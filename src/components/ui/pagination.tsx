"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  className?: string;
}

export function Pagination({ totalPages, currentPage, className }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Logic for ellipsis
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center space-x-2 py-8", className)}
      aria-label="Pagination"
    >
      <Link
        href={createPageURL(Math.max(1, currentPage - 1))}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700",
          currentPage === 1 && "pointer-events-none opacity-50"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      <div className="flex items-center space-x-1">
        {getPageNumbers().map((p, index) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-warm-400 dark:text-warm-500"
              >
                <MoreHorizontal className="h-4 w-4" />
              </span>
            );
          }

          const isCurrent = currentPage === p;

          return (
            <Link
              key={p}
              href={createPageURL(p)}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded-lg font-medium transition",
                isCurrent
                  ? "bg-terracotta-500 text-white dark:bg-terracotta-500 dark:text-white shadow-sm"
                  : "text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800"
              )}
            >
              {p}
            </Link>
          );
        })}
      </div>

      <Link
        href={createPageURL(Math.min(totalPages, currentPage + 1))}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg transition-colors bg-warm-100 dark:bg-warm-800 text-warm-500 dark:text-warm-400 hover:bg-warm-200 dark:hover:bg-warm-700",
          currentPage === totalPages && "pointer-events-none opacity-50"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </Link>
    </nav>
  );
}
