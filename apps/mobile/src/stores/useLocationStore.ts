import { create } from "zustand";

interface LatLng {
  latitude: number;
  longitude: number;
}

interface LocationState {
  currentPosition: LatLng | null;
  permissionStatus: "undetermined" | "granted" | "denied";
  accuracy: number | null;
  heading: number | null;

  setCurrentPosition: (pos: LatLng, accuracy: number) => void;
  setPermissionStatus: (status: "undetermined" | "granted" | "denied") => void;
  setHeading: (heading: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentPosition: null,
  permissionStatus: "undetermined",
  accuracy: null,
  heading: null,

  setCurrentPosition: (pos, accuracy) =>
    set({ currentPosition: pos, accuracy }),

  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setHeading: (heading) => set({ heading }),
}));
