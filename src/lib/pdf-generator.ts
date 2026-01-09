import { Resume } from '@/types/resume'
import { ModernTemplate } from '@/components/pdf-templates/modern-template'
import { pdf } from '@react-pdf/renderer'

export async function generatePDF(resume: Resume): Promise<Buffer> {
  try {
    const { ModernTemplate } = await import('@/components/pdf-templates/modern-template')
    const React = require('react')
    const doc = React.createElement(ModernTemplate, { resume })
    const stream = await pdf(doc).toBuffer()
    const chunks: any[] = []

    for await (const chunk of stream) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

export function getTemplateComponent(templateName: string) {
  const templates = {
    modern: ModernTemplate,
    professional: ModernTemplate,
    creative: ModernTemplate,
    minimal: ModernTemplate,
  }

  return templates[templateName as keyof typeof templates] || ModernTemplate
}