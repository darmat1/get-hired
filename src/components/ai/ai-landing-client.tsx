"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import Link from "next/link";
import { Brain, Zap, Check, BrainCog } from "lucide-react";
import Image from "next/image";

export default function AILandingClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="font-body relative pt-28 pb-12 bg-gradient-to-b from-warm-50 to-warm-50 dark:from-warm-900 dark:to-warm-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 text-sm font-semibold mb-6 animate-bounce">
                  <BrainCog className="h-4 w-4" />
                  {t("ai_landing.badge")}
                </div>

                <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-warm-900 dark:text-warm-50 leading-tight mb-4">
                  {t("ai_landing.hero_title")}
                </h1>

                <p className="text-lg text-warm-600 dark:text-warm-400 mb-6 max-w-xl">
                  {t("ai_landing.hero_subtitle")}
                </p>

                <div className="flex gap-4">
                  <Link href="/dashboard">
                    <button className="rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white px-6 py-3 font-semibold shadow transition">
                      {t("ai_landing.cta_analyze")}
                    </button>
                  </Link>

                  <Link href="/pricing">
                    <button className="rounded-full border border-warm-200 px-6 py-3 text-sm font-medium text-warm-700 hover:bg-warm-50 transition dark:border-warm-800 dark:text-warm-300 dark:hover:bg-warm-800/50 dark:hover:text-warm-100">
                      {t("ai_landing.cta_pricing")}
                    </button>
                  </Link>
                </div>

                <div className="mt-8 flex gap-6">
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold text-warm-900 dark:text-warm-50">
                      +27%
                    </div>
                    <div className="text-sm text-warm-500 dark:text-warm-400">
                      {t("ai_landing.metric_avg_score")}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-3xl font-bold text-warm-900 dark:text-warm-50">
                      +98%
                    </div>
                    <div className="text-sm text-warm-500 dark:text-warm-400">
                      {t("ai_landing.metric_ats_pass")}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-3xl font-bold text-warm-900 dark:text-warm-50">
                      120k+
                    </div>
                    <div className="text-sm text-warm-500 dark:text-warm-400">
                      {t("ai_landing.metric_resumes_analyzed")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full h-[350px] dark:bg-warm-800 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center animate-pulse object-contain">
                  <div className="text-sm text-warm-400">
                    <Image
                      src="/ai1.jpg"
                      alt="AI Landing Hero"
                      width={800}
                      height={800}
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-20 bg-warm-100 dark:bg-warm-800 rounded-lg flex items-center justify-center text-xs text-warm-400 animate-pulse">
                    {t("ai_landing.placeholder_small")}
                  </div>
                  <div className="h-20 bg-warm-100 dark:bg-warm-800 rounded-lg flex items-center justify-center text-xs text-warm-400 animate-pulse">
                    {t("ai_landing.placeholder_small")}
                  </div>
                  <div className="h-20 bg-warm-100 dark:bg-warm-800 rounded-lg flex items-center justify-center text-xs text-warm-400 animate-pulse">
                    {t("ai_landing.placeholder_small")}
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="font-body py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-warm-50 dark:bg-warm-900 rounded-2xl border border-warm-100 dark:border-warm-800 hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-lg bg-warm-100 dark:bg-warm-800 text-warm-600 dark:text-warm-400 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-warm-900 dark:text-warm-50 mb-2">
                  {t("ai_landing.feature_ats_title")}
                </h3>
                <p className="text-sm text-warm-500 dark:text-warm-400">
                  {t("ai_landing.feature_ats_desc")}
                </p>
              </div>

              <div className="p-6 bg-warm-50 dark:bg-warm-800 rounded-2xl border border-warm-100 dark:border-warm-700 hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-warm-900 dark:text-warm-50 mb-2">
                  {t("ai_landing.feature_actionable_title")}
                </h3>
                <p className="text-sm text-warm-500 dark:text-warm-400">
                  {t("ai_landing.feature_actionable_desc")}
                </p>
              </div>

              <div className="p-6 bg-warm-50 dark:bg-warm-800 rounded-2xl border border-warm-100 dark:border-warm-700 hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-warm-900 dark:text-warm-50 mb-2">
                  {t("ai_landing.feature_private_title")}
                </h3>
                <p className="text-sm text-warm-500 dark:text-warm-400">
                  {t("ai_landing.feature_private_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO CONTENT */}
        <section className="font-body py-20 bg-warm-50 dark:bg-warm-900/30">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 prose prose-lg dark:prose-invert">
            <h2 className="font-heading">{t("ai_landing.seo_title")}</h2>
            <p>{t("ai_landing.seo_paragraph")}</p>

            <h3 className="font-heading">{t("ai_landing.what_we_evaluate_title")}</h3>
            <ul>
              <li>
                <strong>{t("ai_landing.eval_ats_label")}</strong>{" "}
                {t("ai_landing.eval_ats")}
              </li>
              <li>
                <strong>{t("ai_landing.eval_impact_label")}</strong>{" "}
                {t("ai_landing.eval_impact")}
              </li>
              <li>
                <strong>{t("ai_landing.eval_structure_label")}</strong>{" "}
                {t("ai_landing.eval_structure")}
              </li>
            </ul>

            <h3 className="font-heading">{t("ai_landing.how_increases_title")}</h3>
            <p>{t("ai_landing.how_increases_desc")}</p>
          </div>
        </section>

        {/* METRICS */}
        <section className="font-body py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="bg-warm-50 dark:bg-warm-800 rounded-2xl p-8 border border-warm-100 dark:border-warm-700">
              <h3 className="font-heading text-xl font-bold text-warm-900 dark:text-warm-50 mb-4">
                {t("ai_landing.metrics_title")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-warm-500 dark:text-warm-400 mb-2">
                    {t("ai_landing.metric_avg_score")}
                  </div>
                  <div className="w-full h-3 bg-warm-100 dark:bg-warm-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warm-600 rounded-full"
                      style={{ width: "72%", transition: "width 1.2s ease" }}
                    />
                  </div>
                  <div className="mt-2 font-semibold text-warm-900 dark:text-warm-50">+27%</div>
                </div>

                <div>
                  <div className="text-sm text-warm-500 dark:text-warm-400 mb-2">
                    {t("ai_landing.metric_ats_pass")}
                  </div>
                  <div className="w-full h-3 bg-warm-100 dark:bg-warm-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: "88%", transition: "width 1.2s ease" }}
                    />
                  </div>
                  <div className="mt-2 font-semibold text-warm-900 dark:text-warm-50">+98%</div>
                </div>

                <div>
                  <div className="text-sm text-warm-500 dark:text-warm-400 mb-2">
                    {t("ai_landing.metric_resumes_analyzed")}
                  </div>
                  <div className="w-full h-3 bg-warm-100 dark:bg-warm-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: "65%", transition: "width 1.2s ease" }}
                    />
                  </div>
                  <div className="mt-2 font-semibold text-warm-900 dark:text-warm-50">120k+</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="font-body py-12 bg-warm-50 dark:bg-warm-900/30">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 prose prose-lg dark:prose-invert">
            <h3 className="font-heading">{t("ai_landing.faq_title")}</h3>
            <h4>{t("ai_landing.faq_q1")}</h4>
            <p>{t("ai_landing.faq_a1")}</p>

            <h4>{t("ai_landing.faq_q2")}</h4>
            <p>{t("ai_landing.faq_a2")}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="font-body py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <Link href="/dashboard">
              <button className="rounded-full bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white px-8 py-3 font-semibold shadow transition">
                {t("ai_landing.cta_try_free")}
              </button>
            </Link>
            <p className="mt-4 text-sm text-warm-500 dark:text-warm-400">
              {t("ai_landing.cta_subtext")}
            </p>
          </div>
        </section>

        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "AI Resume Analysis — GetHired",
              description:
                "AI-powered resume scoring and ATS optimization with actionable, section-level suggestions and exportable results.",
              publisher: { "@type": "Organization", name: "GetHired" },
            }),
          }}
        />
      </main>
    </div>
  );
}
