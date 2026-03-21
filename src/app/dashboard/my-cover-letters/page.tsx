"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  FileCheck,
  FileText,
  Trash2,
  AlertTriangle,
  Copy,
  ExternalLink,
  List,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

interface CoverLetterItem {
  id: string;
  jobDescription: string;
  coverLetterText: string;
  format: string;
  language: string;
  createdAt: string;
  resume: { id: string; title: string } | null;
}

export default function MyCoverLettersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mounted, setMounted] = useState(false);
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetchCoverLetters();
    }
  }, [session]);

  const fetchCoverLetters = async () => {
    try {
      const res = await fetch("/api/cover-letters");
      const data = await res.json();
      setCoverLetters(Array.isArray(data) ? data : []);
    } catch {
      setCoverLetters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/cover-letters/${deleteModal.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setCoverLetters((prev) => prev.filter((cl) => cl.id !== deleteModal.id));
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error("Failed to delete cover letter:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted || isPending) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">
                {t("dashboard.loading")}
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session) return null;

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
                  <h1 className="text-3xl font-bold">
                    {t("my_cover_letters.title")}
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    {t("my_cover_letters.subtitle")}
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/dashboard/cover-letter")}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  {t("my_cover_letters.go_generate")}
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-pulse">
                    <div className="h-8 w-64 bg-muted rounded mx-auto mb-4"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-48 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : coverLetters.length === 0 ? (
                <div className="text-center py-12">
                  <FileCheck className="h-16 w-16 text-muted/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {t("my_cover_letters.no_letters")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("my_cover_letters.no_letters_desc")}
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/cover-letter")}
                  >
                    {t("my_cover_letters.go_generate")}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {coverLetters.map((cl) => (
                    <div
                      key={cl.id}
                      className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5 text-primary" />
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize flex items-center gap-1">
                            <List className="h-3 w-3" />
                            {cl.format}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(cl.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Job Description Snippet */}
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("my_cover_letters.job_description")}
                        </p>
                        <p className="text-sm text-foreground line-clamp-2">
                          {cl.jobDescription.slice(0, 150)}
                          {cl.jobDescription.length > 150 ? "..." : ""}
                        </p>
                      </div>

                      {/* Cover Letter Preview */}
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-3 max-h-40 overflow-y-auto">
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {cl.coverLetterText}
                        </p>
                      </div>

                      {/* Linked Resume */}
                      {cl.resume && (
                        <div className="mb-3 p-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-slate-900 dark:text-white truncate">
                              {cl.resume.title}
                            </span>
                          </div>
                          <Link
                            href={`/resume/${cl.resume.id}/edit`}
                            target="_blank"
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopy(cl.id, cl.coverLetterText)
                          }
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copiedId === cl.id
                            ? t("cover_letter.copied")
                            : t("cover_letter.copy")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteModal({ isOpen: true, id: cl.id })
                          }
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
          !isDeleting && setDeleteModal({ isOpen: false, id: null })
        }
        title={t("my_cover_letters.delete_modal_title") || "Delete Cover Letter"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
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
                <Loader2 className="h-4 w-4 animate-spin" />
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
              {t("my_cover_letters.delete_confirm_title") || "Are you sure?"}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {t("my_cover_letters.delete_confirm_desc") ||
                "This action cannot be undone."}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
