import { Header } from "@/components/layout/header";
import { LandingPage } from "@/components/landing/landing-page";
import type { Metadata } from "next";
import { getT } from "@/lib/server-i18n";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get("x-locale") || "en";
  const t = getT(locale as any);

  const canonical = locale === "en" ? "/" : `/${locale}`;

  return {
    title: t("page.home.title"),
    description: t("page.home.description"),
    alternates: {
      canonical,
      languages: {
        en: "/",
        uk: "/uk",
        ru: "/ru",
        "x-default": "/",
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
