"use client";

import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { ModernPreview } from "@/components/resume/previews/modern-preview";
import { ProfessionalPreview } from "@/components/resume/previews/professional-preview";
import { MinimalPreview } from "@/components/resume/previews/minimal-preview";
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
  const template = data.template || "modern";

  const TEMPLATES = [
    { id: "modern", label: t("template.modern") },
    { id: "professional", label: t("template.professional") },
    // { id: "minimal", label: "Minimal" },
  ];

  const renderPreview = () => {
    switch (template) {
      case "professional":
        return (
          <ProfessionalPreview
            data={data}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
      case "minimal":
        return (
          <MinimalPreview
            data={data}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
      default:
        return (
          <ModernPreview
            data={data}
            onChange={onChange}
            isEditing={isEditing}
          />
        );
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
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {tmpl.label}
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
