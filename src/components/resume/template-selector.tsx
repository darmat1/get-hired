"use client";

import { useTranslation } from "@/lib/translations";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onChange: (template: string) => void;
}

export function TemplateSelector({
  selectedTemplate,
  onChange,
}: TemplateSelectorProps) {
  const { t } = useTranslation();

  const templates = [
    {
      id: "modern",
      name: t("template.modern"),
      description: t("template.modern_desc"),
      preview: "/templates/modern.png",
    },
    {
      id: "professional",
      name: t("template.professional"),
      description: t("template.professional_desc"),
      preview: "/templates/professional.png",
    },
    {
      id: "creative",
      name: t("template.creative"),
      description: t("template.creative_desc"),
      preview: "/templates/creative.png",
    },
    {
      id: "minimal",
      name: t("template.minimal"),
      description: t("template.minimal_desc"),
      preview: "/templates/minimal.png",
    },
  ];

  return (
    <div className="">
      <h2 className="text-xl font-semibold mb-6">{t("template.title")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedTemplate === template.id
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border bg-background/50 hover:border-border-hover hover:bg-background/80"
            }`}
            onClick={() => onChange(template.id)}
          >
            <div className="aspect-[3/4] bg-muted rounded-md mb-3 flex items-center justify-center border border-border/50">
              <span className="text-muted-foreground text-sm">
                {t("template.preview")}
              </span>
            </div>

            <h3 className="font-medium text-lg mb-1">{template.name}</h3>
            <p className="text-muted-foreground text-sm">
              {template.description}
            </p>

            {selectedTemplate === template.id && (
              <div className="mt-2 flex items-center gap-1">
                <span className="text-primary text-sm font-medium">
                  ✓ {t("template.selected")}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
