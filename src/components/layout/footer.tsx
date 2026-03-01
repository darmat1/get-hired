"use client";

import React from "react";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { isAppRoute } from "@/lib/i18n-config";
import { Linkedin, Instagram, Facebook } from "lucide-react";

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
              <li>
                <LocalizedLink
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.blog")}
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
                  href="/resume-builder"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.resume_builder")}
                </LocalizedLink>
              </li>
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
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left text-sm text-muted-foreground">
            &copy; {currentYear} {t("footer.copyright")}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/gethiredwork"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/gethired.work/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/gethired.work"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/GetHiredWorkAi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-0.5"
              aria-label="X (Twitter)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 300 271"
                className="h-4 w-4 fill-current"
              >
                <path d="m236 0h46l-101 115 118 156h-92.6l-72.5-94.8-83 94.8h-46l107-123-113-148h94.9l65.5 86.6zm-16.1 244h25.5l-165-218h-27.4z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
