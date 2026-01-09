'use client'

import { AISettingsPanel } from '@/components/ai/ai-settings-panel'
import { Header } from '@/components/layout/header'
import { useTranslation } from '@/lib/translations'
import { AIService } from '@/lib/ai-services'

interface AISettingsClientProps {
  initialServices: AIService[]
}

export function AISettingsClient({ initialServices }: AISettingsClientProps) {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('ai_settings.title')}</h1>
          <p className="mt-2 text-muted-foreground">
            {t('ai_settings.subtitle')}
          </p>
        </div>
        
        <AISettingsPanel initialServices={initialServices} />
        
        <div className="mt-8 bg-primary/5 rounded-lg p-6 border border-primary/10">
          <h3 className="text-lg font-semibold text-primary mb-3">{t('ai_settings.how_it_works')}</h3>
          <ul className="space-y-2 text-foreground/90 whitespace-pre-line">
            {t('ai_settings.how_it_works_items')}
          </ul>
        </div>
      </main>
    </div>
  )
}
