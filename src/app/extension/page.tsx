"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import {
  Download,
  UserCheck,
  MousePointerClick,
  FileText,
  List,
  AlignLeft,
  FileOutput,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Play,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CHROME_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/gethiredwork-%E2%80%94-cover-lett/khdamklpipfmaeimaeeckfbfbihicimg";

function StepCard({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center font-bold text-warm-600 dark:text-warm-400">
            {number}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-5 w-5 text-warm-600 dark:text-warm-400" />
              <h3 className="font-heading font-semibold text-lg">{title}</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScreenshotPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative aspect-video bg-warm-100 dark:bg-warm-800 rounded-xl border-2 border-dashed border-warm-300 dark:border-warm-700 flex flex-col items-center justify-center gap-3 group hover:border-warm-400 dark:hover:border-warm-600 transition-colors">
      <ImageIcon className="h-12 w-12 text-warm-400" />
      <span className="text-sm text-warm-500 font-medium">{label}</span>
      <div className="absolute inset-0 bg-warm-900/0 group-hover:bg-warm-900/5 dark:group-hover:bg-warm-100/5 transition-colors rounded-xl" />
    </div>
  );
}

function VideoPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="relative aspect-video bg-warm-900 rounded-xl overflow-hidden group cursor-pointer">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 text-white fill-white ml-1" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-white/80 text-sm font-medium">
          {t("extension_landing.video_placeholder")}
        </p>
      </div>
    </div>
  );
}

export default function ExtensionLandingPage() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Download,
      title: t("extension_landing.step1_title"),
      description: t("extension_landing.step1_desc"),
    },
    {
      icon: UserCheck,
      title: t("extension_landing.step2_title"),
      description: t("extension_landing.step2_desc"),
    },
    {
      icon: MousePointerClick,
      title: t("extension_landing.step3_title"),
      description: t("extension_landing.step3_desc"),
    },
    {
      icon: List,
      title: t("extension_landing.step4_title"),
      description: t("extension_landing.step4_desc"),
    },
    {
      icon: FileOutput,
      title: t("extension_landing.step5_title"),
      description: t("extension_landing.step5_desc"),
    },
    {
      icon: Sparkles,
      title: t("extension_landing.step6_title"),
      description: t("extension_landing.step6_desc"),
    },
  ];

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-950 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="font-body relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-warm-50 to-warm-50 dark:from-warm-950 dark:to-warm-950" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warm-100 dark:bg-warm-800 text-sm font-medium text-warm-700 dark:text-warm-300 mb-6">
                {t("extension_landing.badge")}
              </div>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-warm-900 dark:text-warm-50 sm:text-5xl lg:text-6xl mb-6">
                {t("extension_landing.hero_title")}
              </h1>
              <p className="text-lg sm:text-xl text-warm-600 dark:text-warm-400 mb-8 leading-relaxed">
                {t("extension_landing.hero_subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={CHROME_EXTENSION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Button
                    size="lg"
                    className="rounded-full px-8 !bg-terracotta-500 hover:!bg-terracotta-600 !text-white dark:!bg-terracotta-500 dark:hover:!bg-terracotta-600 dark:!text-white"
                  >
                    <Download className="h-5 w-5" />
                    {t("extension_landing.cta_button")}
                  </Button>
                </a>
                <span className="text-sm text-warm-500">
                  {t("extension_landing.cta_subtext")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Video Demo Section */}
        <section className="font-body py-16 lg:py-24 bg-warm-50/50 dark:bg-warm-900/20">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-warm-900 dark:text-warm-50 mb-4">
                {t("extension_landing.video_title")}
              </h2>
              <p className="text-warm-600 dark:text-warm-400">
                {t("extension_landing.video_subtitle")}
              </p>
            </div>
            <VideoPlaceholder />
          </div>
        </section>

        {/* How It Works - Steps */}
        <section className="font-body py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-warm-900 dark:text-warm-50 mb-4">
                {t("extension_landing.steps_title")}
              </h2>
              <p className="text-warm-600 dark:text-warm-400 max-w-2xl mx-auto">
                {t("extension_landing.steps_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <StepCard
                  key={index}
                  number={index + 1}
                  icon={step.icon}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Screenshots Gallery */}
        <section className="font-body py-16 lg:py-24 bg-warm-50/50 dark:bg-warm-900/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-warm-900 dark:text-warm-50 mb-4">
                {t("extension_landing.gallery_title")}
              </h2>
              <p className="text-warm-600 dark:text-warm-400">
                {t("extension_landing.gallery_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScreenshotPlaceholder
                label={t("extension_landing.screenshot_1_label")}
              />
              <ScreenshotPlaceholder
                label={t("extension_landing.screenshot_2_label")}
              />
              <ScreenshotPlaceholder
                label={t("extension_landing.screenshot_3_label")}
              />
              <ScreenshotPlaceholder
                label={t("extension_landing.screenshot_4_label")}
              />
            </div>
          </div>
        </section>

        {/* Features Highlight */}
        <section className="font-body py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-heading text-3xl font-bold text-warm-900 dark:text-warm-50 mb-6">
                  {t("extension_landing.features_title")}
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <AlignLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-warm-900 dark:text-warm-50 mb-1">
                        {t("extension_landing.feature_1_title")}
                      </h3>
                      <p className="text-warm-600 dark:text-warm-400 text-sm">
                        {t("extension_landing.feature_1_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-warm-900 dark:text-warm-50 mb-1">
                        {t("extension_landing.feature_2_title")}
                      </h3>
                      <p className="text-warm-600 dark:text-warm-400 text-sm">
                        {t("extension_landing.feature_2_desc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <MousePointerClick className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-warm-900 dark:text-warm-50 mb-1">
                        {t("extension_landing.feature_3_title")}
                      </h3>
                      <p className="text-warm-600 dark:text-warm-400 text-sm">
                        {t("extension_landing.feature_3_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <ScreenshotPlaceholder
                label={t("extension_landing.screenshot_feature_label")}
              />
            </div>
          </div>
        </section>

        {/* AI Disclaimer */}
        <section className="font-body py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    {t("extension_landing.disclaimer_title")}
                  </h3>
                  <p className="text-amber-800 dark:text-amber-300/80 text-sm leading-relaxed">
                    {t("extension_landing.disclaimer_text")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="font-body py-16 lg:py-24 bg-warm-900">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-warm-50 mb-6">
              {t("extension_landing.final_cta_title")}
            </h2>
            <p className="text-warm-400 mb-8 max-w-2xl mx-auto">
              {t("extension_landing.final_cta_subtitle")}
            </p>
            <a
              href={CHROME_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Button
                size="lg"
                className="rounded-full px-8 bg-warm-50 text-warm-900 hover:bg-warm-100"
              >
                <Download className="h-5 w-5" />
                {t("extension_landing.cta_button")}
                <ChevronRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
