"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useTranslation } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { useProfileStore } from "@/stores/profile-store";
import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExperienceEditor } from "@/components/profile/experience-editor";
import { EducationEditor } from "@/components/profile/education-editor";
import { CertificatesEditor } from "@/components/profile/certificates-editor";
import { SkillsForm } from "@/components/resume/skills-form";
import { PersonalInfoForm } from "@/components/resume/personal-info-form";
import {
  Sparkles,
  Save,
  Loader2,
  Upload,
  ClipboardList,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ResumeSuggestions } from "@/components/profile/resume-suggestions";
import { AIProfileInterview } from "@/components/profile/ai-profile-interview";
import { ProfileAssistantWidget } from "@/components/profile/profile-assistant-widget";
import { extractTextFromPDF } from "@/components/resume/linkedin-import-button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { refreshAiQuota } from "@/components/ui/ai-quota-display";
import { Bot, FileUp, PenLine } from "lucide-react";

export default function MyExperiencePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const {
    profile,
    isLoading,
    isSaving,
    lastSaved,
    updateField,
    loadFromDb,
    saveToDb,
    reset: resetProfileStore,
    needsLoad,
  } = useProfileStore();
  const [mounted, setMounted] = useState(false);
  const [importMode, setImportMode] = useState<"pdf" | "paste" | null>(null);
  const [showInterview, setShowInterview] = useState(false);
  const [profileText, setProfileText] = useState("");
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiTimer, setAiTimer] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session) {
      if (needsLoad()) {
        loadFromDb();
      }
    } else if (!isPending && session === null) {
      resetProfileStore();
      router.push("/");
    }
  }, [session, isPending, router, needsLoad, loadFromDb, resetProfileStore]);

  // AI processing timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiProcessing) {
      setAiTimer(0);
      interval = setInterval(() => setAiTimer((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isAiProcessing]);

  const handleSave = async (isAutosave = false) => {
    const ok = await saveToDb(isAutosave);
    if (!isAutosave) {
      if (ok) {
        setMessage({ type: "success", text: t("profile.save_success") });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: t("profile.save_error") });
      }
    }
  };

  // Autosave logic
  useEffect(() => {
    if (initialLoadRef.current) {
      if (profile.personalInfo && Object.keys(profile.personalInfo).length > 0) {
        initialLoadRef.current = false;
      }
      return;
    }

    if (
      !profile.personalInfo &&
      !profile.workExperience?.length &&
      !profile.education?.length
    )
      return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(true);
    }, 10000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [profile]);

  const updateProfile = (field: string, value: unknown) => {
    updateField(field as keyof typeof profile, value);
  };

  const processFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setMessage({ type: "error", text: t("profile.error.upload_pdf") });
      return;
    }

    setFileName(file.name);
    setIsImportLoading(true);
    setMessage({ type: "warning", text: t("profile.pdf_processing") });

    try {
      const text = await extractTextFromPDF(file, t);
      setProfileText(text);
      setMessage({ type: "success", text: t("profile.pdf_success") });
      handleImport(text);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("profile.import_error"),
      });
      setIsImportLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleImport = async (textToUse?: string) => {
    const text = textToUse || profileText;
    if (!text) return;

    setIsImportLoading(true);
    setIsAiProcessing(true);
    if (!textToUse) setMessage(null);

    try {
      const response = await fetch("/api/resumes/parse-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("profile.import_error"));
      }

      await loadFromDb();
      refreshAiQuota();
      setImportMode(null);
      setProfileText("");
      setFileName(null);

      if (data.nothingFound) {
        setMessage({ type: "warning", text: t("profile.import_nothing_found") });
      } else {
        const { workCount = 0, educationCount = 0, skillsCount = 0 } = data.extracted || {};
        const summary = [
          workCount > 0 ? t("profile.import_found_jobs").replace("{n}", workCount) : "",
          educationCount > 0 ? t("profile.import_found_edu").replace("{n}", educationCount) : "",
          skillsCount > 0 ? t("profile.import_found_skills").replace("{n}", skillsCount) : "",
        ].filter(Boolean).join(", ");
        setMessage({ type: "success", text: summary || t("profile.import_success") });
      }
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("profile.import_error"),
      });
    } finally {
      setIsImportLoading(false);
      setIsAiProcessing(false);
    }
  };

  // useEffect(() => {
  //   console.log(profile);
  // }, [profile]);

  if (!mounted || isPending)
    return <LoadingScreen message={t("profile.loading_profile")} />;
  if (!session) return <LoadingScreen message={t("common.auth_required")} />;

  return (
    <>
    <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard">
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold font-heading sm:text-3xl">{t("nav.my_experience")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("profile.unified_desc")}
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end">
            <div className="flex flex-wrap items-center gap-3">
                  {isSaving && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      {t("common.saving")}...
                    </span>
                  )}
                  {!isSaving && lastSaved && (
                    <span className="text-xs text-muted-foreground">
                      {t("common.saved")}{" "}
                      {lastSaved.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className={`w-full transition-all duration-500 sm:w-auto ${
                      isSaving
                        ? "bg-warm-50 dark:bg-warm-900/50 border-warm-300 dark:border-warm-700 opacity-80"
                        : ""
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? `${t("common.save")}...` : t("common.save")}
                  </Button>
            </div>
            <Button
              onClick={() => setShowSuggestions(true)}
              className="bg-amber-600 text-white hover:bg-amber-700 border-amber-700 shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {t("profile.suggest_btn")}
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-warm-100 dark:bg-warm-800 rounded-xl border border-warm-200 dark:border-warm-700 p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-warm-600 dark:text-warm-400" />
              <h3 className="text-lg font-semibold">{t("profile.import_data")}</h3>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant={importMode === "pdf" ? "default" : "outline"}
                size="sm"
                onClick={() => setImportMode(importMode === "pdf" ? null : "pdf")}
              >
                {t("resume.upload_pdf")}
              </Button>
              <Button
                variant={importMode === "paste" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setImportMode(importMode === "paste" ? null : "paste")
                }
              >
                {t("resume.paste_profile_title")}
              </Button>
            </div>
          </div>

              {importMode === "pdf" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-warm-500 bg-warm-50 dark:bg-warm-900/20"
                        : "border-warm-300 dark:border-warm-600 hover:border-warm-500 dark:hover:border-warm-400"
                    }`}
                  >
                    <Upload
                      className={`h-8 w-8 mx-auto mb-2 transition-colors ${
                        isDragging ? "text-warm-600" : "text-warm-400"
                      }`}
                    />
                    <p
                      className={`text-sm transition-colors ${
                        isDragging
                          ? "text-warm-700 dark:text-warm-300 font-medium"
                          : "text-warm-600 dark:text-warm-400"
                      }`}
                    >
                      {fileName ||
                        (isDragging
                          ? t("profile.drop_here") || "Drop PDF here"
                          : t("profile.upload_pdf_desc"))}
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {importMode === "paste" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="relative">
                    <textarea
                      value={profileText}
                      onChange={(e) => setProfileText(e.target.value)}
                      placeholder={t("profile.paste_text_placeholder")}
                      className="
    w-full px-4 py-3 
    rounded-lg 
    text-sm 
    transition-all
    
    bg-warm-100 border border-warm-300 text-warm-900
    placeholder:text-warm-400

    dark:bg-[var(--color-input)] 
    dark:border-[var(--color-border)] 
    dark:text-[var(--color-foreground)]
    dark:placeholder:text-[var(--color-muted-foreground)]
    
    outline-none
    focus:ring-2 
    focus:ring-[var(--color-ring)] 
    focus:border-transparent

    [field-sizing=content] 
    min-h-[160px] 
    resize-none   
  "
                    />
                    {/* Voice input button hidden for production */}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleImport()}
                    disabled={isImportLoading || !profileText}
                  >
                    {isImportLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ClipboardList className="h-4 w-4 mr-2" />
                    )}
                    {t("profile.ai_parse_btn")}
                  </Button>
                </div>
              )}

              {message && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    message.type === "success"
                      ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
                      : message.type === "warning"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200"
                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : message.type === "warning" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              )}

              {isAiProcessing && (
                <div className="flex flex-col gap-4 rounded-xl border border-warm-200 bg-warm-50 p-5 animate-in fade-in slide-in-from-top-2 duration-300 dark:border-warm-800 dark:bg-warm-900/50 sm:flex-row sm:items-center">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 text-warm-600 dark:text-warm-400 animate-spin" />
                    <Sparkles className="h-4 w-4 text-warm-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-warm-800 dark:text-warm-200">
                      {t("profile.ai_analyzing").replace(
                        "{seconds}",
                        String(aiTimer),
                      )}
                    </p>
                    <div className="mt-2 h-1.5 w-full bg-warm-100 dark:bg-warm-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warm-900 dark:bg-warm-50 transition-all duration-300"
                        style={{
                          width: `${Math.min(95, aiTimer * 3)}%`,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-warm-900 dark:text-warm-100 tabular-nums">
                    {aiTimer}s
                  </span>
                </div>
              )}
            </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">
              {t("profile.loading_profile")}
            </p>
          </div>
        ) : showInterview ? (
          <AIProfileInterview
            onComplete={async () => {
              setShowInterview(false);
              await loadFromDb();
            }}
            onSkip={() => setShowInterview(false)}
          />
        ) : isProfileEmpty(profile) && !importMode ? (
          <ProfileEmptyState
            t={t}
            onStartInterview={() => setShowInterview(true)}
            onUploadPDF={() => setImportMode("pdf")}
            onManual={() => setImportMode(null)}
          />
        ) : (
          <Tabs defaultValue="experience" className="w-full">
            <div className="overflow-x-auto pb-2">
              <TabsList className="grid min-w-[32rem] grid-cols-4 lg:w-[600px]">
                  <TabsTrigger value="info">
                    {t("profile.tab_personal")}
                  </TabsTrigger>
                  <TabsTrigger value="experience">
                    {t("profile.tab_experience")}
                  </TabsTrigger>
                  <TabsTrigger value="education">
                    {t("profile.tab_education")}
                  </TabsTrigger>
                  <TabsTrigger value="skills">
                    {t("profile.tab_skills")}
                  </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="info" className="mt-6">
              <PersonalInfoForm
                data={(profile.personalInfo || {}) as any}
                onChange={(val) => updateProfile("personalInfo", val)}
              />
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <ExperienceEditor
                data={(profile.workExperience || []) as any}
                onChange={(val) => updateProfile("workExperience", val)}
                onSave={() => handleSave(false)}
              />
            </TabsContent>

            <TabsContent value="education" className="mt-6">
              <EducationEditor
                data={(profile.education || []) as any}
                onChange={(val) => updateProfile("education", val)}
              />
              <CertificatesEditor
                data={(profile.certificates || []) as any}
                onChange={(val) => updateProfile("certificates", val)}
              />
            </TabsContent>

            <TabsContent value="skills" className="mt-6">
              <SkillsForm
                data={(profile.skills || []) as any}
                onChange={(val) => updateProfile("skills", val)}
                hideImport={true}
              />
            </TabsContent>
          </Tabs>
        )}

        {showSuggestions && (
          <ResumeSuggestions onClose={() => setShowSuggestions(false)} />
        )}
      </div>
    </AppShell>

      {/* Persistent AI assistant — always visible when profile has content */}
      {!showInterview && !isProfileEmpty(profile) && (
        <ProfileAssistantWidget
          onProfileUpdated={async () => { await loadFromDb(); }}
        />
      )}
    </>
  );
}

