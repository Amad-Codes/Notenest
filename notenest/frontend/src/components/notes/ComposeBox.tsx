import { FormEvent, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NoteInput } from "@/api/notes.api";

interface ComposeBoxProps {
  onCreate: (input: NoteInput) => Promise<unknown>;
}

/** A collapsed single-line input that expands into a full note composer on focus. */
export function ComposeBox({ onCreate }: ComposeBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function reset() {
    setTitle("");
    setContent("");
    setIsExpanded(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) {
      reset();
      return;
    }
    setIsSaving(true);
    await onCreate({ title: title.trim(), content: content.trim() });
    setIsSaving(false);
    reset();
  }

  return (
    <div
      ref={containerRef}
      className="mx-auto mb-8 max-w-xl rounded-2xl border border-line bg-paper-card shadow-card dark:border-line-dark dark:bg-paper-darkcard"
    >
      <form onSubmit={handleSubmit}>
        {isExpanded && (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-transparent px-4 pt-3.5 font-display text-base font-medium text-ink placeholder:text-ink/40 focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark/40"
          />
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="Take a note…"
          rows={isExpanded ? 3 : 1}
          className="w-full resize-none bg-transparent px-4 py-3.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none dark:text-ink-dark dark:placeholder:text-ink-dark/40"
        />
        {isExpanded && (
          <div className="flex items-center justify-end gap-2 border-t border-line/70 px-3 py-2 dark:border-line-dark/70">
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
              <Plus className="h-4 w-4" />
              Add note
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
