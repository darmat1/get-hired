import { LandingPage } from "@/components/landing/landing-page";
import type { Metadata } from "next";
import { getT } from "@/lib/server-i18n";

export function generateMetadata({ locale }: { locale?: string }): Metadata {
  const t = getT((locale as any) || "en");
  const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    title: t("page.home.title"),
    description: t("page.home.description"),
    alternates: {
      canonical: SITE_URL,
      languages: {
        en: `${SITE_URL}/`,
        uk: `${SITE_URL}/ua`,
        ru: `${SITE_URL}/ru`,
      },
    },
  };
}

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Resume Tailor",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList:
      "AI Resume Tailoring, Cover Letter Generation, LinkedIn Import",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
