import AILandingClient from '@/components/ai/ai-landing-client'
import type { Metadata } from 'next' 

export const metadata: Metadata = {
  title: 'AI Resume Analysis — Improve your resume with AI | GetHired',
  description:
    'AI Resume Analysis — automated resume scoring, ATS keyword recommendations, and section-level AI edits to increase interview rates. Fast, privacy-first, exportable to PDF.',
  keywords: [
    'ai resume analysis',
    'resume optimization',
    'ats optimization',
    'resume score',
    'resume keywords',
    'resume ai',
    'gethired',
  ],
  openGraph: {
    title: 'AI Resume Analysis — GetHired',
    description: 'Automated resume scoring, ATS optimization, and AI-generated, actionable suggestions.',
    siteName: 'GetHired',
    images: [
      { url: '/og/ai-resume-analysis.png', alt: 'AI Resume Analysis — GetHired' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Analysis — GetHired',
    description: 'Score and optimize your resume with AI — get ATS-ready and exportable results.',
  },
  robots: {
    index: true,
    follow: true,
  },
} 

export default function AIInfoPage() {
  return <AILandingClient />
}

