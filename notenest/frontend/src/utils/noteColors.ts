import { NoteColor } from "@/types";

/** Maps a note's color token to its card background classes (light + dark). */
export const NOTE_COLOR_BG: Record<NoteColor, string> = {
  default: "bg-note-default dark:bg-note-default-dark",
  yellow: "bg-note-yellow dark:bg-note-yellow-dark",
  blue: "bg-note-blue dark:bg-note-blue-dark",
  green: "bg-note-green dark:bg-note-green-dark",
  pink: "bg-note-pink dark:bg-note-pink-dark",
  purple: "bg-note-purple dark:bg-note-purple-dark",
  orange: "bg-note-orange dark:bg-note-orange-dark",
};

/** Solid swatch color used for the small color-picker dots. */
export const NOTE_COLOR_SWATCH: Record<NoteColor, string> = {
  default: "bg-white border border-line dark:bg-paper-darkcard dark:border-line-dark",
  yellow: "bg-[#FFF4CC]",
  blue: "bg-[#DCE8FB]",
  green: "bg-[#DFF3E3]",
  pink: "bg-[#FBE0EC]",
  purple: "bg-[#E9DEFA]",
  orange: "bg-[#FCE4D2]",
};

export const NOTE_COLOR_ORDER: NoteColor[] = ["default", "yellow", "orange", "blue", "green", "pink", "purple"];
