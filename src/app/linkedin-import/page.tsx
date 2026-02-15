import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LinkedIn PDF to Resume Converter | AI Importer",
  description:
    "Upload your LinkedIn profile PDF and convert it into a professional, ATS-friendly resume in seconds.",
};

export default function LinkedInImportPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
          LinkedIn PDF to Resume Converter
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Turn your LinkedIn profile export into a polished, tailored resume
          instantly. Zero manual entry.
        </p>
        {/* Placeholder for future content */}
        <div className="bg-gray-50 dark:bg-gray-800 p-10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-gray-500">Import tool demo coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
