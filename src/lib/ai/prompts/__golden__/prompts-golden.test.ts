// PARITY: writes golden files for mcp-gateway/internal/prompts. Re-run after
// changing any prompt: npx vitest run src/lib/ai/prompts/__golden__
import { test } from "vitest";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { encode } from "@toon-format/toon";
import {
  getCoverLetterSystemPrompt,
  buildCoverLetterUserPrompt,
  getTailoredResumeSystemPrompt,
  buildTailoredResumeUserPrompt,
} from "../cover-letter";
import { buildSharedCareerContext } from "../shared-career-context";
import { buildSelectionPrompt } from "@/lib/agent/resume-generation";

const out = join(__dirname, "../../../../../mcp-gateway/internal/prompts/testdata");

const profile = {
  personalInfo: { firstName: "Ann", lastName: "Lee", email: "ann@example.com", location: "Kyiv" },
  workExperience: [
    { company: "Acme", position: "Backend Engineer", startDate: "2021-01", endDate: "", current: true, description: "Go, Postgres, 40% latency cut" },
  ],
  education: [{ institution: "KPI", degree: "BSc", field: "CS", startDate: "2015", endDate: "2019" }],
  skills: [{ name: "Go" }, { name: "PostgreSQL" }],
};
const jd = "Senior Go engineer. Build APIs, own Postgres performance.";

test("write golden prompts", () => {
  mkdirSync(out, { recursive: true });
  const w = (name: string, s: string) => writeFileSync(join(out, name), s);
  w("profile.json", JSON.stringify(profile, null, 2));
  w("profile.toon.txt", encode(profile));
  w("career_context.txt", buildSharedCareerContext());
  w("cover_system_prose.txt", getCoverLetterSystemPrompt("prose"));
  w("cover_system_bullet.txt", getCoverLetterSystemPrompt("bullet"));
  w("cover_user.txt", buildCoverLetterUserPrompt({ jobDescription: jd, profileToon: encode(profile) }));
  w("tailored_system.txt", getTailoredResumeSystemPrompt());
  w("tailored_user.txt", buildTailoredResumeUserPrompt({ jobDescription: jd, profileToon: encode(profile), resumeLanguage: "en" }));
  w("selection_with_jd.txt", buildSelectionPrompt(profile as never, "Backend Engineer", jd));
  w("selection_no_jd.txt", buildSelectionPrompt(profile as never, "Backend Engineer"));
});
