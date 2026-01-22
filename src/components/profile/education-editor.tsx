"use client";

import { Education } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useState } from "react";

interface EducationEditorProps {
  data: Education[];
  onChange: (education: Education[]) => void;
}

export function EducationEditor({ data, onChange }: EducationEditorProps) {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const addEducation = () => {
    const newEducation: Education = {
      id: crypto.randomUUID(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
    };
    onChange([...data, newEducation]);
    setExpandedIndex(data.length);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: any,
  ) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t("form.education")}</h2>
        <Button onClick={addEducation} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("form.add")}
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((edu, index) => (
          <div
            key={edu.id}
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
                  {edu.institution || "Учебное заведение"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {edu.degree} {edu.field ? `— ${edu.field}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeEducation(index);
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
                      {t("education.institution")}
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(index, "institution", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("education.degree")}
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("education.field")}
                    </label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(index, "field", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("education.gpa")}
                    </label>
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) =>
                        updateEducation(index, "gpa", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      {t("education.period")}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(index, "startDate", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                      />
                      <span className="text-muted-foreground">—</span>
                      <input
                        type="month"
                        value={edu.endDate}
                        disabled={edu.current}
                        onChange={(e) =>
                          updateEducation(index, "endDate", e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50"
                      />
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edu.current}
                        onChange={(e) => {
                          updateEducation(index, "current", e.target.checked);
                          if (e.target.checked)
                            updateEducation(index, "endDate", "");
                        }}
                        className="accent-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        Учусь сейчас
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
