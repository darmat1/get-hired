"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, CheckCircle2, ChevronDown, ExternalLink, FileText } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";

// ── Types ─────────────────────────────────────────────────────────────────────

type MessageRole = "assistant" | "user" | "success" | "error";
type AssistantMode =
  | "chat"          // default: free-form → adds to profile
  | "resume_ask"    // asked "create resume" → clarifying: general or for a job?
  | "resume_role"   // user chose "general" → asking target role
  | "resume_job"    // user chose "for a job" → waiting for job description
  | "resume_done";  // resume created

interface Message {
  role: MessageRole;
  text: string;
  link?: { href: string; label: string };
}

interface Props {
  onProfileUpdated: () => void;
}

// ── Intent detection ──────────────────────────────────────────────────────────

function detectResumeIntent(text: string): boolean {
  const t = text.toLowerCase();
  const hasResume = /\b(resume|резюме|cv|резюмэ)\b/.test(t);
  const hasAction = /\b(create|generate|make|build|write|new|создай|сгенерируй|сделай|напиши|новое|составь)\b/.test(t);
  return hasResume && hasAction;
}

function detectJobDescription(text: string): boolean {
  if (text.trim().length < 150) return false;
  const t = text.toLowerCase();
  const hits = [
    "requirements", "responsibilities", "qualifications", "we are looking",
    "job description", "position", "duties", "you will",
    "требования", "обязанности", "мы ищем", "вакансия", "условия работы",
  ].filter((w) => t.includes(w));
  return hits.length >= 2;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileAssistantWidget({ onProfileUpdated }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setMode] = useState<AssistantMode>("chat");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addMsg = (msg: Message) => setMessages((prev) => [...prev, msg]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addMsg({ role: "assistant", text: t("assistant.greeting") });
    }
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Handlers by mode ────────────────────────────────────────────────────────

  const handleChat = async (text: string) => {
    // Detect resume generation intent
    if (detectResumeIntent(text)) {
      setMode("resume_ask");
      addMsg({ role: "assistant", text: t("assistant.resume_ask") });
      return;
    }

    // Detect job description paste → offer to create resume for it
    if (detectJobDescription(text)) {
      addMsg({ role: "assistant", text: t("assistant.jd_detected") });
      await createResume("", text);
      return;
    }

    // Default: add to profile via parse-profile
    setIsLoading(true);
    try {
      const res = await fetch("/api/resumes/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("assistant.error_generic"));

      refreshAiQuota();
      onProfileUpdated();

      if (data.nothingFound) {
        addMsg({ role: "error", text: t("assistant.nothing_found") });
        addMsg({ role: "assistant", text: t("assistant.try_more_detail") });
      } else {
        const { workCount = 0, educationCount = 0, skillsCount = 0 } = data.extracted || {};
        const parts = [
          workCount > 0 ? t("assistant.added_jobs").replace("{n}", workCount) : "",
          educationCount > 0 ? t("assistant.added_edu").replace("{n}", educationCount) : "",
          skillsCount > 0 ? t("assistant.added_skills").replace("{n}", skillsCount) : "",
        ].filter(Boolean);
        addMsg({ role: "success", text: parts.join(", ") || t("assistant.updated") });
        addMsg({ role: "assistant", text: t("assistant.what_else") });
      }
    } catch (err) {
      addMsg({ role: "error", text: err instanceof Error ? err.message : t("assistant.error_generic") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeAsk = (text: string) => {
    // User replied to "general or for a specific job?"
    const lower = text.toLowerCase();
    const isGeneral = /\b(general|общее|general|базовое|стандартное|обычное|any|any role)\b/.test(lower)
      || /^(1|да|yes|general)/.test(lower.trim());
    const isJob = /\b(job|specific|вакансию|вакансия|company|компани|for a|под вакансию|конкретн)\b/.test(lower)
      || /^(2|нет|no|job|for)/.test(lower.trim());

    if (isGeneral) {
      setMode("resume_role");
      addMsg({ role: "assistant", text: t("assistant.resume_role_ask") });
    } else if (isJob) {
      setMode("resume_job");
      addMsg({ role: "assistant", text: t("assistant.resume_job_ask") });
    } else {
      // Treat as general with role = input
      setMode("resume_role");
      addMsg({ role: "assistant", text: t("assistant.resume_role_ask") });
    }
  };

  const createResume = async (targetRole: string, jobDescription?: string) => {
    setIsLoading(true);
    setMode("resume_done");
    try {
      const res = await fetch("/api/ai/create-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, jobDescription }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.limitReached) {
          addMsg({ role: "error", text: t("assistant.resume_limit") });
        } else {
          throw new Error(data.error || t("assistant.error_generic"));
        }
        setMode("chat");
        return;
      }

      refreshAiQuota();
      addMsg({
        role: "success",
        text: t("assistant.resume_created").replace("{title}", data.title),
        link: { href: data.url, label: t("assistant.resume_open") },
      });
      addMsg({ role: "assistant", text: t("assistant.what_else") });
      setMode("chat");
    } catch (err) {
      addMsg({ role: "error", text: err instanceof Error ? err.message : t("assistant.error_generic") });
      setMode("chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeRole = async (text: string) => {
    // text = target role (or empty = general)
    const role = text.trim() || t("assistant.resume_general_role");
    addMsg({ role: "assistant", text: t("assistant.resume_creating").replace("{role}", role) });
    await createResume(role);
  };

  const handleResumeJob = async (text: string) => {
    if (!detectJobDescription(text) && text.trim().length < 50) {
      addMsg({ role: "assistant", text: t("assistant.resume_job_too_short") });
      return;
    }
    addMsg({ role: "assistant", text: t("assistant.resume_creating_for_job") });
    await createResume("", text);
  };

  // ── Main send handler ────────────────────────────────────────────────────────

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    addMsg({ role: "user", text });
    setInput("");

    switch (mode) {
      case "chat":         await handleChat(text); break;
      case "resume_ask":   handleResumeAsk(text); break;
      case "resume_role":  await handleResumeRole(text); break;
      case "resume_job":   await handleResumeJob(text); break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  // ── Quick actions ────────────────────────────────────────────────────────────

  const QUICK = mode === "chat" ? [
    { label: t("assistant.suggestion_job"),    value: t("assistant.suggestion_job") },
    { label: t("assistant.suggestion_edu"),    value: t("assistant.suggestion_edu") },
    { label: t("assistant.suggestion_skill"),  value: t("assistant.suggestion_skill") },
    { label: t("assistant.suggestion_resume"), value: t("assistant.suggestion_resume_value") },
  ] : mode === "resume_ask" ? [
    { label: t("assistant.opt_general"),  value: "General resume" },
    { label: t("assistant.opt_for_job"),  value: "For a specific job" },
  ] : [];

  const placeholder = mode === "resume_job"
    ? t("assistant.input_jd_placeholder")
    : mode === "resume_role"
    ? t("assistant.input_role_placeholder")
    : t("assistant.input_placeholder");

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label={t("assistant.open_label")}
        >
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-semibold whitespace-nowrap">{t("assistant.btn_label")}</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-40 w-[340px] sm:w-[380px] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          style={{ maxHeight: "min(560px, calc(100vh - 80px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-amber-500 text-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">{t("assistant.title")}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-80 hover:opacity-100 transition-opacity p-0.5">
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                {msg.role === "success" ? (
                  <div className="flex items-start gap-2 max-w-[90%] text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-2 rounded-xl rounded-tl-sm border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{t("assistant.added_prefix")} {msg.text}</span>
                  </div>
                ) : msg.role === "error" ? (
                  <div className="max-w-[90%] text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-xl rounded-tl-sm border border-red-200 dark:border-red-800">
                    {msg.text}
                  </div>
                ) : (
                  <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-tr-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                )}
                {/* Resume link button */}
                {msg.link && (
                  <a
                    href={msg.link.href}
                    className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {msg.link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
              </div>
            )}

            {/* Quick action chips */}
            {QUICK.length > 0 && !isLoading && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setInput(q.value)}
                    className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors bg-white dark:bg-slate-900"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-2.5 flex gap-2 items-end flex-shrink-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={mode === "resume_job" ? 4 : 2}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:opacity-50 transition-all"
            />
            <button
              onClick={send}
              disabled={isLoading || !input.trim()}
              className="mb-0.5 flex-shrink-0 w-9 h-9 flex items-center justify-center bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
