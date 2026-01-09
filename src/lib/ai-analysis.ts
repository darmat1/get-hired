import { Resume } from '@/types/resume'

export interface AIAnalysis {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  recommendations: {
    section: string
    suggestion: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

export interface ImprovementTip {
  type: 'info' | 'high' | 'medium' | 'low'
  message: string
}

export async function analyzeResume(resume: Resume, language: string = 'en'): Promise<AIAnalysis> {
  // Try to use real AI if API key is available, otherwise fall back to mock
  if (process.env.OPENAI_API_KEY) {
    try {
      return await analyzeWithOpenAI(resume, language)
    } catch (error) {
      console.warn('OpenAI analysis failed, falling back to mock:', error)
    }
  } else if (process.env.GROQ_API_KEY) {
    try {
      return await analyzeWithGroq(resume, language)
    } catch (error) {
      console.warn('Groq analysis failed, falling back to mock:', error)
    }
  }

  // Fallback to mock analysis

  const analysis: AIAnalysis = {
    score: calculateResumeScore(resume),
    strengths: [],
    weaknesses: [],
    suggestions: [],
    recommendations: []
  }

  // Analyze personal info
  if (resume.personalInfo.summary && resume.personalInfo.summary.length > 100) {
    analysis.strengths.push('ai_analysis.summary_good')
  } else {
    analysis.weaknesses.push('ai_analysis.summary_missing')
    analysis.recommendations.push({
      section: 'form.personal_info',
      suggestion: 'ai_analysis.summary_recommendation',
      priority: 'high'
    })
  }

  // Analyze work experience
  if (resume.workExperience.length === 0) {
    analysis.weaknesses.push('ai_analysis.work_missing')
    analysis.recommendations.push({
      section: 'form.work_experience',
      suggestion: 'ai_analysis.work_add',
      priority: 'high'
    })
  } else {
    const hasDetailedDescriptions = resume.workExperience.some(exp =>
      exp.description && exp.description.length >= 3
    )

    if (hasDetailedDescriptions) {
      analysis.strengths.push('ai_analysis.work_detailed')
    } else {
      analysis.suggestions.push('ai_analysis.work_add_details')
      analysis.recommendations.push({
        section: 'form.work_experience',
        suggestion: 'ai_analysis.work_recommendation',
        priority: 'medium'
      })
    }
  }

  // Analyze education
  if (resume.education.length > 0) {
    analysis.strengths.push('ai_analysis.education_listed')
  } else {
    analysis.suggestions.push('ai_analysis.education_consider')
    analysis.recommendations.push({
      section: 'form.education',
      suggestion: 'ai_analysis.education_recommendation',
      priority: 'low'
    })
  }

  // Analyze skills
  const technicalSkills = resume.skills.filter(s => s.category === 'technical')
  const softSkills = resume.skills.filter(s => s.category === 'soft')

  if (technicalSkills.length >= 5) {
    analysis.strengths.push('ai_analysis.technical_good')
  } else if (technicalSkills.length > 0) {
    analysis.suggestions.push('ai_analysis.technical_add_more')
  }

  if (softSkills.length >= 3) {
    analysis.strengths.push('ai_analysis.softskills_listed')
  } else if (softSkills.length === 0) {
    analysis.recommendations.push({
      section: 'form.skills',
      suggestion: 'ai_analysis.softskills_add',
      priority: 'medium'
    })
  }

  // General suggestions
  if (resume.workExperience.length > 0 && resume.education.length > 0) {
    analysis.suggestions.push('ai_analysis.general_certificates')
  }

  return analysis
}

function calculateResumeScore(resume: Resume): number {
  let score = 0
  const maxScore = 100

  // Personal info (20 points)
  if (resume.personalInfo.firstName && resume.personalInfo.lastName) score += 5
  if (resume.personalInfo.email) score += 5
  if (resume.personalInfo.phone) score += 3
  if (resume.personalInfo.summary && resume.personalInfo.summary.length > 50) score += 7

  // Work experience (30 points)
  if (resume.workExperience.length > 0) {
    score += 10
    resume.workExperience.forEach(exp => {
      if (exp.description && exp.description.length >= 3) score += 4
    })
  }

  // Education (20 points)
  if (resume.education.length > 0) {
    score += 10
    if (resume.education.some(edu => edu.field)) score += 5
    if (resume.education.some(edu => edu.gpa)) score += 5
  }

  // Skills (30 points)
  if (resume.skills.length >= 5) {
    score += 15
    const hasTechnical = resume.skills.some(s => s.category === 'technical')
    const hasSoft = resume.skills.some(s => s.category === 'soft')
    if (hasTechnical) score += 8
    if (hasSoft) score += 7
  }

  return Math.min(score, maxScore)
}

async function analyzeWithOpenAI(resume: Resume, language: string): Promise<AIAnalysis> {
  const prompt = `
    Analyze this resume and provide a detailed evaluation in JSON format.
    CRITICAL: You must provide all text values (strengths, weaknesses, suggestions, recommendations) in the following language: ${language}.
    
    Resume Data:
    ${JSON.stringify(resume, null, 2)}
    
    Return a JSON object with the following fields:
    - score: a number from 0 to 100 (overall resume quality)
    - strengths: an array of strings (strong points of the resume)
    - weaknesses: an array of strings (what needs improvement)
    - suggestions: an array of strings (general recommendations)
    - recommendations: an array of objects with the following fields:
      * section: name of the resume section
      * suggestion: specific recommendation for this section
      * priority: "high"|"medium"|"low"
    
    Respond ONLY with the JSON object. No extra text.
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  const analysis = JSON.parse(data.choices[0].message.content)
  return analysis
}

async function analyzeWithGroq(resume: Resume, language: string): Promise<AIAnalysis> {
  const Groq = require('groq-sdk')
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const prompt = `
    Analyze this resume and provide a detailed evaluation in JSON format.
    CRITICAL: You must provide all text values (strengths, weaknesses, suggestions, recommendations) in the following language: ${language}.
    
    Return ONLY a JSON object in the following format:
    {
      "score": 0-100,
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "suggestions": ["suggestion 1", "suggestion 2"],
      "recommendations": [
        {
          "section": "section name",
          "suggestion": "specific recommendation",
          "priority": "high"|"medium"|"low"
        }
      ]
    }
    
    Resume Data:
    ${JSON.stringify(resume, null, 2)}
  `

  const chatCompletion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    response_format: { type: "json_object" }
  })

  const content = chatCompletion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content from Groq API')
  }

  return JSON.parse(content)
}

export function getResumeImprovementTips(analysis: AIAnalysis): ImprovementTip[] {
  const tips: ImprovementTip[] = []

  if (analysis.score < 60) {
    tips.push({ type: 'info', message: 'ai_tip.poor_score' })
  } else if (analysis.score < 80) {
    tips.push({ type: 'info', message: 'ai_tip.good_score' })
  } else {
    tips.push({ type: 'info', message: 'ai_tip.excellent_score' })
  }

  analysis.recommendations
    .filter(rec => rec.priority === 'high')
    .forEach(rec => {
      tips.push({ type: 'high', message: rec.suggestion })
    })

  analysis.recommendations
    .filter(rec => rec.priority === 'medium')
    .forEach(rec => {
      tips.push({ type: 'medium', message: rec.suggestion })
    })

  analysis.recommendations
    .filter(rec => rec.priority === 'low')
    .forEach(rec => {
      tips.push({ type: 'low', message: rec.suggestion })
    })

  return tips
}