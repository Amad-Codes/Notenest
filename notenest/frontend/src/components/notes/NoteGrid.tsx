import { NotebookPen } from "lucide-react";
import { Note, NoteColor, NoteView } from "@/types";
import { NoteCard } from "./NoteCard";
import { NoteGridSkeleton } from "./NoteGridSkeleton";

interface NoteGridProps {
  notes: Note[];
  isLoading: boolean;
  view: NoteView;
  onOpen: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onChangeColor: (note: Note, color: NoteColor) => void;
  onArchiveToggle: (note: Note) => void;
  onTrash: (note: Note) => void;
  onRestore: (note: Note) => void;
  onDeleteForever: (note: Note) => void;
}

const EMPTY_STATE_COPY: Record<NoteView, { title: string; body: string }> = {
  active: { title: "No notes yet", body: "Write your first note using the box above." },
  pinned: { title: "Nothing pinned", body: "Pin important notes to keep them at the top." },
  archived: { title: "Archive is empty", body: "Notes you archive will show up here." },
  trash: { title: "Trash is empty", body: "Notes you delete will appear here for 30 days." },
};

export function NoteGrid({
  notes,
  isLoading,
  view,
  onOpen,
  onTogglePin,
  onChangeColor,
  onArchiveToggle,
  onTrash,
  onRestore,
  onDeleteForever,
}: NoteGridProps) {
  if (isLoading) {
    return <NoteGridSkeleton />;
  }

  if (notes.length === 0) {
    const copy = EMPTY_STATE_COPY[view];
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <NotebookPen className="h-9 w-9 text-ink/20 dark:text-ink-dark/20" />
        <p className="font-display text-lg font-medium text-ink/60 dark:text-ink-dark/60">{copy.title}</p>
        <p className="max-w-xs text-sm text-ink/40 dark:text-ink-dark/40">{copy.body}</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 animate-fade-in">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isTrashView={view === "trash"}
          onOpen={() => onOpen(note)}
          onTogglePin={() => onTogglePin(note)}
          onChangeColor={(color) => onChangeColor(note, color)}
          onArchiveToggle={() => onArchiveToggle(note)}
          onTrash={() => onTrash(note)}
          onRestore={() => onRestore(note)}
          onDeleteForever={() => onDeleteForever(note)}
        />
      ))}
    </div>
  );
}
