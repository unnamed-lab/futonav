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
  transportMode: "walking" | "bike" | "car";

  selectPoi: (poi: Poi | null) => void;
  setRoute: (route: RouteData | null) => void;
  setMode: (mode: "browse" | "navigating") => void;
  setTransportMode: (mode: "walking" | "bike" | "car") => void;
  endNavigation: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  selectedPoi: null,
  route: null,
  mode: "browse",
  transportMode: "walking",

  selectPoi: (poi) =>
    set({ selectedPoi: poi, route: null, mode: poi ? "navigating" : "browse" }),

  setRoute: (route) => set({ route }),

  setMode: (mode) => set({ mode }),

  setTransportMode: (transportMode) => set({ transportMode }),

  endNavigation: () =>
    set({ selectedPoi: null, route: null, mode: "browse", transportMode: "walking" }),
}));
