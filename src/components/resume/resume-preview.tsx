"use client";

import { Resume } from "@/types/resume";
import { useTranslation } from "@/lib/translations";
import { ModernPreview } from "@/components/resume/previews/modern-preview";
import { ProfessionalPreview } from "@/components/resume/previews/professional-preview";
import { CreativePreview } from "@/components/resume/previews/creative-preview";
import { MinimalPreview } from "@/components/resume/previews/minimal-preview";

interface ResumePreviewProps {
  data: Partial<Resume>;
}

export function ResumePreview({ data }: ResumePreviewProps) {
  const { t } = useTranslation();
  const template = data.template || "modern";

  const renderPreview = () => {
    switch (template) {
      case "professional":
        return <ProfessionalPreview data={data} />;
      case "creative":
        return <CreativePreview data={data} />;
      case "minimal":
        return <MinimalPreview data={data} />;
      default:
        return <ModernPreview data={data} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border shadow-lg overflow-hidden">
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

      <div className="flex-1 overflow-auto bg-muted/40 p-4 custom-scrollbar">
        <div
          className="mx-auto relative w-full"
          style={{ aspectRatio: "1 / 1.414" }}
        >
          <div
            className="absolute top-0 left-0 origin-top-left transition-transform duration-300 scale-[0.46] xl:scale-[0.60]"
            style={{ width: "210mm", height: "297mm" }}
          >
            <div className="resume-paper shadow-2xl ring-1 ring-black/10 h-full w-full">
              {data.personalInfo ? (
                renderPreview()
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground/40 italic bg-white">
                  <p>{t("message.no_data")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
