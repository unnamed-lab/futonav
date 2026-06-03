import { create } from "zustand";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface LocationState {
  currentPosition: LatLng | null;
  permissionStatus: "undetermined" | "granted" | "denied";
  accuracy: number | null;

  setCurrentPosition: (pos: LatLng, accuracy: number) => void;
  setPermissionStatus: (status: "undetermined" | "granted" | "denied") => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentPosition: null,
  permissionStatus: "undetermined",
  accuracy: null,

  setCurrentPosition: (pos, accuracy) =>
    set({ currentPosition: pos, accuracy }),

  setPermissionStatus: (status) => set({ permissionStatus: status }),
}));
