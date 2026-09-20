import { useEffect, useRef } from "react";
import type { EmulatorGroup } from "../../lib/emulators";

type BigPictureConsoleTabsProps = {
  activeEmulator: string;
  focused: boolean;
  groups: EmulatorGroup[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

/** Abas de console com foco móvel para teclado e controle no modo Big Picture. */
export function BigPictureConsoleTabs({ activeEmulator, focused, groups, selectedIndex, onSelect }: BigPictureConsoleTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (focused) tabRefs.current[selectedIndex]?.focus();
  }, [focused, selectedIndex]);

  return (
    <div aria-label="Filtrar jogos por console" className={`big-picture-console-tabs ${focused ? "is-focused" : ""}`} role="tablist">
      {groups.map((group, index) => {
        const selected = activeEmulator === group.id;
        return (
          <button
            aria-controls="big-picture-library-panel"
            aria-selected={selected}
            className={`big-picture-console-tab ${selected ? "is-selected" : ""} ${focused && selectedIndex === index ? "is-controller-selected" : ""}`}
            id={`big-picture-console-tab-${index}`}
            key={group.id}
            onClick={() => onSelect(index)}
            ref={(element) => { tabRefs.current[index] = element; }}
            role="tab"
            tabIndex={selectedIndex === index ? 0 : -1}
            type="button"
          >
            {group.label}
          </button>
        );
      })}
    </div>
  );
}
