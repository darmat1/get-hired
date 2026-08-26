"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Edit,
  Download,
  Trash2,
  AlertTriangle,
  Sparkles,
  Loader2,
  BrainCog,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { Modal } from "@/components/ui/modal";
import { ResumeSuggestions } from "@/components/profile/resume-suggestions";
import { JobMatchModal } from "@/components/resume/job-match-modal";
import { useResumeListStore } from "@/stores/resume-list-store";

import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const {
    resumes,
    isLoading,
    loadFromDb: loadResumes,
    needsLoad: needsLoadResumes,
    removeResume,
  } = useResumeListStore();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    resumeId: string | null;
  }>({ isOpen: false, resumeId: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobMatchModal, setJobMatchModal] = useState<{ resumeId: string; resumeTitle: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session) {
      if (needsLoadResumes()) {
        loadResumes();
      }
    } else if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, resumeId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.resumeId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/resumes/${deleteModal.resumeId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        removeResume(deleteModal.resumeId);
        setDeleteModal({ isOpen: false, resumeId: null });
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadPDF = (id: string) => {
    window.open(`/api/resumes/${id}/pdf`, "_blank");
  };

  if (!mounted || isPending) {
    return (
      <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            {t("dashboard.loading")}
          </p>
        </div>
      </AppShell>
    );
  }

  if (!session) return null;

  if (isLoading) {
    return (
      <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mx-auto mb-4"></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
        <div className="space-y-6 text-foreground">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold font-heading sm:text-3xl">{t("dashboard.title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {t("dashboard.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                onClick={() => setShowSuggestions(true)}
                className="bg-amber-600 text-white hover:bg-amber-700 border-amber-700 shadow-sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t("profile.suggest_btn")}
              </Button>
              <Button onClick={() => router.push("/resume/new")}>
                <FileText className="h-4 w-4 mr-2" />
                {t("nav.create_resume")}
              </Button>
            </div>
          </div>

          {resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {t("dashboard.no_resumes")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t("dashboard.no_resumes_desc")}
              </p>
              <Button onClick={() => router.push("/resume/new")}>
                {t("nav.create_resume")}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link href={`/resume/${resume.id}/edit`} className="block">
                        <h3 className="truncate text-lg font-semibold hover:text-primary transition-colors">
                          {resume.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground capitalize">
                        {t("dashboard.template")}: {resume.template}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                  </div>

                  <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                    <p>
                      {t("dashboard.created")}:{" "}
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      {t("dashboard.updated")}:{" "}
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/resume/${resume.id}/edit`)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {t("dashboard.edit")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadPDF(resume.id)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      PDF
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobMatchModal({ resumeId: resume.id, resumeTitle: resume.title })}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                    >
                      <BrainCog className="h-3 w-3 mr-1" />
                      {t("job_match.btn_label")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(resume.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          !isDeleting && setDeleteModal({ isOpen: false, resumeId: null })
        }
        title={t("dashboard.delete_modal_title") || "Delete Resume"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, resumeId: null })}
              disabled={isDeleting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                t("common.delete") || "Delete"
              )}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-warm-900 dark:text-warm-100 font-medium mb-1">
              {t("dashboard.delete_confirm_title") || "Are you sure?"}
            </p>
            <p className="text-warm-600 dark:text-warm-400 text-sm">
              {t("dashboard.delete_confirm_desc") ||
                "This action cannot be undone."}
            </p>
          </div>
        </div>
      </Modal>

      {showSuggestions && (
        <ResumeSuggestions onClose={() => setShowSuggestions(false)} />
      )}

      {jobMatchModal && (
        <JobMatchModal
          resumeId={jobMatchModal.resumeId}
          resumeTitle={jobMatchModal.resumeTitle}
          onClose={() => setJobMatchModal(null)}
        />
      )}
    </>
  );
}
