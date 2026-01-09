'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSelector } from '@/components/ui/language-selector'
import { useTranslation } from '@/lib/translations'

export function Header() {
  const { data: session, status } = useSession()
  const { t } = useTranslation()

  return (
    <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              {t('nav.logo')}
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>

            {status === 'loading' ? (
              <div className="h-8 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded"></div>
            ) : session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {t('nav.dashboard')}
                </Link>
                <Link
                  href="/ai-settings"
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {t('nav.ai_settings')}
                </Link>
                <Link
                  href="/resume/new"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  {t('nav.create_resume')}
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {session.user?.name || session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {t('nav.sign_out')}
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('linkedin')}
                className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
              >
                {t('nav.sign_in')}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}