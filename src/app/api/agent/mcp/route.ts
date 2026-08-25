import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generatePDF } from "@/lib/pdf-generator";
import {
  authenticateAgentRequest,
  hasScope,
  type AgentAuthContext,
  type AgentScope,
} from "@/lib/agent-auth";
import { generateResumeForUser } from "@/lib/agent/resume-generation";
import { generateCoverLetterForUser } from "@/lib/agent/cover-letter-generation";

// Mirrors src/app/api/agent/v1/templates/route.ts — keep in sync.
const TEMPLATES = [
  { id: "professional", name: "Classic", atsReady: true },
  { id: "modern", name: "Modern", atsReady: false },
  { id: "corporate", name: "Corporate", atsReady: false },
  { id: "divider", name: "Divider", atsReady: true },
  { id: "timeline", name: "Timeline", atsReady: false },
  { id: "modular", name: "Modular", atsReady: true },
  { id: "contrast", name: "Contrast", atsReady: false },
  { id: "banner", name: "Banner", atsReady: false },
  { id: "centered", name: "Centered", atsReady: false },
  { id: "tinted", name: "Tinted", atsReady: false },
  { id: "boxed", name: "Boxed", atsReady: false },
  { id: "symmetry", name: "Symmetry", atsReady: true },
  { id: "cards", name: "Cards", atsReady: true },
  { id: "layered", name: "Layered", atsReady: false },
  { id: "portrait", name: "Portrait", atsReady: true },
  { id: "bold", name: "Bold", atsReady: false },
  { id: "framed", name: "Framed", atsReady: true },
  { id: "minimal", name: "Minimalist", atsReady: false },
  { id: "creative", name: "Creative", atsReady: false },
];

type ToolResult = {
  content: Array<
    | { type: "text"; text: string }
    | { type: "resource"; resource: { uri: string; mimeType: string; blob: string } }
  >;
  isError?: boolean;
};

function textResult(value: unknown): ToolResult {
  return {
    content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
  };
}

