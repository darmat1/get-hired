import { create } from "zustand";
import type { Resume } from "@/types/resume";

const DEFAULT_RESUME: Partial<Resume> = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  workExperience: [],
  education: [],
  skills: [],
  template: "modern",
};

interface ResumeStore {
  currentId: string | null;
  resume: Partial<Resume>;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  setResume: (resume: Partial<Resume>) => void;
  updateField: <K extends keyof Resume>(field: K, value: Resume[K]) => void;
  loadFromDb: (id: string) => Promise<boolean>;
  saveToDb: () => Promise<boolean>;
  reset: () => void;
  needsLoad: (id: string) => boolean;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  currentId: null,
  resume: DEFAULT_RESUME,
  isLoading: false,
  isSaving: false,
  lastSaved: null,

  needsLoad: (id: string) => {
    const { currentId } = get();
    return currentId !== id;
  },

  setResume: (resume) =>
    set((s) => ({
      resume: { ...s.resume, ...resume },
      currentId: resume.id ?? s.currentId,
    })),

  updateField: (field, value) =>
    set((s) => ({
      resume: { ...s.resume, [field]: value },
    })),

  loadFromDb: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (res.ok) {
        const data = await res.json();
        set({
          currentId: id,
          resume: data,
        });
        return true;
      }
    } catch (e) {
      console.error("Failed to load resume:", e);
    } finally {
      set({ isLoading: false });
    }
    return false;
  },

  saveToDb: async () => {
    const { currentId, resume } = get();
    if (!currentId) return false;
    set({ isSaving: true });
    try {
      const res = await fetch(`/api/resumes/${currentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume),
      });
      if (res.ok) {
        const data = await res.json();
        set({
          lastSaved: new Date(),
          resume: { ...resume, ...data },
        });
        return true;
      }
    } catch (e) {
      console.error("Failed to save resume:", e);
    } finally {
      set({ isSaving: false });
    }
    return false;
  },

  reset: () =>
    set({
      currentId: null,
      resume: DEFAULT_RESUME,
      lastSaved: null,
    }),
}));
