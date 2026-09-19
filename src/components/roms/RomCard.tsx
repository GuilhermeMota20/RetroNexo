import { Button } from "../Button";
import { RomArtwork } from "./RomArtwork";
import { RomFavoriteButton } from "./RomFavoriteButton";
import type { Rom } from "../../types";

type RomCardProps = {
  favorite: boolean;
  rom: Rom;
  onOpenDetails: (rom: Rom) => void;
  onPlay: (rom: Rom) => void;
  onToggleFavorite: (rom: Rom) => Promise<boolean>;
};

/** Card principal da biblioteca tradicional. */
export function RomCard({ favorite, rom, onOpenDetails, onPlay, onToggleFavorite }: RomCardProps) {
  return (
    <article className="retronexo-card rom-card flex min-w-0 flex-col p-2.5 sm:min-h-56 sm:p-4">
      <RomArtwork rom={rom} variant="card" />
      <span className="text-xs text-retronexo-blue sm:text-sm">{rom.emulator}</span>
      <h2 className="mt-1 line-clamp-2 text-sm leading-tight sm:text-xl sm:leading-none">{rom.title}</h2>
      <p className="mt-2 line-clamp-2 text-[11px] leading-tight text-retronexo-grey-100 sm:mt-3 sm:text-sm">{rom.summary || "Pronto para jogar."}</p>
      <div className="mt-auto flex items-center gap-1.5 pt-3 sm:gap-2 sm:pt-4">
        <Button className="flex-1 whitespace-nowrap px-1.5 py-1 text-[10px] sm:flex-none sm:px-4 sm:py-2 sm:text-base" onClick={() => onOpenDetails(rom)} variant="secondary">Ver detalhes</Button>
        <RomFavoriteButton compact favorite={favorite} rom={rom} onToggle={onToggleFavorite} />
      </div>
      <Button className="mt-2 px-1.5 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-base" onClick={() => onPlay(rom)}>Jogar agora</Button>
    </article>
  );
}
