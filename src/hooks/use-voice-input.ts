"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type VoiceInputState = "idle" | "connecting" | "recording" | "processing" | "error";

export interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onError?: (error: Error) => void;
  wsUrl?: string;
  apiKey?: string;
}

export function useVoiceInput({ 
  onTranscript, 
  onError,
  wsUrl = process.env.NEXT_PUBLIC_VOICE_WS_URL || "ws://localhost:3001",
  apiKey: providedApiKey,
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
      socketRef.current.send(JSON.stringify({ clientContent: { turns: [], endOfTurn: true } }));
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
      
      const apiKey = providedApiKey || "";
      
      const wsProtocol = wsUrl.startsWith("https") ? "wss" : "ws";
      const wsUrlHost = wsUrl.replace(/^https?:\/\//, "");
      const ws = new WebSocket(`${wsProtocol}://${wsUrlHost}/gemini-live`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[Voice] WebSocket connected");
        
        ws.send(JSON.stringify({
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            generation_config: {
              response_modalities: ["TEXT"],
              speech_config: {
                language_code: "ru-RU",
              },
            },
          },
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.setupComplete) {
          console.log("[Voice] Session setup complete");
          startAudioCapture();
          return;
        }

        if (message.serverContent?.inputTranscription?.text) {
          const text = message.serverContent.inputTranscription.text;
          if (message.serverContent.inputTranscription.finish) {
            fullTranscriptRef.current += " " + text;
            onTranscript?.(fullTranscriptRef.current.trim());
          } else {
            setInterimTranscript(fullTranscriptRef.current + " " + text);
          }
        }

        if (message.serverContent?.turnComplete) {
          console.log("[Voice] Turn complete");
          if (fullTranscriptRef.current.trim()) {
            onTranscript?.(fullTranscriptRef.current.trim());
          }
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
      onError?.(err instanceof Error ? err : new Error("Failed to start recording"));
      setState("error");
    }
  }, [onTranscript, onError, wsUrl]);

  const startAudioCapture = async () => {
    try {
      setState("recording");
      console.log("[Voice] Starting audio capture...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
        }

        const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));

        socketRef.current.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "audio/pcm;rate=16000",
                data: base64,
              },
            ],
          },
        }));
      };

      isRecordingRef.current = true;
      console.log("[Voice] Recording started");
    } catch (err) {
      console.error("[Voice] Audio capture error:", err);
      onError?.(err instanceof Error ? err : new Error("Failed to capture audio"));
      setState("error");
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
