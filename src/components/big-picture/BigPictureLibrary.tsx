import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { CSSProperties, RefObject } from "react";
import type { Rom } from "../../types";
import { BigPictureLocalRomCard } from "../BigPictureLocalRomCard";
import { BigPictureRomCard } from "../BigPictureRomCard";
import { BigPictureClock } from "./BigPictureClock";
import { BigPictureLibraryCommands } from "./BigPictureLibraryCommands";

type BigPictureLibraryProps = {
  activeIndex: number;
  favoriteRomIds: string[];
  focused: boolean;
  games: Rom[];
  inputRef: RefObject<HTMLInputElement | null>;
  railRef: RefObject<HTMLDivElement | null>;
  searchFocused: boolean;
  term: string;
  onLoadLocalRom: (file: File) => void;
  onOpenSearch: () => void;
  onPlay: (rom: Rom) => void;
  onSelect: (index: number) => void;
};

/** Cabeçalho, busca e trilha horizontal de ROMs. */
export function BigPictureLibrary({ activeIndex, favoriteRomIds, focused, games, inputRef, railRef, searchFocused, term, onLoadLocalRom, onOpenSearch, onPlay, onSelect }: BigPictureLibraryProps) {
  const totalItems = games.length + 1;
  const centered = totalItems <= 7;
  const railStyle = centered ? { "--big-picture-card-count": totalItems } as CSSProperties : undefined;

  return (
    <section className={`big-picture-library ${focused ? "is-focused" : ""}`} aria-label="Sua biblioteca de jogos">
      <div className="big-picture-library-heading">
        <p className="big-picture-eyebrow">BIBLIOTECA</p>
        <span>{games.length} {games.length === 1 ? "jogo" : "jogos"}</span>
      </div>
      <div className="big-picture-search-area">
        <BigPictureClock />
        <button aria-haspopup="dialog" className={`big-picture-search-field ${searchFocused ? "is-focused" : ""}`} onClick={onOpenSearch} type="button">
          <span>{term || "Buscar ROMs por nome, gênero ou console"}</span>
          <FontAwesomeIcon aria-hidden="true" icon={faMagnifyingGlass} />
        </button>
      </div>

      <div className={`big-picture-rail hide-scrollbar ${centered ? "is-centered" : ""}`} ref={railRef} role="listbox" style={railStyle}>
        <BigPictureLocalRomCard inputRef={inputRef} onLoad={onLoadLocalRom} onSelect={() => onSelect(0)} selected={activeIndex === 0} />
        {games.map((rom, index) => (
          <BigPictureRomCard
            favorite={favoriteRomIds.includes(rom.id)}
            key={rom.id}
            onPlay={() => onPlay(rom)}
            onSelect={() => onSelect(index + 1)}
            rom={rom}
            selected={index + 1 === activeIndex}
          />
        ))}
      </div>
      <BigPictureLibraryCommands favorite={Boolean(activeIndex > 0 && favoriteRomIds.includes(games[activeIndex - 1]?.id ?? ""))} visible={focused && activeIndex > 0} />
    </section>
  );
}
