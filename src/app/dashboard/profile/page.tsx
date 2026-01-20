"use client";

import { useTranslation } from "@/lib/translations";
import { Header } from "@/components/layout/header";
import { ProfileForm } from "@/components/profile/profile-form";

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <>
      <Header />
      <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("profile.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("profile.subtitle")}
          </p>
        </div>

        <ProfileForm />
      </div>
      </div>
    </>
  );
}
