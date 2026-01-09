'use client'

import { Skill } from '@/types/resume'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

interface SkillsFormProps {
  data: Skill[]
  onChange: (skills: Skill[]) => void
  onNext: () => void
  onBack: () => void
}

export function SkillsForm({ data, onChange, onNext, onBack }: SkillsFormProps) {
  const { t } = useTranslation()
  const addSkill = () => {
    const newSkill: Skill = {
      id: Math.random().toString(36),
      name: '',
      category: 'technical',
      level: 'intermediate'
    }
    onChange([...data, newSkill])
  }

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeSkill = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  const skillsByCategory = {
    technical: data.filter(skill => skill.category === 'technical'),
    soft: data.filter(skill => skill.category === 'soft'),
    language: data.filter(skill => skill.category === 'language')
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('form.skills')}</h2>
        <Button onClick={addSkill} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('form.add')}
        </Button>
      </div>

      <div className="space-y-6">
        {(['technical', 'soft', 'language'] as const).map(category => (
          <div key={category}>
            <h3 className="text-lg font-medium mb-3 capitalize text-foreground">
              {category === 'technical' ? t('skills.technical') :
                category === 'soft' ? t('skills.soft') : t('skills.languages')}
            </h3>

            {skillsByCategory[category].length === 0 ? (
              <div className="border border-border border-dashed rounded-lg p-6 text-center text-muted-foreground bg-background/30">
                {t('skills.none')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsByCategory[category].map((skill, index) => {
                  const globalIndex = data.indexOf(skill)
                  return (
                    <div key={skill.id} className="border border-border rounded-lg p-4 bg-background/50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(globalIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            placeholder={t('skills.placeholder.skill')}
                          />

                          <select
                            value={skill.category}
                            onChange={(e) => updateSkill(globalIndex, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                          >
                            <option value="technical">{t('skills.technical')}</option>
                            <option value="soft">{t('skills.soft')}</option>
                            <option value="language">{t('skills.languages')}</option>
                          </select>

                          <select
                            value={skill.level}
                            onChange={(e) => updateSkill(globalIndex, 'level', e.target.value)}
                            className="w-full px-3 py-2 border border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                          >
                            <option value="beginner">{t('skill.level.beginner')}</option>
                            <option value="intermediate">{t('skill.level.intermediate')}</option>
                            <option value="advanced">{t('skill.level.advanced')}</option>
                            <option value="expert">{t('skill.level.expert')}</option>
                          </select>
                        </div>

                        <Button
                          onClick={() => removeSkill(globalIndex)}
                          variant="outline"
                          size="sm"
                          className="ml-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>{t('form.back')}</Button>
        <Button onClick={onNext}>{t('form.next')}</Button>
      </div>
    </div>
  )
}