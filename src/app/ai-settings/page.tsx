import { getAvailableAIServices } from '@/lib/ai-services'
import { AISettingsClient } from './ai-settings-client'

export default function AISettingsPage() {
  const services = getAvailableAIServices()
  
  // Strip sensitive data (API keys) before passing to client
  const safeServices = services.map(service => ({
    ...service,
    apiKey: undefined
  }))

  return <AISettingsClient initialServices={safeServices} />
}
