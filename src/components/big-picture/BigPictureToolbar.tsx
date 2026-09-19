import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../Button";
import { Tooltip } from "../Tooltip";
import type { BigPictureToolbarItem } from "./types";

type BigPictureToolbarProps = {
  activeFilter: string;
  focused: boolean;
  items: BigPictureToolbarItem[];
  selectedIndex: number;
  onAction: (index: number) => void;
  onSelect: (index: number) => void;
};

/** Atalhos de filtro e saída usados pela navegação com mouse, teclado e controle. */
export function BigPictureToolbar({ activeFilter, focused, items, selectedIndex, onAction, onSelect }: BigPictureToolbarProps) {
  return (
    <nav className={`big-picture-toolbar ${focused ? "is-focused" : ""}`} aria-label="Ferramentas da biblioteca" role="toolbar">
      <div className="big-picture-toolbar-actions">
        {items.map((item, index) => (
          <Tooltip content={item.label} key={item.id} position="top">
            <Button
              aria-label={item.label}
              aria-pressed={item.id !== "exit" ? activeFilter === item.id : undefined}
              className={`big-picture-toolbar-button ${selectedIndex === index && focused ? "is-controller-selected" : ""}`}
              onClick={() => {
                onSelect(index);
                onAction(index);
              }}
              variant="icon"
            >
              <FontAwesomeIcon aria-hidden="true" icon={item.icon} />
            </Button>
          </Tooltip>
        ))}
      </div>
    </nav>
  );
}
