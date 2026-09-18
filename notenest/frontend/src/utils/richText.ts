import { JSONContent } from "@tiptap/react";

/**
 * Notes created before the rich-text editor was introduced store `content`
 * as plain text. Notes created after store it as a JSON-stringified Tiptap
 * document. This safely tells the two apart.
 */
function tryParseTiptapJSON(content: string): JSONContent | null {
  if (!content || !content.trim().startsWith("{")) return null;
  try {
    const parsed = JSON.parse(content);
    // A real Tiptap/ProseMirror document always has this shape.
    if (parsed && typeof parsed === "object" && parsed.type === "doc") {
      return parsed as JSONContent;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalizes any stored `content` value into a Tiptap document the editor
 * can load: parses existing rich JSON as-is, or wraps legacy plain text
 * in a single paragraph node so old notes still open correctly.
 */
export function toEditorDocument(content: string): JSONContent {
  const parsed = tryParseTiptapJSON(content);
  if (parsed) return parsed;

  if (!content) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }

  // Legacy plain text may contain manual line breaks - turn each line into
  // its own paragraph so formatting isn't lost.
  return {
    type: "doc",
    content: content
      .split("\n")
      .map((line) => ({
        type: "paragraph",
        content: line ? [{ type: "text", text: line }] : [],
      })),
  };
}

/** Recursively walks a Tiptap JSON tree, collecting visible text. */
function extractText(node: JSONContent, out: string[]): void {
  if (node.type === "text" && node.text) {
    out.push(node.text);
  }
  if (node.type === "taskItem") {
    out.push("☐ ");
  }
  node.content?.forEach((child) => extractText(child, out));
  // Block-level nodes end with a line break so the preview reads naturally.
  if (node.type && ["paragraph", "heading", "listItem", "taskItem", "blockquote"].includes(node.type)) {
    out.push("\n");
  }
}

/**
 * Produces a short plain-text excerpt from stored note content, for use
 * in note cards where rendering the full rich document would be overkill
 * (and would require sanitizing HTML output).
 */
export function getPlainTextPreview(content: string, maxLength = 300): string {
  const doc = toEditorDocument(content);
  const parts: string[] = [];
  extractText(doc, parts);

  const text = parts.join("").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}…`;
}

/** True if the note has no meaningful text content. */
export function isContentEmpty(content: string): boolean {
  return getPlainTextPreview(content, 1).length === 0;
}
