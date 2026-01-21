"use client";

import { useState, useRef } from "react";
import { useTranslation } from "@/lib/translations";
import {
  FileText,
  Loader,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Upload,
} from "lucide-react";

interface SmartImportButtonProps {
  onImportSuccess: () => void;
}

export function LinkedInImportButton({
  onImportSuccess,
}: SmartImportButtonProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [importMode, setImportMode] = useState<"pdf" | "paste">("pdf");
  const [profileText, setProfileText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      return fullText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      throw new Error(t("resume.error.pdf_read_failed"));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage({
        type: "error",
        text: "Please upload a PDF file",
      });
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setMessage({
      type: "warning",
      text: t("resume.message.processing_pdf"),
    });

    try {
      const text = await extractTextFromPDF(file);
      setProfileText(text);
      setMessage({
        type: "success",
        text: t("resume.message.pdf_extracted"),
      });

      handleImport(text);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : t("resume.error.pdf_read_failed"),
      });
      setLoading(false);
    }
  };

  const handleImport = async (textToUse?: string) => {
    const text = textToUse || profileText;
    if (!text) return;

    setLoading(true);
    if (!textToUse) setMessage(null);

    try {
      const response = await fetch("/api/resumes/parse-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
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
        setProfileText("");
        setFileName(null);
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : t("resume.error.linkedin_import_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("resume.import_from_linkedin")}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit">
          <button
            onClick={() => setImportMode("pdf")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              importMode === "pdf"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t("resume.upload_pdf")}
          </button>
          <button
            onClick={() => setImportMode("paste")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              importMode === "paste"
                ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            AI Paste
          </button>
        </div>

        {importMode === "pdf" && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {fileName || t("resume.drag_drop_pdf")}
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
            </div>
            {fileName && !loading && (
              <button
                onClick={() => handleImport()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <ClipboardList className="h-5 w-5" />
                {t("resume.ai_parse")}
              </button>
            )}
          </div>
        )}

        {importMode === "paste" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("resume.paste_profile_title")}
              </label>
              <textarea
                value={profileText}
                onChange={(e) => setProfileText(e.target.value)}
                placeholder={t("resume.paste_placeholder")}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => handleImport()}
              disabled={loading || !profileText}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <ClipboardList className="h-5 w-5" />
              )}
              {loading ? t("resume.importing") : t("resume.ai_parse")}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
              : message.type === "warning"
                ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : message.type === "warning" ? (
            <Loader className="h-5 w-5 animate-spin text-yellow-600 dark:text-yellow-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          <span
            className={`text-sm ${
              message.type === "success"
                ? "text-green-800 dark:text-green-200"
                : message.type === "warning"
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-red-800 dark:text-red-200"
            }`}
          >
            {message.text}
          </span>
        </div>
      )}
    </div>
  );
}
