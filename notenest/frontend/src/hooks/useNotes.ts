import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { notesApi, NoteInput } from "@/api/notes.api";
import { getErrorMessage } from "@/api/axios";
import { Note, NoteView, Tag } from "@/types";

/**
 * Owns all note data + mutations for the dashboard: fetching the current
 * view, search, and tag filter, plus create/update/pin/trash/restore/
 * delete actions that keep local state in sync with the server.
 */
export function useNotes(view: NoteView, search: string, activeTag: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTags = useCallback(async () => {
    try {
      const fetchedTags = await notesApi.listTags();
      setTags(fetchedTags);
    } catch {
      // Non-critical: tag sidebar just stays as-is if this fails.
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notesApi.list({
        view,
        search: search || undefined,
        tag: activeTag || undefined,
      });
      setNotes(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [view, search, activeTag]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  async function createNote(input: NoteInput) {
    try {
      const created = await notesApi.create(input);
      toast.success("Note created");
      await Promise.all([fetchNotes(), refreshTags()]);
      return created;
    } catch (err) {
      toast.error(getErrorMessage(err));
      return null;
    }
  }

  async function updateNote(id: string, input: NoteInput) {
    // Optimistic update so edits feel instant, then reconcile with the server.
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...input, tags: n.tags } : n)));
    try {
      await notesApi.update(id, input);
      await Promise.all([fetchNotes(), refreshTags()]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      fetchNotes(); // roll back to server truth on failure
    }
  }

  async function togglePin(note: Note) {
    await updateNote(note.id, { isPinned: !note.isPinned });
  }

  async function trashNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.trash(id);
      toast.success("Moved to Trash");
    } catch (err) {
      toast.error(getErrorMessage(err));
      fetchNotes();
    }
  }

  async function restoreNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.restore(id);
      toast.success("Note restored");
    } catch (err) {
      toast.error(getErrorMessage(err));
      fetchNotes();
    }
  }

  async function deleteForever(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await notesApi.permanentlyDelete(id);
      toast.success("Note permanently deleted");
    } catch (err) {
      toast.error(getErrorMessage(err));
      fetchNotes();
    }
  }

  return {
    notes,
    tags,
    isLoading,
    createNote,
    updateNote,
    togglePin,
    trashNote,
    restoreNote,
    deleteForever,
    refetch: fetchNotes,
  };
}
