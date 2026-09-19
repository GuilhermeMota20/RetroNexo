import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { toast } from "sonner";
import { LocalRomWelcome } from "../components/roms/LocalRomWelcome";
import { RomCard } from "../components/roms/RomCard";
import { RomDetailsDialog } from "../components/roms/RomDetailsDialog";
import { DefaultLayout } from "../Layouts/DefaultLayout";
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
  const [detailsRom, setDetailsRom] = useState<Rom | null>(null);
  const visibleRoms = useMemo(() => {
    const normalizedTerm = term.toLowerCase();
    return roms.filter((rom) => [rom.title, rom.genre, rom.emulator].join(" ").toLowerCase().includes(normalizedTerm));
  }, [roms, term]);

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

        <p className="mb-5 text-sm text-retronexo-grey-100">{status}</p>
        {roms.length === 0 ? (
          <div className="retronexo-card text-retronexo-grey-100">A biblioteca será exibida quando o Prismic estiver configurado.</div>
        ) : visibleRoms.length === 0 ? (
          <div className="retronexo-card text-retronexo-grey-100">Nenhuma ROM encontrada para esta busca.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {visibleRoms.map((rom) => <RomCard favorite={favoriteRomIds.includes(rom.id)} key={rom.id} onOpenDetails={setDetailsRom} onPlay={onPlay} onToggleFavorite={onToggleFavorite} rom={rom} />)}
          </div>
        )}
      </section>
      {detailsRom && <RomDetailsDialog favorite={favoriteRomIds.includes(detailsRom.id)} rom={detailsRom} user={user} onClose={() => setDetailsRom(null)} onPlay={onPlay} onToggleFavorite={onToggleFavorite} />}
    </DefaultLayout>
  );
}
