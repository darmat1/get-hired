import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generatePDF } from '@/lib/pdf-generator'
import { prisma } from '@/lib/prisma'

function getFilenameForResume(resume: any): string {
  const isTailored = resume.title?.startsWith('Tailored:')
  
  if (isTailored && resume.personalInfo) {
    try {
      const personalInfo = typeof resume.personalInfo === 'string' 
        ? JSON.parse(resume.personalInfo) 
        : resume.personalInfo

      const firstName = personalInfo?.firstName || ''
      const lastName = personalInfo?.lastName || ''
      
      const position = resume.targetPosition || ''
      const company = resume.targetCompany || ''

      if (firstName && lastName && position && company) {
        return `${firstName}-${lastName}_${position}_${company}.pdf`
      }
    } catch (e) {
      console.error('Error parsing resume for filename:', e)
    }
  }

  return `resume-${encodeURIComponent(resume.title || 'untitled')}.pdf`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth.api.getSession({
      headers: req.headers
    })

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found', status: 404 })
    }

    const pdfBuffer = await generatePDF(resume as any)
    const filename = getFilenameForResume(resume)

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(filename)}"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
