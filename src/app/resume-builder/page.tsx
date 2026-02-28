import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import Link from "next/link";
import {
  CheckCircle,
  Zap,
  Download,
  LayoutTemplate,
  Briefcase,
  GraduationCap,
  PenTool,
} from "lucide-react";
import { headers, cookies } from "next/headers";
import type { Language } from "@/lib/translations";
import { getT } from "@/lib/translations-data";

export const metadata: Metadata = {
  title: "Free Resume Builder 2026 | Create Professional ATS-Friendly Resumes",
  description:
    "Create an ATS-friendly, professional resume with our free online resume maker. Choose from 20+ modern templates, get AI content suggestions, and download as PDF instantly.",
  keywords:
    "resume builder, free resume maker, online cv creator, ats-friendly resume templates, professional resume online, best resume builder tool, create cv fast, ai resume writer, resume formats 2026, online resume generator",
  openGraph: {
    title: "Free Resume Builder | Create a Professional Resume in Minutes",
    description:
      "Build a job-winning resume with our free online resume builder. ATS-friendly templates, AI suggestions, and instant PDF download.",
    type: "website",
    url: "https://gethired.com/resume-builder",
  },
  alternates: {
    canonical: "https://gethired.com/resume-builder",
    languages: {
      'en-US': '/resume-builder',
      'uk-UA': '/uk/resume-builder',
      'ru-RU': '/ru/resume-builder',
      'x-default': '/resume-builder',
    },
  },
};

export default async function ResumeBuilderPage() {
  const headerList = await headers();
  const cookieStore = await cookies();
  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  const t = getT(locale);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Animated Background blobs (Soft pastels) */}
          <div className="absolute top-0 right-10 w-72 h-72 bg-sky-300/20 dark:bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute top-20 left-10 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800/50 text-sky-600 dark:text-sky-300 text-sm font-semibold mb-8 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              {t("resume_builder.hero_badge").replace(
                "{year}",
                new Date().getFullYear().toString(),
              )}
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-8">
              {t("resume_builder.hero_title")}{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-400 dark:from-sky-400 dark:to-indigo-300">
                {t("resume_builder.hero_title_highlight")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              {t("resume_builder.hero_desc")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-10 py-5 text-lg bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {t("resume_builder.hero_cta")} <Zap className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                {t("resume_builder.hero_no_cc")}
              </div>
            </div>
          </div>

          <div className="mt-20 relative mx-auto max-w-5xl">
            {/* Pseudo-Browser Window for Hero */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 transform transition hover:scale-[1.02] duration-500">
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                <div className="w-3 h-3 rounded-full bg-red-300 dark:bg-red-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-300 dark:bg-amber-400/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-300 dark:bg-emerald-400/80"></div>
              </div>
              <div className="p-4 sm:p-10 bg-slate-50 dark:bg-slate-900/50">
                {/* Abstract Resume Graphic */}
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 shadow rounded-lg p-8 space-y-6 opacity-90 animate-fade-in-up">
                  <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-700 pb-6">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex-shrink-0 animate-pulse"></div>
                    <div className="space-y-3 flex-1">
                      <div className="h-6 w-1/3 bg-slate-100 dark:bg-slate-700 rounded animate-pulse"></div>
                      <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse animation-delay-150"></div>
                      <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700 rounded animate-pulse animation-delay-300"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-slate-50 dark:bg-slate-700/50 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-slate-50 dark:bg-slate-700/50 rounded animate-pulse animation-delay-150"></div>
                    <div className="h-4 w-4/6 bg-slate-50 dark:bg-slate-700/50 rounded animate-pulse animation-delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                {t("resume_builder.features_title")}
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                {t("resume_builder.features_desc")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <LayoutTemplate className="w-6 h-6 text-sky-400" />,
                  title: t("resume_builder.feature1_title"),
                  desc: t("resume_builder.feature1_desc"),
                },
                {
                  icon: <Briefcase className="w-6 h-6 text-indigo-400" />,
                  title: t("resume_builder.feature2_title"),
                  desc: t("resume_builder.feature2_desc"),
                },
                {
                  icon: <PenTool className="w-6 h-6 text-rose-400" />,
                  title: t("resume_builder.feature3_title"),
                  desc: t("resume_builder.feature3_desc"),
                },
                {
                  icon: <Download className="w-6 h-6 text-emerald-400" />,
                  title: t("resume_builder.feature4_title"),
                  desc: t("resume_builder.feature4_desc"),
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800/80 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700/50 mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS / STEPS */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">
                {t("resume_builder.steps_title")}
              </h2>

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: t("resume_builder.step1_title"),
                    desc: t("resume_builder.step1_desc"),
                  },
                  {
                    step: "02",
                    title: t("resume_builder.step2_title"),
                    desc: t("resume_builder.step2_desc"),
                  },
                  {
                    step: "03",
                    title: t("resume_builder.step3_title"),
                    desc: t("resume_builder.step3_desc"),
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-500 dark:text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-100 dark:border-sky-800/50">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sky-500 dark:text-sky-400 font-semibold hover:underline text-lg"
                >
                  {t("resume_builder.steps_cta")} &rarr;
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/10 to-indigo-400/10 transform rotate-3 rounded-3xl blur-2xl"></div>
              <div className="relative bg-white dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/50 p-6 rounded-3xl shadow-xl transform -rotate-2 hover:rotate-0 transition duration-500">
                <div className="space-y-4">
                  <div className="h-8 w-1/2 bg-sky-50 dark:bg-sky-900/20 rounded"></div>
                  <div className="h-4 w-full bg-slate-50 dark:bg-slate-700/50 rounded"></div>
                  <div className="h-4 w-5/6 bg-slate-50 dark:bg-slate-700/50 rounded"></div>
                  <div className="py-4 my-4 border-y border-slate-50 dark:border-slate-700/50">
                    <div className="flex gap-4 items-center">
                      <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-500" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 w-1/3 bg-slate-100 dark:bg-slate-600/50 rounded"></div>
                        <div className="h-3 w-1/4 bg-slate-50 dark:bg-slate-700/50 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO CONTENT SECTION */}
        <section className="py-20 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-10 text-center text-slate-800 dark:text-slate-200">
              {t("resume_builder.seo_title")}
            </h2>

            <div className="space-y-10 text-slate-500 dark:text-slate-400 leading-relaxed">
              <article>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  {t("resume_builder.seo1_title")}
                </h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("resume_builder.seo1_desc"),
                  }}
                />
              </article>

              <article>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  {t("resume_builder.seo2_title")}
                </h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("resume_builder.seo2_desc"),
                  }}
                />
              </article>

              <article>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  {t("resume_builder.seo3_title")}
                </h3>
                <p
                  dangerouslySetInnerHTML={{
                    __html: t("resume_builder.seo3_desc"),
                  }}
                />
              </article>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-24 relative overflow-hidden bg-sky-500 dark:bg-sky-900 border-t border-sky-600 dark:border-sky-800">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-sm">
              {t("resume_builder.cta_title")}
            </h2>
            <p className="text-xl text-sky-50 dark:text-sky-100/80 mb-10 font-medium">
              {t("resume_builder.cta_desc")}
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-5 bg-white text-sky-600 dark:text-sky-800 hover:bg-sky-50 font-bold rounded-full text-lg shadow-xl hover:shadow-2xl transition hover:-translate-y-1"
            >
              {t("resume_builder.cta_button")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
