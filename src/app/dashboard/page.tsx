"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { LinkedInImportButton } from "@/components/resume/linkedin-import-button";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Download, Trash2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { Modal } from "@/components/ui/modal";

interface ResumeData {
  id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function Dashboard() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    resumeId: string | null;
  }>({ isOpen: false, resumeId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (session) {
      fetchResumes();
    }
  }, [session]);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
        setResumes(resumes.filter((r) => r.id !== deleteModal.resumeId));
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

  if (!session) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">
                Please sign in to view your dashboard
              </h2>
              <Button onClick={() => (window.location.href = "/auth/signin")}>
                Sign In
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-8 w-64 bg-muted rounded mx-auto mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="space-y-6 text-foreground">
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
                  <p className="mt-2 text-muted-foreground">
                    {t("dashboard.subtitle")}
                  </p>
                </div>

                <div className="flex gap-3">
                  <LinkedInImportButton onImportSuccess={fetchResumes} />
                  <Button
                    onClick={() => (window.location.href = "/resume/new")}
                  >
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
                  <Button
                    onClick={() => (window.location.href = "/resume/new")}
                  >
                    {t("nav.create_resume")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {resume.title}
                          </h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {t("dashboard.template")}: {resume.template}
                          </p>
                        </div>
                        <FileText className="h-6 w-6 text-primary" />
                      </div>

                      <div className="text-sm text-muted-foreground mb-4">
                        <p>
                          {t("dashboard.created")}:{" "}
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          {t("dashboard.updated")}:{" "}
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            (window.location.href = `/resume/${resume.id}/edit`)
                          }
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
          </main>
        </div>
      </div>

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
            <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
              {t("dashboard.delete_confirm_title") || "Are you sure?"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t("dashboard.delete_confirm_desc") ||
                "This action cannot be undone."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
