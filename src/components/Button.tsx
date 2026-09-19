import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { NavLink, type To } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  end?: boolean;
  to?: To;
  variant?: ButtonVariant;
};

const baseClassName =
  "inline-flex items-center justify-center rounded-md border border-retronexo-border font-medium uppercase transition-[transform,box-shadow,background-color,color,border-color] duration-150 ease-out shadow-[-6px_6px_0_#100F18] active:translate-x-[-4px] active:translate-y-[4px] active:shadow-[-2px_2px_0_#100F18] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "bg-retronexo-blue px-1.5 py-1 text-[10px] text-retronexo-blue-dark hover:bg-retronexo-blue-hover sm:px-4 sm:py-2 sm:text-base",
  secondary:
    "bg-retronexo-grey-200 px-1.5 py-1 text-[10px] text-retronexo-white hover:text-retronexo-blue sm:px-4 sm:py-2 sm:text-base",
  icon:
    "grid h-11 w-11 place-items-center bg-retronexo-grey-200 text-retronexo-grey-100 hover:border-retronexo-pink hover:text-retronexo-pink",
};

const pressedClassName =
  "translate-x-[-4px] translate-y-[4px] shadow-[-2px_2px_0_#100F18]";

export function Button({
  children,
  className = "",
  end,
  to,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  if (to) {
    const linkProps = props as unknown as ComponentProps<typeof NavLink>;

    return (
      <NavLink
        {...linkProps}
        className={({ isActive }) =>
          [
            baseClassName,
            variantClassNames[isActive ? "primary" : variant],
            isActive ? pressedClassName : "",
            className,
          ].join(" ")
        }
        end={end}
        to={to}
      >
        {children}
      </NavLink>
    );
  }

  return (
    <button
      {...props}
      className={[baseClassName, variantClassNames[variant], className].join(" ")}
      type={type}
    >
      {children}
    </button>
  );
}
