"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/translations";
import { ChevronDown } from "lucide-react";

export function FAQSEO() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    { question: t("landing.seo.q1"), answer: t("landing.seo.a1") },
    { question: t("landing.seo.q2"), answer: t("landing.seo.a2") },
    { question: t("landing.seo.q3"), answer: t("landing.seo.a3") },
    { question: t("landing.seo.q4"), answer: t("landing.seo.a4") },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-900/50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {t("landing.seo.faq.title")}
          </h2>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white dark:bg-slate-800 rounded-2xl border ${
                    isOpen
                      ? "border-slate-500 shadow-md"
                      : "border-slate-200 dark:border-slate-700 shadow-sm"
                  } transition-all duration-300 overflow-hidden`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <h3
                      className={`text-lg font-bold pr-8 ${isOpen ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}
                    >
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-6 h-6 flex-shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? "transform rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${
                      isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
