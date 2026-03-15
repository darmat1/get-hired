"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "@/lib/translations";
import { useProfileStore } from "@/stores/profile-store";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle,
  Loader,
  Copy,
  FileText,
  List,
  ExternalLink,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";

type CoverLetterFormat = "prose" | "bullet";
type ResumeLanguage = "en" | "jd";

export function CoverLetterForm() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { profile, needsLoad, loadFromDb } = useProfileStore();
  const [jobDescription, setJobDescription] = useState("");
  const [format, setFormat] = useState<CoverLetterFormat>("bullet");
  const [generateResume, setGenerateResume] = useState(false);
  const [resumeLanguage, setResumeLanguage] = useState<ResumeLanguage>("en");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resumeCount, setResumeCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    if (needsLoad()) loadFromDb();
  }, [needsLoad, loadFromDb]);

  useEffect(() => {
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) => setResumeCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  const isLimitReached = resumeCount >= 2;

  const handleGenerateCoverLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSeconds(0);
    setMessage(null);

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    if (generateResume && isLimitReached) {
      setMessage({
        type: "error",
        text: t("profile.suggest_limit_desc"),
      });
      setLoading(false);
      clearTimer();
      return;
    }

    if (!jobDescription.trim()) {
      setMessage({
        type: "error",
        text: t("cover_letter.error.enter_job_description"),
      });
      setLoading(false);
      clearTimer();
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
          resumeLanguage: generateResume ? resumeLanguage : undefined,
          profile: profile.personalInfo || profile.workExperience?.length
            ? {
                personalInfo: profile.personalInfo,
                workExperience: profile.workExperience,
                education: profile.education,
                skills: profile.skills,
              }
            : undefined,
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
      refreshAiQuota();
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
      clearTimer();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-full mx-auto space-y-8">
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

      <div className="flex flex-col min-[1000px]:flex-row gap-8 items-start">
        <div className="flex-1 w-full bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 min-[1000px]:sticky min-[1000px]:top-24">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            {t("cover_letter.job_description")}
          </h3>
          <form onSubmit={handleGenerateCoverLetter} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("cover_letter.paste_job_description")}
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t("cover_letter.job_description_placeholder")}
                rows={10}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("cover_letter.format_label")}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat("bullet")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    format === "bullet"
                      ? "bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-900/30 dark:border-slate-600 dark:text-slate-300 ring-2 ring-slate-200 dark:ring-slate-800"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  <List className="h-4 w-4" />
                  {t("cover_letter.format_bullet")}
                </button>
                <button
                  type="button"
                  onClick={() => setFormat("prose")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    format === "prose"
                      ? "bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-900/30 dark:border-slate-600 dark:text-slate-300 ring-2 ring-slate-200 dark:ring-slate-800"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  {t("cover_letter.format_prose")}
                </button>
              </div>
            </div>
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                isLimitReached
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                  : "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20"
              }`}
            >
              <input
                type="checkbox"
                id="generateResume"
                checked={generateResume && !isLimitReached}
                onChange={(e) => setGenerateResume(e.target.checked)}
                disabled={loading || isLimitReached}
                className={`mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 focus:ring-purple-500 cursor-pointer ${
                  isLimitReached
                    ? "opacity-50 cursor-not-allowed"
                    : "text-purple-600"
                }`}
              />
              <label
                htmlFor="generateResume"
                className={`select-none ${isLimitReached ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`block text-sm font-medium ${isLimitReached ? "text-amber-800 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}
                >
                  {t("cover_letter.generate_resume")}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isLimitReached
                    ? t("profile.suggest_limit_desc")
                    : t("cover_letter.generate_resume_desc")}
                </span>
              </label>
            </div>

            {/* Resume Language Selector */}
            {generateResume && !isLimitReached && (
              <div className="p-4 rounded-lg border border-purple-100 dark:border-purple-900 bg-purple-25 dark:bg-purple-900/10">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {t("cover_letter.resume_language_label")}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResumeLanguage("en")}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      resumeLanguage === "en"
                        ? "bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-800"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {t("cover_letter.resume_lang_en")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeLanguage("jd")}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      resumeLanguage === "jd"
                        ? "bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-300 ring-2 ring-purple-200 dark:ring-purple-800"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                    }`}
                  >
                    {t("cover_letter.resume_lang_jd")}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2.5 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                generateResume
                  ? "bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400"
                  : "bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400"
              }`}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {generateResume
                    ? `${t("cover_letter.generating_resume")} (${seconds}s)`
                    : `${t("cover_letter.generating")} (${seconds}s)`}
                </>
              ) : generateResume ? (
                t("cover_letter.generate_both")
              ) : (
                t("cover_letter.generate")
              )}
            </button>
          </form>
        </div>

        <div className="flex-1 w-full">
          {coverLetter && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("cover_letter.generated")}
                </h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? t("cover_letter.copied") : t("cover_letter.copy")}
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed text-sm">
                {coverLetter}
              </div>

              {/* Resume Edit Link */}
              {resumeId && (
                <div className="mt-4 p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
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
      </div>
    </div>
  );
}
