import { useRef, useState } from "react";
import { Download, File, FileText, Loader2, Paperclip, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { Attachment } from "@/types";
import { notesApi } from "@/api/notes.api";
import { getErrorMessage } from "@/api/axios";
import { formatFileSize, isImageType } from "@/utils/fileSize";
import { resolveAttachmentUrl } from "@/utils/attachmentUrl";

interface AttachmentSectionProps {
  noteId: string;
  attachments: Attachment[];
  onUploaded: (attachment: Attachment) => void;
  onDeleted: (attachmentId: string) => void;
}

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/gif,image/webp,image/svg+xml,application/pdf,application/msword,.docx,text/plain,text/csv";

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

/**
 * Handles uploading, previewing, downloading, and deleting file
 * attachments on a note. Images get an inline thumbnail; everything else
 * gets a file-type icon plus name/size and a download link.
 */
export function AttachmentSection({ noteId, attachments, onUploaded, onDeleted }: AttachmentSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`"${file.name}" is larger than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setProgress(0);
    try {
      const attachment = await notesApi.uploadAttachment(noteId, file, setProgress);
      onUploaded(attachment);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProgress(null);
    }
  }

  async function handleDelete(attachment: Attachment) {
    setDeletingId(attachment.id);
    try {
      await notesApi.deleteAttachment(noteId, attachment.id);
      onDeleted(attachment.id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-4 border-t border-line pt-3 dark:border-line-dark">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/40 dark:text-ink-dark/40">
          <Paperclip className="h-3 w-3" /> Attachments
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={progress !== null}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink/70 hover:bg-line/50 disabled:opacity-50 dark:text-ink-dark/70 dark:hover:bg-line-dark/50"
        >
          {progress !== null ? `Uploading… ${progress}%` : "+ Add file"}
        </button>
        <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileSelected} hidden />
      </div>

      {progress !== null && (
        <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-line dark:bg-line-dark">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => {
            const url = resolveAttachmentUrl(attachment.url);
            const isDeleting = deletingId === attachment.id;

            if (isImageType(attachment.fileType)) {
              return (
                <div
                  key={attachment.id}
                  className="group relative h-20 w-20 overflow-hidden rounded-lg border border-line dark:border-line-dark"
                >
                  <img src={url} alt={attachment.fileName} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-ink/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <a
                      href={url}
                      download={attachment.fileName}
                      title="Download"
                      className="rounded-full bg-white/90 p-1.5 text-ink hover:bg-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(attachment)}
                      disabled={isDeleting}
                      title="Delete"
                      className="rounded-full bg-white/90 p-1.5 text-danger hover:bg-white"
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-paper px-2.5 py-2 dark:border-line-dark dark:bg-paper-dark"
              >
                <FileIcon mimeType={attachment.fileType} />
                <div className="min-w-0">
                  <p className="max-w-[9rem] truncate text-xs font-medium text-ink dark:text-ink-dark">
                    {attachment.fileName}
                  </p>
                  <p className="font-mono text-[10px] text-ink/40 dark:text-ink-dark/40">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                <a href={url} download={attachment.fileName} title="Download" className="text-ink/40 hover:text-ink dark:text-ink-dark/40 dark:hover:text-ink-dark">
                  <Download className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(attachment)}
                  disabled={isDeleting}
                  title="Delete"
                  className="text-ink/40 hover:text-danger dark:text-ink-dark/40"
                >
                  {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
