import { create } from "zustand";

export interface ResumeListItem {
  id: string;
  title: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

interface ResumeListStore {
  resumes: ResumeListItem[];
  isLoading: boolean;
  hasLoaded: boolean;

  setResumes: (items: ResumeListItem[]) => void;
  removeResume: (id: string) => void;
  upsertResume: (item: ResumeListItem) => void;
  needsLoad: () => boolean;
  loadFromDb: () => Promise<void>;
}

export const useResumeListStore = create<ResumeListStore>((set, get) => ({
  resumes: [],
  isLoading: false,
  hasLoaded: false,

  needsLoad: () => !get().hasLoaded,

  setResumes: (items) =>
    set({
      resumes: items,
      hasLoaded: true,
    }),

  removeResume: (id) =>
    set((state) => ({
      resumes: state.resumes.filter((r) => r.id !== id),
    })),

  upsertResume: (item) =>
    set((state) => {
      const exists = state.resumes.find((r) => r.id === item.id);
      if (exists) {
        return {
          resumes: state.resumes.map((r) => (r.id === item.id ? item : r)),
        };
      }
      return {
        resumes: [item, ...state.resumes],
      };
    }),

  loadFromDb: async () => {
    if (!get().needsLoad()) return;

    set({ isLoading: true });
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        set({
          resumes: data,
          hasLoaded: true,
        });
      } else {
        set({ hasLoaded: true });
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      set({ hasLoaded: true });
    } finally {
      set({ isLoading: false });
    }
  },
}));

