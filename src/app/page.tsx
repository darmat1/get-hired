import { LandingPage } from "@/components/landing/landing-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Resume Tailor & Cover Letter Generator | LinkedIn PDF to Resume",
  description:
    "Create tailored resumes and fact-based cover letters in seconds. Convert your LinkedIn PDF and match it to any job description using AI.",
};

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
