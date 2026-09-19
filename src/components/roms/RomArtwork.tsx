import type { Rom } from "../../types";

type RomArtworkProps = {
  rom: Rom;
  variant: "card" | "dialog";
};

/** Capa da ROM, compartilhada entre o card da biblioteca e o diálogo. */
export function RomArtwork({ rom, variant }: RomArtworkProps) {
  const wrapperClass = variant === "dialog" ? "rom-artwork rom-artwork-dialog" : "rom-artwork rom-artwork-card";

  if (!rom.coverUrl) return <div className={wrapperClass}><span className="text-4xl text-retronexo-blue">▣</span></div>;

  return (
    <div className={wrapperClass}>
      <div className="rom-artwork-backdrop" style={{ backgroundImage: `url(${rom.coverUrl})` }} />
      <img alt={`Capa de ${rom.title}`} className="rom-artwork-image" src={rom.coverUrl} />
    </div>
  );
}
