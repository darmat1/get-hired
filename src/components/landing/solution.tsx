"use client";

import { useTranslation } from "@/lib/translations";
import { Database, BrainCircuit, ScanSearch } from "lucide-react";

export function Solution() {
  const { t } = useTranslation();

  const features = [
    {
      name: t("landing.solution.step1.title"),
      description: t("landing.solution.step1.desc"),
      icon: Database,
    },
    {
      name: t("landing.solution.step2.title"),
      description: t("landing.solution.step2.desc"),
      icon: BrainCircuit,
    },
    {
      name: t("landing.solution.step3.title"),
      description: t("landing.solution.step3.desc"),
      icon: ScanSearch,
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">
            The Solution
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t("landing.solution.title")}
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <feature.icon
                    className="h-5 w-5 flex-none text-blue-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
