'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { FileText, Edit, Download, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

interface ResumeData {
  id: string
  title: string
  template: string
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { data: session } = useSession()
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchResumes()
    }
  }, [session])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data)
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteResume = async (id: string) => {
    if (!confirm(t('dashboard.delete_confirm'))) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setResumes(resumes.filter(r => r.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete resume:', error)
    }
  }

  const downloadPDF = (id: string, title: string) => {
    window.open(`/api/resumes/${id}/pdf`, '_blank')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h2>
            <Button onClick={() => window.location.href = '/auth/signin'}>
              Sign In
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 w-64 bg-muted rounded mx-auto mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
            <p className="mt-2 text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>

          <Button onClick={() => window.location.href = '/resume/new'}>
            <FileText className="h-4 w-4 mr-2" />
            {t('nav.create_resume')}
          </Button>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {t('dashboard.no_resumes')}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('dashboard.no_resumes_desc')}
            </p>
            <Button onClick={() => window.location.href = '/resume/new'}>
              {t('nav.create_resume')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-card text-card-foreground rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {resume.title}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {t('dashboard.template')}: {resume.template}
                    </p>
                  </div>
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  <p>{t('dashboard.created')}: {new Date(resume.createdAt).toLocaleDateString()}</p>
                  <p>{t('dashboard.updated')}: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/resume/${resume.id}/edit`}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    {t('dashboard.edit')}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(resume.id, resume.title)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteResume(resume.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}