"use client";

import { useEffect, useState } from "react";
import { CoverLetterForm } from "@/components/cover-letter/cover-letter-form";
import { useTranslation } from "@/lib/translations";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function CoverLetterPage() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (!mounted || isPending)
    return <LoadingScreen message={t("profile.loading_profile")} />;
  if (!session) return null;

  return (
    <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
      <div className="mx-auto max-w-full">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {t("cover_letter.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            {t("cover_letter.subtitle")}
          </p>
        </div>

        <CoverLetterForm />
      </div>
    </AppShell>
  );
}
