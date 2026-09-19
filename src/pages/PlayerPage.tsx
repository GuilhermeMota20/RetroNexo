import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faBolt, faDatabase, faDownload, faExpand, faFileImport, faFloppyDisk, faFolderOpen, faPause, faPlay, faRotateLeft, faStop, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Button } from "../components/Button";
import { Dialog } from "../components/Dialog";
import { EmulatorPlayer, type PlayerControls } from "../components/EmulatorPlayer";
import { PlayerLibraryActions } from "../components/player/PlayerLibraryActions";
import { DefaultLayout } from "../Layouts/DefaultLayout";
import { Tooltip } from "../components/Tooltip";
import { deleteSavedState, listSavedStates, type SavedState } from "../lib/localStates";
import type { Rom } from "../types";

type PlayerPageProps = {
  rom: Rom | null;
  favoriteRoms: Rom[];
  isLoggedIn: boolean;
  onBrowseRoms: () => void;
  onQuickPlay: (rom: Rom) => void;
  onLoadLocalRom: (file: File) => void;
  onStop: () => void;
  immersive?: boolean;
};

type PlayerActionProps = {
  label: string;
  onClick: () => void;
  icon: IconProp;
  variant?: "primary" | "secondary" | "icon";
};

function PlayerAction({ label, onClick, icon, variant = "icon" }: PlayerActionProps) {
  return (
    <Tooltip content={label}>
      <Button aria-label={label} className="!h-8 !w-8 !shrink-0 sm:!h-11 sm:!w-11" onClick={onClick} variant={variant}>
        <FontAwesomeIcon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" icon={icon} />
      </Button>
    </Tooltip>
  );
}

type StateManagerDialogProps = {
  loading: boolean;
  states: SavedState[];
  onClose: () => void;
  onLoad: (state: SavedState) => void;
  onDelete: (state: SavedState) => void;
};

