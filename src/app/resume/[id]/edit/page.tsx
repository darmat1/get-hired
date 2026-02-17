"use client";

import { useState, useEffect } from "react";
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
import { useParams } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function EditResumePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const params = useParams();
  const id = params?.id as string;

  const [step, setStep] = useState(1);
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
    if (session?.user && id) {
      fetchResume();
    } else if (session === null) {
      setIsLoading(false); // Stop loading if definitely not logged in
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, id]);

  const fetchResume = async () => {
    try {
      const response = await fetch(`/api/resumes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
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

  const saveResume = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (response.ok) {
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

  if (isLoading) {
    return <LoadingScreen message={t("profile.loading_profile")} />;
  }

  if (!session) {
    return <LoadingScreen message={t("auth.sign_in_required")} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6 text-foreground">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Editor Column */}
              <div className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Link
                      href="/dashboard"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-2xl font-bold">
                      {t("nav.create_resume")}
                    </h1>
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

                {/* Steps */}
                <div className="mb-8 flex justify-between items-center border-b pb-4">
                  {[
                    t("form.personal_info"),
                    t("form.work_experience"),
                    t("form.education"),
                    t("form.skills"),
                    t("dashboard.template"),
                  ].map((label, index) => (
                    <button
                      key={index}
                      onClick={() => setStep(index + 1)}
                      className={`text-sm font-medium transition-colors ${
                        step === index + 1
                          ? "text-primary border-b-2 border-primary -mb-[17px] pb-4"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-6">
                  {step === 1 && (
                    <PersonalInfoForm
                      data={resumeData.personalInfo as PersonalInfo}
                      onChange={updatePersonalInfo}
                      onNext={() => setStep(2)}
                    />
                  )}
                  {step === 2 && (
                    <WorkExperienceForm
                      data={resumeData.workExperience as WorkExperience[]}
                      onChange={updateWorkExperience}
                    />
                  )}
                  {step === 3 && (
                    <EducationForm
                      data={resumeData.education as Education[]}
                      onChange={updateEducation}
                    />
                  )}
                  {step === 4 && (
                    <SkillsForm
                      data={resumeData.skills as Skill[]}
                      onChange={updateSkills}
                    />
                  )}
                  {step === 5 && (
                    <>
                      <TemplateSelector
                        selectedTemplate={resumeData.template || "modern"}
                        onChange={updateTemplate}
                      />
                    </>
                  )}
                </div>

                <div className="mt-8">
                  <AIAnalysisPanel resume={resumeData as Resume} />
                </div>
              </div>

              {/* Preview Column */}
              <div className="hidden lg:block w-[600px]">
                <div className="sticky top-0">
                  <ResumePreview
                    data={resumeData as Resume}
                    onChange={setResumeData}
                    isEditing={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
