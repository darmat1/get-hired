import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers, cookies } from "next/headers";
import "./globals.scss";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider, type Language } from "@/lib/translations";
import { Footer } from "@/components/layout/footer";
import { AIKeyWarning } from "@/components/layout/ai-key-warning";
import { getBaseUrl } from "@/lib/i18n-config";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = getBaseUrl();
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
// 1. Улучшенные метаданные
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GetHired - AI Career Agent & Resume Tailor",
    template: "%s | GetHired",
  },
  description:
    "Personal AI Career Agent that adapts your experience to any job description in 30 seconds. LinkedIn import and fact-based cover letters.",
  keywords: [
    "AI Resume Builder",
    "LinkedIn to Resume",
    "ATS Resume Optimization",
    "AI Cover Letter Generator",
  ],
  authors: [{ name: "GetHired Team" }],
  alternates: {
    canonical: "./",
    languages: {
      "en-US": "/",
      "uk-UA": "/uk",
      "ru-RU": "/ru",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "GetHired",
    title: "GetHired - Stop guessing what recruiters want",
    description:
      "Tailor your resume to any job description using AI in seconds.",
    images: [{ url: "/og-image.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{const t=localStorage.getItem('get-hired-theme'),s=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t!=='light'&&s))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})();`;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GetHired",
    description:
      "AI-powered career agent for resume tailoring and cover letter generation.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "LinkedIn PDF Import",
      "AI Resume Tailoring",
      "Fact-based Cover Letter Generation",
      "ATS Optimization",
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer', '${GTM_ID}');
            `,
          }}
        />
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
