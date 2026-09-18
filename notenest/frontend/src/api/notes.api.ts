import { api } from "./axios";
import { ApiSuccess, Attachment, Note, NoteColor, NoteView, Tag } from "@/types";

export interface NoteInput {
  title?: string;
  content?: string;
  color?: NoteColor;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isTrashed?: boolean;
  /** ISO string to set a reminder, null to clear it, omit to leave unchanged. */
  reminderAt?: string | null;
}

export interface ListNotesParams {
  view: NoteView;
  search?: string;
  tag?: string;
}

export const notesApi = {
  async list(params: ListNotesParams) {
    const res = await api.get<ApiSuccess<Note[]>>("/notes", { params });
    return res.data.data;
  },

  async getById(id: string) {
    const res = await api.get<ApiSuccess<Note>>(`/notes/${id}`);
    return res.data.data;
  },

  async create(input: NoteInput) {
    const res = await api.post<ApiSuccess<Note>>("/notes", input);
    return res.data.data;
  },

  async update(id: string, input: NoteInput) {
    const res = await api.patch<ApiSuccess<Note>>(`/notes/${id}`, input);
    return res.data.data;
  },

  async trash(id: string) {
    const res = await api.patch<ApiSuccess<Note>>(`/notes/${id}/trash`);
    return res.data.data;
  },

  async restore(id: string) {
    const res = await api.patch<ApiSuccess<Note>>(`/notes/${id}/restore`);
    return res.data.data;
  },

  async permanentlyDelete(id: string) {
    await api.delete(`/notes/${id}`);
  },

  async listTags() {
    const res = await api.get<ApiSuccess<Tag[]>>("/notes/tags");
    return res.data.data;
  },

  async uploadAttachment(noteId: string, file: File, onProgress?: (percent: number) => void) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<ApiSuccess<Attachment>>(`/notes/${noteId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return res.data.data;
  },

  async deleteAttachment(noteId: string, attachmentId: string) {
    await api.delete(`/notes/${noteId}/attachments/${attachmentId}`);
  },
};
