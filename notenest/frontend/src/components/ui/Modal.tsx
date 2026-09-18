import { ReactNode, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

/**
 * A focus-trapping, escape-to-close modal. Used for the note editor and
 * confirmation dialogs so we have one consistent overlay behavior.
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`w-full ${maxWidth} h-full sm:h-auto sm:max-h-[85vh] overflow-y-auto scrollbar-thin bg-paper-card dark:bg-paper-darkcard sm:rounded-2xl shadow-card-hover animate-scale-in`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-line dark:border-line-dark sticky top-0 bg-paper-card dark:bg-paper-darkcard z-10">
            <h2 className="font-display text-lg font-medium">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-full text-ink/50 hover:text-ink hover:bg-line/50 dark:text-ink-dark/50 dark:hover:text-ink-dark dark:hover:bg-line-dark/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
