import type { ChangeEvent } from "react";
import { toast } from "sonner";
import { isSupportedLocalRom, localRomAccept } from "../../lib/localRoms";
import type { Rom } from "../../types";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";

type PlayerLibraryActionsProps = {
  favoriteRoms: Rom[];
  isLoggedIn: boolean;
  onBrowseRoms: () => void;
  onLoadLocalRom: (file: File) => void;
  onQuickPlay: (rom: Rom) => void;
};

/** Acesso compacto à biblioteca e às ROMs favoritas antes de iniciar o player. */
export function PlayerLibraryActions({ favoriteRoms, isLoggedIn, onBrowseRoms, onLoadLocalRom, onQuickPlay }: PlayerLibraryActionsProps) {
  const loadLocalRom = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSupportedLocalRom(file.name)) {
      toast.error("Arquivo incompatível", { description: "Esse arquivo não parece ser uma ROM compatível." });
      return;
    }
    onLoadLocalRom(file);
    toast.success("ROM local carregada", { description: file.name });
  };

  return (
    <section aria-label="Acesso rápido à biblioteca" className="mb-5 rounded-lg border border-retronexo-border bg-retronexo-grey-300 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {isLoggedIn && <Button onClick={onBrowseRoms}>Ver ROMs</Button>}
          <label className="retronexo-button-secondary cursor-pointer">
            <input accept={localRomAccept} className="sr-only" onChange={loadLocalRom} type="file" />
            Selecionar ROM local
          </label>
        </div>
        {isLoggedIn && favoriteRoms.length > 0 && (
          <div className="flex min-w-0 items-center gap-2 border-t border-retronexo-border pt-3 md:border-t-0 md:pt-0">
            <p className="shrink-0 text-xs text-retronexo-blue">FAVORITOS</p>
            <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {favoriteRoms.map((favorite) => (
                <Tooltip content={`Jogar ${favorite.title}`} key={favorite.id}>
                  <Button aria-label={`Jogar ${favorite.title}`} className="group h-9 w-12 shrink-0 overflow-hidden p-0 sm:h-10 sm:w-14" onClick={() => onQuickPlay(favorite)} variant="icon">
                    {favorite.coverUrl ? <img alt="" className="h-full w-full object-cover transition group-hover:scale-110" src={favorite.coverUrl} /> : <span className="block px-1 text-[9px] text-retronexo-grey-100">{favorite.title}</span>}
                  </Button>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
