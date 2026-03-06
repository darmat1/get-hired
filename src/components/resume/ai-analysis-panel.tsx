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

  const targetRole = resume.targetPosition || resume.targetCompany;

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "resume",
          resume,
          targetRole,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysis(result);

        const highlights: FieldHighlight[] = [];

        result.red?.forEach((issue: any) => {
          highlights.push({
            field: issue.field,
            severity: "red",
            message: issue.issue,
          });
        });

        result.yellow?.forEach((issue: any) => {
          highlights.push({
            field: issue.field,
            severity: "yellow",
            message: issue.issue,
          });
        });

        result.green?.forEach((item: any) => {
          highlights.push({
            field: item.field,
            severity: "green",
            message: item.strength,
          });
        });

        onHighlightsChange?.(highlights);
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
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
      performAnalysis();
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

  if (isLoading && !analysis) {
    return (
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-muted-foreground">{t("ai.analyzing")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
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

      {isExpanded && analysis && (
        <div className="p-4 pt-0 space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${getScoreBg(analysis.score)}`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{analysis.summary}</p>
          </div>

          {analysis.red && analysis.red.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("ai.critical_issues")} ({analysis.red.length})
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
              <div className="space-y-2 max-h-48 overflow-y-auto">
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
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
