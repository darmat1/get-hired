"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/translations";
import { AIKeysForm } from "@/components/profile/ai-keys-form";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function AISettingsPage() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, router]);

  if (isPending)
    return <LoadingScreen message={t("profile.loading_profile")} />;
  if (!session) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("ai_settings.title")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("ai_settings.subtitle")}
        </p>
      </div>

      <div className="space-y-8">
        <AIKeysForm />
      </div>
    </div>
  );
}
