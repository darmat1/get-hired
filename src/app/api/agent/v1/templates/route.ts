import { NextRequest, NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";

// Mirrors the `template.*` display names in src/lib/translations-data.ts and
// the "ATS ready" badges in src/components/resume/resume-preview.tsx's
// TEMPLATES array. Keep in sync if templates are added/renamed there.
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

export async function GET(request: NextRequest) {
  const ctx = await authenticateAgentRequest(request);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json(TEMPLATES);
}
