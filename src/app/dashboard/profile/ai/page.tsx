"use client";

import { useTranslation } from "@/lib/translations";
import { AIKeysForm } from "@/components/profile/ai-keys-form";

export default function AISettingsPage() {
  const { t } = useTranslation();

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
