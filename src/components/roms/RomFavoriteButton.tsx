import { toast } from "sonner";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";
import type { Rom } from "../../types";

type RomFavoriteButtonProps = {
  compact?: boolean;
  favorite: boolean;
  rom: Rom;
  onToggle: (rom: Rom) => Promise<boolean>;
};

/** Ação de favorito com feedback consistente em todas as visualizações de ROM. */
export function RomFavoriteButton({ compact = false, favorite, rom, onToggle }: RomFavoriteButtonProps) {
  const toggleFavorite = async () => {
    try {
      const added = await onToggle(rom);
      toast.success(added ? "ROM adicionada aos favoritos" : "ROM removida dos favoritos", { description: rom.title });
    } catch (error) {
      toast.error("Não foi possível atualizar os favoritos", { description: error instanceof Error ? error.message : "Tente novamente em alguns instantes." });
    }
  };

  const sizeClass = compact ? "h-7 w-7 shrink-0 sm:h-11 sm:w-11" : "!h-9 !w-9 md:!h-11 md:!w-11";
  const favoriteClass = favorite ? "!border-retronexo-pink !bg-retronexo-pink/15 !text-retronexo-pink [&_svg]:fill-current" : "";

  return (
    <Tooltip content={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
      <Button
        aria-label={favorite ? `Remover ${rom.title} dos favoritos` : `Adicionar ${rom.title} aos favoritos`}
        className={`rom-favorite-button ${sizeClass} ${favoriteClass}`}
        onClick={() => void toggleFavorite()}
        variant="icon"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.4 4.6 13A5.1 5.1 0 0 1 12 6.1 5.1 5.1 0 0 1 19.4 13L12 20.4Z" /></svg>
      </Button>
    </Tooltip>
  );
}
