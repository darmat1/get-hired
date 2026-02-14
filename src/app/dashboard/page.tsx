"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useTranslation } from "@/lib/translations";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExperienceEditor } from "@/components/profile/experience-editor";
import { EducationEditor } from "@/components/profile/education-editor";
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
import { extractTextFromPDF } from "@/components/resume/linkedin-import-button";

export default function MyExperiencePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>({
    personalInfo: {},
    workExperience: [],
    education: [],
    skills: [],
    certificates: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [importMode, setImportMode] = useState<"pdf" | "paste" | null>(null);
  const [profileText, setProfileText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiTimer, setAiTimer] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  // AI processing timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAiProcessing) {
      setAiTimer(0);
      interval = setInterval(() => setAiTimer((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isAiProcessing]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile/experience");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/profile/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        setMessage({ type: "success", text: t("profile.save_success") });
      } else {
        throw new Error(t("profile.save_error"));
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save profile:", error);
      setMessage({ type: "error", text: t("profile.save_error") });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setMessage({ type: "error", text: t("profile.error.upload_pdf") });
      return;
    }

    setFileName(file.name);
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleImport = async (textToUse?: string) => {
    const text = textToUse || profileText;
    if (!text) return;

    setIsLoading(true);
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

      setMessage({ type: "success", text: t("profile.import_success") });
      fetchProfile(); // Refresh profile data
      setImportMode(null);
      setProfileText("");
      setFileName(null);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : t("profile.import_error"),
      });
    } finally {
      setIsLoading(false);
      setIsAiProcessing(false);
    }
  };

  if (!session) return <div>{t("common.auth_required")}</div>;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">{t("nav.my_experience")}</h1>
                <p className="text-muted-foreground">
                  {t("profile.unified_desc")}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t("common.save")}
                </Button>
                <Button onClick={() => setShowSuggestions(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("profile.suggest_btn")}
                </Button>
              </div>
            </div>

            {/* Import Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">
                    {t("profile.import_data")}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={importMode === "pdf" ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setImportMode(importMode === "pdf" ? null : "pdf")
                    }
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
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {fileName || t("profile.upload_pdf_desc")}
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
                  <textarea
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                    placeholder={t("profile.paste_text_placeholder")}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <Button
                    className="w-full"
                    onClick={() => handleImport()}
                    disabled={isLoading || !profileText}
                  >
                    {isLoading ? (
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
                <div className="flex items-center gap-4 p-5 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-700 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                    <Sparkles className="h-4 w-4 text-indigo-500 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      {t("profile.ai_analyzing").replace(
                        "{seconds}",
                        String(aiTimer),
                      )}
                    </p>
                    <div className="mt-2 h-1.5 w-full bg-blue-100 dark:bg-blue-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"
                        style={{
                          width: `${Math.min(95, aiTimer * 3)}%`,
                          transition: "width 1s ease",
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300 tabular-nums">
                    {aiTimer}s
                  </span>
                </div>
              )}
            </div>

            {isLoading && !profile ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">
                  {t("profile.loading_profile")}
                </p>
              </div>
            ) : profile ? (
              <Tabs defaultValue="experience" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
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

                <TabsContent value="info" className="mt-6">
                  <PersonalInfoForm
                    data={profile.personalInfo || {}}
                    onChange={(val) => updateProfile("personalInfo", val)}
                    onNext={() => {}}
                  />
                </TabsContent>

                <TabsContent value="experience" className="mt-6">
                  <ExperienceEditor
                    data={profile.workExperience || []}
                    onChange={(val) => updateProfile("workExperience", val)}
                  />
                </TabsContent>

                <TabsContent value="education" className="mt-6">
                  <EducationEditor
                    data={profile.education || []}
                    onChange={(val) => updateProfile("education", val)}
                  />
                </TabsContent>

                <TabsContent value="skills" className="mt-6">
                  <SkillsForm
                    data={profile.skills || []}
                    onChange={(val) => updateProfile("skills", val)}
                    onNext={() => {}}
                    onBack={() => {}}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-muted-foreground">
                  {t("profile.load_error")}
                </p>
              </div>
            )}

            {showSuggestions && (
              <ResumeSuggestions onClose={() => setShowSuggestions(false)} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
