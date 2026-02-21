"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  BadgeCheck,
  Target,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCircle,
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
  const router = useRouter();
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [existingResumes, setExistingResumes] = useState<string[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;
    loadSuggestions();
    fetchExistingResumes();
  }, []);

  const fetchExistingResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setExistingResumes(data.map((r: any) => r.title));
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    }
  };

  const loadSuggestions = async (force: boolean = false) => {
    setIsLoading(true);
    if (force) {
      setIsRegenerating(true);
    }
    try {
      if (!force) {
        // Try to fetch existing first
        const response = await fetch("/api/profile/suggest-resumes", {
          method: "GET",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.variants && data.variants.length > 0) {
            setVariants(data.variants);
            setIsLoading(false);
            return;
          }
        }
      }

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
      setIsRegenerating(false);
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
        const resume = await response.json();
        router.push(`/resume/${resume.id}/edit`);
      }
    } catch (error) {
      console.error("Failed to create resume:", error);
    } finally {
      setIsCreating(null);
    }
  };

  const isLimitReached = existingResumes.length >= 4;

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
            <Button
              variant="outline"
              onClick={() => loadSuggestions(true)}
              disabled={isLoading || isRegenerating}
              className="mt-4"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
              />
              {t("ai.regenerate_suggestions")}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSuggestions(true)}
                disabled={isLoading || isRegenerating}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
                />
                {t("ai.regenerate_suggestions")}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {variants.map((variant) => {
                const isCreated = existingResumes.includes(variant.title);
                return (
                  <Card
                    key={variant.id}
                    className={`p-4 flex flex-col justify-between border-2 transition-all group ${
                      isCreated
                        ? "bg-muted/30 border-muted"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {variant.title}
                        </h3>
                        {isCreated ? (
                          <div className="flex items-center text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded text-sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {t("profile.resume_exists")}
                          </div>
                        ) : (
                          <div className="flex items-center text-green-600 font-bold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-sm">
                            <BadgeCheck className="h-3 w-3 mr-1" />
                            {variant.matchScore}%
                          </div>
                        )}
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
                      disabled={!!isCreating || isLimitReached || isCreated}
                      variant={
                        isLimitReached || isCreated ? "outline" : "default"
                      }
                    >
                      {isCreating === variant.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : isCreated ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      {isCreated
                        ? t("profile.resume_exists")
                        : t("profile.create_resume_btn")}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
