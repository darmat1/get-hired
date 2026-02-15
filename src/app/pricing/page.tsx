"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import { Check, Zap, ShieldCheck, Mail, BarChart3, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const { t } = useTranslation();

  const starterFeatures = [
    t("pricing_landing.feature_resumes"),
    t("pricing_landing.feature_template"),
    t("pricing_landing.feature_ai_cl"),
    t("pricing_landing.feature_li"),
    t("pricing_landing.feature_ai_resume"),
  ];

  const proFeatures = [
    t("pricing_landing.feature_unlimited"),
    t("pricing_landing.feature_premium_templates"),
    t("pricing_landing.feature_analytics"),
    "Priority Support",
    "Early Access to Features",
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden text-center bg-gray-50/50 dark:bg-gray-900/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
              {t("pricing_landing.hero_title")}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("pricing_landing.hero_subtitle")}
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-24 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="relative group bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">
                    {t("pricing_landing.free_name")}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold">$0</span>
                    <span className="text-gray-500">/mo</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10">
                  {starterFeatures.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                    >
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/dashboard" className="block mt-auto">
                  <Button size="lg" className="w-full py-6 text-lg rounded-xl">
                    {t("li_landing.start_btn")}
                  </Button>
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="relative group bg-white dark:bg-black p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />

                <div className="absolute top-8 right-8 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {t("pricing_landing.pro_tag")}
                </div>

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {t("pricing_landing.pro_name")}
                  </h3>
                  <div className="h-12" />{" "}
                  {/* Spacer to maintain layout consistency */}
                </div>

                <ul className="space-y-4 mb-10">
                  {proFeatures.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-gray-600 dark:text-gray-300"
                    >
                      <Star className="h-5 w-5 text-blue-400 flex-shrink-0 fill-blue-400/20" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  disabled
                  size="lg"
                  variant="outline"
                  className="w-full py-6 text-lg rounded-xl border-gray-200 dark:border-gray-700 text-gray-400"
                >
                  {t("pricing_landing.pro_tag")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* SEO / Value Prop Section */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-8">
                  {t("pricing_landing.seo_title")}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-10">
                  {t("pricing_landing.seo_desc")}
                </p>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Fast Results:</strong> Generate a full resume &
                      cover letter combo in under 5 minutes.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>ATS Compatibility:</strong> Every template is
                      engineered to pass through modern hiring software.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Privacy First:</strong> Your data belongs to you.
                      No hidden subscriptions or data selling.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="h-20 w-20 text-purple-600 mb-6 mx-auto animate-pulse" />
                    <p className="text-lg font-bold">10,000+ Success Stories</p>
                    <p className="text-gray-500 text-sm">
                      Join the community of hired pros
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-xs uppercase tracking-wider">
                    Hiring software pass rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
