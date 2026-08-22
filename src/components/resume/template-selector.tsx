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
      id: "professional",
      name: t("template.professional"),
      description: t("template.professional_desc"),
      preview: "/templates/professional.png",
      badge: "ATS ready",
    },
    {
      id: "modern",
      name: t("template.modern"),
      description: t("template.modern_desc"),
      preview: "/templates/modern.png",
    },
    {
      id: "corporate",
      name: t("template.corporate"),
      description: t("template.corporate_desc"),
      preview: "/templates/corporate.png",
    },
    {
      id: "divider",
      name: t("template.divider"),
      description: t("template.divider_desc"),
      preview: "/templates/divider.png",
      badge: "ATS ready",
    },
    {
      id: "timeline",
      name: t("template.timeline"),
      description: t("template.timeline_desc"),
      preview: "/templates/timeline.png",
    },
    {
      id: "modular",
      name: t("template.modular"),
      description: t("template.modular_desc"),
      preview: "/templates/modular.png",
      badge: "ATS ready",
    },
    {
      id: "contrast",
      name: t("template.contrast"),
      description: t("template.contrast_desc"),
      preview: "/templates/contrast.png",
    },
    {
      id: "banner",
      name: t("template.banner"),
      description: t("template.banner_desc"),
      preview: "/templates/banner.png",
    },
    {
      id: "centered",
      name: t("template.centered"),
      description: t("template.centered_desc"),
      preview: "/templates/centered.png",
    },
    {
      id: "tinted",
      name: t("template.tinted"),
      description: t("template.tinted_desc"),
      preview: "/templates/tinted.png",
    },
    {
      id: "boxed",
      name: t("template.boxed"),
      description: t("template.boxed_desc"),
      preview: "/templates/boxed.png",
    },
    {
      id: "symmetry",
      name: t("template.symmetry"),
      description: t("template.symmetry_desc"),
      preview: "/templates/symmetry.png",
      badge: "ATS ready",
    },
    {
      id: "cards",
      name: t("template.cards"),
      description: t("template.cards_desc"),
      preview: "/templates/cards.png",
      badge: "ATS ready",
    },
    {
      id: "layered",
      name: t("template.layered"),
      description: t("template.layered_desc"),
      preview: "/templates/layered.png",
    },
    {
      id: "portrait",
      name: t("template.portrait"),
      description: t("template.portrait_desc"),
      preview: "/templates/portrait.png",
      badge: "ATS ready",
    },
    {
      id: "bold",
      name: t("template.bold"),
      description: t("template.bold_desc"),
      preview: "/templates/bold.png",
    },
    {
      id: "framed",
      name: t("template.framed"),
      description: t("template.framed_desc"),
      preview: "/templates/framed.png",
      badge: "ATS ready",
    },

    // {
    //   id: "minimal",
    //   name: t("template.minimal"),
    //   description: t("template.minimal_desc"),
    //   preview: "/templates/minimal.png",
    // },
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

            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-medium text-lg">{template.name}</h3>
              {"badge" in template && template.badge ? (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {template.badge}
                </span>
              ) : null}
            </div>
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
