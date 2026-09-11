import { describe, it, expect } from "vitest";
import { isProfileComplete } from "@/lib/admin/profile-completion";

describe("isProfileComplete", () => {
  it("is false when profile is null", () => {
    expect(isProfileComplete(null)).toEqual({
      hasWorkExperience: false,
      hasEducation: false,
      hasSkills: false,
    });
  });

  it("is false for empty arrays", () => {
    expect(
      isProfileComplete({ workExperience: [], education: [], skills: [] }),
    ).toEqual({ hasWorkExperience: false, hasEducation: false, hasSkills: false });
  });

  it("is true when arrays are non-empty", () => {
    expect(
      isProfileComplete({
        workExperience: [{ title: "Engineer" }],
        education: [{ institution: "MIT" }],
        skills: [{ name: "TypeScript" }],
      }),
    ).toEqual({ hasWorkExperience: true, hasEducation: true, hasSkills: true });
  });

  it("treats non-array JSON as empty", () => {
    expect(
      isProfileComplete({ workExperience: "not-an-array", education: null, skills: undefined }),
    ).toEqual({ hasWorkExperience: false, hasEducation: false, hasSkills: false });
  });
});
