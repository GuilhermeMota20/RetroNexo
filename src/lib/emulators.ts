import type { Rom } from "../types";

export type EmulatorGroup = {
  id: string;
  label: string;
};

const labels: Record<string, string> = {
  gb: "Game Boy",
  gbc: "Game Boy Color",
  gba: "GBA",
  genesis: "Mega Drive",
  md: "Mega Drive",
  n64: "Nintendo 64",
  nds: "Nintendo DS",
  nes: "NES",
  ps1: "PlayStation",
  psx: "PlayStation",
  sms: "Master System",
  snes: "SNES",
};

export function normalizeEmulator(emulator: string) {
  return emulator.trim().toLocaleLowerCase();
}

export function getEmulatorGroups(roms: Rom[]): EmulatorGroup[] {
  const ids = new Set(roms.map((rom) => normalizeEmulator(rom.emulator)).filter(Boolean));
  return [...ids]
    .map((id) => ({ id, label: labels[id] ?? id.toLocaleUpperCase() }))
    .sort((first, second) => first.label.localeCompare(second.label, "pt-BR"));
}
