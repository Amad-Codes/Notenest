import { Loader2, NotebookPen } from "lucide-react";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-ink/40 dark:text-ink-dark/40 ${className}`} />;
}

/** Full-viewport loading state, shown while the initial auth check resolves. */
export function PageLoader() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-paper dark:bg-paper-dark">
      <NotebookPen className="h-8 w-8 text-accent animate-pulse" />
      <p className="text-sm text-ink/50 dark:text-ink-dark/50">Loading NoteNest…</p>
    </div>
  );
}