function StateManagerDialog({ loading, states, onClose, onLoad, onDelete }: StateManagerDialogProps) {
  return (
    <Dialog
      description="Escolha um state para carregar ou remova os que não deseja manter. O mais recente é aberto automaticamente."
      onClose={onClose}
      title="States salvos"
    >
      {loading ? (
        <p className="text-sm text-retronexo-grey-100">Carregando states...</p>
      ) : states.length === 0 ? (
        <p className="text-sm text-retronexo-grey-100">Nenhum state salvo para esta ROM.</p>
      ) : (
        <ul className="grid max-h-80 gap-2 overflow-y-auto pr-1">
          {states.map((state, index) => (
            <li className="flex items-center gap-2 rounded-md border border-retronexo-border bg-retronexo-grey-400 p-2" key={state.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-retronexo-white">{state.label}{index === 0 ? " · Mais recente" : ""}</p>
                <p className="text-xs text-retronexo-grey-100">{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(state.updatedAt))}</p>
              </div>
              <Tooltip content="Carregar este state">
                <Button aria-label="Carregar este state" className="!h-8 !w-8" onClick={() => onLoad(state)} variant="icon">
                  <FontAwesomeIcon aria-hidden="true" className="h-4 w-4" icon={faArrowRight} />
                </Button>
              </Tooltip>
              <Tooltip content="Apagar este state">
                <Button aria-label="Apagar este state" className="!h-8 !w-8" onClick={() => onDelete(state)} variant="icon">
                  <FontAwesomeIcon aria-hidden="true" className="h-4 w-4" icon={faTrash} />
                </Button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}

export function PlayerPage({ rom, favoriteRoms, isLoggedIn, onBrowseRoms, onQuickPlay, onLoadLocalRom, onStop, immersive = false }: PlayerPageProps) {
  const controlsRef = useRef<PlayerControls | null>(null);
  const stateFileInputRef = useRef<HTMLInputElement>(null);
  const [paused, setPaused] = useState(false);
  const [stateManagerOpen, setStateManagerOpen] = useState(false);
  const [statesLoading, setStatesLoading] = useState(false);
  const [savedStates, setSavedStates] = useState<SavedState[]>([]);

  const setControls = useCallback((controls: PlayerControls | null) => {
    controlsRef.current = controls;
    setPaused(false);
  }, []);

  const stopPlayer = () => {
    // The Big Picture player hands control back to its full-screen library.
    // Leaving full screen here causes a visible jump to the desktop layout.
    if (!immersive && document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
    onStop();
    toast.info("Player interrompido.");
  };

  const runControl = async (action: (controls: PlayerControls) => void | Promise<void>, success?: string) => {
    const controls = controlsRef.current;
    if (!controls) return toast.info("Aguarde o emulador iniciar.");
    try {
      await action(controls);
      if (success) toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível executar esta ação.");
    }
  };

  const togglePause = async () => {
    const shouldResume = paused;
    await runControl((controls) => {
      if (shouldResume) controls.resume();
      else controls.pause();
      setPaused(!shouldResume);
    });
  };

  const openStateManager = async () => {
    if (!rom) return;
    setStateManagerOpen(true);
    setStatesLoading(true);
    try {
      setSavedStates(await listSavedStates({ emulator: rom.emulator, saveKey: rom.saveKey }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar os states.");
    } finally {
      setStatesLoading(false);
    }
  };

  const loadSavedState = (state: SavedState) => {
    void runControl((controls) => controls.loadState(state.blob), "State carregado.");
    setStateManagerOpen(false);
  };

  const deleteState = async (state: SavedState) => {
    try {
      await deleteSavedState({ id: state.id });
      setSavedStates((states) => states.filter((savedState) => savedState.id !== state.id));
      toast.success("State removido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível apagar o state.");
    }
  };

  const clearEmulatorCache = () => {
    if (!window.confirm("Limpar os arquivos de ROM em cache? Eles precisarão ser baixados novamente.")) return;
    void runControl((controls) => controls.clearEmulatorCache());
  };

  const loadStateFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    void runControl((controls) => controls.loadState(file), "State local carregado.");
  };

  return (
    <DefaultLayout fillMobileViewport={Boolean(rom)} hideFooterOnMobile={Boolean(rom)} immersive={immersive}>
      <section className={immersive && rom ? "flex h-full min-h-0 flex-1 flex-col" : rom ? "flex min-h-0 flex-1 flex-col md:block" : undefined}>
        <div className={rom ? (immersive ? "hidden" : "hidden md:block") : undefined}>
          <div className="mb-8">
          <p className="text-sm text-retronexo-blue">EMULADOR</p>
          <h1 className="mt-1 text-4xl text-retronexo-white sm:text-5xl">Player</h1>
          <p className="mt-2 text-retronexo-grey-100">O state mais recente é restaurado automaticamente neste dispositivo.</p>
          </div>

          <PlayerLibraryActions
            favoriteRoms={favoriteRoms}
            isLoggedIn={isLoggedIn}
            onBrowseRoms={onBrowseRoms}
            onLoadLocalRom={onLoadLocalRom}
            onQuickPlay={onQuickPlay}
          />
        </div>

        {rom && (
          <section className="retronexo-card mb-3 shrink-0 p-2" aria-label="Controles do player">
            <div aria-label="Ações do player" className="flex gap-2 overflow-x-auto px-3 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:px-0 md:py-0 md:overflow-visible" role="toolbar">
              <input accept=".state,.sav,application/octet-stream" className="sr-only" onChange={loadStateFile} ref={stateFileInputRef} type="file" />
              <PlayerAction icon={paused ? faPlay : faPause} label={paused ? "Retomar jogo" : "Pausar jogo"} onClick={() => void togglePause()} />
              <PlayerAction icon={faFloppyDisk} label="Salvar state" onClick={() => void runControl((controls) => controls.saveState("State manual"))} />
              <PlayerAction icon={faFolderOpen} label="Gerenciar states" onClick={() => void openStateManager()} />
              <PlayerAction icon={faBolt} label="Quick save" onClick={() => void runControl((controls) => controls.saveState("Quick save"))} variant="primary" />
              <PlayerAction icon={faRotateLeft} label="Quick load" onClick={() => void runControl((controls) => controls.loadLatestState(), "Quick load concluído.")} />
              <PlayerAction icon={faDownload} label="Baixar state no dispositivo" onClick={() => void runControl((controls) => controls.downloadState())} />
              <PlayerAction icon={faFileImport} label="Carregar arquivo de state" onClick={() => stateFileInputRef.current?.click()} />
              <PlayerAction icon={faExpand} label="Alternar tela cheia" onClick={() => void runControl((controls) => controls.toggleFullscreen())} />
              <PlayerAction icon={faDatabase} label="Limpar cache do emulador" onClick={clearEmulatorCache} />
              <PlayerAction icon={faStop} label="Interromper emulação" onClick={stopPlayer} variant="secondary" />
            </div>
          </section>
        )}

        <EmulatorPlayer fillMobileViewport={Boolean(rom)} immersive={immersive} key={rom?.id || "empty-player"} onControlsReady={setControls} rom={rom} />
      </section>

      {stateManagerOpen && <StateManagerDialog loading={statesLoading} states={savedStates} onClose={() => setStateManagerOpen(false)} onLoad={loadSavedState} onDelete={(state) => void deleteState(state)} />}
    </DefaultLayout>
  );
}
