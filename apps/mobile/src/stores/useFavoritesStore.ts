import { create } from "zustand";

interface FavoritesState {
  favoriteIds: string[];
  toggleFavorite: (poiId: string) => void;
  isFavorite: (poiId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: [],

  toggleFavorite: (poiId: string) => {
    const current = get().favoriteIds;
    if (current.includes(poiId)) {
      set({ favoriteIds: current.filter((id) => id !== poiId) });
    } else {
      set({ favoriteIds: [...current, poiId] });
    }
  },

  isFavorite: (poiId: string) => get().favoriteIds.includes(poiId),
}));
