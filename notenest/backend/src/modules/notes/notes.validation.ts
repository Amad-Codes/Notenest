import { z } from "zod";

// Palette tokens the frontend knows how to render. Keeping this as an enum
// (rather than a free-text color) prevents invalid/unstyled values reaching the UI.
export const NOTE_COLORS = [
  "default",
  "yellow",
  "blue",
  "green",
  "pink",
  "purple",
  "orange",
] as const;

const tagList = z
  .array(z.string().trim().min(1).max(30))
  .max(10, "A note can have at most 10 tags")
  .optional();

export const createNoteSchema = z.object({
  body: z.object({
    title: z.string().trim().max(150).default(""),
    // Content is stored as a JSON-stringified Tiptap document (or, for
    // legacy notes, plain text). The higher limit accounts for JSON
    // structure overhead versus raw text of the same visible length.
    content: z.string().max(100000).default(""),
    color: z.enum(NOTE_COLORS).default("default"),
    tags: tagList,
  }),
});

export const updateNoteSchema = z.object({
  body: z.object({
    title: z.string().trim().max(150).optional(),
    content: z.string().max(100000).optional(),
    color: z.enum(NOTE_COLORS).optional(),
    tags: tagList,
    isPinned: z.boolean().optional(),
    isArchived: z.boolean().optional(),
    isTrashed: z.boolean().optional(),
    // ISO datetime string to set a reminder, `null` to clear it, or
    // omitted entirely to leave the existing reminder untouched.
    reminderAt: z.string().datetime().nullable().optional(),
  }),
});

export const listNotesQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    tag: z.string().trim().optional(),
    view: z.enum(["active", "archived", "trash", "pinned"]).default("active"),
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>["body"];
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>["body"];
