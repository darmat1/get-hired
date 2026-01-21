"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useTranslation } from "@/lib/translations";
import { Linkedin, Loader, AlertCircle, CheckCircle } from "lucide-react";

interface LinkedInImportButtonProps {
  onImportSuccess: () => void;
}

export function LinkedInImportButton({ onImportSuccess }: LinkedInImportButtonProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleLinkedInImport = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Check if user has LinkedIn connected
      const userResponse = await fetch("/api/resumes/linkedin-status");
      const userData = await userResponse.json();

      if (!userData.hasLinkedIn) {
        setMessage({
          type: "error",
          text: t("resume.error.no_linkedin_connected"),
        });
        setLoading(false);
        return;
      }

      // Import LinkedIn profile as resume
      const response = await fetch("/api/resumes/import-linkedin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("resume.error.linkedin_import_failed"));
      }

      setMessage({
        type: "success",
        text: t("resume.success.linkedin_imported"),
      });

      // Refresh resumes list
      setTimeout(() => {
        onImportSuccess();
        setMessage(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("resume.error.linkedin_import_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          <span
            className={
              message.type === "success"
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }
          >
            {message.text}
          </span>
        </div>
      )}

      <button
        onClick={handleLinkedInImport}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
      >
        {loading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <Linkedin className="h-5 w-5" />
        )}
        {loading ? t("resume.importing") : t("resume.import_from_linkedin")}
      </button>
    </div>
  );
}
