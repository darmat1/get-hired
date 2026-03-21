"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type VoiceInputState =
  | "idle"
  | "connecting"
  | "recording"
  | "processing"
  | "error";

export interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  wsUrl?: string;
  apiKey?: string;
  userId?: string;
}

export function useVoiceInput({
  onTranscript,
  onError,
  wsUrl = process.env.NEXT_PUBLIC_VOICE_WS_URL || "localhost:3001",
  apiKey: providedApiKey,
  userId,
}: UseVoiceInputOptions) {
  const [state, setState] = useState<VoiceInputState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");

  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | AudioWorkletNode | null>(
    null,
  );
  const isRecordingRef = useRef(false);
  const fullTranscriptRef = useRef("");

  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);

  const playAudio = (base64Data: string) => {
    try {
      if (
        !playbackContextRef.current ||
        playbackContextRef.current.state === "closed"
      ) {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
        nextPlayTimeRef.current = 0;
      }

      const ctx = playbackContextRef.current;

      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const numSamples = bytes.length / 2;
      const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(bytes.buffer);

      for (let i = 0; i < numSamples; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;
    } catch (err) {
      console.error("[Voice] Failed to play audio:", err);
    }
  };

  // Останавливает запись и отправляет endOfTurn — сессия остаётся живой
  const stopRecording = useCallback(async () => {
    isRecordingRef.current = false;
    setState("processing");

    if (processorRef.current) {
      if ("port" in processorRef.current) {
        (processorRef.current as AudioWorkletNode).port?.close();
      }
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Отправляем endOfTurn — сокет НЕ закрываем, ждём ответа Gemini
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          clientContent: {
            turns: [{ role: "user", parts: [{ text: "" }] }],
            turnComplete: true,
          },
        }),
      );
    }

    setInterimTranscript("");
    fullTranscriptRef.current = "";
  }, []);

  // Явное завершение всей сессии
  const endSession = useCallback(() => {
    isRecordingRef.current = false;

    if (processorRef.current) {
      if ("port" in processorRef.current) {
        (processorRef.current as AudioWorkletNode).port?.close();
      }
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
      nextPlayTimeRef.current = 0;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setState("idle");
    setInterimTranscript("");
    fullTranscriptRef.current = "";
  }, []);

  // Начинает новую сессию (если нет активной) и запускает запись
  const startRecording = useCallback(async () => {
    try {
      // Если сессия уже есть — просто запускаем запись
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        await startAudioCapture();
        return;
      }

      setState("connecting");
      fullTranscriptRef.current = "";

      const wsProtocol = wsUrl.startsWith("https") ? "wss" : "ws";
      const wsUrlHost = wsUrl.replace(/^https?:\/\//, "");
      const ws = new WebSocket(`${wsProtocol}://${wsUrlHost}/gemini-live`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[Voice] WebSocket connected");
        ws.send(
          JSON.stringify({
            setup: {
              asUserId: userId,
            },
          }),
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.setupComplete) {
          console.log("[Voice] Session setup complete");
          startAudioCapture();
          return;
        }

        if (message.transcript) {
          const { isFinal, fullTranscript } = message.transcript;
          if (isFinal) {
            fullTranscriptRef.current = fullTranscript;
            onTranscript?.(fullTranscript.trim());
            setInterimTranscript("");
          } else {
            setInterimTranscript(fullTranscript);
          }
        }

        if (message.audio) {
          playAudio(message.audio.data);
        }

        if (message.turnComplete) {
          console.log("[Voice] Turn complete — session stays alive for dialog");
          // Сокет НЕ закрываем — сессия продолжается
          // Пользователь может нажать запись снова для следующей реплики
          setState("idle");
        }

        if (message.sessionClosed) {
          console.log("[Voice] Session closed by server");
          setState("idle");
          socketRef.current = null;
        }

        if (message.error) {
          console.error("[Voice] Server error:", message.error);
          onError?.(new Error(message.error.message || "Session error"));
          setState("error");
          if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
          }
        }
      };

      ws.onerror = (error) => {
        console.error("[Voice] WebSocket error:", error);
        onError?.(new Error("WebSocket connection error"));
        setState("error");
      };

      ws.onclose = () => {
        console.log("[Voice] WebSocket closed");
        socketRef.current = null;
        if (isRecordingRef.current) {
          setState("idle");
          isRecordingRef.current = false;
        }
      };
    } catch (err) {
      console.error("[Voice] Failed to start:", err);
      onError?.(
        err instanceof Error ? err : new Error("Failed to start recording"),
      );
      setState("error");
    }
  }, [onTranscript, onError, wsUrl, userId]);

  const startAudioCapture = async () => {
    try {
      setState("recording");
      console.log("[Voice] Starting audio capture...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const workletCode = `
        class PCMProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            if (input) this.port.postMessage(input);
            return true;
          }
        }
        registerProcessor('pcm-processor', PCMProcessor);
      `;
      const blob = new Blob([workletCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await audioContext.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, "pcm-processor");

      workletNode.port.onmessage = (e) => {
        if (
          !socketRef.current ||
          socketRef.current.readyState !== WebSocket.OPEN
        )
          return;

        const float32 = e.data as Float32Array;
        const pcm16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
          pcm16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32767));
        }

        const base64 = btoa(
          String.fromCharCode(...new Uint8Array(pcm16.buffer)),
        );

        socketRef.current.send(
          JSON.stringify({
            realtimeInput: {
              media_chunks: [
                {
                  mime_type: "audio/pcm;rate=16000",
                  data: base64,
                },
              ],
            },
          }),
        );
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      processorRef.current = workletNode;
      isRecordingRef.current = true;
      console.log("[Voice] Recording started");
    } catch (err) {
      console.error("[Voice] Audio capture error:", err);
      onError?.(
        err instanceof Error ? err : new Error("Failed to capture audio"),
      );
      setState("error");
    }
  };

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      processorRef.current?.disconnect();
      audioContextRef.current?.close();
      playbackContextRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      socketRef.current?.close();
    };
  }, []);

  return {
    state,
    interimTranscript,
    startRecording,
    stopRecording,
    endSession,
    isRecording: state === "recording",
  };
}
