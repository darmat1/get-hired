'use client'

import { Resume } from '@/types/resume'
import { analyzeResume, getResumeImprovementTips, ImprovementTip } from '@/lib/ai-analysis'
import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, AlertCircle, Info, CircleAlert } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

interface AIAnalysisPanelProps {
  resume: Partial<Resume>
}

export function AIAnalysisPanel({ resume }: AIAnalysisPanelProps) {
  const { t, language } = useTranslation()
  const [analysis, setAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [tips, setTips] = useState<ImprovementTip[]>([])

  useEffect(() => {
    if (resume.personalInfo?.firstName || resume.workExperience?.length || resume.skills?.length) {
      performAnalysis()
    }
  }, [resume])

  const performAnalysis = async () => {
    setIsLoading(true)
    try {
      const result = await analyzeResume(resume as Resume, language)
      setAnalysis(result)
      setTips(getResumeImprovementTips(result))
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success'
    if (score >= 60) return 'text-warning'
    return 'text-destructive'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 80) return t('ai.excellent')
    if (score >= 60) return t('ai.good')
    if (score >= 40) return t('ai.fair')
    return t('ai.needs_work')
  }

  if (isLoading) {
    return (
      <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-muted-foreground">{t('ai.analyzing')}</span>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{t('ai.title')}</h3>
      </div>

      <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{t('ai.score')}</span>
          <div className="text-right">
            <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}/100
            </span>
            <div className={`text-sm ${getScoreColor(analysis.score)}`}>
              {getScoreMessage(analysis.score)}
            </div>
          </div>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${analysis.score >= 80 ? 'bg-success' :
              analysis.score >= 60 ? 'bg-warning' : 'bg-destructive'
              }`}
            style={{ width: `${analysis.score}%` }}
          ></div>
        </div>
      </div>

      {analysis.strengths.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <h4 className="font-medium text-success dark:brightness-110">{t('ai.strengths')}</h4>
          </div>
          <ul className="space-y-1">
            {analysis.strengths.map((strength: string, index: number) => (
              <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>{t(strength)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.weaknesses.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="font-medium text-destructive dark:brightness-110">{t('ai.weaknesses')}</h4>
          </div>
          <ul className="space-y-1">
            {analysis.weaknesses.map((weakness: string, index: number) => (
              <li key={index} className="text-sm text-foreground/90 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>{t(weakness)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tips.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-primary mb-2">{t('ai.recommendations')}</h4>
          <div className="space-y-2">
            {tips.map((tip, index) => {
              const Icon = tip.type === 'high' ? CircleAlert :
                tip.type === 'medium' ? AlertTriangle :
                  tip.type === 'low' ? CheckCircle2 : Info;

              const bgColor = tip.type === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                tip.type === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                  tip.type === 'low' ? 'bg-success/10 text-success border-success/20' :
                    'bg-primary/10 text-primary border-primary/20';

              return (
                <div key={index} className={`text-sm p-3 rounded-md border flex items-start gap-3 ${bgColor}`}>
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{t(tip.message)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-medium text-muted-foreground mb-2">{t('ai.detailed_recommendations')}</h4>
          <div className="space-y-2">
            {analysis.recommendations
              .filter((rec: any) => rec.priority === 'high')
              .map((rec: any, index: number) => (
                <div key={index} className="text-sm p-3 bg-destructive/5 text-destructive border border-destructive/10 rounded-md flex items-start gap-3">
                  <CircleAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="leading-tight">
                    <span className="font-semibold">{t(rec.section)}:</span> {t(rec.suggestion)}
                  </div>
                </div>
              ))}
            {analysis.recommendations
              .filter((rec: any) => rec.priority === 'medium')
              .map((rec: any, index: number) => (
                <div key={index} className="text-sm p-3 bg-warning/5 text-warning border border-warning/10 rounded-md flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="leading-tight">
                    <span className="font-semibold">{t(rec.section)}:</span> {t(rec.suggestion)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}