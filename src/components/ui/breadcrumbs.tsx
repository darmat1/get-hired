"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/translations";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // If no items are provided, generate them from the pathname
  const generatedItems =
    items ||
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, array) => {
        const href = "/" + array.slice(0, index + 1).join("/");

        // Try to translate the segment or capitalize it
        let label = segment;
        try {
          // Simple heuristic for labels
          if (segment === "blog") label = t("nav.blog");
          else if (segment === "dashboard") label = t("nav.dashboard");
          else {
            // Capitalize and remove hyphens
            label =
              segment.charAt(0).toUpperCase() +
              segment.slice(1).replace(/-/g, " ");
          }
        } catch (e) {
          label =
            segment.charAt(0).toUpperCase() +
            segment.slice(1).replace(/-/g, " ");
        }

        return { label, href };
      });

  return (
    <nav
      className="flex mb-6 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar"
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            {t("nav.home")}
          </Link>
        </li>
        {generatedItems.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
              <Link
                href={item.href}
                className={`ml-1 text-sm font-medium transition-colors ${
                  index === generatedItems.length - 1
                    ? "text-slate-900 dark:text-slate-100 cursor-default"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
                aria-current={
                  index === generatedItems.length - 1 ? "page" : undefined
                }
              >
                {item.label}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
