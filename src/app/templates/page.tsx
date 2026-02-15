import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS-Friendly Resume Templates | Free Professional Designs",
  description:
    "Choose from our collection of ATS-optimized resume templates. Professional designs that guarantee you pass the initial screening.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
          ATS-Friendly Resume Templates
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
          Clean, readable, and proven to work. Select a template and start
          building your career today.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for template variants */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="group relative">
              <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 ring-1 ring-gray-900/10 dark:ring-white/10 group-hover:opacity-75 transition-opacity">
                {/* Visual placeholder */}
                <div className="flex items-center justify-center h-full text-gray-400">
                  Template Variant {i}
                </div>
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                Professional Design #{i}
              </h3>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
