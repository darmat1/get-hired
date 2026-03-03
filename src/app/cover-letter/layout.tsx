import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get("x-locale") || "en";
  const path = "/cover-letter";
  const canonical = locale === "en" ? path : `/${locale}${path}`;

  return {
    title: "Free Cover Letter Generator | AI-Powered Cover Letter Builder",
    description:
      "Create professional cover letters with our free AI cover letter generator. Tailor to any job, use real resume facts, and download as PDF instantly.",
    keywords:
      "cover letter generator, free cover letter maker, ai cover letter writer, cover letter builder, professional cover letter, job application letter, cover letter templates",
    alternates: {
      canonical,
      languages: {
        "en-US": "/cover-letter",
        "uk-UA": "/uk/cover-letter",
        "ru-RU": "/ru/cover-letter",
        "x-default": "/cover-letter",
      },
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
