'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { PersonalInfoForm } from '@/components/resume/personal-info-form'
import { WorkExperienceForm } from '@/components/resume/work-experience-form'
import { EducationForm } from '@/components/resume/education-form'
import { SkillsForm } from '@/components/resume/skills-form'
import { TemplateSelector } from '@/components/resume/template-selector'
import { ResumePreview } from '@/components/resume/resume-preview'
import { AIAnalysisPanel } from '@/components/resume/ai-analysis-panel'
import { PersonalInfo, WorkExperience, Education, Skill, Resume } from '@/types/resume'
import { fetchLinkedInProfile } from '@/lib/linkedin'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Download, Save } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

export default function NewResumePage() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [resumeData, setResumeData] = useState<Partial<Resume>>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: session?.user?.email || '',
      phone: '',
      location: '',
      summary: ''
    },
    workExperience: [],
    education: [],
    skills: [],
    template: 'modern'
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleLinkedInImport = async () => {
    if (!(session as any)?.accessToken) return

    setIsLoading(true)
    try {
      const profile = await fetchLinkedInProfile((session as any).accessToken)

      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo!,
          firstName: profile.firstName,
          lastName: profile.lastName,
          summary: profile.summary,
          location: profile.location
        },
        workExperience: profile.experience.map((exp: any) => ({
          id: Math.random().toString(36),
          title: exp.title,
          company: exp.company,
          location: exp.location || '',
          startDate: exp.startDate?.year?.toString() || '',
          endDate: exp.endDate?.year?.toString(),
          current: !exp.endDate,
          description: [exp.description].filter(Boolean)
        })),
        education: profile.education.map((edu: any) => ({
          id: Math.random().toString(36),
          institution: edu.schoolName,
          degree: edu.degree,
          field: edu.fieldOfStudy || '',
          startDate: edu.startDate?.year?.toString() || '',
          endDate: edu.endDate?.year?.toString(),
          current: !edu.endDate
        })),
        skills: profile.skills.slice(0, 10).map((skill: any) => ({
          id: Math.random().toString(36),
          name: skill.name,
          category: 'technical' as const,
          level: 'intermediate' as const
        }))
      }))
    } catch (error) {
      console.error('Failed to import LinkedIn data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePersonalInfo = (info: PersonalInfo) => {
    setResumeData(prev => ({ ...prev, personalInfo: info }))
  }

  const updateWorkExperience = (experience: WorkExperience[]) => {
    setResumeData(prev => ({ ...prev, workExperience: experience }))
  }

  const updateEducation = (education: Education[]) => {
    setResumeData(prev => ({ ...prev, education }))
  }

  const updateSkills = (skills: Skill[]) => {
    setResumeData(prev => ({ ...prev, skills }))
  }

  const updateTemplate = (template: string) => {
    setResumeData(prev => ({ ...prev, template }))
  }

  const saveResume = async () => {
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resumeData)
      })

      if (response.ok) {
        const savedResume = await response.json()
        window.location.href = `/resume/${savedResume.id}`
      }
    } catch (error) {
      console.error('Failed to save resume:', error)
    }
  }

  const downloadPDF = () => {
    console.log('Downloading PDF...')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('resume_builder.title')}</h1>

          <div className="flex gap-4">
            {session && (
              <Button
                variant="outline"
                onClick={handleLinkedInImport}
                disabled={isLoading}
              >
                {isLoading ? t('form.loading') : t('form.import_linkedin')}
              </Button>
            )}
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
                  selectedTemplate={resumeData.template || 'modern'}
                  onChange={updateTemplate}
                />

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(4)}>
                    {t('form.back')}
                  </Button>

                  <div className="flex gap-4">
                    <Button onClick={saveResume} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {t('form.save')}
                    </Button>
                    <Button onClick={downloadPDF} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      {t('form.download_pdf')}
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
      </main>
    </div>
  )
}