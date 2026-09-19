import { useEffect, useRef, useState } from "react";
import { faDeleteLeft, faKeyboard, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "./Button";
import { GamepadButton, GamepadDirectionButton } from "./GamepadButton";

type BigPictureKeyboardProps = {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

const keys = [
  ..."QWERTYUIOP", ..."ASDFGHJKL", ..."ZXCVBNM", "ESPAÇO", "APAGAR",
];

/** Teclado virtual acionável por teclado, mouse e controles XInput. */
export function BigPictureKeyboard({ value, onChange, onClose }: BigPictureKeyboardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const lastInput = useRef<string | null>(null);
  const latestAction = useRef({ value, selected, onChange, onClose });
  latestAction.current = { value, selected, onChange, onClose };

  const pressKey = (key: string) => {
    if (key === "APAGAR") return onChange(value.slice(0, -1));
    if (key === "ESPAÇO") return onChange(`${value} `);
    onChange(`${value}${key.toLowerCase()}`);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") return onClose();
      if (event.key === "Backspace") return onChange(value.slice(0, -1));
      if (event.key === "Enter" && selected !== null) return pressKey(keys[selected]);
      if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        setSelected((index) => {
          if (index === null) return 0;
          if (event.key === "ArrowLeft") return Math.max(index - 1, 0);
          if (event.key === "ArrowRight") return Math.min(index + 1, keys.length - 1);
          if (event.key === "ArrowUp") return Math.max(index - 10, 0);
          return Math.min(index + 10, keys.length - 1);
        });
        return;
      }
      if (event.key.length === 1 && /[a-z0-9 ]/i.test(event.key)) onChange(`${value}${event.key}`);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onChange, onClose, selected, value]);

  useEffect(() => {
    let frame = 0;
    const poll = () => {
      const gamepad = navigator.getGamepads?.().find(Boolean);
      if (gamepad) {
        // Some XInput drivers report analog face buttons by value rather than
        // setting `pressed`. Supporting both keeps os botões XInput confiáveis nos navegadores.
        const button = (index: number) => {
          const current = gamepad.buttons[index];
          return Boolean(current?.pressed || (current?.value ?? 0) > .5);
        };
        const input = button(12) || gamepad.axes[1] < -0.65 ? "up"
          : button(13) || gamepad.axes[1] > 0.65 ? "down"
          : button(14) || gamepad.axes[0] < -0.65 ? "left"
          : button(15) || gamepad.axes[0] > 0.65 ? "right"
          : button(2) ? "delete"
          : button(0) ? "confirm"
          : button(1) ? "close"
          : null;
        if (input && input !== lastInput.current) {
          const action = latestAction.current;
          if (input === "close") action.onClose();
          if (input === "delete") action.onChange(action.value.slice(0, -1));
          if (input === "confirm") {
            if (action.selected !== null) {
              const key = keys[action.selected];
              if (key === "APAGAR") action.onChange(action.value.slice(0, -1));
              else if (key === "ESPAÇO") action.onChange(`${action.value} `);
              else action.onChange(`${action.value}${key.toLowerCase()}`);
            }
          }
          if (input === "left") setSelected((index) => index === null ? 0 : Math.max(index - 1, 0));
          if (input === "right") setSelected((index) => index === null ? 0 : Math.min(index + 1, keys.length - 1));
          if (input === "up") setSelected((index) => index === null ? 0 : Math.max(index - 10, 0));
          if (input === "down") setSelected((index) => index === null ? 0 : Math.min(index + 10, keys.length - 1));
        }
        lastInput.current = input;
      } else {
        lastInput.current = null;
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="big-picture-keyboard-backdrop" role="presentation">
      <section aria-label="Teclado de busca" aria-modal="true" className="big-picture-keyboard" role="dialog">
        <div className="big-picture-keyboard-header">
          <span><FontAwesomeIcon aria-hidden="true" icon={faKeyboard} /> BUSCAR ROM</span>
          <Button aria-label="Fechar teclado" className="!h-8 !w-8" onClick={onClose} variant="icon"><FontAwesomeIcon icon={faXmark} /></Button>
        </div>
        <output aria-live="polite" className="big-picture-keyboard-input">{value || "Digite para buscar..."}</output>
        <div className="big-picture-keyboard-grid" role="grid">
          {keys.map((key, index) => (
            <Button
              aria-label={key === "ESPAÇO" ? "Espaço" : key === "APAGAR" ? "Apagar" : `Letra ${key}`}
              aria-selected={selected === index}
              className={`big-picture-key ${selected === index ? "is-selected" : ""} ${key === "ESPAÇO" ? "is-space" : ""}`}
              key={key}
              onClick={() => pressKey(key)}
              role="gridcell"
              variant="secondary"
            >
              {key === "APAGAR" ? <FontAwesomeIcon aria-hidden="true" icon={faDeleteLeft} /> : key}
            </Button>
          ))}
        </div>
        <div className="big-picture-keyboard-help" aria-label="Comandos do joystick: direcionais movem, A seleciona, X apaga e B fecha.">
          <span><GamepadDirectionButton direction="left" /><GamepadDirectionButton direction="right" /><GamepadDirectionButton direction="up" /><GamepadDirectionButton direction="down" /> MOVER</span>
          <span><GamepadButton action="A" /> SELECIONAR</span>
          <span><GamepadButton action="X" /> APAGAR</span>
          <span><GamepadButton action="B" /> FECHAR</span>
        </div>
      </section>
    </div>
  );
}
