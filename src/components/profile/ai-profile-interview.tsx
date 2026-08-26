"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/lib/translations";
import { Sparkles, Send, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";

interface Step {
  id: string;
  question: string;
  placeholder: string;
  hint?: string;
  optional?: boolean;
}

function buildSteps(t: (k: string) => string): Step[] {
  return [
    {
      id: "name",
      question: t("interview.q_name"),
      placeholder: t("interview.ph_name"),
      hint: t("interview.hint_name"),
    },
    {
      id: "contacts",
      question: t("interview.q_contacts"),
      placeholder: t("interview.ph_contacts"),
      hint: t("interview.hint_contacts"),
      optional: true,
    },
    {
      id: "recent",
      question: t("interview.q_recent"),
      placeholder: t("interview.ph_recent"),
      hint: t("interview.hint_recent"),
    },
    {
      id: "more_exp",
      question: t("interview.q_more_exp"),
      placeholder: t("interview.ph_more_exp"),
      hint: t("interview.hint_more_exp"),
      optional: true,
    },
    {
      id: "education",
      question: t("interview.q_education"),
      placeholder: t("interview.ph_education"),
      hint: t("interview.hint_education"),
      optional: true,
    },
    {
      id: "skills",
      question: t("interview.q_skills"),
      placeholder: t("interview.ph_skills"),
      hint: t("interview.hint_skills"),
    },
  ];
}

interface Message {
  role: "assistant" | "user";
  text: string;
}

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export function AIProfileInterview({ onComplete, onSkip }: Props) {
  const { t } = useTranslation();
  const steps = buildSteps(t);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: t("interview.greeting") },
    { role: "assistant", text: steps[0].question },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const isLastStep = stepIndex === steps.length - 1;

  const submitAnswer = async () => {
    const text = currentInput.trim();
    const step = steps[stepIndex];

    if (!text && !step.optional) return;

    const newAnswers = { ...answers, [step.id]: text };
    setAnswers(newAnswers);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: text || t("interview.skip_answer") },
    ]);
    setCurrentInput("");

    if (!isLastStep) {
      const next = steps[stepIndex + 1];
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", text: next.question }]);
        setStepIndex(stepIndex + 1);
      }, 300);
      return;
    }

    // All steps done — build combined text and send to parse-profile
    setIsProcessing(true);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", text: t("interview.processing") },
    ]);

    const combinedText = buildProfileText(newAnswers);

    try {
      const res = await fetch("/api/resumes/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || t("interview.error_generic"));

      refreshAiQuota();
      setIsDone(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: t("interview.done") },
      ]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("interview.error_generic"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submitAnswer();
    }
  };

  const currentStep = steps[stepIndex];

  return (
    <div className="flex flex-col h-full min-h-[520px] max-h-[700px] bg-warm-100 dark:bg-warm-900 rounded-2xl border border-warm-200 dark:border-warm-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100 dark:border-warm-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-warm-900 dark:text-warm-100">
              {t("interview.title")}
            </p>
            {!isDone && (
              <p className="text-xs text-warm-400">
                {t("interview.step_of")
                  .replace("{n}", String(Math.min(stepIndex + 1, steps.length)))
                  .replace("{total}", String(steps.length))}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 transition-colors"
        >
          {t("interview.skip_to_manual")}
        </button>
      </div>

      {/* Progress bar */}
      {!isDone && (
        <div className="h-0.5 bg-warm-200 dark:bg-warm-800">
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${((stepIndex) / steps.length) * 100}%` }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-warm-200 dark:bg-warm-800 text-warm-800 dark:text-warm-200 rounded-tl-sm"
                  : "bg-amber-500 text-white rounded-tr-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && !isDone && (
          <div className="flex justify-start">
            <div className="bg-warm-200 dark:bg-warm-800 rounded-2xl rounded-tl-sm px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-warm-500" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-warm-100 dark:border-warm-800 px-4 py-3">
        {isDone ? (
          <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t("interview.view_profile")}
          </Button>
        ) : errorMsg ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={() => setErrorMsg(null)}>
              {t("interview.try_again")}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              {currentStep.hint && (
                <p className="text-xs text-warm-400 px-1">{currentStep.hint}</p>
              )}
              <textarea
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentStep.placeholder}
                disabled={isProcessing}
                rows={2}
                className="w-full resize-none rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-800 px-3 py-2 text-sm text-warm-900 dark:text-warm-100 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50 transition-all"
              />
            </div>
            <Button
              onClick={submitAnswer}
              disabled={isProcessing || (!currentInput.trim() && !currentStep.optional)}
              className="mb-0.5 bg-amber-500 hover:bg-amber-600 text-white h-10 w-10 p-0 rounded-xl flex-shrink-0"
            >
              {isLastStep ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
        {currentStep.optional && !isDone && !errorMsg && (
          <p className="text-xs text-warm-400 text-center mt-1.5">
            {t("interview.optional_hint")} — {t("interview.press_enter")}
          </p>
        )}
        {!currentStep.optional && !isDone && !errorMsg && (
          <p className="text-xs text-warm-400 text-center mt-1.5">
            {t("interview.press_enter")}
          </p>
        )}
      </div>
    </div>
  );
}

function buildProfileText(answers: Record<string, string>): string {
  const parts: string[] = [];

  if (answers.name) parts.push(`Name and role: ${answers.name}`);
  if (answers.contacts) parts.push(`Contact information: ${answers.contacts}`);
  if (answers.recent) parts.push(`Most recent experience:\n${answers.recent}`);
  if (answers.more_exp) parts.push(`Additional experience:\n${answers.more_exp}`);
  if (answers.education) parts.push(`Education and certifications:\n${answers.education}`);
  if (answers.skills) parts.push(`Skills: ${answers.skills}`);

  return parts.join("\n\n");
}
