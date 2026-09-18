import { useEffect, useRef, useState } from "react";
import { Archive, ArchiveRestore, Pin, PinOff, Trash2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Attachment, Note, NoteColor, Tag } from "@/types";
import { NoteInput } from "@/api/notes.api";
import { NOTE_COLOR_ORDER, NOTE_COLOR_SWATCH } from "@/utils/noteColors";
import { timeAgo } from "@/utils/timeAgo";
import { RichTextEditor, RichTextEditorHandle } from "./RichTextEditor";
import { AIAssistantMenu } from "./AIAssistantMenu";
import { ReminderPicker } from "./ReminderPicker";
import { AttachmentSection } from "./AttachmentSection";

interface NoteEditorModalProps {
  note: Note | null;
  allTags: Tag[];
  onClose: () => void;
  onSave: (id: string, input: NoteInput) => Promise<unknown>;
  onTrash: (note: Note) => void;
  onArchiveToggle: (note: Note) => void;
}

export function NoteEditorModal({ note, allTags, onClose, onSave, onTrash, onArchiveToggle }: NoteEditorModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<NoteColor>("default");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [reminderAt, setReminderAt] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const editorRef = useRef<RichTextEditorHandle>(null);

  // Sync local editor state whenever a different note is opened.
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color);
      setTags(note.tags.map((t) => t.name));
      setIsPinned(note.isPinned);
      setReminderAt(note.reminderAt);
      setAttachments(note.attachments);
      setTagDraft("");
    }
  }, [note]);

  if (!note) return null;

  const tagSuggestions = allTags
    .map((t) => t.name)
    .filter((name) => name.toLowerCase().includes(tagDraft.trim().toLowerCase()) && !tags.includes(name))
    .filter(() => tagDraft.trim().length > 0)
    .slice(0, 5);

  function addTag(rawValue?: string) {
    const clean = (rawValue ?? tagDraft).trim().toLowerCase();
    if (clean && !tags.includes(clean) && tags.length < 10) {
      setTags([...tags, clean]);
    }
    setTagDraft("");
  }

  function removeTag(tagToRemove: string) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  /** Persists all current field values, then closes. Called on close/blur. */
  async function handleClose() {
    if (!note) return;
    await onSave(note.id, {
      title: title.trim(),
      content: content.trim(),
      color,
      tags,
      isPinned,
      reminderAt,
    });
    onClose();
  }

  async function handleReminderChange(next: string | null) {
    setReminderAt(next);
    // Reminders save immediately (rather than waiting for modal close) so
    // the badge feedback and any future notification scheduling is prompt.
    await onSave(note!.id, { reminderAt: next });
  }

  return (
    <Modal isOpen={!!note} onClose={handleClose} maxWidth="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
        <div className="flex items-center gap-1">
          {NOTE_COLOR_ORDER.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              title={`Set color: ${c}`}
              className={`h-5 w-5 rounded-full ${NOTE_COLOR_SWATCH[c]} ${
                color === c ? "ring-2 ring-ink/50 dark:ring-ink-dark/50" : ""
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <AIAssistantMenu
            getText={() => editorRef.current?.getPlainText() ?? ""}
            onInsert={(text) => editorRef.current?.appendText(text)}
            onReplace={(text) => editorRef.current?.replaceAll(text)}
          />
          <ReminderPicker reminderAt={reminderAt} onChange={handleReminderChange} />
          <button
            onClick={() => setIsPinned((v) => !v)}
            title={isPinned ? "Unpin" : "Pin"}
            className="rounded-lg p-2 text-ink/50 hover:bg-line/50 dark:text-ink-dark/50 dark:hover:bg-line-dark/50"
          >
            {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onArchiveToggle(note)}
            title={note.isArchived ? "Unarchive" : "Archive"}
            className="rounded-lg p-2 text-ink/50 hover:bg-line/50 dark:text-ink-dark/50 dark:hover:bg-line-dark/50"
          >
            {note.isArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              onTrash(note);
              onClose();
            }}
            title="Move to trash"
            className="rounded-lg p-2 text-ink/50 hover:bg-danger/10 hover:text-danger dark:text-ink-dark/50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleClose}
            aria-label="Close and save"
            className="ml-1 rounded-lg p-2 text-ink/50 hover:bg-line/50 dark:text-ink-dark/50 dark:hover:bg-line-dark/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent font-display text-xl font-semibold text-ink placeholder:text-ink/30 focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark/30"
        />
        <div className="mt-3">
          <RichTextEditor ref={editorRef} key={note.id} content={content} onChange={setContent} placeholder="Take a note…" />
        </div>

        <AttachmentSection
          noteId={note.id}
          attachments={attachments}
          onUploaded={(a) => setAttachments((prev) => [...prev, a])}
          onDeleted={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />

        <div className="relative mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3 dark:border-line-dark">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 font-mono text-xs text-ink/70 dark:bg-ink-dark/10 dark:text-ink-dark/70"
            >
              #{tag}
              <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            onBlur={() => setTimeout(() => addTag(), 120)}
            placeholder={tags.length === 0 ? "Add tags (press Enter)" : "Add another…"}
            className="min-w-[8rem] flex-1 bg-transparent py-1 text-xs text-ink placeholder:text-ink/40 focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark/40"
          />

          {tagSuggestions.length > 0 && (
            <div className="absolute left-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-lg border border-line bg-paper-card shadow-card-hover dark:border-line-dark dark:bg-paper-darkcard">
              {tagSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  // onMouseDown fires before the input's onBlur, so the
                  // suggestion click registers before the field collapses.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(suggestion);
                  }}
                  className="block w-full px-3 py-2 text-left text-xs text-ink/70 hover:bg-line/50 dark:text-ink-dark/70 dark:hover:bg-line-dark/50"
                >
                  #{suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[11px] text-ink/40 dark:text-ink-dark/40">
            Edited {timeAgo(note.updatedAt)}
          </span>
          <Button size="sm" onClick={handleClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
