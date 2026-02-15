"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import {
  FileText,
  Download,
  Upload,
  Cpu,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LinkedInImportPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
                  <Zap className="h-3 w-3" />
                  <span>{t("li_landing.adv3_title")}</span>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
                  {t("li_landing.hero_title")}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
                  {t("li_landing.hero_subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="px-8 py-6 text-lg h-auto group"
                    >
                      {t("li_landing.start_btn")}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-6 text-lg h-auto"
                  >
                    {t("nav.home")}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 pointer-events-none" />
                  <FileText className="h-24 w-24 text-blue-500 mb-6 animate-pulse" />
                  <div className="text-center">
                    <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">
                      [SCREENSHOT PLACEHOLDER]
                    </p>
                    <p className="text-sm text-gray-400">
                      Preview of PDF to Data transformation
                    </p>
                  </div>
                </div>
                {/* Floatings items */}
                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 animate-bounce duration-[3000ms]">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium pr-2">
                    ATS Optimized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
                {t("li_landing.how_title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connector lines (Desktop) */}
              <div className="hidden md:block absolute top-12 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-blue-600 mb-8 group hover:scale-110 transition-transform">
                  <Download className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {t("li_landing.step1_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                  {t("li_landing.step1_desc")}
                </p>
                {/* Step Placeholder */}
                <div className="mt-8 w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-xs text-gray-500 uppercase font-mono tracking-widest text-center px-4">
                    Screenshot: LinkedIn &apos;Save to PDF&apos; Button
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-purple-600 mb-8 group hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {t("li_landing.step2_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                  {t("li_landing.step2_desc")}
                </p>
                {/* Step Placeholder */}
                <div className="mt-8 w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-xs text-gray-500 uppercase font-mono tracking-widest text-center px-4">
                    Screenshot: Upload Area on CV Maker
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center relative">
                <div className="h-20 w-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-orange-600 mb-8 group hover:scale-110 transition-transform">
                  <Cpu className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {t("li_landing.step3_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                  {t("li_landing.step3_desc")}
                </p>
                {/* Step Placeholder */}
                <div className="mt-8 w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-xs text-gray-500 uppercase font-mono tracking-widest text-center px-4">
                    Screenshot: Final Professional Resume
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages */}
        <section className="py-24 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center p-8">
                    <div className="text-center">
                      <Lock className="h-12 w-12 text-blue-600 mb-3 mx-auto" />
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                        Private
                      </p>
                    </div>
                  </div>
                  <div className="aspect-[4/5] mt-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center p-8">
                    <div className="text-center">
                      <Zap className="h-12 w-12 text-purple-600 mb-3 mx-auto" />
                      <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                        No limits
                      </p>
                    </div>
                  </div>
                </div>
                {/* Decoration blob */}
                <div className="absolute -z-10 top-0 left-0 w-full h-full bg-blue-500/5 blur-3xl rounded-full" />
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-8">
                  {t("li_landing.adv_title")}
                </h2>

                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex-shrink-0 flex items-center justify-center text-white">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">
                        {t("li_landing.adv1_title")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("li_landing.adv1_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-600 flex-shrink-0 flex items-center justify-center text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">
                        {t("li_landing.adv2_title")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("li_landing.adv2_desc")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-600 flex-shrink-0 flex items-center justify-center text-white">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">
                        {t("li_landing.adv3_title")}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t("li_landing.adv3_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security / CTA */}
        <section className="py-24 bg-blue-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-blue-500 pointer-events-none -skew-x-12 translate-x-1/2" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8 mx-auto backdrop-blur-sm">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
                {t("li_landing.security_title")}
              </h2>
              <p className="text-xl text-blue-100 mb-10 leading-relaxed">
                {t("li_landing.security_desc")}
              </p>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-10 py-7 text-lg h-auto shadow-xl hover:scale-105 transition-transform"
                >
                  {t("li_landing.start_btn")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
