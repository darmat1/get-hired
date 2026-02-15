"use client";

import { Skill } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useState, KeyboardEvent } from "react";

interface SkillsFormProps {
  data: Skill[];
  onChange: (skills: Skill[]) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  const { t } = useTranslation();

  // State for input values
  const [technicalInput, setTechnicalInput] = useState("");
  const [softInput, setSoftInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [languageLevel, setLanguageLevel] =
    useState<Skill["level"]>("intermediate");

  const handleAddSkill = (
    category: "technical" | "soft" | "language",
    inputValue: string,
    setInput: (val: string) => void,
    level: Skill["level"] = "intermediate",
  ) => {
    if (!inputValue.trim()) return;

    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: inputValue.trim(),
      category: category,
      level: level,
    };

    onChange([...data, newSkill]);
    setInput("");
  };

  const handleRemoveSkill = (skillToRemove: Skill) => {
    onChange(data.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    category: "technical" | "soft" | "language",
    inputValue: string,
    setInput: (val: string) => void,
    level: Skill["level"] = "intermediate",
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill(category, inputValue, setInput, level);
    }
  };

  const skillsByCategory = {
    technical: data.filter((skill) => skill.category === "technical"),
    soft: data.filter((skill) => skill.category === "soft"),
    language: data.filter((skill) => skill.category === "language"),
  };

  const renderCategorySection = (
    category: "technical" | "soft" | "language",
    title: string,
    inputValue: string,
    setInput: (val: string) => void,
  ) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground/80 uppercase tracking-wider">
        {title}
      </h3>

      {/* Skills List (Badges) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {skillsByCategory[category].map((skill) => (
          <div
            key={skill.id}
            className="flex items-center gap-1 bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-full text-sm border border-border/50 group hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
          >
            <span>
              {skill.name}
              {category === "language" && (
                <span className="text-muted-foreground text-xs ml-1 opacity-70">
                  ({t(`skill.level.${skill.level}`)})
                </span>
              )}
            </span>
            <button
              onClick={() => handleRemoveSkill(skill)}
              className="text-muted-foreground hover:text-destructive ml-1 focus:outline-none"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {skillsByCategory[category].length === 0 && (
          <div className="text-sm text-muted-foreground italic py-1">
            {t("skills.none")}
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            handleKeyDown(
              e,
              category,
              inputValue,
              setInput,
              category === "language" ? languageLevel : "intermediate",
            )
          }
          placeholder={`Add ${title.toLowerCase()}...`}
          className="flex-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {category === "language" && (
          <select
            value={languageLevel}
            onChange={(e) => setLanguageLevel(e.target.value as Skill["level"])}
            className="w-[130px] px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="beginner">{t("skill.level.beginner")}</option>
            <option value="elementary">{t("skill.level.elementary")}</option>
            <option value="intermediate">
              {t("skill.level.intermediate")}
            </option>
            <option value="advanced">{t("skill.level.advanced")}</option>
            <option value="expert">{t("skill.level.expert")}</option>
          </select>
        )}

        <Button
          onClick={() =>
            handleAddSkill(
              category,
              inputValue,
              setInput,
              category === "language" ? languageLevel : "intermediate",
            )
          }
          variant="secondary"
          size="icon"
          disabled={!inputValue.trim()}
        >
          <Plus size={18} />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("form.skills")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Technical Skills */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            {renderCategorySection(
              "technical",
              t("skills.technical"),
              technicalInput,
              setTechnicalInput,
            )}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          {renderCategorySection(
            "soft",
            t("skills.soft"),
            softInput,
            setSoftInput,
          )}
        </div>

        {/* Language Skills */}
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          {renderCategorySection(
            "language",
            t("skills.languages"),
            languageInput,
            setLanguageInput,
          )}
        </div>
      </div>
    </div>
  );
}
