"use client";

import { useState } from "react";
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
import { Download, Save } from "lucide-react";
import { useTranslation } from "@/lib/translations";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function NewResumePage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<Partial<Resume>>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: session?.user?.email || "",
      phone: "",
      location: "",
      summary: "",
    },
    workExperience: [],
    education: [],
    skills: [],
    template: "modern",
  });

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
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData),
      });

      if (response.ok) {
        const savedResume = await response.json();
        window.location.href = `/resume/${savedResume.id}`;
      }
    } catch (error) {
      console.error("Failed to save resume:", error);
    }
  };

  const downloadPDF = () => {
    console.log("Downloading PDF...");
  };

  if (!session) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">
                Please sign in to create a resume
              </h2>
              <Button onClick={() => (window.location.href = "/auth/signin")}>
                Sign In
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="space-y-6 text-foreground">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                {t("resume_builder.title")}
              </h1>

              <div className="flex gap-4">
                {/* LinkedIn import disabled - using Better Auth instead */}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {step === 1 && (
                  <PersonalInfoForm
                    data={resumeData.personalInfo!}
                    onChange={updatePersonalInfo}
                    onNext={() => setStep(2)}
                  />
                )}

                {step === 2 && (
                  <WorkExperienceForm
                    data={resumeData.workExperience || []}
                    onChange={updateWorkExperience}
                    onNext={() => setStep(3)}
                    onBack={() => setStep(1)}
                  />
                )}

                {step === 3 && (
                  <EducationForm
                    data={resumeData.education || []}
                    onChange={updateEducation}
                    onNext={() => setStep(4)}
                    onBack={() => setStep(2)}
                  />
                )}

                {step === 4 && (
                  <SkillsForm
                    data={resumeData.skills || []}
                    onChange={updateSkills}
                    onNext={() => setStep(5)}
                    onBack={() => setStep(3)}
                  />
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <TemplateSelector
                      selectedTemplate={resumeData.template || "modern"}
                      onChange={updateTemplate}
                    />

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(4)}>
                        {t("form.back")}
                      </Button>

                      <div className="flex gap-4">
                        <Button
                          onClick={saveResume}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {t("form.save")}
                        </Button>
                        <Button
                          onClick={downloadPDF}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          {t("form.download_pdf")}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-8 h-fit space-y-6">
                <ResumePreview data={resumeData} />
                <AIAnalysisPanel resume={resumeData} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
