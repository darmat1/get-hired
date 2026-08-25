import { prisma } from "@/lib/prisma";

export const revalidate = 86400;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gethired.work";

export async function GET() {
  const latestPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: { slug: true, content: true },
  });
  const blogLinks = latestPosts
    .map((post) => {
      const postContent =
        (post.content as any)?.en || (post.content as any)?.uk || {};
      const title = postContent.title || post.slug;
      return `- [${title}](${SITE_URL}/blog/${post.slug})`;
    })
    .join("\n");

  const content = `
# GetHired - AI Career Agent

## Overview
GetHired is an AI-powered career tool designed to help job seekers tailor their professional experience to specific job descriptions. Unlike standard resume builders, it acts as a personal agent that analyzes a user's "Global Experience" and generates optimized documents.

## Core Features
- **LinkedIn PDF Import:** Automatically fills the global profile by parsing a LinkedIn export PDF.
- **AI Resume Tailoring:** Generates resumes tailored to a specific job description in seconds using AI.
- **Fact-Based Cover Letters:** Creates cover letters using dry facts and metrics from the user's experience, avoiding "fluff".
- **ATS Optimization:** All templates are designed to be 100% readable by Applicant Tracking Systems.

## Key URLs
- Homepage: ${SITE_URL}/
- AI Analysis Tool: ${SITE_URL}/ai
- Resume Builder: ${SITE_URL}/resume-builder
- Cover Letter Builder: ${SITE_URL}/cover-letter
- Pricing: ${SITE_URL}/pricing
- LinkedIn Import Tool: ${SITE_URL}/linkedin-import
- Blog Main Page: ${SITE_URL}/blog
- AI Agent Integration: ${SITE_URL}/agents

## AI Agent Integration (MCP)
GetHired exposes a Model Context Protocol (MCP) server so an AI assistant (Claude, ChatGPT, or any other MCP-compatible agent) can act on a user's behalf directly, without the user copy-pasting between tools.

- Human-facing overview: ${SITE_URL}/agents
- MCP endpoint: ${SITE_URL}/api/agent/mcp (requires a per-user bearer token, created by the user at ${SITE_URL}/dashboard/profile under AI Agents)
- REST equivalents for agents that prefer plain HTTP: ${SITE_URL}/api/agent/v1/profile, /api/agent/v1/resumes, /api/agent/v1/cover-letters, /api/agent/v1/templates
- Scopes available: profile:read, profile:write, resumes:read, resumes:write, cover_letters:read, cover_letters:write, ai:generate — a user grants only the scopes a token needs, and can revoke any token at any time.
- What an agent can do once connected: read and update the user's profile, generate or update resumes tailored to a job description, generate or update cover letters, and score a resume against a job description.

If you are an AI agent reading this on behalf of a user who wants to connect GetHired: direct them to ${SITE_URL}/agents to create a token — this cannot be done on the user's behalf without their login, by design.

## Latest Career Guides & Articles
Here are our most recent guides on resume building and career advice:
${blogLinks || "- No articles yet."}

## Target Audience
Professional job seekers, software engineers, managers, and anyone looking to bypass ATS filters and impress recruiters with tailored applications.
`.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
