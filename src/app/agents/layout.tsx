import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const locale = headerList.get("x-locale") || "en";
  const path = "/agents";
  const canonical = locale === "en" ? path : `/${locale}${path}`;

  return {
    title: "AI Agents | GetHired - Connect Claude, ChatGPT & MCP Assistants",
    description:
      "Connect Claude, ChatGPT, or any MCP-compatible AI assistant to GetHired. Update your profile, tailor resumes, and write cover letters right from your AI tool.",
    keywords:
      "mcp, model context protocol, ai agent, claude, chatgpt, resume ai integration",
    alternates: {
      canonical,
      languages: {
        "en-US": "/agents",
        "uk-UA": "/uk/agents",
        "ru-RU": "/ru/agents",
        "x-default": "/agents",
      },
    },
    openGraph: {
      url: canonical,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
