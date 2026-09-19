import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { getLatestStateBlob, getLatestStateUrl, saveState, stateBlob } from "../lib/localStates";
import type { Rom } from "../types";

export type PlayerControls = {
  pause: () => void;
  resume: () => void;
  toggleFullscreen: () => Promise<void>;
  saveState: (label?: string) => void;
  downloadState: () => void;
  loadState: (state: Blob) => Promise<void>;
  loadLatestState: () => Promise<void>;
  clearEmulatorCache: () => void;
};

type EmulatorPlayerProps = {
  fillMobileViewport?: boolean;
  immersive?: boolean;
  rom: Rom | null;
  onControlsReady?: (controls: PlayerControls | null) => void;
};

const emulatorSource = "https://cdn.emulatorjs.org/stable/data/loader.js";

const stableGameId = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  return Math.max(1, Math.abs(hash));
};

const serializeConfig = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

function emulatorDocument(input: { gameUrl: string; stateUrl: string; sessionId: string; parentOrigin: string; rom: Rom }) {
  const notify = (type: string, payload?: string) =>
    `window.parent.postMessage({ source: "retronexo-emulator", sessionId: ${serializeConfig(input.sessionId)}, type: ${serializeConfig(type)}${payload ? `, payload: ${payload}` : ""} }, ${serializeConfig(input.parentOrigin)});`;

  const optionalConfiguration = [
    input.rom.biosUrl && `window.EJS_biosUrl=${serializeConfig(input.rom.biosUrl)};`,
    input.rom.gamePatchUrl && `window.EJS_gamePatchUrl=${serializeConfig(input.rom.gamePatchUrl)};`,
    input.rom.gameParentUrl && `window.EJS_gameParentUrl=${serializeConfig(input.rom.gameParentUrl)};`,
    Object.keys(input.rom.externalFiles || {}).length && `window.EJS_externalFiles=${serializeConfig(input.rom.externalFiles)};`,
    input.rom.cheats?.length && `window.EJS_cheats=${serializeConfig(input.rom.cheats)};`,
    input.rom.cheatPath && `window.EJS_cheatPath=${serializeConfig(input.rom.cheatPath)};`,
    Object.keys(input.rom.shaders || {}).length && `window.EJS_shaders=${serializeConfig(input.rom.shaders)};`,
    input.rom.controlScheme && `window.EJS_controlScheme=${serializeConfig(input.rom.controlScheme)};`,
    Object.keys(input.rom.defaultControls || {}).length && `window.EJS_defaultControls=${serializeConfig(input.rom.defaultControls)};`,
    Object.keys(input.rom.virtualGamepadSettings || {}).length && `window.EJS_VirtualGamepadSettings=${serializeConfig(input.rom.virtualGamepadSettings)};`,
    input.rom.videoRotation !== undefined && `window.EJS_videoRotation=${serializeConfig(input.rom.videoRotation)};`,
    input.rom.forceLegacyCores && "window.EJS_forceLegacyCores=true;",
    input.rom.disableCue && "window.EJS_disableCue=true;",
  ].filter(Boolean).join("\n");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body, #emulator-react {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #181922;
      }
      #emulator-react .ejs_parent,
      #emulator-react .ejs_big_screen {
        display: flex !important;
        width: 100% !important;
        height: 100% !important;
        flex-direction: column !important;
      }
      #emulator-react .ejs_canvas_parent {
        min-height: 0 !important;
        flex: 1 1 auto !important;
      }
      #emulator-react canvas {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain;
      }
    </style>
  </head>
  <body>
    <div id="emulator-react"></div>
    <script>
      window.EJS_player = "#emulator-react";
      window.EJS_core = ${serializeConfig(input.rom.emulator)};
      window.EJS_gameUrl = ${serializeConfig(input.gameUrl)};
      window.EJS_gameName = ${serializeConfig(input.rom.saveKey)};
      window.EJS_gameID = ${serializeConfig(stableGameId(input.rom.id))};
      window.EJS_pathtodata = "https://cdn.emulatorjs.org/stable/data/";
      window.EJS_startOnLoaded = true;
      window.EJS_askBeforeExit = false;
      window.EJS_language = "pt-BR";
      window.EJS_disableAutoLang = true;
      window.EJS_color = "#4ED7F5";
      window.EJS_backgroundColor = "#181922";
      window.EJS_loadStateURL = ${serializeConfig(input.stateUrl)};
      ${optionalConfiguration}

      window.EJS_Buttons = {
        playPause: false,
        restart: false,
        mute: false,
        fullscreen: false,
        saveState: false,
        loadState: false,
        screenRecord: false,
        volumeSlider: false,
        saveSavFiles: false,
        loadSavFiles: false,
        quickSave: false,
        quickLoad: false,
        screenshot: false,
        cacheManager: false,
        exitEmulation: false,
        diskButton: false,
        settings: true,
        gamepad: true,
        cheat: window.innerWidth >= 768,
      };

      window.EJS_onGameStart = () => { ${notify("game-start")} };
      window.EJS_onSaveState = (payload) => { ${notify("save-state", "payload")} };
      window.EJS_onSaveUpdate = () => { ${notify("save-update")} };
      window.addEventListener("message", async (event) => {
        if (event.origin !== ${serializeConfig(input.parentOrigin)} || event.source !== window.parent) return;

        const data = event.data || {};
        if (data.source !== "retronexo-player" || data.sessionId !== ${serializeConfig(input.sessionId)}) return;

        const runtime = window.EJS_emulator;

        try {
          if (data.command === "pause") runtime?.pause?.();
          if (data.command === "resume") runtime?.play?.();

          if (data.command === "save-state") {
            const state = await runtime?.gameManager?.getState?.();
            ${notify("save-state", "{ state, label: data.label }")}
          }

          if (data.command === "export-state") {
            const state = await runtime?.gameManager?.getState?.();
            ${notify("export-state", "state")}
          }

          if (data.command === "load-state" && data.payload) {
            runtime?.gameManager?.loadState?.(new Uint8Array(data.payload));
          }

          if (data.command === "clear-cache") {
            const cache = runtime?.storage?.rom;
            if (!cache?.getSizes || !cache?.remove) throw new Error("O cache ainda não está disponível.");

            const cached = await cache.getSizes();
            const keys = Object.keys(cached || {});
            await Promise.all(keys.map((key) => cache.remove(key)));
            ${notify("cache-cleared", "keys.length")}
          }
        } catch (error) {
          ${notify("command-error", "String(error?.message || error)")}
        }
      });
    </script>
    <script src="${emulatorSource}" onerror="${notify("load-error")}"></script>
  </body>
