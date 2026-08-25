"use client";

import { useTranslation } from "@/lib/translations";
import { ShieldCheck, Lock, Ban } from "lucide-react";

export function AgentsSecurity() {
  const { t } = useTranslation();

  const items = [
    {
      icon: ShieldCheck,
      title: t("agents.security.item1_title"),
      desc: t("agents.security.item1_desc"),
    },
    {
      icon: Lock,
      title: t("agents.security.item2_title"),
      desc: t("agents.security.item2_desc"),
    },
    {
      icon: Ban,
      title: t("agents.security.item3_title"),
      desc: t("agents.security.item3_desc"),
    },
  ];

  return (
    <section className="font-body py-24 sm:py-32 bg-warm-50 dark:bg-warm-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="font-heading text-4xl font-extrabold tracking-tight text-warm-900 dark:text-warm-50 sm:text-5xl text-center mb-16">
          {t("agents.security.title")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex-shrink-0 w-12 h-12 rounded-full bg-warm-50 dark:bg-warm-800 border border-warm-200 dark:border-warm-700 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-warm-600 dark:text-warm-400" />
              </div>
              <h3 className="font-heading font-bold text-lg text-warm-900 dark:text-warm-50 mb-2">
                {item.title}
              </h3>
              <p className="text-warm-600 dark:text-warm-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
