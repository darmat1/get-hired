'use client'

import { Header } from '@/components/layout/header'
import { User, FileText, Sparkles, Download } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/translations'

export function ClientWrapper() {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            {t('home.title')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            {t('home.subtitle')}
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/resume/new"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {t('home.create_resume_btn')}
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
            >
              {t('home.sign_in')} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <User className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                {t('home.feature.linkedin.title')}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  {t('home.feature.linkedin.desc')}
                </p>
              </dd>
            </div>
            
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <Sparkles className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                {t('home.feature.ai.title')}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  {t('home.feature.ai.desc')}
                </p>
              </dd>
            </div>
            
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                <Download className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                {t('home.feature.templates.title')}
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                <p className="flex-auto">
                  {t('home.feature.templates.desc')}
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  )
}