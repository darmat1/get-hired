import { Resume } from '@/types/resume'
import { ModernTemplate } from '@/components/pdf-templates/modern-template'
import { pdf, Font } from '@react-pdf/renderer'
import React from 'react'


// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ],
})

Font.register({
  family: 'Roboto-Bold',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
})

export async function generatePDF(resume: Resume): Promise<Buffer> {
  try {
    const Template = getTemplateComponent(resume.template || 'modern')
    const doc = React.createElement(Template, { resume })
    const result = await pdf(doc as any).toBuffer()

    if (Buffer.isBuffer(result)) {
      return result
    }

    // Handle case where it returns a stream (based on previous code/types)
    const chunks: any[] = []
    for await (const chunk of (result as any)) {
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
