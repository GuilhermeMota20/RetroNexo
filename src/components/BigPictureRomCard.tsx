import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Rom } from "../types";

type BigPictureRomCardProps = { rom: Rom; selected: boolean; favorite: boolean; onSelect: () => void; onPlay: () => void };

export function BigPictureRomCard({ rom, selected, favorite, onSelect, onPlay }: BigPictureRomCardProps) {
  return (
    <button aria-selected={selected} className={`big-picture-game ${selected ? "is-selected" : ""}`} onClick={onSelect} onDoubleClick={onPlay} role="option" type="button">
      <span className="big-picture-cover" style={rom.coverUrl ? { backgroundImage: `url(${rom.coverUrl})` } : undefined}>
        {!rom.coverUrl && <span>{rom.title.slice(0, 2)}</span>}
        {favorite && <FontAwesomeIcon aria-label="Favorito" icon={faHeart} />}
      </span>
      <span className="big-picture-card-copy"><strong>{rom.title}</strong><small>{rom.genre || "Gênero não informado"}</small><small>{rom.emulator}</small></span>
    </button>
  );
}
