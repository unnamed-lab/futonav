import { create } from "zustand";

interface SettingsState {
  mapStyle: "standard" | "satellite";
  units: "metric";
  onboardingSeen: boolean;

  setMapStyle: (style: "standard" | "satellite") => void;
  setOnboardingSeen: (seen: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  mapStyle: "standard",
  units: "metric",
  onboardingSeen: false,

  setMapStyle: (mapStyle) => set({ mapStyle }),
  setOnboardingSeen: (onboardingSeen) => set({ onboardingSeen }),
}));
