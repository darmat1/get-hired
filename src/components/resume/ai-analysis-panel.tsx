"use client";

import { Resume } from "@/types/resume";
import type { ResumeScore, FieldHighlight } from "@/types/resume-score";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";

interface AIAnalysisPanelProps {
  resume: Partial<Resume>;
  onHighlightsChange?: (highlights: FieldHighlight[]) => void;
}

export function AIAnalysisPanel({
  resume,
  onHighlightsChange,
}: AIAnalysisPanelProps) {
  const { t, language } = useTranslation();
  const [analysis, setAnalysis] = useState<ResumeScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [timer, setTimer] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const statusMessages = [
    "Analyzing resume structure...",
    "Scanning work experience details...",
    "Evaluating skills and keywords...",
    "Checking for critical issues...",
    "Formulating recommendations...",
    "Calculating final score...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setError(null);
      setTimer(0);
      setStatusMessage(statusMessages[0]);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 180) {
            setIsLoading(false);
            setError("Analysis took too long. Please check your internet connection.");
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setTimer(0);
      setStatusMessage("");
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      const step = Math.min(Math.floor(timer / 3), statusMessages.length - 1);
      setStatusMessage(statusMessages[step]);
    }
  }, [timer, isLoading]);

  const targetRole = resume.targetPosition || resume.targetCompany;

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    setAnalysis(null);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    try {
      const response = await fetch("/api/ai/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "resume",
          resume,
          targetRole,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);
        
        const highlights: FieldHighlight[] = [];
        result.red?.forEach((issue: any) => {
          highlights.push({ field: issue.field, severity: "red", message: issue.issue });
        });
        result.yellow?.forEach((issue: any) => {
          highlights.push({ field: issue.field, severity: "yellow", message: issue.issue });
        });
        result.green?.forEach((item: any) => {
          highlights.push({ field: item.field, severity: "green", message: item.strength });
        });
        onHighlightsChange?.(highlights);
        refreshAiQuota();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to analyze resume. Please try again.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Request timed out. Please check your connection.");
      } else {
        console.error("AI analysis failed:", err);
        setError("Network error. Please check your internet connection.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [resume, targetRole, onHighlightsChange]);

  useEffect(() => {
    if (
      resume.personalInfo?.firstName ||
      resume.workExperience?.length ||
      resume.skills?.length
    ) {
      // Don't auto-analyze if we already have it? 
      // Actually, for edit page it's better to keep it manual or debounce
      // performAnalysis();
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreLabelColor = (label: string) => {
    switch (label) {
      case "Excellent":
      case "Strong":
        return "text-emerald-600 dark:text-emerald-400";
      case "Good":
        return "text-amber-600 dark:text-amber-400";
      case "Fair":
      case "Weak":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors shrink-0"
      >
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("ai.resume_score")}</h3>
        </div>
        {analysis && (
          <div className="flex items-center gap-3">
            <span
              className={`text-xl font-bold ${getScoreColor(analysis.score)}`}
            >
              {analysis.score}
            </span>
            <span
              className={`text-sm font-medium ${getScoreLabelColor(analysis.scoreLabel)}`}
            >
              {analysis.scoreLabel}
            </span>
          </div>
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
              </div>
              
              <div className="space-y-2 w-full">
                <div className="text-2xl font-mono font-bold text-primary tabular-nums">
                  {timer}s
                </div>
                <div className="h-6 overflow-hidden flex items-center justify-center">
                  <p className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {statusMessage}
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-4 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.min((timer / 20) * 100, 95)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8 px-4">
              <div className="bg-red-500/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm font-medium text-red-600 mb-4">
                {error}
              </p>
              <Button
                onClick={performAnalysis}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("common.try_again")}
              </Button>
            </div>
          ) : !analysis ? (
            <div className="text-center py-6">
              <Sparkles className="h-10 w-10 text-primary/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                {t("ai.no_analysis_yet")}
              </p>
              <Button
                onClick={performAnalysis}
                className="w-full"
                variant="default"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t("ai.analyze_resume")}
              </Button>
            </div>
          ) : (
            <>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getScoreBg(analysis.score)}`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {analysis.summary}
                </p>
              </div>

              {analysis.red && analysis.red.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("ai.critical_issues")} ({analysis.red.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {analysis.red.map((issue, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-sm"
                      >
                        <p className="font-medium text-red-700 dark:text-red-300">
                          {issue.field}
                        </p>
                        <p className="text-red-600 dark:text-red-400">
                          {issue.issue}
                        </p>
                        {issue.recommendation && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {issue.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.yellow && analysis.yellow.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("ai.concerns")} ({analysis.yellow.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {analysis.yellow.map((issue, index) => (
                      <div
                        key={index}
                        className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-sm"
                      >
                        <p className="font-medium text-amber-700 dark:text-amber-300">
                          {issue.field}
                        </p>
                        <p className="text-amber-600 dark:text-amber-400">
                          {issue.issue}
                        </p>
                        {issue.recommendation && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {issue.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.green && analysis.green.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("ai.strengths")} ({analysis.green.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {analysis.green.map((item, index) => (
                      <div
                        key={index}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-sm"
                      >
                        <p className="font-medium text-emerald-700 dark:text-emerald-300">
                          {item.field}
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400">
                          {item.strength}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={performAnalysis}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t("ai.reanalyze")}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
