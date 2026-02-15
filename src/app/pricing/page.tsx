import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing | Affordable AI Resume Career Agent",
  description:
    "Start building your professional resume for free. Compare our plans and choose the one that fits your career goals.",
};

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Everything you need to get started.",
      features: [
        "LinkedIn PDF Upload",
        "AI Resume Tailoring",
        "Basic Templates",
        "1 Resume Per Month",
      ],
      cta: "Get Started",
      current: true,
    },
    {
      name: "Pro",
      price: "$19",
      description: "For serious job seekers.",
      features: [
        "Unlimited Resumes",
        "Advanced AI Cover Letters",
        "Premium Templates",
        "Priority Support",
        "Detailed Analytics",
      ],
      cta: "Coming Soon",
      current: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="py-24 px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-16">
          Join thousands of job seekers using AI to land their dream job.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 dark:ring-gray-700 ${
                plan.current
                  ? "bg-white dark:bg-gray-800 shadow-xl"
                  : "bg-gray-50/50 dark:bg-gray-800/50"
              }`}
            >
              <h3 className="text-lg font-semibold leading-8 text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">
                  /month
                </span>
              </p>
              <ul
                role="list"
                className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-400 text-left"
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className="h-6 w-5 flex-none text-blue-600"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                disabled={!plan.current}
                className={`mt-10 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.current
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600"
                    : "bg-gray-200 text-gray-400 dark:bg-gray-700 cursor-not-allowed"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
