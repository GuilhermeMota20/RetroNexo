import { useEffect, useRef } from "react";
import type { BigPictureFocusArea } from "./types";

type UseBigPictureNavigationOptions = {
  focusArea: BigPictureFocusArea;
  searchOpen: boolean;
  toolbarItemCount: number;
  toolbarIndex: number;
  onConfirm: () => void;
  onExit: () => void;
  onMoveGame: (direction: -1 | 1) => void;
  onOpenSearch: () => void;
  onSecondaryAction: () => void;
  setFocusArea: (area: BigPictureFocusArea | ((current: BigPictureFocusArea) => BigPictureFocusArea)) => void;
  setToolbarIndex: (index: number | ((current: number) => number)) => void;
};

const getGamepadInput = (gamepad: Gamepad) => {
  const button = (index: number) => Boolean(gamepad.buttons[index]?.pressed || (gamepad.buttons[index]?.value ?? 0) > .5);
  return button(12) || gamepad.axes[1] < -0.65 ? "up"
    : button(13) || gamepad.axes[1] > 0.65 ? "down"
    : button(14) || gamepad.axes[0] < -0.65 ? "left"
    : button(15) || gamepad.axes[0] > 0.65 ? "right"
    : button(2) ? "secondary"
    : button(3) ? "search"
    : button(0) ? "confirm"
    : button(1) ? "back"
    : null;
};

/** Centraliza a leitura de teclado e XInput para não duplicar regras de foco. */
export function useBigPictureNavigation({ focusArea, searchOpen, toolbarItemCount, toolbarIndex, onConfirm, onExit, onMoveGame, onOpenSearch, onSecondaryAction, setFocusArea, setToolbarIndex }: UseBigPictureNavigationOptions) {
  const previousGamepadInput = useRef<string | null>(null);

  const moveFocusVertically = (direction: -1 | 1) => {
    setFocusArea((area) => {
      if (direction < 0) return area === "toolbar" ? "library" : "search";
      return area === "search" ? "library" : "toolbar";
    });
  };

  const moveHorizontally = (direction: -1 | 1) => {
    if (focusArea === "toolbar") {
      setToolbarIndex((index) => (index + direction + toolbarItemCount) % toolbarItemCount);
      return;
    }
    if (focusArea === "library") onMoveGame(direction);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (searchOpen || event.key === "Escape") return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        moveFocusVertically(event.key === "ArrowUp" ? -1 : 1);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveHorizontally(event.key === "ArrowLeft" ? -1 : 1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusArea, onConfirm, onMoveGame, searchOpen, toolbarIndex]);

  useEffect(() => {
    let frameId = 0;
    const pollGamepad = () => {
      const gamepad = navigator.getGamepads?.().find(Boolean);
      if (searchOpen) {
        // Prevent the B that closed the dialog from also exiting Big Picture.
        previousGamepadInput.current = gamepad?.buttons[1]?.pressed ? "back" : null;
      } else if (gamepad) {
        const input = getGamepadInput(gamepad);
        if (input && input !== previousGamepadInput.current) {
          if (input === "up") moveFocusVertically(-1);
          if (input === "down") moveFocusVertically(1);
          if (input === "left") moveHorizontally(-1);
          if (input === "right") moveHorizontally(1);
          if (input === "secondary") onSecondaryAction();
          if (input === "search") onOpenSearch();
          if (input === "confirm") onConfirm();
          if (input === "back") onExit();
        }
        previousGamepadInput.current = input;
      } else {
        previousGamepadInput.current = null;
      }
      frameId = window.requestAnimationFrame(pollGamepad);
    };

    frameId = window.requestAnimationFrame(pollGamepad);
    return () => window.cancelAnimationFrame(frameId);
  }, [focusArea, onConfirm, onExit, onMoveGame, onOpenSearch, onSecondaryAction, searchOpen, toolbarIndex]);
}
