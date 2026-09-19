import { GamepadButton, GamepadDirectionButton } from "../GamepadButton";

type BigPictureControllerHintsProps = {
  onOpenSearch: () => void;
};

/** Legenda visual e acessível dos comandos disponíveis na biblioteca. */
export function BigPictureControllerHints({ onOpenSearch }: BigPictureControllerHintsProps) {
  return (
    <aside className="big-picture-controller-hints" aria-label="Comandos do joystick">
      <span><GamepadDirectionButton direction="left" /><GamepadDirectionButton direction="right" /><GamepadDirectionButton direction="up" /><GamepadDirectionButton direction="down" /> mover</span>
      <span><GamepadButton action="A" /> selecionar</span>
      <button aria-label="Buscar ROMs" className="big-picture-controller-shortcut" onClick={onOpenSearch} type="button"><GamepadButton action="Y" /> buscar</button>
      <span><GamepadButton action="B" /> sair</span>
    </aside>
  );
}
