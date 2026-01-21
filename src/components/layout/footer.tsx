'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/translations'

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.about')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.about_text')}
            </p>
          </div>

          {/* Column 2: Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.terms_of_service')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/cookie-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.cookie_policy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer.contact_email')}
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
