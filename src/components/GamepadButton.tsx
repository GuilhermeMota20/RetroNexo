import { faA, faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faB, faX, faY } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type GamepadButtonProps = {
  action: "A" | "B" | "X" | "Y";
};

const actionIcons = { A: faA, B: faB, X: faX, Y: faY };
const directionIcons = { up: faArrowUp, down: faArrowDown, left: faArrowLeft, right: faArrowRight };

/** Representação visual dos botões frontais de um controle XInput. */
export function GamepadButton({ action }: GamepadButtonProps) {
  return (
    <span aria-hidden="true" className={`gamepad-face-button is-${action.toLowerCase()}`}>
      <FontAwesomeIcon icon={actionIcons[action]} />
    </span>
  );
}

type GamepadDirectionButtonProps = {
  direction: "up" | "down" | "left" | "right";
};

/** Direcional quadrado, com a mesma leitura tátil dos botões do controle. */
export function GamepadDirectionButton({ direction }: GamepadDirectionButtonProps) {
  return (
    <span aria-hidden="true" className="gamepad-direction-button">
      <FontAwesomeIcon icon={directionIcons[direction]} />
    </span>
  );
}
