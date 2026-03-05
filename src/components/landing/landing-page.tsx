"use client";

import { useSession } from "@/lib/auth-client";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Solution } from "@/components/landing/solution";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQSEO } from "@/components/landing/faq-seo";

export function LandingPage() {
  const { isPending } = useSession();

  // We no longer automatically redirect to /dashboard here
  // to allow logged-in users to view the landing page.

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Features />
        <HowItWorks />
        <FAQSEO />
      </main>
    </div>
  );
}
