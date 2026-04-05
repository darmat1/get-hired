"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { LocalizedLink } from "@/components/ui/localized-link";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function NewResumePage() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, router]);

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

  if (!mounted || isPending)
    return <LoadingScreen message={t("profile.loading_profile")} />;
  if (!session) return null;

  return (
    <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <LocalizedLink
            href="/dashboard/my-resumes"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back_to_dashboard") || "Back to Dashboard"}
          </LocalizedLink>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {t("nav.create_resume")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {t("resume_builder.new_subtitle") ||
              "Give your resume a name to get started."}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label
                htmlFor="resume-title"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-slate-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-end">
              <LocalizedLink href="/dashboard/my-resumes">
                <Button variant="ghost" type="button" className="w-full sm:w-auto">
                  {t("common.cancel")}
                </Button>
              </LocalizedLink>
              <Button
                type="submit"
                disabled={!title.trim() || isCreating}
                className="w-full bg-slate-900 px-6 text-white hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 sm:w-auto"
              >
                {isCreating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {t("common.create") || "Create Resume"}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800/50 dark:bg-slate-900/40 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="h-fit rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              <Plus className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("resume_builder.quick_start_title") || "Quick Start"}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {t("resume_builder.quick_start_desc") ||
                  "After creating your resume, you can import data from your profile or fill in the details manually in our powerful editor."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
