import { EditorContent, useEditor, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { toEditorDocument } from "@/utils/richText";

interface RichTextEditorProps {
  /** Stored note content: either legacy plain text or JSON-stringified Tiptap doc. */
  content: string;
  /** Called with the new JSON-stringified document on every change. */
  onChange: (json: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** Imperative handle so parent components (e.g. the AI Assistant panel) can read/write editor content without lifting all of Tiptap's state up. */
export interface RichTextEditorHandle {
  /** Plain-text representation of the current document (used as AI input). */
  getPlainText: () => string;
  /** Inserts text as a new paragraph at the end of the document. */
  appendText: (text: string) => void;
  /** Replaces the entire document with plain-text content (one paragraph per line). */
  replaceAll: (text: string) => void;
}

/**
 * A professional rich-text editor built on Tiptap. Supports bold, italic,
 * underline, headings, bullet/numbered/checklist lists, blockquotes,
 * inline+block code, links, and full undo/redo history — all with the
 * standard keyboard shortcuts Tiptap's StarterKit provides out of the box.
 */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  ({ content, onChange, placeholder, autoFocus }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // StarterKit's default heading includes levels 1-6; we only expose
          // level 2 in the toolbar to keep notes visually consistent.
          heading: { levels: [2] },
        }),
        Underline,
        Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: "text-accent underline" } }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({ placeholder: placeholder ?? "Take a note…" }),
      ],
      content: toEditorDocument(content),
      autofocus: autoFocus ?? false,
      editorProps: {
        attributes: {
          class:
            "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[10rem] px-4 py-3 leading-relaxed",
        },
      },
      onUpdate: ({ editor: e }) => {
        onChange(JSON.stringify(e.getJSON()));
      },
    });

    // If a different note is loaded into an already-mounted editor instance,
    // replace its content rather than waiting for a full remount.
    useEffect(() => {
      if (!editor) return;
      const current = JSON.stringify(editor.getJSON());
      const next = JSON.stringify(toEditorDocument(content));
      if (current !== next) {
        editor.commands.setContent(toEditorDocument(content) as JSONContent, false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        getPlainText: () => editor?.getText() ?? "",
        appendText: (text: string) => {
          if (!editor) return;
          editor
            .chain()
            .focus("end")
            .insertContent(
              text
                .split("\n")
                .filter(Boolean)
                .map((line) => ({ type: "paragraph", content: [{ type: "text", text: line }] }))
            )
            .run();
          onChange(JSON.stringify(editor.getJSON()));
        },
        replaceAll: (text: string) => {
          if (!editor) return;
          const doc = {
            type: "doc",
            content: text
              .split("\n")
              .map((line) => ({
                type: "paragraph",
                content: line ? [{ type: "text", text: line }] : [],
              })),
          };
          editor.commands.setContent(doc, false);
          onChange(JSON.stringify(editor.getJSON()));
        },
      }),
      [editor]
      // eslint-disable-next-line react-hooks/exhaustive-deps
    );

    if (!editor) return null;

    return (
      <div className="rounded-xl border border-line dark:border-line-dark">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
