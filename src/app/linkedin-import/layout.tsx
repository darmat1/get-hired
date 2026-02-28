import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkedIn PDF Import | Import Your LinkedIn Profile to Resume",
  description:
    "Import your LinkedIn profile to create a professional resume instantly. Upload LinkedIn PDF, get AI-enhanced content, and download an ATS-friendly resume.",
  keywords:
    "linkedin import, linkedin pdf to resume, import linkedin profile, linkedin resume maker, linkedin to cv, linkedin profile importer",
  alternates: {
    canonical: "/linkedin-import",
    languages: {
      "en-US": "/linkedin-import",
      "uk-UA": "/uk/linkedin-import",
      "ru-RU": "/ru/linkedin-import",
      "x-default": "/linkedin-import",
    },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
