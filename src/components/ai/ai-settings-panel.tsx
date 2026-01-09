'use client'

import { useState, useEffect } from 'react'
import { getAvailableAIServices, testAIService, getCurrentAIService, AISetupInstructions } from '@/lib/ai-services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, ExternalLink, Key } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

export function AISettingsPanel() {
  const { t } = useTranslation()
  const [services, setServices] = useState(getAvailableAIServices())
  const [isTesting, setIsTesting] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState<string | null>(null)

  const handleTestService = async (service: any) => {
    setIsTesting(service.name)
    const isWorking = await testAIService(service)

    setServices(prev => prev.map(s =>
      s.name === service.name
        ? { ...s, status: isWorking ? 'connected' : 'disconnected' }
        : s
    ))

    setIsTesting(null)
  }

  const currentService = getCurrentAIService()

  return (
    <div className="space-y-6">
      {currentService && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              {t('ai_settings.active_service')} {currentService.name}
            </CardTitle>
            <CardDescription>
              {t('ai_settings.analysis_using')} {currentService.name}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('ai_settings.available_services')}</h3>

        {services.map((service) => (
          <Card key={service.name} className={service.status === 'connected' ? 'border-green-200' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <Badge variant={service.isFree ? 'default' : 'secondary'}>
                    {service.isFree ? t('ai_settings.free') : t('ai_settings.paid')}
                  </Badge>
                  {service.status === 'connected' && (
                    <Badge variant="default" className="bg-green-600">
                      {t('ai_settings.connected')}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {service.status === 'disconnected' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowInstructions(service.name.toLowerCase())}
                        className="h-8"
                      >
                        <Key className="h-3 w-3 mr-1" />
                        {t('ai_settings.setup')}
                      </Button>

                      {service.apiKey && (
                        <Button
                          size="sm"
                          onClick={() => handleTestService(service)}
                          disabled={isTesting === service.name}
                          className="h-8"
                        >
                          {isTesting === service.name ? t('ai_settings.testing') : t('ai_settings.test')}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <CardDescription>{t(service.descriptionKey)}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {showInstructions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t('ai_settings.setup')} {AISetupInstructions[showInstructions as keyof typeof AISetupInstructions].name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInstructions(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {AISetupInstructions[showInstructions as keyof typeof AISetupInstructions].stepKeys.map((stepKey, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {t(stepKey)}
                </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>Limits:</strong> {t(AISetupInstructions[showInstructions as keyof typeof AISetupInstructions].limitsKey)}
            </div>

            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              {t('ai_settings.reload')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Статус */}
      {!currentService && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800">
              <X className="h-5 w-5" />
              <span className="font-medium">{t('ai_settings.not_configured')}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {t('ai_settings.not_configured_desc')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}