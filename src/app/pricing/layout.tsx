import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | GetHired - Free Resume Builder & AI Career Tools",
  description:
    "Choose the plan that fits your career needs. Free forever plan with essential resume tools, or Pro plan with unlimited resumes, premium templates, and analytics.",
  keywords:
    "pricing, resume builder pricing, ai career tools pricing, free resume maker, pro resume builder",
  alternates: {
    canonical: "/pricing",
    languages: {
      "en-US": "/pricing",
      "uk-UA": "/uk/pricing",
      "ru-RU": "/ru/pricing",
      "x-default": "/pricing",
    },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
