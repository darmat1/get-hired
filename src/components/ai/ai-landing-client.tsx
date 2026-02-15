'use client';

import { Header } from '@/components/layout/header'
import { useTranslation } from '@/lib/translations'
import Link from 'next/link'
import { Brain, Zap, Check } from 'lucide-react'

export default function AILandingClient() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-28 pb-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 animate-bounce">
                  <Zap className="h-4 w-4" />
                  {t('ai_landing.badge')}
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                  {t('ai_landing.hero_title')}
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-xl">
                  {t('ai_landing.hero_subtitle')}
                </p>

                <div className="flex gap-4">
                  <Link href="/resume/new">
                    <button className="rounded-full bg-indigo-600 px-6 py-3 text-white font-semibold shadow hover:bg-indigo-500 transition">
                      {t('ai_landing.cta_analyze')}
                    </button>
                  </Link>

                  <Link href="/pricing">
                    <button className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium hover:bg-gray-50 transition">
                      {t('ai_landing.cta_pricing')}
                    </button>
                  </Link>
                </div>

                <div className="mt-8 flex gap-6">
                  <div className="flex flex-col">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">+27%</div>
                    <div className="text-sm text-gray-500">{t('ai_landing.metric_avg_score')}</div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">+98%</div>
                    <div className="text-sm text-gray-500">{t('ai_landing.metric_ats_pass')}</div>
                  </div>

                  <div className="flex flex-col">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">120k+</div>
                    <div className="text-sm text-gray-500">{t('ai_landing.metric_resumes_analyzed')}</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full h-[420px] bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex items-center justify-center animate-pulse">
                  <div className="text-sm text-gray-400">{t('ai_landing.placeholder_screenshot')}</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400 animate-pulse">{t('ai_landing.placeholder_small')}</div>
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400 animate-pulse">{t('ai_landing.placeholder_small')}</div>
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400 animate-pulse">{t('ai_landing.placeholder_small')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('ai_landing.feature_ats_title')}</h3>
                <p className="text-sm text-gray-500">{t('ai_landing.feature_ats_desc')}</p>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('ai_landing.feature_actionable_title')}</h3>
                <p className="text-sm text-gray-500">{t('ai_landing.feature_actionable_desc')}</p>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition">
                <div className="h-12 w-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{t('ai_landing.feature_private_title')}</h3>
                <p className="text-sm text-gray-500">{t('ai_landing.feature_private_desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO CONTENT */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/30">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 prose prose-lg dark:prose-invert">
            <h2>{t('ai_landing.seo_title')}</h2>
            <p>
              {t('ai_landing.seo_paragraph')}
            </p>

            <h3>{t('ai_landing.what_we_evaluate_title')}</h3>
            <ul>
              <li><strong>{t('ai_landing.eval_ats_label')}</strong> {t('ai_landing.eval_ats')}</li>
              <li><strong>{t('ai_landing.eval_impact_label')}</strong> {t('ai_landing.eval_impact')}</li>
              <li><strong>{t('ai_landing.eval_structure_label')}</strong> {t('ai_landing.eval_structure')}</li>
            </ul>

            <h3>{t('ai_landing.how_increases_title')}</h3>
            <p>{t('ai_landing.how_increases_desc')}</p>
          </div>
        </section>

        {/* METRICS */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">{t('ai_landing.metrics_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-2">{t('ai_landing.metric_avg_score')}</div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '72%', transition: 'width 1.2s ease' }} />
                  </div>
                  <div className="mt-2 font-semibold">+27%</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">{t('ai_landing.metric_ats_pass')}</div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '88%', transition: 'width 1.2s ease' }} />
                  </div>
                  <div className="mt-2 font-semibold">+98%</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-2">{t('ai_landing.metric_resumes_analyzed')}</div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '65%', transition: 'width 1.2s ease' }} />
                  </div>
                  <div className="mt-2 font-semibold">120k+</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900/30">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 prose prose-lg dark:prose-invert">
            <h3>{t('ai_landing.faq_title')}</h3>
            <h4>{t('ai_landing.faq_q1')}</h4>
            <p>{t('ai_landing.faq_a1')}</p>

            <h4>{t('ai_landing.faq_q2')}</h4>
            <p>{t('ai_landing.faq_a2')}</p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <Link href="/resume/new">
              <button className="rounded-full bg-indigo-600 px-8 py-3 text-white font-semibold shadow hover:bg-indigo-500 transition">{t('ai_landing.cta_try_free')}</button>
            </Link>
            <p className="mt-4 text-sm text-gray-500">{t('ai_landing.cta_subtext')}</p>
          </div>
        </section>

        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: 'AI Resume Analysis — GetHired',
              description:
                'AI-powered resume scoring and ATS optimization with actionable, section-level suggestions and exportable results.',
              publisher: { "@type": 'Organization', name: 'GetHired' },
            }),
          }}
        />
      </main>
    </div>
  )
}
