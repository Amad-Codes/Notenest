import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { CreateNoteInput, UpdateNoteInput } from "./notes.validation";
import { deleteStoredFile, storeFile } from "../uploads/upload.service";

export interface ListNotesFilters {
  search?: string;
  tag?: string;
  view: "active" | "archived" | "trash" | "pinned";
}

// Shared "include" so every note returned to the client has its tags and
// attachments available, without repeating this object in every query.
const noteInclude = {
  tags: true,
  attachments: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.NoteInclude;

/** Ensures the note exists and belongs to the requesting user, or throws. */
async function findOwnedNoteOrThrow(noteId: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.authorId !== userId) {
    throw ApiError.notFound("Note not found");
  }
  return note;
}

/**
 * Turns a flat array of tag name strings into Prisma's connect-or-create
 * syntax, scoped to the user, so tags are reused across a user's notes
 * instead of duplicated per note.
 */
function buildTagConnections(userId: string, tags: string[] | undefined) {
  if (!tags) return undefined;
  return {
    set: [], // clear existing connections first (used on update)
    connectOrCreate: tags.map((name) => ({
      where: { userId_name: { userId, name } },
      create: { name, userId },
    })),
  };
}

export const notesService = {
  async list(userId: string, filters: ListNotesFilters) {
    const where: Prisma.NoteWhereInput = {
      authorId: userId,
      isTrashed: filters.view === "trash",
      ...(filters.view === "archived" && { isArchived: true }),
      ...(filters.view === "active" && { isArchived: false }),
      ...(filters.view === "pinned" && { isArchived: false, isPinned: true }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search } },
          { content: { contains: filters.search } },
        ],
      }),
      ...(filters.tag && { tags: { some: { name: filters.tag } } }),
    };

    return prisma.note.findMany({
      where,
      include: noteInclude,
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });
  },

  async getById(noteId: string, userId: string) {
    await findOwnedNoteOrThrow(noteId, userId);
    return prisma.note.findUnique({ where: { id: noteId }, include: noteInclude });
  },

  async create(userId: string, input: CreateNoteInput) {
    return prisma.note.create({
      data: {
        title: input.title,
        content: input.content,
        color: input.color,
        authorId: userId,
        ...(input.tags?.length && {
          tags: {
            connectOrCreate: input.tags.map((name) => ({
              where: { userId_name: { userId, name } },
              create: { name, userId },
            })),
          },
        }),
      },
      include: noteInclude,
    });
  },

  async update(noteId: string, userId: string, input: UpdateNoteInput) {
    await findOwnedNoteOrThrow(noteId, userId);

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content }),
        ...(input.color !== undefined && { color: input.color }),
        ...(input.isPinned !== undefined && { isPinned: input.isPinned }),
        ...(input.isArchived !== undefined && { isArchived: input.isArchived }),
        ...(input.isTrashed !== undefined && { isTrashed: input.isTrashed }),
        ...(input.reminderAt !== undefined && {
          reminderAt: input.reminderAt ? new Date(input.reminderAt) : null,
        }),
        ...(input.tags !== undefined && { tags: buildTagConnections(userId, input.tags) }),
      },
      include: noteInclude,
    });
  },

  /** Soft delete: moves the note to Trash. Recoverable until permanentlyDelete. */
  async softDelete(noteId: string, userId: string) {
    await findOwnedNoteOrThrow(noteId, userId);
    return prisma.note.update({
      where: { id: noteId },
      data: { isTrashed: true, isPinned: false },
    });
  },

  async restore(noteId: string, userId: string) {
    await findOwnedNoteOrThrow(noteId, userId);
    return prisma.note.update({ where: { id: noteId }, data: { isTrashed: false } });
  },

  /** Permanently removes a note. Only callable on notes already in Trash. */
  async permanentlyDelete(noteId: string, userId: string) {
    const note = await findOwnedNoteOrThrow(noteId, userId);
    if (!note.isTrashed) {
      throw ApiError.badRequest("Move the note to Trash before deleting it permanently");
    }
    await prisma.note.delete({ where: { id: noteId } });
  },

  async listTags(userId: string) {
    return prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
  },

  /** Uploads and attaches a file to a note the user owns. */
  async addAttachment(noteId: string, userId: string, file: Express.Multer.File) {
    await findOwnedNoteOrThrow(noteId, userId);
    const stored = await storeFile(file);

    return prisma.attachment.create({
      data: {
        noteId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        url: stored.url,
        publicId: stored.publicId,
        storage: stored.storage,
      },
    });
  },

  /** Deletes an attachment's stored file and its database record. */
  async removeAttachment(noteId: string, attachmentId: string, userId: string) {
    await findOwnedNoteOrThrow(noteId, userId);

    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.noteId !== noteId) {
      throw ApiError.notFound("Attachment not found");
    }

    await deleteStoredFile(attachment);
    await prisma.attachment.delete({ where: { id: attachmentId } });
  },
};
