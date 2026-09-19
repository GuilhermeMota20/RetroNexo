import { initials } from "../lib/profile";

type AvatarProps = {
  avatar?: string;
  label: string;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ avatar, label, size = "md" }: AvatarProps) {
  const dimension =
    size === "lg"
      ? "h-24 w-24 sm:h-36 sm:w-36"
      : size === "sm"
        ? "h-9 w-9"
        : "h-12 w-12";

  const source = avatar ? `/avatars/${avatar}.png` : undefined;

  if (source) {
    return (
      <img
        className={`${dimension} rounded-md bg-retronexo-blue-dark object-cover`}
        src={source}
        alt={label}
      />
    );
  }

  return (
    <span className={`${dimension} grid place-items-center rounded-md bg-retronexo-blue text-retronexo-blue-dark`}>
      {initials(label)}
    </span>
  );
}
