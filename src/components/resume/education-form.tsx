"use client";

import { Education } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/translations";

interface EducationFormProps {
  data: Education[];
  onChange: (education: Education[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EducationForm({
  data,
  onChange,
  onNext,
  onBack,
}: EducationFormProps) {
  const { t } = useTranslation();
  const addEducation = () => {
    const newEducation: Education = {
      id: Math.random().toString(36),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
    };
    onChange([...data, newEducation]);
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
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t("form.education")}</h2>
        <Button onClick={addEducation} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("form.add")}
        </Button>
      </div>

      <div className="space-y-6">
        {data.map((edu, index) => (
          <div key={edu.id} className="">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">
                {t("form.education")} #{index + 1}
              </h3>
              <Button
                onClick={() => removeEducation(index)}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

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
                  placeholder={t("education.placeholder.institution")}
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
                  placeholder={t("education.placeholder.degree")}
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
                  placeholder={t("education.placeholder.field")}
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
                  placeholder={t("education.placeholder.gpa")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  {t("education.period")}
                </label>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div className="flex-1">
                      <input
                        type="month"
                        value={edu.startDate}
                        onChange={(e) =>
                          updateEducation(index, "startDate", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors h-10"
                      />
                    </div>
                    <span className="hidden sm:block text-muted-foreground">
                      —
                    </span>
                    <div className="flex-1">
                      <input
                        type="month"
                        value={edu.endDate}
                        onChange={(e) =>
                          updateEducation(index, "endDate", e.target.value)
                        }
                        disabled={edu.current}
                        className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:bg-muted h-10"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) => {
                        updateEducation(index, "current", e.target.checked);
                        if (e.target.checked) {
                          updateEducation(index, "endDate", "");
                        }
                      }}
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">
                      {t("work.current_position")}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t("form.back")}
        </Button>
        <Button onClick={onNext}>{t("form.next")}</Button>
      </div>
    </div>
  );
}
