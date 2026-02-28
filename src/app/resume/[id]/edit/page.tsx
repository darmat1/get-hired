"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { PersonalInfoForm } from "@/components/resume/personal-info-form";
import { WorkExperienceForm } from "@/components/resume/work-experience-form";
import { EducationForm } from "@/components/resume/education-form";
import { SkillsForm } from "@/components/resume/skills-form";
import { TemplateSelector } from "@/components/resume/template-selector";
import { ResumePreview } from "@/components/resume/resume-preview";
import { AIAnalysisPanel } from "@/components/resume/ai-analysis-panel";
import {
  PersonalInfo,
  WorkExperience,
  Education,
  Skill,
  Resume,
} from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Download, Save, Loader2, ChevronLeft } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function EditResumePage() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [resumeData, setResumeData] = useState<Partial<Resume>>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    workExperience: [],
    education: [],
    skills: [],
    template: "modern",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user && id) {
      fetchResume();
    } else if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, id, router]);

  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
        lastSavedDataRef.current = JSON.stringify(data);
      } else {
        console.error("Failed to fetch resume");
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePersonalInfo = (info: PersonalInfo) => {
    setResumeData((prev) => ({ ...prev, personalInfo: info }));
  };

  const updateWorkExperience = (experience: WorkExperience[]) => {
    setResumeData((prev) => ({ ...prev, workExperience: experience }));
  };

  const updateEducation = (education: Education[]) => {
    setResumeData((prev) => ({ ...prev, education }));
  };

  const updateSkills = (skills: Skill[]) => {
    setResumeData((prev) => ({ ...prev, skills }));
  };

  const updateTemplate = (template: string) => {
    setResumeData((prev) => ({ ...prev, template }));
  };

  // Keep refs for data tracking
  const resumeDataRef = useRef(resumeData);
  const lastSavedDataRef = useRef<string>("");

  useEffect(() => {
    resumeDataRef.current = resumeData;
  }, [resumeData]);

  // Auto-save every 15 seconds, but only if there are unsaved changes
  useEffect(() => {
    if (!id || !session?.user) return;

    const interval = setInterval(async () => {
      const currentDataStr = JSON.stringify(resumeDataRef.current);

      // Skip if data hasn't changed since last save
      if (currentDataStr === lastSavedDataRef.current) return;

      setIsSaving(true);
      try {
        const response = await fetch(`/api/resumes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: currentDataStr,
        });

        if (response.ok) {
          lastSavedDataRef.current = currentDataStr;
        } else {
          console.error("Failed to auto-save resume");
        }
      } catch (error) {
        console.error("Failed to auto-save resume:", error);
      } finally {
        setIsSaving(false);
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [id, session]);

  const saveResume = async () => {
    setIsSaving(true);
    try {
      const currentDataStr = JSON.stringify(resumeDataRef.current);
      const response = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: currentDataStr,
      });

      if (response.ok) {
        lastSavedDataRef.current = currentDataStr;
        // Handle success
      } else {
        console.error("Failed to update resume");
      }
    } catch (error) {
      console.error("Failed to save resume:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const downloadPDF = () => {
    window.open(`/api/resumes/${id}/pdf`, "_blank");
  };

  if (!mounted || isPending)
    return <LoadingScreen message={t("profile.loading_profile")} />;
  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto space-y-6 text-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Link>
                <h1 className="text-2xl font-bold">{t("nav.create_resume")}</h1>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={saveResume}
                  disabled={isSaving}
                  type="button"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {t("form.save")}
                </Button>
                <Button onClick={downloadPDF} type="button">
                  <Download className="h-4 w-4 mr-2" />
                  {t("form.download_pdf")}
                </Button>
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-start justify-center">
              <div className="flex-1 w-full max-w-[950px]">
                <ResumePreview
                  data={resumeData as Resume}
                  onChange={setResumeData}
                  isEditing={true}
                />
              </div>

              <div className="w-full xl:w-[400px] sticky top-8 self-start">
                <AIAnalysisPanel resume={resumeData as Resume} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
