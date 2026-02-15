"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import {
  FileText,
  Sparkles,
  Upload,
  Zap,
  ShieldCheck,
  ArrowRight,
  ClipboardList,
  Mail,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CoverLetterPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Centered Layout for variety */}
        <section className="relative pt-32 pb-20 overflow-hidden text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[120px] -z-10" />

          <div className="mx-auto max-w-4xl px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold mb-8 border border-purple-100 dark:border-purple-800/50">
              <Sparkles className="h-4 w-4" />
              <span>{t("cl_landing.adv1_title")}</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl mb-8 leading-[1.1]">
              {t("cl_landing.hero_title")}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              {t("cl_landing.hero_subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="px-10 py-7 text-xl h-auto group bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/20"
                >
                  {t("li_landing.start_btn")}
                  <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-7 text-xl h-auto"
              >
                {t("nav.home")}
              </Button>
            </div>

            {/* Floating UI Elements instead of a big screenshot */}
            <div className="relative max-w-3xl mx-auto h-[200px] hidden sm:block">
              <div className="absolute top-0 left-0 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-64 -rotate-6 animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-700" />
                  <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-gray-50 dark:bg-gray-900 rounded-full" />
                  <div className="w-4/5 h-2 bg-gray-50 dark:bg-gray-900 rounded-full" />
                </div>
              </div>

              <div className="absolute top-10 right-0 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-64 rotate-3 animate-float-delayed">
                <div className="flex items-center gap-2 text-purple-600 mb-4">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-bold">AI Writing...</span>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-2 bg-purple-50 dark:bg-purple-900/30 rounded-full" />
                  <div className="w-full h-2 bg-purple-50 dark:bg-purple-900/30 rounded-full" />
                  <div className="w-3/4 h-2 bg-purple-50 dark:bg-purple-900/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works - Card Grid with alternate styling */}
        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl text-left">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("cl_landing.how_title")}
                </h2>
                <div className="h-1.5 w-24 bg-purple-600 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="group bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/50 transition-all duration-300">
                <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Upload className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t("cl_landing.step1_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {t("cl_landing.step1_desc")}
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-400 uppercase font-mono tracking-wider">
                    <FileText className="h-3 w-3" /> resume.pdf
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/50 transition-all duration-300 mt-0 md:mt-12">
                <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <ClipboardList className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t("cl_landing.step2_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {t("cl_landing.step2_desc")}
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col gap-2">
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                    <div className="w-2/3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-purple-500/50 transition-all duration-300 mt-0 md:mt-24">
                <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {t("cl_landing.step3_title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {t("cl_landing.step3_desc")}
                </p>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advantages - Modern Grid Layout */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t("cl_landing.adv_title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <ShieldCheck className="h-12 w-12 text-purple-600 mb-6" />
                <h4 className="text-xl font-bold mb-4">
                  {t("cl_landing.adv1_title")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t("cl_landing.adv1_desc")}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Zap className="h-12 w-12 text-blue-600 mb-6" />
                <h4 className="text-xl font-bold mb-4">
                  {t("cl_landing.adv2_title")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t("cl_landing.adv2_desc")}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Mail className="h-12 w-12 text-orange-600 mb-6" />
                <h4 className="text-xl font-bold mb-4">
                  {t("cl_landing.adv3_title")}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t("cl_landing.adv3_desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security / CTA - Refresh with different skew */}
        <section className="py-24 bg-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="bg-white/10 backdrop-blur-md rounded-[3rem] p-12 md:p-20 text-center border border-white/20">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center text-white mb-10 mx-auto">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-8">
                {t("li_landing.security_title")}
              </h2>
              <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
                {t("li_landing.security_desc")}
              </p>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="px-12 py-8 text-2xl h-auto shadow-2xl hover:scale-105 transition-transform bg-white text-purple-600 hover:bg-white/90"
                >
                  {t("ai.generate_cover_letter")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(-6deg);
          }
          50% {
            transform: translateY(-20px) rotate(-6deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) rotate(3deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite 3s;
        }
      `}</style>
    </div>
  );
}
