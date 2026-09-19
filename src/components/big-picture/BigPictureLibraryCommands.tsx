import { GamepadButton } from "../GamepadButton";

type BigPictureLibraryCommandsProps = {
  favorite: boolean;
  visible: boolean;
};

/** Comando contextual exibido exclusivamente quando uma ROM está selecionada. */
export function BigPictureLibraryCommands({ favorite, visible }: BigPictureLibraryCommandsProps) {
  return (
    <div aria-live="polite" className={`big-picture-library-commands ${visible ? "is-visible" : ""}`}>
      {visible && <span><GamepadButton action="A" /> jogar</span>}
      {visible && <span><GamepadButton action="X" /> {favorite ? "remover dos favoritos" : "adicionar aos favoritos"}</span>}
    </div>
  );
}
