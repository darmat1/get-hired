"use client";

import { WorkExperience } from "@/types/resume";
import type { CompanyScore } from "@/types/resume-score";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";

interface AutosizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  highlight?: "red" | "yellow" | "green" | null;
}

function AutosizeTextarea({
  value,
  onChange,
  placeholder,
  className,
  highlight,
}: AutosizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const highlightClass = {
    red: "border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-red-500/20",
    yellow: "border-amber-500 bg-amber-500/5 focus:border-amber-500 focus:ring-amber-500/20",
    green: "border-emerald-500 bg-emerald-500/5 focus:border-emerald-500 focus:ring-emerald-500/20",
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none ${
        highlight ? highlightClass[highlight] : ""
      }`}
      rows={1}
    />
  );
}

interface ExperienceEditorProps {
  data: WorkExperience[];
  onChange: (experience: WorkExperience[]) => void;
  onSave?: () => void;
}

interface FieldHighlight {
  field: string;
  severity: "red" | "yellow" | "green";
  message: string;
}

function calculateContentHash(exp: WorkExperience): string {
  const content = [
    exp.title,
    exp.company,
    exp.location,
    exp.employmentType,
    exp.startDate,
    exp.endDate,
    exp.current ? "true" : "false",
    exp.mainDescription || "",
    ...(exp.description || []),
  ].join("|");
  
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function isDataChanged(exp: WorkExperience): boolean {
  if (!exp.analysis?.contentHash) return false;
  const currentHash = calculateContentHash(exp);
  return currentHash !== exp.analysis.contentHash;
}

export function ExperienceEditor({ data, onChange, onSave }: ExperienceEditorProps) {
  const { t, language } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, CompanyScore>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedExp, setSelectedExp] = useState<WorkExperience | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadedScores: Record<string, CompanyScore> = {};
    data.forEach((exp) => {
      if (exp.analysis) {
        loadedScores[exp.id] = {
          score: exp.analysis.score,
          scoreLabel: exp.analysis.scoreLabel as CompanyScore["scoreLabel"],
          summary: exp.analysis.summary,
          red: [],
          yellow: [],
          green: [],
        };
      }
    });
    setScores(loadedScores);
  }, []);

  const getFieldHighlight = useCallback(
    (expId: string, field: string): "red" | "yellow" | "green" | null => {
      const score = scores[expId];
      if (!score) return null;

      const allIssues = [...(score.red || []), ...(score.yellow || [])];
      const matchingIssue = allIssues.find(
        (issue) => issue.field?.toLowerCase() === field.toLowerCase()
      );
      if (matchingIssue) {
        const isRed = score.red?.some((r) => r.field.toLowerCase() === field.toLowerCase());
        return isRed ? "red" : "yellow";
      }

      const greenMatch = score.green?.find(
        (g) => g.field?.toLowerCase() === field.toLowerCase()
      );
      return greenMatch ? "green" : null;
    },
    [scores]
  );

  const analyzeCompany = async (exp: WorkExperience, shouldCloseModal = false) => {
    setAnalyzingId(exp.id);
    try {
      const response = await fetch("/api/ai/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "company",
          experience: exp,
          language,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const contentHash = calculateContentHash(exp);
        const updatedData = data.map((e) =>
          e.id === exp.id
            ? {
                ...e,
                analysis: {
                  score: result.score,
                  scoreLabel: result.scoreLabel,
                  summary: result.summary,
                  red: result.red,
                  yellow: result.yellow,
                  green: result.green,
                  contentHash,
                  analyzedAt: new Date().toISOString(),
                },
              }
            : e
        );
        
        setScores((prev) => ({ ...prev, [exp.id]: result }));
        onChange(updatedData);
        onSave?.();
        
        if (shouldCloseModal) {
          setSelectedExp(null);
          setIsModalOpen(false);
        }
        refreshAiQuota();
      }
    } catch (error) {
      console.error("Failed to analyze company:", error);
    } finally {
      setAnalyzingId(null);
    }
  };

  const analyzeAll = async () => {
    for (const exp of data) {
      if (exp.title && exp.company) {
        await analyzeCompany(exp, false);
      }
    }
  };

  const clearScore = (expId: string) => {
    setScores((prev) => {
      const newScores = { ...prev };
      delete newScores[expId];
      return newScores;
    });

    const updatedData = data.map((e) => {
      if (e.id === expId) {
        const { analysis, ...rest } = e;
        return rest;
      }
      return e;
    });
    onChange(updatedData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: crypto.randomUUID(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      mainDescription: "",
      description: [""],
    };
    onChange([newExperience, ...data]);
    setExpandedIndex(0);
  };

  const updateExperience = (
    index: number,
    field: keyof WorkExperience,
    value: any,
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const updateDescription = (
    expIndex: number,
    descIndex: number,
    value: string,
  ) => {
    const updated = [...data];
    const updatedDescriptions = [...updated[expIndex].description];
    updatedDescriptions[descIndex] = value;
    updated[expIndex] = {
      ...updated[expIndex],
      description: updatedDescriptions,
    };
    onChange(updated);
  };

  const addDescriptionPoint = (expIndex: number) => {
    const updated = [...data];
    updated[expIndex] = {
      ...updated[expIndex],
      description: [...updated[expIndex].description, ""],
    };
    onChange(updated);
  };

  const removeDescriptionPoint = (expIndex: number, descIndex: number) => {
    const updated = [...data];
    updated[expIndex] = {
      ...updated[expIndex],
      description: updated[expIndex].description.filter(
        (_, i) => i !== descIndex,
      ),
    };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    setItemToDelete(index);
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      const expId = data[itemToDelete]?.id;
      if (expId) clearScore(expId);
      onChange(data.filter((_, i) => i !== itemToDelete));
      if (expandedIndex === itemToDelete) setExpandedIndex(null);
      setItemToDelete(null);
    }
  };

  const openDetails = (exp: WorkExperience) => {
    setSelectedExp(exp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("form.experience")}</h2>
        <div className="flex gap-2">
          <Button
            onClick={analyzeAll}
            variant="outline"
            size="sm"
            disabled={analyzingId !== null}
          >
            {analyzingId ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t("ai.analyze_all")}
          </Button>
          <Button onClick={addExperience} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("form.add")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 2xl:gap-4">
        {data.map((exp, index) => {
          const score = scores[exp.id];
          const isAnalyzing = analyzingId === exp.id;
          const currentScore = exp.analysis?.score ?? score?.score;
          const hasAnalysis = exp.analysis !== undefined || score !== undefined;

          return (
            <div
              key={exp.id}
              className={`flex flex-col border bg-card overflow-hidden h-[600px] shadow-sm hover:shadow-md transition-shadow ${
                hasAnalysis && currentScore !== undefined
                  ? currentScore >= 80
                    ? "border-emerald-500/50"
                    : currentScore >= 60
                      ? "border-amber-500/50"
                      : "border-red-500/50"
                  : "border-border"
              }`}
            >
              {/* Score indicator */}
              {(score || exp.analysis) && (
                <div
                  className={`px-4 py-2 text-sm font-medium flex items-center justify-between ${
                    (exp.analysis?.score ?? score?.score ?? 0) >= 80
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : (exp.analysis?.score ?? score?.score ?? 0) >= 60
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "bg-red-500/10 text-red-700 dark:text-red-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {(exp.analysis?.score ?? score?.score ?? 0) >= 80 ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (exp.analysis?.score ?? score?.score ?? 0) >= 60 ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    Score: {exp.analysis?.score ?? score?.score ?? 0}/100
                    {isDataChanged(exp) && (
                      <span className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded ml-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {t("ai.data_changed")}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => openDetails(exp)}
                    className="hover:underline text-xs"
                  >
                    {t("common.details")}
                  </button>
                </div>
              )}

              {/* Header - Editable */}
              <div className="flex justify-between items-start p-4 border-b border-border bg-muted/30 gap-4">
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="relative group/title">
                    <input
                      type="text"
                      value={exp.title || ""}
                      onChange={(e) =>
                        updateExperience(index, "title", e.target.value)
                      }
                      placeholder={t("work.new_position")}
                      className={`w-full bg-transparent font-semibold border-none focus:ring-0 p-0 h-auto text-base placeholder:text-muted-foreground/50 transition-colors ${
                        getFieldHighlight(exp.id, "Title")
                          ? getFieldHighlight(exp.id, "Title") === "red"
                            ? "bg-red-500/10 text-red-700 dark:text-red-300"
                            : getFieldHighlight(exp.id, "Title") === "yellow"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : ""
                      }`}
                    />
                    {getFieldHighlight(exp.id, "Title") && (
                      <div className="absolute -right-1 top-0">
                        {getFieldHighlight(exp.id, "Title") === "red" ? (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        ) : getFieldHighlight(exp.id, "Title") === "yellow" ? (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        )}
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary/30 group-focus-within/title:w-full transition-all duration-300" />
                  </div>
                  <div className="relative group/company">
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) =>
                        updateExperience(index, "company", e.target.value)
                      }
                      placeholder={t("work.company")}
                      className={`w-full bg-transparent text-sm border-none focus:ring-0 p-0 h-auto placeholder:text-muted-foreground/30 transition-colors ${
                        getFieldHighlight(exp.id, "Company")
                          ? getFieldHighlight(exp.id, "Company") === "red"
                            ? "bg-red-500/10 text-red-700 dark:text-red-300"
                            : getFieldHighlight(exp.id, "Company") === "yellow"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary/20 group-focus-within/company:w-full transition-all duration-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 -mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeCompany(exp)}
                    disabled={isAnalyzing || !exp.title || !exp.company}
                    className="h-8 px-2 text-xs"
                    type="button"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : hasAnalysis && currentScore !== undefined ? (
                      <span className={getScoreColor(currentScore)}>
                        {currentScore}
                      </span>
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExperience(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                        {t("work.employment_type")}
                      </label>
                      <select
                        value={exp.employmentType || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "employmentType",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                      >
                        <option value="">{t("common.please_select")}</option>
                        <option value="full_time">
                          {t("work.employment_types.full_time")}
                        </option>
                        <option value="part_time">
                          {t("work.employment_types.part_time")}
                        </option>
                        <option value="self_employed">
                          {t("work.employment_types.self_employed")}
                        </option>
                        <option value="freelance">
                          {t("work.employment_types.freelance")}
                        </option>
                        <option value="contract">
                          {t("work.employment_types.contract")}
                        </option>
                        <option value="internship">
                          {t("work.employment_types.internship")}
                        </option>
                        <option value="apprenticeship">
                          {t("work.employment_types.apprenticeship")}
                        </option>
                        <option value="seasonal">
                          {t("work.employment_types.seasonal")}
                        </option>
                        <option value="pet_project">
                          {t("work.employment_types.pet_project")}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                        {t("work.location")}
                      </label>
                      <input
                        type="text"
                        value={exp.location || ""}
                        onChange={(e) =>
                          updateExperience(index, "location", e.target.value)
                        }
                        className={`w-full px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                          getFieldHighlight(exp.id, "Location")
                            ? getFieldHighlight(exp.id, "Location") === "red"
                              ? "border-red-500 bg-red-500/5"
                              : "border-amber-500 bg-amber-500/5"
                            : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                      {t("work.period")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExperience(index, "startDate", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
                          getFieldHighlight(exp.id, "Dates") ||
                          getFieldHighlight(exp.id, "Start Date") ||
                          getFieldHighlight(exp.id, "End Date")
                            ? "border-red-500 bg-red-500/5"
                            : ""
                        }`}
                      />
                      <span className="text-muted-foreground">—</span>
                      <input
                        type="month"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) =>
                          updateExperience(index, "endDate", e.target.value)
                        }
                        className={`flex-1 px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 ${
                          getFieldHighlight(exp.id, "Dates") ||
                          getFieldHighlight(exp.id, "Start Date") ||
                          getFieldHighlight(exp.id, "End Date")
                            ? "border-red-500 bg-red-500/5"
                            : ""
                        }`}
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer w-fit group">
                      <input
                        type="checkbox"
                        checked={!!exp.current}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newData = [...data];
                          newData[index] = {
                            ...newData[index],
                            current: isChecked,
                            ...(isChecked ? { endDate: "" } : {}),
                          };
                          onChange(newData);
                        }}
                        className="accent-primary h-3.5 w-3.5"
                      />
                      <span className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
                        {t("work.current_position")}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">
                      {t("work.main_description")}
                    </label>
                    <AutosizeTextarea
                      value={exp.mainDescription || ""}
                      onChange={(val) =>
                        updateExperience(index, "mainDescription", val)
                      }
                      placeholder={t("work.placeholder.main_description")}
                      highlight={getFieldHighlight(exp.id, "Main Description")}
                      className="
                        w-full 
                        px-3 py-2 
                        rounded-md 
                        text-sm
                        bg-input border border-input-border 
                        text-foreground 
                        placeholder:text-muted-foreground
                        focus:outline-none 
                        focus:ring-2 focus:ring-primary/20 focus:border-primary 
                        transition-colors 
                      "
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                      {t("work.responsibilities_achievements")}
                    </label>
                    <div className="space-y-3">
                      {exp.description.map((desc, dIndex) => (
                        <div key={dIndex} className="flex gap-2 group/item">
                          <AutosizeTextarea
                            value={desc}
                            onChange={(val) =>
                              updateDescription(index, dIndex, val)
                            }
                            placeholder="Example: Increased conversion rate by 15%..."
                            highlight={
                              getFieldHighlight(exp.id, "Description") ||
                              getFieldHighlight(exp.id, "Achievements")
                            }
                            className="
                              flex-1 
                              px-3 py-2 
                              rounded-md 
                              text-sm
                              bg-input border border-input-border 
                              text-foreground 
                              placeholder:text-muted-foreground
                              focus:outline-none 
                              focus:ring-2 focus:ring-primary/20 focus:border-primary 
                              transition-colors 
                            "
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDescriptionPoint(index, dIndex)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addDescriptionPoint(index)}
                      className="w-full text-xs h-9 border-dashed hover:border-primary hover:text-primary transition-all"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      {t("work.add_bullet")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("ai.company_score_title")}
        className="max-w-lg"
      >
        {selectedExp && (selectedExp.analysis || scores[selectedExp.id]) && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">
                {selectedExp.title} @ {selectedExp.company}
              </p>
            </div>

            {(() => {
              const score = {
                score: selectedExp.analysis?.score ?? 0,
                scoreLabel: selectedExp.analysis?.scoreLabel ?? "Fair",
                summary: selectedExp.analysis?.summary ?? "",
                red: selectedExp.analysis?.red ?? [],
                yellow: selectedExp.analysis?.yellow ?? [],
                green: selectedExp.analysis?.green ?? [],
              };
              return (
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
                        <span className="text-sm text-muted-foreground">
                          /100
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          score.score >= 80
                            ? "bg-emerald-500"
                            : score.score >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
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
                          <p className="text-muted-foreground mt-1 text-xs">
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
                          <p className="text-muted-foreground mt-1 text-xs">
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
                        <span className="text-sm font-medium">
                          {t("ai.strengths")}
                        </span>
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
                      onClick={() => {
                        if (selectedExp) {
                          setIsModalOpen(false);
                          analyzeCompany(selectedExp);
                        }
                      }}
                      className="flex-1"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t("ai.reanalyze")}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => clearScore(selectedExp.id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t("common.clear")}
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        title={t("work.delete_confirm_title")}
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t("common.delete")}
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-4 text-sm">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {t("work.delete_confirm_desc")}
            </p>
            {itemToDelete !== null && data[itemToDelete] && (
              <p className="mt-1 text-muted-foreground italic">
                {data[itemToDelete].title} @ {data[itemToDelete].company}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
