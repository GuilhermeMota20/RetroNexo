import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { toast } from "sonner";
import { LocalRomWelcome } from "../components/roms/LocalRomWelcome";
import { RomCard } from "../components/roms/RomCard";
import { RomDetailsDialog } from "../components/roms/RomDetailsDialog";
import { DefaultLayout } from "../Layouts/DefaultLayout";
import { getEmulatorGroups, normalizeEmulator } from "../lib/emulators";
import { loginGoogle } from "../lib/social";
import type { Rom } from "../types";

type RomsPageProps = {
  favoriteRomIds: string[];
  roms: Rom[];
  status: string;
  user: User | null;
  onLoadLocalRom: (file: File) => void;
  onPlay: (rom: Rom) => void;
  onToggleFavorite: (rom: Rom) => Promise<boolean>;
};

/** Página de composição da biblioteca tradicional. */
export function RomsPage({ favoriteRomIds, roms, status, user, onLoadLocalRom, onPlay, onToggleFavorite }: RomsPageProps) {
  const [term, setTerm] = useState("");
  const [selectedEmulator, setSelectedEmulator] = useState("all");
  const [detailsRom, setDetailsRom] = useState<Rom | null>(null);
  const emulatorGroups = useMemo(() => getEmulatorGroups(roms), [roms]);
  const emulatorTabs = useMemo(() => [{ id: "all", label: "Todos" }, ...emulatorGroups], [emulatorGroups]);
  const activeEmulator = emulatorGroups.some((group) => group.id === selectedEmulator) ? selectedEmulator : "all";
  const visibleRoms = useMemo(() => {
    const normalizedTerm = term.toLowerCase();
    return roms.filter((rom) => {
      const matchesEmulator = activeEmulator === "all" || normalizeEmulator(rom.emulator) === activeEmulator;
      const matchesTerm = [rom.title, rom.genre, rom.emulator].join(" ").toLowerCase().includes(normalizedTerm);
      return matchesEmulator && matchesTerm;
    });
  }, [activeEmulator, roms, term]);

  const signIn = async () => {
    try {
      await loginGoogle();
    } catch (error) {
      toast.error("Não foi possível entrar", { description: error instanceof Error ? error.message : "Tente novamente." });
    }
  };

  if (!user) {
    return <DefaultLayout><LocalRomWelcome onLoadLocalRom={onLoadLocalRom} onSignIn={() => void signIn()} /></DefaultLayout>;
  }

  return (
    <DefaultLayout>
      <section>
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-retronexo-blue">BIBLIOTECA</p>
            <h1 className="mt-1 text-4xl text-retronexo-white sm:text-5xl">ROMs</h1>
            <p className="mt-2 text-retronexo-grey-100">Escolha um jogo para abrir no player.</p>
          </div>
          <input aria-label="Buscar ROM" className="retronexo-input max-w-none text-base shadow-[-6px_6px_0_#100F18] sm:max-w-sm" onChange={(event) => setTerm(event.target.value)} placeholder="Buscar ROM..." value={term} />
        </div>

        <div aria-label="Filtrar ROMs por emulador" className="mb-5 flex gap-2 overflow-x-auto pb-3 pl-2" onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
          event.preventDefault();
          const index = emulatorTabs.findIndex((group) => group.id === activeEmulator);
          const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + emulatorTabs.length) % emulatorTabs.length;
          setSelectedEmulator(emulatorTabs[nextIndex].id);
          window.requestAnimationFrame(() => document.getElementById(`rom-emulator-tab-${nextIndex}`)?.focus());
        }} role="tablist">
          {emulatorTabs.map((group, index) => {
            const selected = activeEmulator === group.id;
            return (
              <button
                aria-controls="rom-library-panel"
                aria-selected={selected}
                className={`shrink-0 rounded-md border px-3 py-2 text-sm font-medium shadow-[-6px_6px_0_#100F18] transition-[transform,box-shadow,color,border-color] duration-150 active:translate-x-[-4px] active:translate-y-[4px] active:shadow-[-2px_2px_0_#100F18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-retronexo-blue ${selected ? "border-retronexo-blue bg-retronexo-blue text-retronexo-blue-dark" : "border-retronexo-border bg-retronexo-grey-200 text-retronexo-grey-100 hover:border-retronexo-blue hover:text-retronexo-white"}`}
                id={`rom-emulator-tab-${index}`}
                key={group.id}
                onClick={() => setSelectedEmulator(group.id)}
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                {group.label}
              </button>
            );
          })}
        </div>

        <p className="mb-5 text-sm text-retronexo-grey-100">{status}</p>
        <div aria-labelledby={`rom-emulator-tab-${emulatorTabs.findIndex((group) => group.id === activeEmulator)}`} id="rom-library-panel" role="tabpanel" tabIndex={0}>
        {roms.length === 0 ? (
          <div className="retronexo-card text-retronexo-grey-100">A biblioteca será exibida quando o Prismic estiver configurado.</div>
        ) : visibleRoms.length === 0 ? (
          <div className="retronexo-card text-retronexo-grey-100">Nenhuma ROM encontrada para esta busca.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {visibleRoms.map((rom) => <RomCard favorite={favoriteRomIds.includes(rom.id)} key={rom.id} onOpenDetails={setDetailsRom} onPlay={onPlay} onToggleFavorite={onToggleFavorite} rom={rom} />)}
          </div>
        )}
        </div>
      </section>
      {detailsRom && <RomDetailsDialog favorite={favoriteRomIds.includes(detailsRom.id)} rom={detailsRom} user={user} onClose={() => setDetailsRom(null)} onPlay={onPlay} onToggleFavorite={onToggleFavorite} />}
    </DefaultLayout>
  );
}
