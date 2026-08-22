import { Resume } from "@/types/resume";
import { ModernTemplate } from "@/components/pdf-templates/modern-template";
import { pdf, Font } from "@react-pdf/renderer";
import React from "react";

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Roboto-Bold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
});

export async function generatePDF(resume: Resume): Promise<Buffer> {
  try {
    const Template = getTemplateComponent(resume.template || "professional");
    const doc = React.createElement(Template, { resume });
    const result = await pdf(doc as any).toBuffer();

    if (Buffer.isBuffer(result)) {
      return result;
    }

    // Handle case where it returns a stream (based on previous code/types)
    const chunks: any[] = [];
    for await (const chunk of result as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

// Imports of new templates
import { ProfessionalTemplate } from "@/components/pdf-templates/professional-template";
import { CreativeTemplate } from "@/components/pdf-templates/creative-template";
import { MinimalTemplate } from "@/components/pdf-templates/minimal-template";

// Template variety batch
import { TimelineTemplate } from "@/components/pdf-templates/timeline-template";
import { ModularTemplate } from "@/components/pdf-templates/modular-template";
import { ContrastTemplate } from "@/components/pdf-templates/contrast-template";
import { BannerTemplate } from "@/components/pdf-templates/banner-template";
import { CenteredTemplate } from "@/components/pdf-templates/centered-template";
import { TintedTemplate } from "@/components/pdf-templates/tinted-template";
import { BoxedTemplate } from "@/components/pdf-templates/boxed-template";
import { SymmetryTemplate } from "@/components/pdf-templates/symmetry-template";
import { CardsTemplate } from "@/components/pdf-templates/cards-template";
import { LayeredTemplate } from "@/components/pdf-templates/layered-template";
import { PortraitTemplate } from "@/components/pdf-templates/portrait-template";
import { CorporateTemplate } from "@/components/pdf-templates/corporate-template";
import { BoldTemplate } from "@/components/pdf-templates/bold-template";
import { DividerTemplate } from "@/components/pdf-templates/divider-template";
import { FramedTemplate } from "@/components/pdf-templates/framed-template";

// ... existing code ...

export function getTemplateComponent(templateName: string) {
  const templates = {
    modern: ModernTemplate,
    professional: ProfessionalTemplate,
    creative: CreativeTemplate,
    minimal: MinimalTemplate,
    timeline: TimelineTemplate,
    modular: ModularTemplate,
    contrast: ContrastTemplate,
    banner: BannerTemplate,
    centered: CenteredTemplate,
    tinted: TintedTemplate,
    boxed: BoxedTemplate,
    symmetry: SymmetryTemplate,
    cards: CardsTemplate,
    layered: LayeredTemplate,
    portrait: PortraitTemplate,
    corporate: CorporateTemplate,
    bold: BoldTemplate,
    divider: DividerTemplate,
    framed: FramedTemplate,
  };

  return templates[templateName as keyof typeof templates] || ProfessionalTemplate;
}
