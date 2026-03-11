"use client";

import React from "react";

import { LocalizedLink } from "@/components/ui/localized-link";
import { useTranslation } from "@/lib/translations";
import { usePathname } from "next/navigation";
import { isAppRoute } from "@/lib/i18n-config";
import { LinkedinIcon } from "@/components/ui/icons/linkedin";
import { Instagram, Facebook, Youtube } from "lucide-react";

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
              href="https://www.youtube.com/@gethired-work"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href="https://www.threads.com/@gethired.work"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Threads"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Threads"
                viewBox="0 0 192 192"
                className="h-5 w-5 fill-current"
              >
                <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/gethiredwork"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="h-5 w-5 fill-current" />
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
