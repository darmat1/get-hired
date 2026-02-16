import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers, cookies } from "next/headers";
import "./globals.scss";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider, type Language } from "@/lib/translations";
import { Footer } from "@/components/layout/footer";
import { AIKeyWarning } from "@/components/layout/ai-key-warning";

import { getBaseUrl } from "@/lib/i18n-config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GetHired - Create Professional Resumes",
  description:
    "Create professional resumes with LinkedIn data integration and AI recommendations",
  alternates: {
    canonical: getBaseUrl(),
    languages: {
      en: `${getBaseUrl()}/`,
      uk: `${getBaseUrl()}/uk`,
      ru: `${getBaseUrl()}/ru`,
    },
  },
};

const themeScript = `(function(){try{const t=localStorage.getItem('cv-maker-theme'),s=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t!=='light'&&s))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const cookieStore = await cookies();

  const locale = (headerList.get("x-locale") ||
    cookieStore.get("NEXT_LOCALE")?.value ||
    "en") as Language;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider initialLanguage={locale}>
            {children}
            <AIKeyWarning />
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
