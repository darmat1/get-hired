import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers, cookies } from "next/headers"; // Импортируем headers и cookies
import "./globals.scss";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider, type Language } from "@/lib/translations";
import { Footer } from "@/components/layout/footer";
import { AIKeyWarning } from "@/components/layout/ai-key-warning";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "GetHired - AI Resume Builder",
  // ... твои метаданные
};

const themeScript = `(function(){try{const t=localStorage.getItem('cv-maker-theme'),s=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t!=='light'&&s))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Получаем данные на сервере (в Next 15/16 это асинхронно)
  const headerList = await headers();
  const cookieStore = await cookies();

  // 2. Определяем локаль (приоритет: заголовок от прокси -> кука -> дефолт)
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
          {/* 3. Передаем initialLanguage для совпадения стейта клиента и сервера */}
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
