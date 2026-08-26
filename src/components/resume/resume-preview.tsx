"use client";

import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { ModernPreview } from "@/components/resume/previews/modern-preview";
import { ProfessionalPreview } from "@/components/resume/previews/professional-preview";
import { MinimalPreview } from "@/components/resume/previews/minimal-preview";
import { TimelinePreview } from "@/components/resume/previews/timeline-preview";
import { ModularPreview } from "@/components/resume/previews/modular-preview";
import { ContrastPreview } from "@/components/resume/previews/contrast-preview";
import { BannerPreview } from "@/components/resume/previews/banner-preview";
import { CenteredPreview } from "@/components/resume/previews/centered-preview";
import { TintedPreview } from "@/components/resume/previews/tinted-preview";
import { BoxedPreview } from "@/components/resume/previews/boxed-preview";
import { SymmetryPreview } from "@/components/resume/previews/symmetry-preview";
import { CardsPreview } from "@/components/resume/previews/cards-preview";
import { LayeredPreview } from "@/components/resume/previews/layered-preview";
import { PortraitPreview } from "@/components/resume/previews/portrait-preview";
import { CorporatePreview } from "@/components/resume/previews/corporate-preview";
import { BoldPreview } from "@/components/resume/previews/bold-preview";
import { DividerPreview } from "@/components/resume/previews/divider-preview";
import { FramedPreview } from "@/components/resume/previews/framed-preview";
import { LayoutGrid } from "lucide-react";

interface ResumePreviewProps {
  data: Partial<Resume>;
  onChange?: (data: Partial<Resume>) => void;
  isEditing?: boolean;
  onTemplateChange?: (template: string) => void;
}

export function ResumePreview({
  data,
  onChange,
  isEditing = false,
  onTemplateChange,
}: ResumePreviewProps) {
  const { t } = useTranslation();
  const template = data.template || "professional";

  const TEMPLATES = [
    { id: "professional", label: t("template.professional"), badge: "ATS ready" },
    { id: "modern", label: t("template.modern") },
    { id: "corporate", label: t("template.corporate") },
    { id: "divider", label: t("template.divider"), badge: "ATS ready" },
    { id: "timeline", label: t("template.timeline") },
    { id: "modular", label: t("template.modular"), badge: "ATS ready" },
    { id: "contrast", label: t("template.contrast") },
    { id: "banner", label: t("template.banner") },
    { id: "centered", label: t("template.centered") },
    { id: "tinted", label: t("template.tinted") },
    { id: "boxed", label: t("template.boxed") },
    { id: "symmetry", label: t("template.symmetry"), badge: "ATS ready" },
    { id: "cards", label: t("template.cards"), badge: "ATS ready" },
    { id: "layered", label: t("template.layered") },
    { id: "portrait", label: t("template.portrait"), badge: "ATS ready" },
    { id: "bold", label: t("template.bold") },
    { id: "framed", label: t("template.framed"), badge: "ATS ready" },
    // { id: "minimal", label: "Minimal" },
  ];

  const renderPreview = () => {
    const props = { data, onChange, isEditing };
    switch (template) {
      case "professional":
        return <ProfessionalPreview {...props} />;
      case "modern":
        return <ModernPreview {...props} />;
      case "minimal":
        return <MinimalPreview {...props} />;
      case "timeline":
        return <TimelinePreview {...props} />;
      case "modular":
        return <ModularPreview {...props} />;
      case "contrast":
        return <ContrastPreview {...props} />;
      case "banner":
        return <BannerPreview {...props} />;
      case "centered":
        return <CenteredPreview {...props} />;
      case "tinted":
        return <TintedPreview {...props} />;
      case "boxed":
        return <BoxedPreview {...props} />;
      case "symmetry":
        return <SymmetryPreview {...props} />;
      case "cards":
        return <CardsPreview {...props} />;
      case "layered":
        return <LayeredPreview {...props} />;
      case "portrait":
        return <PortraitPreview {...props} />;
      case "corporate":
        return <CorporatePreview {...props} />;
      case "bold":
        return <BoldPreview {...props} />;
      case "divider":
        return <DividerPreview {...props} />;
      case "framed":
        return <FramedPreview {...props} />;
      default:
        return <ProfessionalPreview {...props} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border shadow-lg">
      <div className="p-4 border-b bg-card flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-foreground/80 text-sm">
          {t("preview.title")}
        </h3>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Template Switcher */}
      {isEditing && onTemplateChange && (
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-3 flex-shrink-0">
          <LayoutGrid className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onTemplateChange(tmpl.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  template === tmpl.id
                    ? "bg-warm-900 text-white dark:bg-warm-100 dark:text-warm-900 shadow-sm"
                    : "bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 border border-warm-200 dark:border-warm-700 hover:border-warm-400 dark:hover:border-warm-500 hover:text-warm-900 dark:hover:text-warm-200"
                }`}
              >
                <span>{tmpl.label}</span>
                {tmpl.badge ? (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      template === tmpl.id
                        ? "bg-white/15 text-white dark:bg-warm-900/10 dark:text-warm-900"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    }`}
                  >
                    {tmpl.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-muted/40 p-4 md:p-12 custom-scrollbar">
        <div className="flex justify-center min-w-max pb-8">
          <div
            className="bg-white shadow-2xl ring-1 ring-black/10 transition-shadow duration-300 relative"
            style={{ width: "210mm", minHeight: "297mm" }}
          >
            {data.personalInfo ? (
              renderPreview()
            ) : (
              <div className="flex items-center justify-center h-full min-h-[297mm] text-muted-foreground/40 italic bg-white">
                <p>{t("message.no_data")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
