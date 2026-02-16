"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/translations";

import { usePathname } from "next/navigation";

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  // Hide footer on dashboard and resume builder pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/resume")) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
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
                <Link
                  href="/ai"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.ai_analysis")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Solutions */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.solutions")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/cover-letter"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.cover_letter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/linkedin-import"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.linkedin_import")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="font-semibold mb-4">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.privacy_policy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.terms_of_service")}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookie-policy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t("footer.cookie_policy")}
                </Link>
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
