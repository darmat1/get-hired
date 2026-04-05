"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useResumeStore } from "@/stores/resume-store";
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

import { AppShell } from "@/components/layout/app-shell";
import { Sidebar } from "@/components/layout/sidebar";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function EditResumePage() {
  const { t } = useTranslation();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const {
    resume: resumeData,
    isLoading,
    isSaving,
    setResume,
    updateField,
    loadFromDb,
    saveToDb,
    reset: resetResumeStore,
    needsLoad: needsLoadResume,
  } = useResumeStore();

  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const lastSavedDataRef = useRef<string>("");

  useEffect(() => {
    setMounted(true);
    return () => resetResumeStore();
  }, [resetResumeStore]);

  useEffect(() => {
    if (session?.user && id) {
      if (needsLoadResume(id)) {
        loadFromDb(id).then((ok) => {
          if (ok) {
            lastSavedDataRef.current = JSON.stringify(
              useResumeStore.getState().resume,
            );
          }
        });
      }
    } else if (!isPending && session === null) {
      router.push("/");
    }
  }, [session, isPending, id, router, needsLoadResume, loadFromDb]);

  const updatePersonalInfo = (info: PersonalInfo) => {
    updateField("personalInfo", info);
  };

  const updateWorkExperience = (experience: WorkExperience[]) => {
    updateField("workExperience", experience);
  };

  const updateEducation = (education: Education[]) => {
    updateField("education", education);
  };

  const updateSkills = (skills: Skill[]) => {
    updateField("skills", skills);
  };

  const updateTemplate = (template: string) => {
    updateField("template", template);
  };

  // Auto-save every 15 seconds, but only if there are unsaved changes
  useEffect(() => {
    if (!id || !session?.user) return;

    const interval = setInterval(async () => {
      const current = useResumeStore.getState().resume;
      const currentDataStr = JSON.stringify(current);

      if (currentDataStr === lastSavedDataRef.current) return;

      const ok = await saveToDb();
      if (ok) {
        lastSavedDataRef.current = currentDataStr;
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [id, session, saveToDb]);

  const saveResume = async () => {
    const ok = await saveToDb();
    if (ok) {
      lastSavedDataRef.current = JSON.stringify(resumeData);
    }
  };

  const downloadPDF = () => {
    window.open(`/api/resumes/${id}/pdf`, "_blank");
  };

  const waitingForData = id && needsLoadResume(id) && !resumeData.id;
  if (!mounted || isPending || isLoading || waitingForData)
    return <LoadingScreen message={t("profile.loading_profile")} />;
  if (!session) return null;

  return (
    <AppShell sidebar={<Sidebar />} mobileTitle="Dashboard" contentClassName="p-4 md:p-6 xl:p-8">
      <div className="mx-auto max-w-[1400px] space-y-6 text-foreground">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/my-resumes"
              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <h1 className="truncate text-xl font-bold sm:text-2xl">
              {(resumeData as any)?.title || t("nav.create_resume")}
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={saveResume}
              disabled={isSaving}
              type="button"
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t("form.save")}
            </Button>
            <Button onClick={downloadPDF} type="button" className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              {t("form.download_pdf")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:justify-center 2xl:gap-8">
          <div className="w-full min-w-0 flex-1 2xl:max-w-[950px]">
            <ResumePreview
              data={resumeData as Resume}
              onChange={(data) => setResume(data as Partial<Resume>)}
              isEditing={true}
              onTemplateChange={updateTemplate}
            />
          </div>

          <div className="w-full 2xl:w-[400px] 2xl:sticky 2xl:top-8 2xl:self-start">
            <AIAnalysisPanel resume={resumeData as Resume} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
