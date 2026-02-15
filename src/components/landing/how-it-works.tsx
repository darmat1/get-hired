"use client";

import { useTranslation } from "@/lib/translations";
import { Upload, Cpu, FileText, Download } from "lucide-react";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      name: t("landing.how_it_works.step1"),
      icon: Upload,
    },
    {
      name: t("landing.how_it_works.step2"),
      icon: Cpu,
    },
    {
      name: t("landing.how_it_works.step3"),
      icon: FileText,
    },
    {
      name: t("landing.how_it_works.step4"),
      icon: Download,
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            Process
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("landing.how_it_works.title")}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-y-8 lg:grid-cols-4 lg:gap-x-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 mb-6">
                  <step.icon
                    className="h-8 w-8 text-white"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">
                  {step.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
