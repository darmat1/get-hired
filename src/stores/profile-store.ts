import { create } from "zustand";

export interface ProfileData {
  id?: string;
  userId?: string;
  personalInfo: Record<string, unknown>;
  workExperience: unknown[];
  education: unknown[];
  skills: unknown[];
  certificates: unknown[];
  createdAt?: string;
  updatedAt?: string;
}

const EMPTY_PROFILE: ProfileData = {
  personalInfo: {},
  workExperience: [],
  education: [],
  skills: [],
  certificates: [],
};

interface ProfileStore {
  profile: ProfileData;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasLoaded: boolean;

  setProfile: (profile: Partial<ProfileData>) => void;
  updateField: (field: keyof ProfileData, value: unknown) => void;
  loadFromDb: () => Promise<void>;
  saveToDb: (isAutosave?: boolean) => Promise<boolean>;
  reset: () => void;
  needsLoad: () => boolean;
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: EMPTY_PROFILE,
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  hasLoaded: false,

  needsLoad: () => !get().hasLoaded,

  setProfile: (profile) =>
    set((s) => ({
      profile: {
        ...s.profile,
        ...profile,
        personalInfo: profile.personalInfo ?? s.profile.personalInfo ?? {},
        workExperience:
          profile.workExperience ?? s.profile.workExperience ?? [],
        education: profile.education ?? s.profile.education ?? [],
        skills: profile.skills ?? s.profile.skills ?? [],
        certificates: profile.certificates ?? s.profile.certificates ?? [],
      },
    })),

  updateField: (field, value) =>
    set((s) => ({
      profile: { ...s.profile, [field]: value },
    })),

  loadFromDb: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/profile/experience");
      if (res.ok) {
        const data = await res.json();
        set({
          hasLoaded: true,
          profile: {
            personalInfo: data.personalInfo ?? {},
            workExperience: data.workExperience ?? [],
            education: data.education ?? [],
            skills: data.skills ?? [],
            certificates: data.certificates ?? [],
            id: data.id,
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
        });
      } else {
        set({ hasLoaded: true });
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
      set({ hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },

  saveToDb: async (isAutosave = false) => {
    const { profile } = get();
    if (!isAutosave) set({ isSaving: true });
    try {
      const res = await fetch("/api/profile/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          lastSaved: new Date(),
          profile: {
            ...profile,
            id: data.id,
            userId: data.userId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
        });
        return true;
      }
    } catch (e) {
      console.error("Failed to save profile:", e);
    } finally {
      if (!isAutosave) set({ isSaving: false });
    }
    return false;
  },

  reset: () =>
    set({ profile: EMPTY_PROFILE, lastSaved: null, hasLoaded: false }),
}));
