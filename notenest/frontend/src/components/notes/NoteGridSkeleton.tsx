const HEIGHTS = ["h-32", "h-44", "h-24", "h-52", "h-36", "h-28", "h-40", "h-48"];

/** Masonry-shaped skeleton cards, shown in place of the note grid while loading. */
export function NoteGridSkeleton() {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4" aria-hidden="true">
      {HEIGHTS.map((height, i) => (
        <div
          key={i}
          className={`mb-4 animate-pulse break-inside-avoid rounded-2xl border border-line/70 bg-paper-card dark:border-line-dark/70 dark:bg-paper-darkcard ${height}`}
        >
          <div className="flex h-full flex-col gap-2 p-4">
            <div className="h-3 w-2/3 rounded bg-line dark:bg-line-dark" />
            <div className="h-2.5 w-full rounded bg-line/70 dark:bg-line-dark/70" />
            <div className="h-2.5 w-5/6 rounded bg-line/70 dark:bg-line-dark/70" />
            <div className="h-2.5 w-1/2 rounded bg-line/70 dark:bg-line-dark/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
