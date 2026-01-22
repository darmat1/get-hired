"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, BadgeCheck, Target, FileText } from "lucide-react";
import { Modal } from "@/components/ui/modal";

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
  const [variants, setVariants] = useState<ResumeVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  useEffect(() => {
    generateSuggestions();
  }, []);

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

  return (
    <Modal isOpen={true} onClose={onClose} title="ИИ Предложения для Резюме">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              Анализируем ваш опыт...
            </p>
          </div>
        ) : variants.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted/30 mx-auto mb-4" />
            <p>
              Не удалось сгенерировать варианты. Попробуйте обновить профиль.
            </p>
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

                  <div className="space-y-3 mb-6">
                    <div className="flex flex-wrap gap-1">
                      {variant.selectedSkills.slice(0, 8).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] bg-background border border-border px-1.5 py-0.5 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => createResumeFromVariant(variant)}
                  disabled={!!isCreating}
                >
                  {isCreating === variant.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Создать резюме
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