</html>`;
}

export function EmulatorPlayer({ fillMobileViewport = false, immersive = false, rom, onControlsReady }: EmulatorPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !rom) return;

    let active = true;
    let localRomUrl: string | null = null;
    let localStateUrl: string | null = null;
    const sessionId = `${rom.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frame = document.createElement("iframe");
    const command = (name: string, payload?: unknown) => frame.contentWindow?.postMessage({ source: "retronexo-player", sessionId, command: name, payload }, window.location.origin);

    const controls: PlayerControls = {
      pause: () => command("pause"),
      resume: () => command("resume"),
      toggleFullscreen: async () => {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await frame.requestFullscreen();
      },
      saveState: (label = "State manual") => command("save-state", { label }),
      downloadState: () => command("export-state"),
      loadState: async (state) => command("load-state", await state.arrayBuffer()),
      loadLatestState: async () => {
        const blob = await getLatestStateBlob({ emulator: rom.emulator, saveKey: rom.saveKey });
        if (!blob) throw new Error("Nenhum state salvo para esta ROM.");
        command("load-state", await blob.arrayBuffer());
      },
      clearEmulatorCache: () => command("clear-cache"),
    };

    const persistState = async (payload?: unknown) => {
      const stateData = payload && typeof payload === "object" ? payload as { label?: unknown } : undefined;
      const saved = await saveState({
        emulator: rom.emulator,
        saveKey: rom.saveKey,
        payload,
        label: typeof stateData?.label === "string" ? stateData.label : undefined,
      });
      if (!active) return;
      if (saved) toast.success("State salvo neste dispositivo.");
      else toast.error("Não foi possível capturar o state atual.");
    };

    const downloadState = (payload?: unknown) => {
      const blob = stateBlob(payload);
      if (!blob) {
        toast.error("Não foi possível exportar o state atual.");
        return;
      }
      const safeName = rom.saveKey.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "save";
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `${safeName}-${new Date().toISOString().replace(/[:.]/g, "-")}.state`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast.success("State baixado no dispositivo.");
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.contentWindow) return;
      const data = event.data as { source?: string; sessionId?: string; type?: string; payload?: unknown };
      if (data.source !== "retronexo-emulator" || data.sessionId !== sessionId || !active) return;
      if (data.type === "game-start") {
        toast.success(`Jogando ${rom.title}`);
        if (window.matchMedia("(max-width: 767px)").matches) void frame.requestFullscreen().catch(() => toast.info("Toque em Tela cheia para expandir o jogo."));
      }
      if (data.type === "save-state") void persistState(data.payload);
      if (data.type === "export-state") downloadState(data.payload);
      if (data.type === "save-update") toast.success("Save do jogo atualizado pelo emulador.");
      if (data.type === "cache-cleared") toast.success(`Cache do emulador limpo (${Number(data.payload || 0)} item(ns)).`);
      if (data.type === "command-error") toast.error(String(data.payload || "Não foi possível executar este comando."));
      if (data.type === "load-error") toast.error("Não foi possível iniciar o EmulatorJS.");
    };

    const start = async () => {
      localStateUrl = await getLatestStateUrl({ emulator: rom.emulator, saveKey: rom.saveKey }).catch(() => null);
      if (!active) return;
      const gameUrl = rom.romUrl instanceof File ? (localRomUrl = URL.createObjectURL(rom.romUrl)) : rom.romUrl;
      frame.className = "absolute inset-0 h-full w-full border-0";
      frame.title = `Emulador: ${rom.title}`;
      frame.allow = "autoplay; fullscreen; gamepad";
      frame.allowFullscreen = true;
      frame.addEventListener("load", () => {
        window.setTimeout(() => frame.contentWindow?.focus(), 0);
      }, { once: true });
      frame.srcdoc = emulatorDocument({ gameUrl, stateUrl: localStateUrl || "", sessionId, parentOrigin: window.location.origin, rom });
      container.replaceChildren(frame);
      onControlsReady?.(controls);
    };

    window.addEventListener("message", onMessage);
    void start().catch(() => active && toast.error("Não foi possível preparar esta ROM."));
    return () => {
      active = false;
      onControlsReady?.(null);
      window.removeEventListener("message", onMessage);
      frame.remove();
      if (localRomUrl) URL.revokeObjectURL(localRomUrl);
      if (localStateUrl) URL.revokeObjectURL(localStateUrl);
    };
  }, [rom, onControlsReady]);

  const sectionClassName = immersive
    ? "flex min-h-0 flex-1 flex-col"
    : rom
    ? fillMobileViewport ? "flex min-h-0 flex-1 flex-col md:block md:flex-none" : undefined
    : "hidden md:block";
  const cardClassName = immersive
    ? "retronexo-card flex min-h-0 flex-1 flex-col p-2"
    : fillMobileViewport ? "retronexo-card flex min-h-0 flex-1 flex-col p-2 md:block md:flex-none md:p-4" : "retronexo-card p-2 sm:p-4";
  const frameClassName = immersive
    ? "emulator-frame relative flex min-h-0 flex-1 overflow-hidden rounded-md bg-retronexo-grey-400 text-center"
    : fillMobileViewport
    ? "emulator-frame relative flex min-h-0 flex-1 overflow-hidden rounded-md bg-retronexo-grey-400 text-center md:h-[560px] md:flex-none"
    : "emulator-frame relative flex h-[360px] items-center justify-center overflow-hidden rounded-md bg-retronexo-grey-400 text-center md:h-[560px]";

  return <section className={sectionClassName}><div className={cardClassName}><div ref={containerRef} className={frameClassName}>{!rom && <p className="text-retronexo-grey-100">Selecione uma ROM da biblioteca.</p>}</div></div></section>;
}
