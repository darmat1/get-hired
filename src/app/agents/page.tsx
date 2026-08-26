"use client";

import { Header } from "@/components/layout/header";
import { useTranslation } from "@/lib/translations";
import { LocalizedLink } from "@/components/ui/localized-link";
import { AgentsHero } from "@/components/agents/agents-hero";
import { AgentsCapabilities } from "@/components/agents/agents-capabilities";
import { AgentsCompatibleWith } from "@/components/agents/agents-compatible-with";
import { AgentsHowItWorks } from "@/components/agents/agents-how-it-works";
import { AgentsSecurity } from "@/components/agents/agents-security";
import { AgentsFAQ } from "@/components/agents/agents-faq";

export default function AgentsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900">
      <Header />
      <main>
        <AgentsHero />
        <AgentsCapabilities />
        <AgentsCompatibleWith />
        <AgentsHowItWorks />
        <AgentsSecurity />
        <AgentsFAQ />

        <section className="font-body py-20 text-center px-4">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-warm-900 dark:text-warm-50 mb-8">
            {t("agents.cta.title")}
          </h2>
          <LocalizedLink
            href="/auth/signin"
            className="inline-flex px-10 py-4 text-lg bg-terracotta-500 hover:bg-terracotta-600 text-white dark:bg-terracotta-500 dark:hover:bg-terracotta-600 dark:text-white font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            {t("agents.cta.button")}
          </LocalizedLink>
        </section>
      </main>
    </div>
  );
}