function isProfileEmpty(profile: { workExperience?: unknown[]; personalInfo?: Record<string, unknown>; education?: unknown[]; skills?: unknown[] }): boolean {
  const hasWork = (profile.workExperience?.length ?? 0) > 0;
  const hasEdu = (profile.education?.length ?? 0) > 0;
  const hasSkills = (profile.skills?.length ?? 0) > 0;
  const hasName = !!(profile.personalInfo?.firstName || profile.personalInfo?.lastName);
  return !hasWork && !hasEdu && !hasSkills && !hasName;
}

function ProfileEmptyState({
  t,
  onStartInterview,
  onUploadPDF,
  onManual,
}: {
  t: (k: string) => string;
  onStartInterview: () => void;
  onUploadPDF: () => void;
  onManual: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-warm-200 dark:border-warm-700 bg-warm-50/50 dark:bg-warm-900/30 p-8 sm:p-12 text-center space-y-8">
      <div className="space-y-2">
        <p className="text-2xl font-bold text-warm-900 dark:text-warm-100">
          {t("onboarding.title")}
        </p>
        <p className="text-warm-500 dark:text-warm-400 max-w-md mx-auto text-sm sm:text-base">
          {t("onboarding.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {/* AI Interview — primary */}
        <button
          onClick={onStartInterview}
          className="group relative flex flex-col items-center gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/20 p-6 text-center hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all shadow-sm hover:shadow-md"
        >
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {t("onboarding.recommended")}
          </span>
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-warm-900 dark:text-warm-100 text-sm">
              {t("onboarding.ai_interview")}
            </p>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
              {t("onboarding.ai_interview_desc")}
            </p>
          </div>
        </button>

        {/* Upload PDF */}
        <button
          onClick={onUploadPDF}
          className="flex flex-col items-center gap-3 rounded-2xl border border-warm-200 dark:border-warm-700 bg-warm-100 dark:bg-warm-800 p-6 text-center hover:border-warm-400 dark:hover:border-warm-500 hover:shadow-sm transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-warm-200 dark:bg-warm-700 flex items-center justify-center">
            <FileUp className="h-6 w-6 text-warm-600 dark:text-warm-300" />
          </div>
          <div>
            <p className="font-semibold text-warm-900 dark:text-warm-100 text-sm">
              {t("onboarding.upload_pdf")}
            </p>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
              {t("onboarding.upload_pdf_desc")}
            </p>
          </div>
        </button>

        {/* Manual */}
        <button
          onClick={onManual}
          className="flex flex-col items-center gap-3 rounded-2xl border border-warm-200 dark:border-warm-700 bg-warm-100 dark:bg-warm-800 p-6 text-center hover:border-warm-400 dark:hover:border-warm-500 hover:shadow-sm transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-warm-200 dark:bg-warm-700 flex items-center justify-center">
            <PenLine className="h-6 w-6 text-warm-600 dark:text-warm-300" />
          </div>
          <div>
            <p className="font-semibold text-warm-900 dark:text-warm-100 text-sm">
              {t("onboarding.manual")}
            </p>
            <p className="text-xs text-warm-500 dark:text-warm-400 mt-1">
              {t("onboarding.manual_desc")}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
