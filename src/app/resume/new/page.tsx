"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { LocalizedLink } from "@/components/ui/localized-link";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function NewResumePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
        }),
      });

      if (response.ok) {
        const savedResume = await response.json();
        // Redirect to edit page
        router.push(`/resume/${savedResume.id}/edit`);
      } else {
        const data = await response.json();
        setError(data.error || t("resume.new.error_failed"));
      }
    } catch (err) {
      console.error("Failed to create resume:", err);
      setError(t("resume.new.error_unexpected"));
    } finally {
      setIsCreating(false);
    }
  };

  if (!session) {
    return <LoadingScreen message={t("auth.sign_in_required")} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <LocalizedLink
                href="/dashboard"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("common.back_to_dashboard") || "Back to Dashboard"}
              </LocalizedLink>
              <h1 className="text-3xl font-bold text-foreground">
                {t("nav.create_resume")}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t("resume_builder.new_subtitle") ||
                  "Give your resume a name to get started."}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label
                    htmlFor="resume-title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {t("resume_builder.resume_title") || "Resume Title"}
                  </label>
                  <input
                    id="resume-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      t("resume_builder.title_placeholder") ||
                      "e.g. Software Engineer 2024"
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <LocalizedLink href="/dashboard">
                    <Button variant="ghost" type="button">
                      {t("common.cancel")}
                    </Button>
                  </LocalizedLink>
                  <Button
                    type="submit"
                    disabled={!title.trim() || isCreating}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {t("common.create") || "Create Resume"}
                  </Button>
                </div>
              </form>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg h-fit">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                    {t("resume_builder.quick_start_title") || "Quick Start"}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400/80 mt-1">
                    {t("resume_builder.quick_start_desc") ||
                      "After creating your resume, you can import data from your profile or fill in the details manually in our powerful editor."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
