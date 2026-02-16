import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.scss";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider } from "@/lib/translations";
import { Footer } from "@/components/layout/footer";
import { AIKeyWarning } from "@/components/layout/ai-key-warning";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: "CV Maker - Create Professional Resumes",
  description:
    "Create professional resumes with LinkedIn data integration and AI recommendations",
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/`,
      uk: `${SITE_URL}/uk`,
      ru: `${SITE_URL}/ru`,
    },
  },
};

const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('cv-maker-theme');
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (theme === 'dark' || (theme !== 'light' && systemDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const initialLocale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LanguageProvider initialLanguage={initialLocale}>
            {children}
            <AIKeyWarning />
            <Footer />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
