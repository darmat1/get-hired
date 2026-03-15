"use client";

import { useState } from "react";
import { WorkExperience } from "@/types/resume";
import type { CompanyScore } from "@/types/resume-score";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";

interface CompanyScoreButtonProps {
  experience: WorkExperience;
  targetRole?: string;
  onScoreUpdate?: (experienceId: string, score: CompanyScore | null) => void;
  savedScore?: CompanyScore | null;
}

export function CompanyScoreButton({
  experience,
  targetRole,
  onScoreUpdate,
  savedScore,
}: CompanyScoreButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [score, setScore] = useState<CompanyScore | null>(savedScore || null);

  const analyzeCompany = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company",
          experience,
          targetRole,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setScore(result);
        onScoreUpdate?.(experience.id, result);
        refreshAiQuota();
      }
    } catch (error) {
      console.error("Failed to analyze company:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearScore = () => {
    setScore(null);
    onScoreUpdate?.(experience.id, null);
    setIsModalOpen(false);
  };

  const getScoreColor = (scoreValue: number) => {
    if (scoreValue >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (scoreValue >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (scoreValue: number) => {
    if (scoreValue >= 80) return "bg-emerald-500";
    if (scoreValue >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="h-8 px-2 text-xs"
        type="button"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        {score ? `${score.score}` : t("ai.analyze")}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("ai.company_score_title")}
        className="max-w-lg"
      >
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              {experience.title} @ {experience.company}
            </p>
          </div>

          {!score && !isLoading && (
            <Button onClick={analyzeCompany} className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {t("ai.analyze_company")}
            </Button>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                {t("ai.analyzing")}
              </span>
            </div>
          )}

          {score && !isLoading && (
            <>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t("ai.score")}
                  </span>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-bold ${getScoreColor(score.score)}`}
                    >
                      {score.score}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getScoreBg(score.score)}`}
                    style={{ width: `${score.score}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {score.summary}
                </p>
              </div>

              {score.red && score.red.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("ai.critical_issues")}
                    </span>
                  </div>
                  {score.red.map((issue, index) => (
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
                      <p className="text-muted-foreground mt-1">
                        {issue.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {score.yellow && score.yellow.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {t("ai.concerns")}
                    </span>
                  </div>
                  {score.yellow.map((issue, index) => (
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
                      <p className="text-muted-foreground mt-1">
                        {issue.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {score.green && score.green.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{t("ai.strengths")}</span>
                  </div>
                  {score.green.map((item, index) => (
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
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={analyzeCompany}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("ai.reanalyze")}
                </Button>
                <Button variant="ghost" onClick={clearScore}>
                  <X className="h-4 w-4 mr-2" />
                  {t("common.close")}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
