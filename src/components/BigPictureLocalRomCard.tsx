import type { ChangeEvent, RefObject } from "react";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";
import { isSupportedLocalRom, localRomAccept } from "../lib/localRoms";

type BigPictureLocalRomCardProps = {
  selected: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: () => void;
  onLoad: (file: File) => void;
};

export function BigPictureLocalRomCard({ selected, inputRef, onSelect, onLoad }: BigPictureLocalRomCardProps) {
  const chooseFile = () => inputRef.current?.click();
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isSupportedLocalRom(file.name)) {
      toast.error("Arquivo incompatível", { description: "Escolha uma ROM compatível." });
      return;
    }
    onLoad(file);
  };

  return (
    <>
      <input accept={localRomAccept} className="sr-only" onChange={onChange} ref={inputRef} type="file" />
      <button aria-label="Carregar ROM local" aria-selected={selected} className={`big-picture-local-card ${selected ? "is-selected" : ""}`} onClick={() => { onSelect(); chooseFile(); }} role="option" type="button">
        <FontAwesomeIcon aria-hidden="true" icon={faFolderOpen} />
        <strong>Carregar ROM</strong>
        <small>Arquivo do computador</small>
      </button>
    </>
  );
}
