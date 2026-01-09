'use client'

import React, { useState, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { t } = useTranslation()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const saved = localStorage.getItem('cv-maker-theme') as 'light' | 'dark' | 'system'
    if (saved) {
      setTheme(saved)
      applyTheme(saved)
    } else {
      setTheme('system')
      applyTheme('system')
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleThemeChange)
    return () => mediaQuery.removeEventListener('change', handleThemeChange)
  }, [theme])

  const applyTheme = (newTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    const body = document.body

    root.classList.remove('light', 'dark')
    body.classList.remove('light', 'dark')

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      body.classList.add(systemTheme)
    } else {
      root.classList.add(newTheme)
      body.classList.add(newTheme)
    }

    void root.offsetWidth
  }

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]

    setTheme(nextTheme)
    localStorage.setItem('cv-maker-theme', nextTheme)
    applyTheme(nextTheme)
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return t('theme.light')
      case 'dark':
        return t('theme.dark')
      default:
        return t('theme.system')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors ${className}`}
      title={t('theme.toggle')}
    >
      {getIcon()}
      <span className="text-sm">{getLabel()}</span>
    </button>
  )
}

