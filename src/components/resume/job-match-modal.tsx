"use client";

import { useState } from "react";
import { Sparkles, X, Loader2, CheckCircle2, XCircle, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";
import type { JobMatch, JobMatchSuggestion, MatchLabel } from "@/types/job-match";

interface Props {
  resumeId: string;
  resumeTitle: string;
  onClose: () => void;
}

const scoreColors: Record<MatchLabel, string> = {
  Poor: "text-red-500",
  Fair: "text-orange-500",
  Good: "text-yellow-500",
  Great: "text-emerald-500",
  Excellent: "text-green-600",
};

const scoreRingColors: Record<MatchLabel, string> = {
  Poor: "stroke-red-500",
  Fair: "stroke-orange-500",
  Good: "stroke-yellow-500",
  Great: "stroke-emerald-500",
  Excellent: "stroke-green-600",
};

const priorityIcon = (p: JobMatchSuggestion["priority"]) => {
  if (p === "high") return <ChevronUp className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />;
  if (p === "medium") return <Minus className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />;
  return <ChevronDown className="h-3.5 w-3.5 text-warm-400 flex-shrink-0" />;
};

function ScoreRing({ score, label }: { score: number; label: MatchLabel }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="108" height="108" viewBox="0 0 108 108" className="-rotate-90">
        <circle cx="54" cy="54" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-warm-100 dark:text-warm-800" />
        <circle
          cx="54" cy="54" r={radius} fill="none" strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${scoreRingColors[label]} transition-all duration-700`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-extrabold ${scoreColors[label]}`}>{score}%</span>
        <span className="text-[10px] font-semibold text-warm-400 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}

export function JobMatchModal({ resumeId, resumeTitle, onClose }: Props) {
  const { t } = useTranslation();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<JobMatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("job_match.error_generic"));
      refreshAiQuota();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("job_match.error_generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-warm-100 dark:bg-warm-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200 dark:border-warm-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-warm-900 dark:text-warm-100">{t("job_match.title")}</p>
              <p className="text-xs text-warm-400 truncate max-w-[240px]">{resumeTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {!result ? (
            <>
              <p className="text-sm text-warm-600 dark:text-warm-400">{t("job_match.description")}</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-warm-500 uppercase tracking-wide">
                  {t("job_match.paste_label")}
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={t("job_match.paste_placeholder")}
                  rows={10}
                  className="w-full resize-none rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-800 px-4 py-3 text-sm text-warm-900 dark:text-warm-100 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {/* Score */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-warm-50 dark:bg-warm-800/50 rounded-xl">
                <ScoreRing score={result.matchScore} label={result.matchLabel} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-warm-700 dark:text-warm-300 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.presentKeywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-semibold text-warm-700 dark:text-warm-300 uppercase tracking-wide">
                        {t("job_match.present_keywords")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.presentKeywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {result.missingKeywords.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-semibold text-warm-700 dark:text-warm-300 uppercase tracking-wide">
                        {t("job_match.missing_keywords")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingKeywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 text-xs rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-warm-700 dark:text-warm-300 uppercase tracking-wide">
                    {t("job_match.suggestions")}
                  </p>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-3 p-3.5 bg-warm-50 dark:bg-warm-800/50 rounded-xl">
                        <div className="mt-0.5">{priorityIcon(s.priority)}</div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-warm-400 mr-2">{t(`job_match.section_${s.section}`)}</span>
                          <p className="text-sm text-warm-700 dark:text-warm-300 mt-0.5">{s.suggestion}</p>
                          {s.example && (
                            <p className="text-xs text-warm-500 dark:text-warm-400 mt-1.5 italic border-l-2 border-amber-300 dark:border-amber-600 pl-2">
                              {s.example}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setResult(null); setJobDescription(""); }}
                className="text-sm text-warm-400 hover:text-warm-600 dark:hover:text-warm-200 transition-colors"
              >
                ← {t("job_match.analyze_another")}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="px-6 py-4 border-t border-warm-200 dark:border-warm-800 flex-shrink-0 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
            <Button
              onClick={analyze}
              disabled={isLoading || jobDescription.trim().length < 50}
              className="bg-amber-500 hover:bg-amber-600 text-white min-w-[120px]"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("job_match.analyzing")}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t("job_match.analyze_btn")}</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
