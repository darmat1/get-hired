"use client";

import { useTranslation } from "@/lib/translations";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog, FileText, Mail, Sparkles } from "lucide-react";

export function AgentsCapabilities() {
  const { t } = useTranslation();

  const items = [
    {
      icon: UserCog,
      title: t("agents.capabilities.profile.title"),
      desc: t("agents.capabilities.profile.desc"),
    },
    {
      icon: FileText,
      title: t("agents.capabilities.resumes.title"),
      desc: t("agents.capabilities.resumes.desc"),
    },
    {
      icon: Mail,
      title: t("agents.capabilities.cover_letters.title"),
      desc: t("agents.capabilities.cover_letters.desc"),
    },
    {
      icon: Sparkles,
      title: t("agents.capabilities.score.title"),
      desc: t("agents.capabilities.score.desc"),
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-white dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl text-center mb-16">
          {t("agents.capabilities.title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card
              key={item.title}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
