import { getBaseUrl } from "@/lib/i18n-config";

export async function GET() {
  const SITE_URL = getBaseUrl().replace(/\/$/, "");

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
- Resume Builder: ${SITE_URL}/dashboard
- AI Analysis Tool: ${SITE_URL}/ai
- Pricing: ${SITE_URL}/pricing
- LinkedIn Import Tool: ${SITE_URL}/linkedin-import

## Target Audience
Professional job seekers, software engineers, managers, and anyone looking to bypass ATS filters and impress recruiters with tailored applications.
`.trim();

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