function errorResult(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

function scopeError(scope: AgentScope): ToolResult {
  return errorResult(`Missing required scope: ${scope}`);
}

/**
 * Builds a fresh MCP server scoped to one authenticated request. Cheap to
 * construct per-request in stateless mode — avoids any risk of one token's
 * tool handlers leaking into another token's request via shared state.
 */
function buildServer(ctx: AgentAuthContext): McpServer {
  const server = new McpServer({ name: "get-hired-agent", version: "1.0.0" });

  const require = (scope: AgentScope): ToolResult | null =>
    hasScope(ctx, scope) ? null : scopeError(scope);

  // ── Profile ──────────────────────────────────────────────────────────
  server.registerTool(
    "get_profile",
    { description: "Get the user's profile: personal info, work experience, education, skills, certificates." },
    async () => {
      const denied = require("profile:read");
      if (denied) return denied;
      const profile = await prisma.userProfile.findUnique({ where: { userId: ctx.userId } });
      if (!profile) {
        return textResult({ personalInfo: {}, workExperience: [], education: [], skills: [], certificates: [] });
      }
      return textResult({
        personalInfo: profile.personalInfo || {},
        workExperience: profile.workExperience || [],
        education: profile.education || [],
        skills: profile.skills || [],
        certificates: profile.certificates || [],
      });
    },
  );

  server.registerTool(
    "update_profile",
    {
      description: "Update the user's profile. Only provided fields are changed; omitted fields are left as-is.",
      inputSchema: {
        personalInfo: z.record(z.string(), z.unknown()).optional(),
        workExperience: z.array(z.record(z.string(), z.unknown())).optional(),
        education: z.array(z.record(z.string(), z.unknown())).optional(),
        skills: z.array(z.record(z.string(), z.unknown())).optional(),
        certificates: z.array(z.record(z.string(), z.unknown())).optional(),
      },
    },
    async (args) => {
      const denied = require("profile:write");
      if (denied) return denied;
      const existing = await prisma.userProfile.findUnique({ where: { userId: ctx.userId } });
      const data = {
        personalInfo: args.personalInfo !== undefined ? args.personalInfo : existing?.personalInfo || {},
        workExperience: args.workExperience !== undefined ? args.workExperience : existing?.workExperience || [],
        education: args.education !== undefined ? args.education : existing?.education || [],
        skills: args.skills !== undefined ? args.skills : existing?.skills || [],
        certificates: args.certificates !== undefined ? args.certificates : existing?.certificates || [],
      };
      const profile = await prisma.userProfile.upsert({
        where: { userId: ctx.userId },
        create: { userId: ctx.userId, ...data },
        update: data,
      });
      return textResult(profile);
    },
  );

  // ── Resumes ──────────────────────────────────────────────────────────
  server.registerTool(
    "list_resumes",
    { description: "List the user's resumes (lean summary — use get_resume for full content)." },
    async () => {
      const denied = require("resumes:read");
      if (denied) return denied;
      const resumes = await prisma.resume.findMany({
        where: { userId: ctx.userId },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          template: true,
          targetPosition: true,
          targetCompany: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return textResult(resumes);
    },
  );

  server.registerTool(
    "get_resume",
    {
      description: "Get one resume by id, full content.",
      inputSchema: { resumeId: z.string() },
    },
    async ({ resumeId }) => {
      const denied = require("resumes:read");
      if (denied) return denied;
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: ctx.userId } });
      if (!resume) return errorResult("Resume not found");
      return textResult(resume);
    },
  );

  server.registerTool(
    "create_resume",
    {
      description:
        "Create a new resume (max 2 per user). Omitted content fields are pre-filled from the user's profile.",
      inputSchema: {
        title: z.string().optional(),
        template: z.string().optional(),
        personalInfo: z.record(z.string(), z.unknown()).optional(),
        workExperience: z.array(z.record(z.string(), z.unknown())).optional(),
        education: z.array(z.record(z.string(), z.unknown())).optional(),
        skills: z.array(z.record(z.string(), z.unknown())).optional(),
        certificates: z.array(z.record(z.string(), z.unknown())).optional(),
        customization: z.record(z.string(), z.unknown()).optional(),
        language: z.string().optional(),
        targetPosition: z.string().optional(),
        targetCompany: z.string().optional(),
      },
    },
    async (args) => {
      const denied = require("resumes:write");
      if (denied) return denied;

      const resumeCount = await prisma.resume.count({ where: { userId: ctx.userId } });
      if (resumeCount >= 2) {
        return errorResult("Resume limit reached (max 2). Delete an existing resume first.");
      }

      let personalInfo = args.personalInfo;
      let workExperience = args.workExperience;
      let education = args.education;
      let skills = args.skills;
      let certificates = args.certificates;

      const needsPrefill = !personalInfo && !workExperience && !education && !skills && !certificates;
      if (needsPrefill) {
        const profile = await prisma.userProfile.findUnique({ where: { userId: ctx.userId } });
        if (profile) {
          personalInfo = (profile.personalInfo as Record<string, unknown>) || {};
          workExperience = (profile.workExperience as Record<string, unknown>[]) || [];
          education = (profile.education as Record<string, unknown>[]) || [];
          skills = (profile.skills as Record<string, unknown>[]) || [];
          certificates = (profile.certificates as Record<string, unknown>[]) || [];
        }
      }
      if (!personalInfo) personalInfo = {};

      const nameForTitle = personalInfo as { firstName?: string; lastName?: string };
      const resume = await prisma.resume.create({
        data: {
          title:
            args.title ||
            (nameForTitle.firstName && nameForTitle.lastName
              ? `Resume ${nameForTitle.firstName} ${nameForTitle.lastName}`
              : "New Resume"),
          template: args.template || "professional",
          language: args.language || "en",
          personalInfo,
          workExperience: workExperience || [],
          education: education || [],
          skills: skills || [],
          certificates: certificates || [],
          customization: args.customization,
          targetPosition: args.targetPosition,
          targetCompany: args.targetCompany,
          userId: ctx.userId,
        },
      });
      return textResult(resume);
    },
  );

  const UPDATABLE_RESUME_FIELDS = [
    "title",
    "template",
    "personalInfo",
    "workExperience",
    "education",
    "skills",
    "certificates",
    "customization",
    "language",
    "targetPosition",
    "targetCompany",
  ] as const;

  server.registerTool(
    "update_resume",
    {
      description:
        "Update a resume. Only provided fields are changed — this is how you change the template, or the design (customization: sidebarColor, showAvatar, and the various show* toggles), or any content.",
      inputSchema: {
        resumeId: z.string(),
        title: z.string().optional(),
        template: z.string().optional(),
        personalInfo: z.record(z.string(), z.unknown()).optional(),
        workExperience: z.array(z.record(z.string(), z.unknown())).optional(),
        education: z.array(z.record(z.string(), z.unknown())).optional(),
        skills: z.array(z.record(z.string(), z.unknown())).optional(),
        certificates: z.array(z.record(z.string(), z.unknown())).optional(),
        customization: z.record(z.string(), z.unknown()).optional(),
        language: z.string().optional(),
        targetPosition: z.string().optional(),
        targetCompany: z.string().optional(),
      },
    },
    async ({ resumeId, ...rest }) => {
      const denied = require("resumes:write");
      if (denied) return denied;
      const existing = await prisma.resume.findFirst({ where: { id: resumeId, userId: ctx.userId } });
      if (!existing) return errorResult("Resume not found");

      const data: Record<string, unknown> = {};
      const restRecord = rest as Record<string, unknown>;
      for (const field of UPDATABLE_RESUME_FIELDS) {
        if (restRecord[field] !== undefined) data[field] = restRecord[field];
      }
      const updated = await prisma.resume.update({ where: { id: resumeId }, data });
      return textResult(updated);
    },
  );

  server.registerTool(
    "delete_resume",
    { description: "Delete a resume.", inputSchema: { resumeId: z.string() } },
    async ({ resumeId }) => {
      const denied = require("resumes:write");
      if (denied) return denied;
      const existing = await prisma.resume.findFirst({ where: { id: resumeId, userId: ctx.userId } });
      if (!existing) return errorResult("Resume not found");
      await prisma.resume.delete({ where: { id: resumeId } });
      return textResult({ success: true });
    },
  );

  server.registerTool(
    "download_resume_pdf",
    { description: "Render a resume to PDF and return it as an embedded file.", inputSchema: { resumeId: z.string() } },
    async ({ resumeId }) => {
      const denied = require("resumes:read");
      if (denied) return denied;
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: ctx.userId } });
      if (!resume) return errorResult("Resume not found");
      const pdfBuffer = await generatePDF(resume as unknown as Parameters<typeof generatePDF>[0]);
      return {
        content: [
          {
            type: "resource",
            resource: {
              uri: `resume://${resumeId}.pdf`,
              mimeType: "application/pdf",
              blob: pdfBuffer.toString("base64"),
            },
          },
        ],
      };
    },
  );

  server.registerTool(
    "generate_resume",
    {
      description:
        "Use AI to pick relevant experience/skills from the user's profile and create a tailored resume for a target role or a job description.",
      inputSchema: {
        targetRole: z.string().optional(),
        jobDescription: z.string().optional(),
        template: z.string().optional(),
      },
    },
    async (args) => {
      const deniedGen = require("ai:generate");
      if (deniedGen) return deniedGen;
      const deniedWrite = require("resumes:write");
      if (deniedWrite) return deniedWrite;

      const result = await generateResumeForUser(ctx.userId, args);
      if (!result.ok) return errorResult(result.error);
      return textResult({ resumeId: result.resumeId, title: result.title, url: `/resume/${result.resumeId}/edit` });
    },
  );

  // ── Cover letters ────────────────────────────────────────────────────
  server.registerTool(
    "list_cover_letters",
    { description: "List the user's cover letters (truncated job description — use get_cover_letter for full text)." },
    async () => {
      const denied = require("cover_letters:read");
      if (denied) return denied;
      const coverLetters = await prisma.coverLetter.findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      });
      return textResult(
        coverLetters.map((cl) => ({
          id: cl.id,
          jobDescription: cl.jobDescription.slice(0, 200),
          format: cl.format,
          language: cl.language,
          resumeId: cl.resumeId,
          createdAt: cl.createdAt,
          updatedAt: cl.updatedAt,
        })),
      );
    },
  );

  server.registerTool(
    "get_cover_letter",
    { description: "Get one cover letter by id, full text.", inputSchema: { coverLetterId: z.string() } },
    async ({ coverLetterId }) => {
      const denied = require("cover_letters:read");
      if (denied) return denied;
      const coverLetter = await prisma.coverLetter.findFirst({
        where: { id: coverLetterId, userId: ctx.userId },
      });
      if (!coverLetter) return errorResult("Cover letter not found");
      return textResult(coverLetter);
    },
  );

  server.registerTool(
    "create_cover_letter",
    {
      description: "Save a cover letter the agent already wrote (no AI call — use generate_cover_letter for that).",
      inputSchema: {
        jobDescription: z.string(),
        coverLetterText: z.string(),
        format: z.string().optional(),
        language: z.string().optional(),
        resumeId: z.string().optional(),
      },
    },
    async (args) => {
      const denied = require("cover_letters:write");
      if (denied) return denied;

      if (args.resumeId) {
        const resume = await prisma.resume.findFirst({ where: { id: args.resumeId, userId: ctx.userId } });
        if (!resume) return errorResult("Resume not found");
      }

      const existingCount = await prisma.coverLetter.count({ where: { userId: ctx.userId } });
      if (existingCount >= 2) {
        const oldest = await prisma.coverLetter.findFirst({
          where: { userId: ctx.userId },
          orderBy: { createdAt: "asc" },
        });
        if (oldest) await prisma.coverLetter.delete({ where: { id: oldest.id } });
      }

      const coverLetter = await prisma.coverLetter.create({
        data: {
          jobDescription: args.jobDescription,
          coverLetterText: args.coverLetterText,
          format: args.format || "bullet",
          language: args.language || "en",
          userId: ctx.userId,
          resumeId: args.resumeId || null,
        },
      });
      return textResult(coverLetter);
    },
  );

  server.registerTool(
    "update_cover_letter",
    {
      description: "Update a cover letter's text/format/language.",
      inputSchema: {
        coverLetterId: z.string(),
        coverLetterText: z.string().optional(),
        format: z.string().optional(),
        language: z.string().optional(),
      },
    },
    async ({ coverLetterId, ...rest }) => {
      const denied = require("cover_letters:write");
      if (denied) return denied;
      const existing = await prisma.coverLetter.findFirst({ where: { id: coverLetterId, userId: ctx.userId } });
      if (!existing) return errorResult("Cover letter not found");
      const updated = await prisma.coverLetter.update({
        where: { id: coverLetterId },
        data: {
          ...(rest.coverLetterText !== undefined ? { coverLetterText: rest.coverLetterText } : {}),
          ...(rest.format !== undefined ? { format: rest.format } : {}),
          ...(rest.language !== undefined ? { language: rest.language } : {}),
        },
      });
      return textResult(updated);
    },
  );

  server.registerTool(
    "delete_cover_letter",
    { description: "Delete a cover letter.", inputSchema: { coverLetterId: z.string() } },
    async ({ coverLetterId }) => {
      const denied = require("cover_letters:write");
      if (denied) return denied;
      const existing = await prisma.coverLetter.findFirst({ where: { id: coverLetterId, userId: ctx.userId } });
      if (!existing) return errorResult("Cover letter not found");
      await prisma.coverLetter.delete({ where: { id: coverLetterId } });
      return textResult({ success: true });
    },
  );

  server.registerTool(
    "generate_cover_letter",
    {
      description: "Use AI to write and save a cover letter tailored to a job description.",
      inputSchema: {
        jobDescription: z.string(),
        format: z.string().optional(),
        language: z.string().optional(),
        resumeId: z.string().optional(),
      },
    },
    async (args) => {
      const deniedGen = require("ai:generate");
      if (deniedGen) return deniedGen;
      const deniedWrite = require("cover_letters:write");
      if (deniedWrite) return deniedWrite;

      const result = await generateCoverLetterForUser(ctx.userId, args);
      if (!result.ok) return errorResult(result.error);
      return textResult({ coverLetterId: result.coverLetterId, coverLetterText: result.coverLetterText });
    },
  );

  // ── Templates ────────────────────────────────────────────────────────
  server.registerTool(
    "list_templates",
    { description: "List all available resume template ids and names, flagging which are ATS-safe (single-column)." },
    async () => textResult(TEMPLATES),
  );

  return server;
}

async function handle(request: Request): Promise<Response> {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const server = buildServer(ctx);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — one server+transport per request
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function GET(request: Request) {
  return handle(request);
}

export async function DELETE(request: Request) {
  return handle(request);
}
