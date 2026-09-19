import { faArrowRightFromBracket, faClockRotateLeft, faGamepad, faHeart, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BigPictureBrand } from "../components/big-picture/BigPictureBrand";
import { BigPictureControllerHints } from "../components/big-picture/BigPictureControllerHints";
import { BigPictureLibrary } from "../components/big-picture/BigPictureLibrary";
import { BigPictureToolbar } from "../components/big-picture/BigPictureToolbar";
import type { BigPictureFocusArea, BigPictureToolbarItem } from "../components/big-picture/types";
import { useBigPictureNavigation } from "../components/big-picture/useBigPictureNavigation";
import { BigPictureKeyboard } from "../components/BigPictureKeyboard";
import type { Rom } from "../types";

type BigPictureLayoutProps = {
  roms: Rom[];
  favoriteRomIds: string[];
  onLoadLocalRom: (file: File) => void;
  onExit: () => void;
  onPlay: (rom: Rom) => void;
  onToggleFavorite: (rom: Rom) => Promise<boolean>;
};

const toolbarFilters: BigPictureToolbarItem[] = [
  { id: "all", label: "Biblioteca", icon: faGamepad },
  { id: "favorites", label: "Favoritos", icon: faHeart },
  { id: "console", label: "Por console", icon: faLayerGroup },
  { id: "recent", label: "Recentes", icon: faClockRotateLeft },
  { id: "exit", label: "Sair do Big Picture", icon: faArrowRightFromBracket },
];

/** Biblioteca de tela cheia, composta por blocos independentes e navegável por XInput. */
export function BigPictureLayout({ roms, favoriteRomIds, onLoadLocalRom, onExit, onPlay, onToggleFavorite }: BigPictureLayoutProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const localRomInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [focusArea, setFocusArea] = useState<BigPictureFocusArea>("library");
  const [toolbarIndex, setToolbarIndex] = useState(0);
  const [term, setTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const games = useMemo(() => {
    const normalizedTerm = term.trim().toLowerCase();
    return roms.filter((rom) => {
      const matchesFilter = activeFilter !== "favorites" || favoriteRomIds.includes(rom.id);
      const matchesSearch = !normalizedTerm || [rom.title, rom.genre, rom.emulator].join(" ").toLowerCase().includes(normalizedTerm);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, favoriteRomIds, roms, term]);

  const totalLibraryItems = games.length + 1;
  const activeGame = activeIndex > 0 ? games[activeIndex - 1] : undefined;

  const moveGame = useCallback((direction: -1 | 1) => {
    setActiveIndex((index) => {
      const nextIndex = Math.max(0, Math.min(index + direction, totalLibraryItems - 1));
      const card = railRef.current?.children[nextIndex] as HTMLElement | undefined;
      card?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      return nextIndex;
    });
  }, [totalLibraryItems]);

  const runToolbarAction = useCallback((index: number) => {
    const item = toolbarFilters[index];
    if (!item) return;
    if (item.id === "exit") return onExit();
    setActiveFilter(item.id);
    setActiveIndex(0);
    setFocusArea("library");
  }, [onExit]);

  const confirmSelection = useCallback(() => {
    if (focusArea === "toolbar") return runToolbarAction(toolbarIndex);
    if (focusArea === "search") return setSearchOpen(true);
    if (activeGame) return onPlay(activeGame);
    localRomInputRef.current?.click();
  }, [activeGame, focusArea, onPlay, runToolbarAction, toolbarIndex]);

  const openSearch = useCallback(() => {
    setFocusArea("search");
    setSearchOpen(true);
  }, []);

  const toggleActiveFavorite = useCallback(() => {
    if (focusArea !== "library" || !activeGame) return;
    void onToggleFavorite(activeGame)
      .then((added) => toast.success(added ? "ROM adicionada aos favoritos" : "ROM removida dos favoritos", { description: activeGame.title }))
      .catch((error) => toast.error("Não foi possível atualizar os favoritos", { description: error instanceof Error ? error.message : "Tente novamente." }));
  }, [activeGame, focusArea, onToggleFavorite]);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(totalLibraryItems - 1, 0)));
  }, [totalLibraryItems]);

  useBigPictureNavigation({
    focusArea,
    searchOpen,
    toolbarItemCount: toolbarFilters.length,
    toolbarIndex,
    onConfirm: confirmSelection,
    onExit,
    onMoveGame: moveGame,
    onOpenSearch: openSearch,
    onSecondaryAction: toggleActiveFavorite,
    setFocusArea,
    setToolbarIndex,
  });

  return (
    <div className="big-picture-shell" aria-label="Modo Big Picture">
      <main className="big-picture-main">
        <BigPictureLibrary
          activeIndex={activeIndex}
          favoriteRomIds={favoriteRomIds}
          focused={focusArea === "library"}
          games={games}
          inputRef={localRomInputRef}
          onLoadLocalRom={onLoadLocalRom}
          onOpenSearch={openSearch}
          onPlay={onPlay}
          onSelect={(index) => {
            setFocusArea("library");
            setActiveIndex(index);
          }}
          railRef={railRef}
          searchFocused={focusArea === "search"}
          term={term}
        />
      </main>

      <div className="big-picture-toolbar-row">
        <BigPictureBrand />
        <BigPictureToolbar
          activeFilter={activeFilter}
          focused={focusArea === "toolbar"}
          items={toolbarFilters}
          onAction={runToolbarAction}
          onSelect={setToolbarIndex}
          selectedIndex={toolbarIndex}
        />
        <BigPictureControllerHints onOpenSearch={openSearch} />
      </div>

      {searchOpen && <BigPictureKeyboard onChange={setTerm} onClose={() => setSearchOpen(false)} value={term} />}
    </div>
  );
}
