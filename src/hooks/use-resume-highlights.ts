"use client";

import { useState, useEffect, useCallback } from "react";
import type { Resume } from "@/types/resume";
import type { ResumeScore, FieldHighlight } from "@/types/resume-score";

export function useResumeHighlights(resume: Partial<Resume>) {
  const [highlights, setHighlights] = useState<FieldHighlight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeResume = useCallback(async () => {
    if (
      !resume.personalInfo?.firstName &&
      !resume.workExperience?.length &&
      !resume.skills?.length
    ) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const targetRole = resume.targetPosition || resume.targetCompany;

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
        const result = (await response.json()) as ResumeScore;
        const newHighlights: FieldHighlight[] = [];

        result.red?.forEach((issue) => {
          newHighlights.push({
            field: issue.field,
            severity: "red",
            message: issue.issue,
          });
        });

        result.yellow?.forEach((issue) => {
          newHighlights.push({
            field: issue.field,
            severity: "yellow",
            message: issue.issue,
          });
        });

        result.green?.forEach((item) => {
          if (item.strength) {
            newHighlights.push({
              field: item.field,
              severity: "green",
              message: item.strength,
            });
          }
        });

        setHighlights(newHighlights);
      }
    } catch (error) {
      console.error("Failed to analyze resume:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [resume]);

  useEffect(() => {
    analyzeResume();
  }, [analyzeResume]);

  const getFieldHighlight = (fieldName: string): FieldHighlight | undefined => {
    return highlights.find(
      (h) => h.field.toLowerCase() === fieldName.toLowerCase()
    );
  };

  const getHighlightClass = (fieldName: string): string => {
    const highlight = getFieldHighlight(fieldName);
    if (!highlight) return "";

    switch (highlight.severity) {
      case "red":
        return "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5";
      case "yellow":
        return "border-amber-500 focus:border-amber-500 focus:ring-amber-500/20 bg-amber-500/5";
      case "green":
        return "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-500/5";
      default:
        return "";
    }
  };

  return {
    highlights,
    isAnalyzing,
    analyzeResume,
    getFieldHighlight,
    getHighlightClass,
  };
}
