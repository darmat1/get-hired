"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/translations";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Loader,
  Copy,
  FileText,
  List,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

type CoverLetterFormat = "prose" | "bullet";

export function CoverLetterForm() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [format, setFormat] = useState<CoverLetterFormat>("prose");
  const [generateResume, setGenerateResume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!jobDescription.trim()) {
      setMessage({
        type: "error",
        text: t("cover_letter.error.enter_job_description"),
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobDescription,
          language: language,
          format: format,
          generateResume: generateResume,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || t("cover_letter.error.generation_failed"),
        );
      }

      setCoverLetter(data.coverLetter);

      if (data.resumeId) {
        setResumeId(data.resumeId);
        setMessage({
          type: "success",
          text: t("cover_letter.success.both_generated"),
        });
      } else {
        setResumeId(null);
        setMessage({
          type: "success",
          text: t("cover_letter.success.generated"),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : t("cover_letter.error.generation_failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Message Alert */}
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

      {/* Job Description Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("cover_letter.job_description")}
        </h3>
        <form onSubmit={handleGenerateCoverLetter} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cover_letter.paste_job_description")}
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder={t("cover_letter.job_description_placeholder")}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Format Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("cover_letter.format_label")}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat("prose")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  format === "prose"
                    ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <FileText className="h-4 w-4" />
                {t("cover_letter.format_prose")}
              </button>
              <button
                type="button"
                onClick={() => setFormat("bullet")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  format === "bullet"
                    ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300 ring-2 ring-blue-200 dark:ring-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                <List className="h-4 w-4" />
                {t("cover_letter.format_bullet")}
              </button>
            </div>
          </div>

          {/* Generate Tailored Resume Checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
            <input
              type="checkbox"
              id="generateResume"
              checked={generateResume}
              onChange={(e) => setGenerateResume(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <label
              htmlFor="generateResume"
              className="cursor-pointer select-none"
            >
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                {t("cover_letter.generate_resume")}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t("cover_letter.generate_resume_desc")}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2.5 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              generateResume
                ? "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
            }`}
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            {loading && generateResume
              ? t("cover_letter.generating_resume")
              : generateResume
                ? t("cover_letter.generate_both")
                : t("cover_letter.generate")}
          </button>
        </form>
      </div>

      {/* Generated Cover Letter */}
      {coverLetter && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("cover_letter.generated")}
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
            >
              <Copy className="h-4 w-4" />
              {copied ? t("cover_letter.copied") : t("cover_letter.copy")}
            </button>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed text-sm">
            {coverLetter}
          </div>

          {/* Resume Edit Link */}
          {resumeId && (
            <div className="mt-4 p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t("cover_letter.generated_resume")}
                </span>
              </div>
              <Link
                href={`/resume/${resumeId}/edit`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                {t("cover_letter.open_resume_editor")}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
