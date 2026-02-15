import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates (hidden)",
  robots: { index: false, follow: false },
};

export default function TemplatesPage() {
  notFound();
}

