import { create } from "zustand";
import type { Poi } from "@futonav/shared";

interface RecentSearchesState {
  recentPois: Poi[];
  addRecentPoi: (poi: Poi) => void;
  clearRecentPois: () => void;
}

export const useRecentSearchesStore = create<RecentSearchesState>((set, get) => ({
  recentPois: [],

  addRecentPoi: (poi: Poi) => {
    const current = get().recentPois.filter((p) => p.id !== poi.id);
    set({ recentPois: [poi, ...current].slice(0, 10) });
  },

  clearRecentPois: () => set({ recentPois: [] }),
}));
