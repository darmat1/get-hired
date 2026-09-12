export interface ProfileCompletion {
  hasWorkExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
}

function isNonEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

export function isProfileComplete(
  profile: { workExperience?: unknown; education?: unknown; skills?: unknown } | null,
): ProfileCompletion {
  return {
    hasWorkExperience: isNonEmptyArray(profile?.workExperience),
    hasEducation: isNonEmptyArray(profile?.education),
    hasSkills: isNonEmptyArray(profile?.skills),
  };
}
