"use client";

import { WorkExperience } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/translations";

interface WorkExperienceFormProps {
  data: WorkExperience[];
  onChange: (experience: WorkExperience[]) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export function WorkExperienceForm({
  data,
  onChange,
}: WorkExperienceFormProps) {
  const { t } = useTranslation();
  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: Math.random().toString(36),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
    };
    onChange([...data, newExperience]);
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
    const descriptions = [...updated[expIndex].description];
    descriptions[descIndex] = value;
    updated[expIndex] = { ...updated[expIndex], description: descriptions };
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
    const descriptions = updated[expIndex].description.filter(
      (_, i) => i !== descIndex,
    );
    updated[expIndex] = { ...updated[expIndex], description: descriptions };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {t("form.work_experience")}
          </h2>
          <Button
            onClick={addExperience}
            variant="outline"
            size="sm"
            type="button"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("form.add")}
          </Button>
        </div>

        <div className="space-y-6 text-foreground">
          {data.map((exp, index) => (
            <div key={exp.id} className="">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">
                  {t("form.work_experience")} #{index + 1}
                </h3>
                <Button
                  onClick={() => removeExperience(index)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

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
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
                    placeholder={t("work.placeholder.position")}
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
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
                    placeholder={t("work.placeholder.company")}
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
                    className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
                    placeholder={t("work.placeholder.location")}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {t("work.period")}
                  </label>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <div className="flex-1">
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) =>
                            updateExperience(index, "startDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors h-10 text-foreground"
                        />
                      </div>
                      <span className="hidden sm:block text-muted-foreground">
                        —
                      </span>
                      <div className="flex-1">
                        <input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) =>
                            updateExperience(index, "endDate", e.target.value)
                          }
                          disabled={exp.current}
                          className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:opacity-50 disabled:bg-muted h-10 text-foreground"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => {
                          updateExperience(index, "current", e.target.checked);
                          if (e.target.checked) {
                            updateExperience(index, "endDate", "");
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {t("work.description")}
                </label>
                {(Array.isArray(exp.description)
                  ? exp.description
                  : typeof exp.description === "string"
                    ? (exp.description as string).split("\n")
                    : [""]
                ).map((desc, descIndex) => (
                  <div key={descIndex} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) =>
                        updateDescription(index, descIndex, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-foreground"
                      placeholder={t("work.placeholder.description")}
                    />
                    <Button
                      onClick={() => removeDescriptionPoint(index, descIndex)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => addDescriptionPoint(index)}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  type="button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("form.add")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
