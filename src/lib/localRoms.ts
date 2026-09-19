const supportedExtensions = [
  ".gba",
  ".gb",
  ".gbc",
  ".nes",
  ".sfc",
  ".smc",
  ".n64",
  ".z64",
  ".v64",
  ".nds",
  ".bin",
  ".iso",
  ".cue",
  ".chd",
  ".zip",
];

const emulatorByExtension: Record<string, string> = {
  ".gba": "gba",
  ".gb": "gb",
  ".gbc": "gbc",
  ".nes": "nes",
  ".sfc": "snes",
  ".smc": "snes",
  ".n64": "n64",
  ".z64": "n64",
  ".v64": "n64",
  ".nds": "nds",
  ".cue": "psx",
  ".iso": "psx",
  ".chd": "psx",
  ".bin": "segaMD",
};

export const localRomAccept = supportedExtensions.join(",");

export const isSupportedLocalRom = (fileName: string) => {
  const normalizedName = fileName.toLowerCase();

  return supportedExtensions.some((extension) => normalizedName.endsWith(extension));
};

export const emulatorFromFileName = (fileName: string) => {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  return emulatorByExtension[extension] || "gba";
};
