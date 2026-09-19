export type Rom = {
  id: string;
  uid?: string;
  title: string;
  summary: string;
  romUrl: string | File;
  coverUrl?: string;
  emulator: string;
  genre?: string;
  region?: string;
  year?: number;
  saveKey: string;
  biosUrl?: string;
  gamePatchUrl?: string;
  gameParentUrl?: string;
  externalFiles?: Record<string, string>;
  cheats?: [string, string][];
  cheatPath?: string;
  shaders?: Record<string, string>;
  controlScheme?: string;
  defaultControls?: Record<string, unknown>;
  virtualGamepadSettings?: Record<string, unknown>;
  videoRotation?: 0 | 1 | 2 | 3;
  forceLegacyCores?: boolean;
  disableCue?: boolean;
};

export type Profile = {
  uid: string;
  displayName: string;
  email: string;
  avatar: string;
};

export type RomRequest = {
  id: string;
  authorUid: string;
  authorName: string;
  title: string;
  emulator: string;
  note: string;
  status: "pending" | "approved" | "rejected";
  voteCount: number;
  priority: boolean;
  createdAt?: Date;
};
