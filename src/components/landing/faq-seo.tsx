"use client";

import { useTranslation } from "@/lib/translations";

export function FAQSEO() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t("landing.seo.q1"),
      answer: t("landing.seo.a1"),
    },
    // Add more FAQs here as needed for SEO
  ];

  return (
    <div className="bg-white dark:bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            FAQ
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("landing.seo.faq.title")}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl divide-y divide-gray-900/10 dark:divide-white/10">
          <dl className="mt-10 space-y-6 divide-y divide-gray-900/10 dark:divide-white/10">
            {faqs.map((faq, index) => (
              <div key={index} className="pt-6">
                <dt className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
