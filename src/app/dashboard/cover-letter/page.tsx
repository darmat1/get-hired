"use client";

import { useEffect, useState } from "react";
import { CoverLetterForm } from "@/components/cover-letter/cover-letter-form";
import { useTranslation } from "@/lib/translations";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

import { Header } from "@/components/layout/header";
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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("cover_letter.title")}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("cover_letter.subtitle")}
                </p>
              </div>

              <CoverLetterForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
