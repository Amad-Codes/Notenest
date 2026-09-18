export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const NOTE_COLORS = ["default", "yellow", "blue", "green", "pink", "purple", "orange"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export interface Tag {
  id: string;
  name: string;
  userId: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  storage: "local" | "cloudinary";
  createdAt: string;
  noteId: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  reminderAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  tags: Tag[];
  attachments: Attachment[];
}

export type NoteView = "active" | "pinned" | "archived" | "trash";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  details?: Record<string, string[] | undefined>;
}
