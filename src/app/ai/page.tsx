'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { getCurrentAIService, getAvailableAIServices } from '@/lib/ai-services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Zap, DollarSign, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AIInfoPage() {
  const { data: session } = useSession()
  const [currentService, setCurrentService] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])

  useEffect(() => {
    const current = getCurrentAIService()
    setCurrentService(current)
    setServices(getAvailableAIServices())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">AI Анализ резюме</h1>
          <p className="mt-2 text-gray-600">
            Используйте искусственный интеллект для улучшения вашего резюме
          </p>
        </div>

        {/* Текущий статус */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentService ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  AI активно: {currentService.name}
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  AI не настроен
                </>
              )}
            </CardTitle>
            <CardDescription>
              {currentService
                ? `Анализ резюме выполняется с помощью ${currentService.name}`
                : 'Настройте AI сервис для получения персонализированных рекомендаций'
              }
            </CardDescription>
          </CardHeader>
          {currentService && (
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant={currentService.isFree ? 'default' : 'secondary'}>
                  {currentService.isFree ? 'Бесплатный' : 'Платный'}
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
            <CardTitle>Как работает AI анализ?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Анализ структуры</h4>
                <p className="text-sm text-gray-600">AI проверяет наличие всех необходимых разделов резюме</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Оценка качества</h4>
                <p className="text-sm text-gray-600">Анализирует полноту описания опыта и навыков</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Персональные рекомендации</h4>
                <p className="text-sm text-gray-600">Дает конкретные советы по улучшению каждого раздела</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Доступные AI сервисы</CardTitle>
            <CardDescription>
              Выберите подходящий вам вариант
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {service.name === 'Groq' && <Zap className="h-5 w-5 text-yellow-500" />}
                    {service.name === 'OpenAI' && <DollarSign className="h-5 w-5 text-green-500" />}
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={service.isFree ? 'default' : 'secondary'}>
                      {service.isFree ? 'Бесплатный' : 'Платный'}
                    </Badge>
                    {service.status === 'connected' && (
                      <Badge className="bg-green-600">Подключено</Badge>
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
                  Готовы улучшить ваше резюме с AI?
                </h3>
                <p className="text-blue-700 mb-4">
                  Настройте AI сервис и получите персонализированные рекомендации уже сегодня
                </p>
                <Link
                  href="/ai-settings"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Настроить AI
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
              Протестировать AI анализ
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

function Header() {
  const { data: session, status } = useSession()

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
            {status === 'loading' ? (
              <div className="h-8 w-32 animate-pulse bg-gray-200 rounded"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Мои резюме
                </Link>
                <Link
                  href="/ai-settings"
                  className="text-gray-700 hover:text-gray-900"
                >
                  AI настройки
                </Link>
                <Link
                  href="/resume/new"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Создать резюме
                </Link>
              </>
            ) : (
              <Link
                href="/"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                На главную
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}