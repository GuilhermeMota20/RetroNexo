import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
  contentClassName?: string;
};

type Coordinates = {
  left: number;
  top: number;
};

export function Tooltip({
  content,
  children,
  position = "top",
  className = "",
  contentClassName = "",
}: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates>({ left: 0, top: 0 });

  const updateCoordinates = () => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setCoordinates({
      left: rect.left + rect.width / 2,
      top: position === "top" ? rect.top - 8 : rect.bottom + 8,
    });
  };

  useEffect(() => {
    if (!open) return;

    updateCoordinates();
    window.addEventListener("resize", updateCoordinates);
    window.addEventListener("scroll", updateCoordinates, true);

    return () => {
      window.removeEventListener("resize", updateCoordinates);
      window.removeEventListener("scroll", updateCoordinates, true);
    };
  }, [open, position]);

  useEffect(() => () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
  }, []);

  const hide = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
    setOpen(false);
  };

  const show = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      updateCoordinates();
      setOpen(true);
    }, 650);
  };

  const tooltip = open && typeof document !== "undefined"
    ? createPortal(
        <span
          className={`pointer-events-none fixed z-[80] max-w-64 rounded border border-retronexo-grey-200 bg-retronexo-grey-300 px-2 py-1 text-center text-xs text-retronexo-white shadow-[0_6px_16px_rgba(0,0,0,.55)] ${contentClassName}`}
          role="tooltip"
          style={{
            left: coordinates.left,
            top: coordinates.top,
            transform: position === "top" ? "translate(-50%, -100%)" : "translateX(-50%)",
          }}
        >
          {content}
        </span>,
        document.body,
      )
    : null;

  return (
    <span
      className={className ? `inline-flex ${className}` : "relative inline-flex"}
      onBlur={hide}
      onClick={hide}
      onFocus={show}
      onMouseEnter={show}
      onMouseLeave={hide}
      ref={triggerRef}
    >
      {children}
      {tooltip}
    </span>
  );
}
