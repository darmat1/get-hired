"use client";

import { WorkExperience } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useState, useRef, useEffect } from "react";

interface AutosizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function AutosizeTextarea({
  value,
  onChange,
  placeholder,
  className,
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

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none`}
      rows={1}
    />
  );
}

interface ExperienceEditorProps {
  data: WorkExperience[];
  onChange: (experience: WorkExperience[]) => void;
}

export function ExperienceEditor({ data, onChange }: ExperienceEditorProps) {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

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
    onChange(data.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("form.experience")}</h2>
        <Button onClick={addExperience} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("form.add")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 2xl:gap-4">
        {data.map((exp, index) => (
          <div
            key={exp.id}
            className="flex flex-col border border-border bg-card overflow-hidden h-[600px] shadow-sm hover:shadow-md transition-shadow"
          >
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
                    className="w-full bg-transparent font-semibold border-none focus:ring-0 p-0 h-auto text-base placeholder:text-muted-foreground/50 transition-colors"
                  />
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
                    className="w-full bg-transparent text-sm text-muted-foreground border-none focus:ring-0 p-0 h-auto placeholder:text-muted-foreground/30 transition-colors"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary/20 group-focus-within/company:w-full transition-all duration-300" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(index)}
                className="text-muted-foreground hover:text-destructive shrink-0 -mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
                      className="w-full px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
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
                      className="flex-1 px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                      type="month"
                      value={exp.endDate}
                      disabled={exp.current}
                      onChange={(e) =>
                        updateExperience(index, "endDate", e.target.value)
                      }
                      className="flex-1 px-3 py-2 text-sm border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
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
        ))}
      </div>
    </div>
  );
}
