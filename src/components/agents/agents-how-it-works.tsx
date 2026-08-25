"use client";

import { useTranslation } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, ClipboardPaste, MessageSquare } from "lucide-react";

export function AgentsHowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: KeyRound,
      title: t("agents.how_it_works.step1_title"),
      desc: t("agents.how_it_works.step1_desc"),
    },
    {
      icon: ClipboardPaste,
      title: t("agents.how_it_works.step2_title"),
      desc: t("agents.how_it_works.step2_desc"),
    },
    {
      icon: MessageSquare,
      title: t("agents.how_it_works.step3_title"),
      desc: t("agents.how_it_works.step3_desc"),
    },
  ];

  return (
    <section id="how-it-works" className="font-body py-24 sm:py-32 bg-warm-50 dark:bg-warm-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-warm-900 dark:text-warm-50 sm:text-5xl text-center mb-16">
          {t("agents.how_it_works.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              className="border-warm-200 dark:border-warm-700 dark:bg-warm-800/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warm-100 dark:bg-warm-800 flex items-center justify-center font-bold text-warm-600 dark:text-warm-400 text-sm">
                    {index + 1}
                  </div>
                  <step.icon className="h-5 w-5 text-warm-600 dark:text-warm-400" />
                </div>
                <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-2">
                  {step.title}
                </h3>
                <p className="text-warm-600 dark:text-warm-400 leading-relaxed">
                  {step.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
