import { useEffect, type ReactNode } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "./Button";

type DialogProps = {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export function Dialog({ title, description, children, onClose, className = "" }: DialogProps) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="dialog-title"
        aria-modal="true"
        className={`relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-lg border border-retronexo-grey-200 bg-retronexo-grey-300 p-5 shadow-2xl sm:p-6 ${className}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <Button
          aria-label="Fechar diálogo"
          className="absolute right-4 top-3 !h-9 !w-9"
          onClick={onClose}
          variant="icon"
        >
          <FontAwesomeIcon aria-hidden="true" className="h-4 w-4" icon={faXmark} />
        </Button>
        <h2 className="pr-8 text-2xl text-retronexo-white" id="dialog-title">
          {title}
        </h2>
        {description && <p className="mt-2 text-sm text-retronexo-grey-100">{description}</p>}
        <div className="mt-5">{children}</div>
      </section>
    </div>
  );
}
