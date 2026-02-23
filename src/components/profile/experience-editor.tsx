"use client";

import { WorkExperience } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useState } from "react";

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
      description: [""],
    };
    onChange([...data, newExperience]);
    setExpandedIndex(data.length);
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

      <div className="space-y-4">
        {data.map((exp, index) => (
          <div
            key={exp.id}
            className="border border-border rounded-lg bg-card overflow-hidden"
          >
            <div
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            >
              <div className="flex-1">
                <h3 className="font-medium">
                  {exp.title || t("work.new_position")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {exp.company || t("work.company")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExperience(index);
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedIndex === index ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedIndex === index && (
              <div className="p-4 border-t border-border bg-background/50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("work.position")}
                    </label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) =>
                        updateExperience(index, "title", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("work.company")}
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, "company", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("work.location")}
                    </label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) =>
                        updateExperience(index, "location", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("work.period")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) =>
                          updateExperience(index, "startDate", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <span className="text-muted-foreground">—</span>
                      <input
                        type="month"
                        value={exp.endDate}
                        disabled={exp.current}
                        onChange={(e) =>
                          updateExperience(index, "endDate", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => {
                          updateExperience(index, "current", e.target.checked);
                          if (e.target.checked)
                            updateExperience(index, "endDate", "");
                        }}
                        className="accent-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        {t("work.current_position")}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    {t("work.description")}
                  </label>
                  {exp.description.map((desc, dIndex) => (
                    <div key={dIndex} className="flex gap-2">
                      <textarea
                        value={desc}
                        onChange={(e) =>
                          updateDescription(index, dIndex, e.target.value)
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
    [field-sizing:content] 
    min-h-[42px] 
    resize-none 
    overflow-hidden 
  "
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDescriptionPoint(index, dIndex)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addDescriptionPoint(index)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("work.add_description_point")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
