import { create } from "zustand";
import type { Poi } from "@futonav/shared";

interface RouteData {
  polyline: { latitude: number; longitude: number }[];
  distanceMeters: number;
  etaMinutes: number;
}

interface NavState {
  selectedPoi: Poi | null;
  route: RouteData | null;
  mode: "browse" | "navigating";

  selectPoi: (poi: Poi | null) => void;
  setRoute: (route: RouteData | null) => void;
  setMode: (mode: "browse" | "navigating") => void;
  endNavigation: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  selectedPoi: null,
  route: null,
  mode: "browse",

  selectPoi: (poi) =>
    set({ selectedPoi: poi, route: null, mode: poi ? "navigating" : "browse" }),

  setRoute: (route) => set({ route }),

  setMode: (mode) => set({ mode }),

  endNavigation: () =>
    set({ selectedPoi: null, route: null, mode: "browse" }),
}));
