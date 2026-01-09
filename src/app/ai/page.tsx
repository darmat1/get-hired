'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { getCurrentAIService, getAvailableAIServices } from '@/lib/ai-services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, DollarSign, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/translations'

export default function AIInfoPage() {
  const { t } = useTranslation()
  const [services] = useState<any>(() => getAvailableAIServices());

  const [currentService, setCurrentService] = useState<any>(() => {
    return getCurrentAIService();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">{t('ai.title')}</h1>
          <p className="mt-2 text-gray-600">
            {t('ai.description')}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentService ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  {t('ai.active')}: {currentService.name}
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  {t('ai.not_configured')}
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentService
                ? t('ai.analysis_with').replace('{service}', currentService.name)
                : t('ai.setup_required')
              }
            </CardDescription>
          </CardHeader>
          {currentService && (
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={currentService.isFree ? 'default' : 'secondary'}>
                  {currentService.isFree ? t('ai.free') : t('ai.paid')}
                </Badge>
                <span className="text-sm text-gray-600">
                  {currentService.description}
                </span>
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('ai.how_it_works')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold">{t('ai.step1_title')}</h4>
                <p className="text-sm text-gray-600">{t('ai.step1_desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold">{t('ai.step2_title')}</h4>
                <p className="text-sm text-gray-600">{t('ai.step2_desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold">{t('ai.step3_title')}</h4>
                <p className="text-sm text-gray-600">{t('ai.step3_desc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('ai.available_services')}</CardTitle>
            <CardDescription>
              {t('ai.choose_service')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service: any) => (
              <div key={service.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {service.name === 'Groq' && <Zap className="h-5 w-5 text-yellow-500" />}
                    {service.name === 'OpenAI' && <DollarSign className="h-5 w-5 text-green-500" />}
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.isFree ? 'default' : 'secondary'}>
                      {service.isFree ? t('ai.free') : t('ai.paid')}
                    </Badge>
                    {service.status === 'connected' && (
                      <Badge className="bg-green-600">{t('ai.connected')}</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {!currentService && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {t('ai.ready_to_improve')}
                </h3>
                <p className="text-blue-700 mb-4">
                  {t('ai.setup_recommendation')}
                </p>
                <Link
                  href="/ai-settings"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  {t('ai.setup')}
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {currentService && (
          <div className="text-center">
            <Link
              href="/resume/new"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {t('ai.test_analysis')}
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function Header() {
  const { data: session, isPending } = useSession()
  const { t } = useTranslation()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              CV Maker
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            {isPending ? (
              <div className="h-8 w-32 animate-pulse bg-gray-200 rounded"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900"
                >
                  {t('nav.my_resumes')}
                </Link>
                <Link
                  href="/ai-settings"
                  className="text-gray-700 hover:text-gray-900"
                >
                  {t('nav.ai_settings')}
                </Link>
                <Link
                  href="/resume/new"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {t('nav.create_resume')}
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {t('nav.home')}
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}