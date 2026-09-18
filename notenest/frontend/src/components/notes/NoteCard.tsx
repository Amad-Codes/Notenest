import { Archive, ArchiveRestore, Bell, Paperclip, Pin, PinOff, Trash2, Undo2, X } from "lucide-react";
import { Note, NoteColor } from "@/types";
import { NOTE_COLOR_BG, NOTE_COLOR_ORDER, NOTE_COLOR_SWATCH } from "@/utils/noteColors";
import { timeAgo } from "@/utils/timeAgo";
import { getPlainTextPreview } from "@/utils/richText";
import { format, isPast } from "date-fns";

interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onTogglePin: () => void;
  onChangeColor: (color: NoteColor) => void;
  onArchiveToggle: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
  isTrashView: boolean;
}

/**
 * The signature visual element of NoteNest: a paper-like card with a
 * folded top-right corner (a "dog-ear"), evoking a real notebook page.
 */
export function NoteCard({
  note,
  onOpen,
  onTogglePin,
  onChangeColor,
  onArchiveToggle,
  onTrash,
  onRestore,
  onDeleteForever,
  isTrashView,
}: NoteCardProps) {
  return (
    <div
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-line/70 dark:border-line-dark/70 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-hover ${NOTE_COLOR_BG[note.color]}`}
    >
      {/* Folded corner — the signature "dog-ear" detail */}
      <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 overflow-hidden rounded-tr-2xl">
        <div className="absolute -right-3 -top-3 h-6 w-6 rotate-45 bg-ink/10 dark:bg-ink-dark/10" />
      </div>

      <button onClick={onOpen} className="block w-full px-4 pb-3 pt-4 text-left">
        {note.title && (
          <h3 className="mb-1 pr-4 font-display text-base font-semibold leading-snug text-ink dark:text-ink-dark">
            {note.title}
          </h3>
        )}
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80 dark:text-ink-dark/80 line-clamp-6">
          {getPlainTextPreview(note.content) || (
            <span className="italic text-ink/40 dark:text-ink-dark/40">Empty note</span>
          )}
        </p>

        {note.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {note.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[11px] text-ink/60 dark:bg-ink-dark/10 dark:text-ink-dark/60"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {(note.reminderAt || note.attachments.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {note.reminderAt && (
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isPast(new Date(note.reminderAt))
                    ? "bg-danger/10 text-danger"
                    : "bg-accent/20 text-accent-hover dark:text-accent"
                }`}
              >
                <Bell className="h-3 w-3" />
                {format(new Date(note.reminderAt), "MMM d, h:mm a")}
              </span>
            )}
            {note.attachments.length > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-ink/40 dark:text-ink-dark/40">
                <Paperclip className="h-3 w-3" />
                {note.attachments.length}
              </span>
            )}
          </div>
        )}
      </button>

      <div className="flex items-center justify-between border-t border-ink/5 px-3 py-2 dark:border-ink-dark/5">
        <span className="px-1 font-mono text-[11px] text-ink/40 dark:text-ink-dark/40">
          {timeAgo(note.updatedAt)}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          {isTrashView ? (
            <>
              <button
                onClick={onRestore}
                title="Restore note"
                className="rounded-lg p-1.5 text-ink/60 hover:bg-ink/10 dark:text-ink-dark/60 dark:hover:bg-ink-dark/10"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={onDeleteForever}
                title="Delete forever"
                className="rounded-lg p-1.5 text-danger hover:bg-danger/10"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="mr-1 hidden items-center gap-1 sm:flex">
                {NOTE_COLOR_ORDER.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChangeColor(color)}
                    title={`Set color: ${color}`}
                    className={`h-4 w-4 rounded-full ${NOTE_COLOR_SWATCH[color]} ${
                      note.color === color ? "ring-2 ring-ink/40 dark:ring-ink-dark/40" : ""
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={onTogglePin}
                title={note.isPinned ? "Unpin" : "Pin"}
                className="rounded-lg p-1.5 text-ink/60 hover:bg-ink/10 dark:text-ink-dark/60 dark:hover:bg-ink-dark/10"
              >
                {note.isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
              <button
                onClick={onArchiveToggle}
                title={note.isArchived ? "Unarchive" : "Archive"}
                className="rounded-lg p-1.5 text-ink/60 hover:bg-ink/10 dark:text-ink-dark/60 dark:hover:bg-ink-dark/10"
              >
                {note.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </button>
              <button
                onClick={onTrash}
                title="Move to trash"
                className="rounded-lg p-1.5 text-ink/60 hover:bg-danger/10 hover:text-danger dark:text-ink-dark/60"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
