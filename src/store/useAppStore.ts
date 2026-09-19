import { create } from "zustand";
import type { Profile, Rom, RomRequest } from "../types";

export type Theme = "dark" | "light";

const savedTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem("retronexo-theme") === "light" ? "light" : "dark";
};

const savedBigPicture = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("retronexo-big-picture") === "true";
};

type AppState = {
  roms: Rom[];
  selectedRom: Rom | null;
  profile: Profile | null;
  romRequests: RomRequest[];
  favoriteRomIds: string[];
  profileOpen: boolean;
  theme: Theme;
  bigPicture: boolean;
  setRoms: (roms: Rom[]) => void;
  setSelectedRom: (rom: Rom | null) => void;
  setProfile: (profile: Profile | null) => void;
  setPlayerData: (profile: Profile, favoriteRomIds: string[]) => void;
  setRomRequests: (requests: RomRequest[]) => void;
  setFavoriteRomIds: (romIds: string[]) => void;
  setProfileOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setBigPicture: (enabled: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  roms: [],
  selectedRom: null,
  profile: null,
  romRequests: [],
  favoriteRomIds: [],
  profileOpen: false,
  theme: savedTheme(),
  bigPicture: savedBigPicture(),

  setRoms: (roms) => set({ roms }),
  setSelectedRom: (selectedRom) => set({ selectedRom }),
  setProfile: (profile) => set({ profile }),
  setPlayerData: (profile, favoriteRomIds) => set({ profile, favoriteRomIds }),
  setRomRequests: (romRequests) => set({ romRequests }),
  setFavoriteRomIds: (favoriteRomIds) => set({ favoriteRomIds }),
  setProfileOpen: (profileOpen) => set({ profileOpen }),
  setTheme: (theme) => set({ theme }),
  setBigPicture: (bigPicture) => set({ bigPicture }),
}));
