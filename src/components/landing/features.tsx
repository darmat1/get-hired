"use client";

import { useTranslation } from "@/lib/translations";
import { CheckCircle2 } from "lucide-react";

export function Features() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden bg-white dark:bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-blue-600">
                Killer Feature
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {t("landing.features.cover_letter.title")}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                {t("landing.features.cover_letter.desc")}
              </p>
              <ul
                role="list"
                className="mt-10 space-y-8 text-gray-600 dark:text-gray-300"
              >
                <li className="flex gap-x-3">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 flex-none text-blue-600"
                    aria-hidden="true"
                  />
                  <span>
                    Fact-based arguments extracted directly from your resume.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 flex-none text-blue-600"
                    aria-hidden="true"
                  />
                  <span>
                    Tailored specifically to the job description keywords.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 flex-none text-blue-600"
                    aria-hidden="true"
                  />
                  <span>No generic "I am a hard worker" phrases.</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-start justify-end lg:order-last">
            <img
              src="/cover-letter-preview.png" // Placeholder
              alt="AI Generated Cover Letter"
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-900/10 dark:ring-white/10 sm:w-[57rem]"
              width={2432}
              height={1442}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
