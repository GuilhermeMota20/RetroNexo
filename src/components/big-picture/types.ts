import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export type BigPictureFocusArea = "search" | "library" | "toolbar";

export type BigPictureToolbarItem = {
  id: string;
  label: string;
  icon: IconDefinition;
};
