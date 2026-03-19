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
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isRecordingRef = useRef(false);
  const fullTranscriptRef = useRef("");

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    if (processorRef.current) {
      (processorRef.current as any).port?.close();
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

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setState("idle");
    setInterimTranscript("");
    fullTranscriptRef.current = "";
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState("connecting");
      fullTranscriptRef.current = "";

      const wsProtocol = wsUrl.startsWith("https") ? "wss" : "ws";
      const wsUrlHost = wsUrl.replace(/^https?:\/\//, "");
      const ws = new WebSocket(`${wsProtocol}://${wsUrlHost}/gemini-live`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[Voice] WebSocket connected");

        // Только идентификатор пользователя — модель и конфиг настраиваются на бэкенде
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
          const { text, isFinal, fullTranscript } = message.transcript;
          if (isFinal) {
            fullTranscriptRef.current = fullTranscript;
            onTranscript?.(fullTranscript.trim());
            setInterimTranscript("");
          } else {
            setInterimTranscript(fullTranscript);
          }
        }

        if (message.audio) {
          playAudio(message.audio.data, message.audio.mimeType);
        }

        if (message.turnComplete) {
          console.log("[Voice] Turn complete");
        }

        if (message.sessionClosed) {
          console.log("[Voice] Session closed by server");
          stopRecording();
        }

        if (message.error) {
          console.error("[Voice] Server error:", message.error);
          onError?.(new Error(message.error.message || "Session error"));
          setState("error");
        }
      };

      ws.onerror = (error) => {
        console.error("[Voice] WebSocket error:", error);
        onError?.(new Error("WebSocket connection error"));
        setState("error");
      };

      ws.onclose = () => {
        console.log("[Voice] WebSocket closed");
        if (isRecordingRef.current) {
          setState("idle");
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

      // Inline worklet processor
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

        const float32 = e.data;
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
                { mime_type: "audio/pcm;rate=16000", data: base64 },
              ],
            },
          }),
        );
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // Store workletNode for cleanup
      processorRef.current = workletNode as any;
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

  const playAudio = async (base64Data: string, mimeType: string) => {
    try {
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const audioContext = new AudioContext();
      const buffer = await audioContext.decodeAudioData(bytes.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (err) {
      console.error("[Voice] Failed to play audio:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    state,
    interimTranscript,
    startRecording,
    stopRecording,
    isRecording: state === "recording",
  };
}
