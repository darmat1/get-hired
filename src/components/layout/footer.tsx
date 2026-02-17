"use client";

import React from "react";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { isAppRoute } from "@/lib/i18n-config";

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (isAppRoute(pathname || "")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">{t("footer.about")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.about_text")}
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.product")}</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedLink
                  href="/ai"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.ai_analysis")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.pricing")}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.solutions")}</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedLink
                  href="/cover-letter"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.cover_letter")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/linkedin-import"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.linkedin_import")}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              <li>
                <LocalizedLink
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.privacy_policy")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer." + "terms_of_service")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/cookie-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.cookie_policy")}
                </LocalizedLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {currentYear} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
