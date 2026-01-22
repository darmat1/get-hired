"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  BadgeCheck,
  Target,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useTranslation } from "@/lib/translations";

interface ResumeVariant {
  id: string;
  title: string;
  targetRole: string;
  seniority: string;
  matchScore: number;
  reasoning: string;
  selectedSkills: string[];
  selectedExp: string[];
}

interface ResumeSuggestionsProps {
  onClose: () => void;
}

export function ResumeSuggestions({ onClose }: ResumeSuggestionsProps) {
  const { t } = useTranslation();
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [resumesCount, setResumesCount] = useState(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    generateSuggestions();
    fetchResumesCount();
  }, []);

  const fetchResumesCount = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumesCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch resumes count:", error);
    }
  };

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/suggest-resumes", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setVariants(data.variants);
      }
    } catch (error) {
      console.error("Failed to generate suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createResumeFromVariant = async (variant: ResumeVariant) => {
    setIsCreating(variant.id);
    try {
      // Fetch profile to get base data
      const profileRes = await fetch("/api/profile/experience");
      const profile = await profileRes.json();

      // Filter experience/skills based on variant selection
      const filteredExp = profile.workExperience.filter((exp: any) =>
        variant.selectedExp.includes(exp.id),
      );
      const filteredSkills = profile.skills.filter((skill: any) =>
        variant.selectedSkills.includes(skill.name),
      );

      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: variant.title,
          template: "modern",
          personalInfo: profile.personalInfo,
          workExperience: filteredExp,
          education: profile.education,
          skills: filteredSkills,
          certificates: profile.certificates,
        }),
      });

      if (response.ok) {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Failed to create resume:", error);
    } finally {
      setIsCreating(null);
    }
  };

  const isLimitReached = resumesCount >= 4;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("profile.resume_suggestions_title")}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {isLimitReached && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">
                {t("profile.suggest_limit_title")}
              </p>
              <p className="text-amber-800/80">
                {t("profile.suggest_limit_desc")}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              {t("profile.loading_suggestions")}
            </p>
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted/30 mx-auto mb-4" />
            <p>{t("profile.no_suggestions")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map((variant) => (
              <Card
                key={variant.id}
                className="p-4 flex flex-col justify-between border-2 hover:border-primary/50 transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                      {variant.title}
                    </h3>
                    <div className="flex items-center text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-sm">
                      <BadgeCheck className="h-3 w-3 mr-1" />
                      {variant.matchScore}%
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {variant.seniority}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                      {variant.targetRole.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm text-secondary-foreground/80 mb-4 italic">
                    {variant.reasoning}
                  </p>

                  <div className="space-y-3 mb-4">
                    <div className="flex flex-wrap gap-1">
                      {variant.selectedSkills.slice(0, 10).map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mt-auto"
                  onClick={() => createResumeFromVariant(variant)}
                  disabled={!!isCreating || isLimitReached}
                  variant={isLimitReached ? "outline" : "default"}
                >
                  {isCreating === variant.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  {t("profile.create_resume_btn")}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
