import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Cover Letter Generator | Tailored to any Job Description",
  description:
    "Generate professional cover letters in seconds. Our AI analyzes your resume and the job description to write a perfect match.",
};

export default function CoverLetterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
          AI Cover Letter Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Create a cover letter that actually gets read. Tailored to your resume
          and the job you want.
        </p>
        {/* Placeholder for future content */}
        <div className="bg-gray-50 dark:bg-gray-800 p-10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <p className="text-gray-500">Interactive demo coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
