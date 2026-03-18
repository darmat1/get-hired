"use client";

import { useVoiceInput, VoiceInputState } from "@/hooks/use-voice-input";
import { Mic, MicOff, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  apiKey?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost" | "secondary";
}

export function VoiceInputButton({
  onTranscript,
  apiKey,
  className = "",
  size = "default",
  variant = "outline",
}: VoiceInputButtonProps) {
  const [error, setError] = useState<string | null>(null);

  const { state, startRecording, stopRecording, isRecording, interimTranscript } =
    useVoiceInput({
      apiKey,
      onTranscript: (text) => {
        onTranscript(text);
        setError(null);
      },
      onError: (err) => {
        setError(err.message);
      },
    });

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getIcon = () => {
    switch (state) {
      case "recording":
        return <Mic className="h-4 w-4 animate-pulse" />;
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (state) {
      case "recording":
        return "Stop";
      case "processing":
        return "Processing...";
      default:
        return "Voice input";
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={state === "processing"}
        className={`${isRecording ? "bg-red-100 hover:bg-red-200 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400" : ""} ${className}`}
        title={error || getLabel()}
      >
        {getIcon()}
        {size !== "icon" && <span className="ml-2">{getLabel()}</span>}
      </Button>
      
      {isRecording && interimTranscript && (
        <p className="text-xs text-muted-foreground animate-pulse px-1">
          {interimTranscript}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-500 px-1">{error}</p>
      )}
    </div>
  );
}
