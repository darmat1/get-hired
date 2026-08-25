"use client";

import { useTranslation } from "@/lib/translations";
import { Upload, Cpu, FileText, Download } from "lucide-react";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      name: t("landing.how_it_works.step1"),
      icon: Upload,
      color: "from-warm-400 to-warm-600",
      delay: "0",
    },
    {
      name: t("landing.how_it_works.step2"),
      icon: Cpu,
      color: "from-warm-400 to-warm-600",
      delay: "100",
    },
    {
      name: t("landing.how_it_works.step3"),
      icon: FileText,
      color: "from-violet-400 to-violet-600",
      delay: "200",
    },
    {
      name: t("landing.how_it_works.step4"),
      icon: Download,
      color: "from-fuchsia-400 to-fuchsia-600",
      delay: "300",
    },
  ];

  return (
    <section className="font-body bg-warm-50 dark:bg-warm-950 py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-warm-200 dark:via-warm-800 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center mb-20">
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-warm-900 dark:text-warm-50 sm:text-5xl">
            {t("landing.how_it_works.title")}
          </h2>
        </div>

        <div className="mx-auto max-w-5xl relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-12 left-10 right-10 h-1 bg-warm-100 dark:bg-warm-800 rounded-full z-0 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-warm-500 via-warm-500 to-fuchsia-500 w-full animate-[slide-right_3s_ease-in-out_infinite]"></div>
          </div>

          <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-4 lg:gap-x-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
                style={{ animationDelay: `${step.delay}ms` }}
              >
                {/* Step number badge */}
                <div className="absolute -top-3 lg:-top-6 bg-warm-50 dark:bg-warm-900 text-warm-400 dark:text-warm-500 text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-warm-100 dark:border-warm-800 z-20 group-hover:text-warm-500 group-hover:border-warm-200 dark:group-hover:border-warm-900 transition-colors duration-300">
                  {index + 1}
                </div>

                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} mb-6 shadow-lg shadow-warm-500/20 text-white transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 relative z-10`}
                >
                  <step.icon className="h-10 w-10" aria-hidden="true" />
                  {/* Glowing ring behind icon */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 -z-10`}
                  ></div>
                </div>

                <h3 className="font-heading text-xl font-bold leading-8 text-warm-900 dark:text-warm-50 mt-2 px-2 max-w-[200px]">
                  {step.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
