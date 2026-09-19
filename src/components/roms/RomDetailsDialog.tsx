import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import type { User } from "firebase/auth";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";
import { RomArtwork } from "./RomArtwork";
import { RomFavoriteButton } from "./RomFavoriteButton";
import type { Rom } from "../../types";

type RomDetailsDialogProps = {
  favorite: boolean;
  rom: Rom;
  user: User | null;
  onClose: () => void;
  onPlay: (rom: Rom) => void;
  onToggleFavorite: (rom: Rom) => Promise<boolean>;
};

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-retronexo-grey-400 p-3"><p className="text-xs text-retronexo-grey-100">{label}</p><strong className="mt-1 block text-retronexo-white">{value}</strong></div>;
}

/** Detalhes de uma ROM, incluindo informações e ações contextuais. */
export function RomDetailsDialog({ favorite, rom, user, onClose, onPlay, onToggleFavorite }: RomDetailsDialogProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-4" role="presentation" onMouseDown={onClose}>
      <section aria-labelledby="rom-details-title" aria-modal="true" className="relative max-h-[92vh] w-full max-w-6xl overflow-x-hidden overflow-y-auto rounded-lg bg-retronexo-grey-300 p-6 sm:p-8 lg:p-10" role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <Tooltip className="absolute right-7 top-7 z-20 md:right-4 md:top-3" content="Fechar detalhes" position="bottom">
          <Button aria-label="Fechar detalhes" className="!h-9 !w-9" onClick={onClose} variant="icon"><FontAwesomeIcon aria-hidden="true" className="h-4 w-4" icon={faXmark} /></Button>
        </Tooltip>
        <div className="grid gap-8 lg:grid-cols-[minmax(21rem,24rem)_minmax(0,1fr)]">
          <RomArtwork rom={rom} variant="dialog" />
          <div>
            <p className="text-sm text-retronexo-blue">DETALHES DA ROM</p>
            <h2 className="mt-1 text-3xl text-retronexo-white" id="rom-details-title">{rom.title}</h2>
            <p className="mt-4 text-retronexo-grey-100">{rom.summary || "Sem descrição disponível."}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <DetailItem label="Emulador" value={rom.emulator} />
              <DetailItem label="Gênero" value={rom.genre || "Não informado"} />
              <DetailItem label="Região" value={rom.region || "Não informada"} />
              <DetailItem label="Ano" value={rom.year ? String(rom.year) : "Não informado"} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button onClick={() => { onClose(); onPlay(rom); }}>Jogar agora</Button>
          {user ? <RomFavoriteButton favorite={favorite} rom={rom} onToggle={onToggleFavorite} /> : <span className="text-sm text-retronexo-grey-100">Entre para favoritar esta ROM.</span>}
        </div>
      </section>
    </div>
  );
}
