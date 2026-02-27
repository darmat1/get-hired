import { Header } from "@/components/layout/header";
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <Header />
      <div className="flex w-full mx-auto min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Left Sidebar for Navigation */}
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 p-6 flex-shrink-0">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Menu
          </h2>
          <nav className="space-y-2">
            <Link
              href="/admin/blog"
              className="block px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
            >
              Blog
            </Link>
            {/* Future links like User Management can go here */}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
