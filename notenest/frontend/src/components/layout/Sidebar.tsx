import { useState } from "react";
import { Archive, Pin, Search, StickyNote, Tag as TagIcon, Trash2 } from "lucide-react";
import { NoteView, Tag } from "@/types";

interface SidebarProps {
  isOpen: boolean;
  activeView: NoteView;
  onViewChange: (view: NoteView) => void;
  tags: Tag[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

const VIEWS: { key: NoteView; label: string; icon: typeof StickyNote }[] = [
  { key: "active", label: "All notes", icon: StickyNote },
  { key: "pinned", label: "Pinned", icon: Pin },
  { key: "archived", label: "Archive", icon: Archive },
  { key: "trash", label: "Trash", icon: Trash2 },
];

// Only bother showing a "search tags" box once there are enough tags that
// scanning the list by eye stops being the fastest option.
const TAG_SEARCH_THRESHOLD = 8;

export function Sidebar({ isOpen, activeView, onViewChange, tags, activeTag, onTagChange }: SidebarProps) {
  const [tagQuery, setTagQuery] = useState("");

  const visibleTags = tagQuery.trim()
    ? tags.filter((t) => t.name.toLowerCase().includes(tagQuery.trim().toLowerCase()))
    : tags;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 transform border-r border-line bg-paper pt-16 transition-transform duration-200 dark:border-line-dark dark:bg-paper-dark lg:static lg:z-0 lg:translate-x-0 lg:pt-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="flex h-full flex-col gap-6 overflow-y-auto scrollbar-thin p-4">
        <div className="flex flex-col gap-1">
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                activeView === key
                  ? "bg-ink text-paper dark:bg-accent dark:text-ink"
                  : "text-ink/70 hover:bg-line/50 dark:text-ink-dark/70 dark:hover:bg-line-dark/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {tags.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 px-3.5 font-mono text-[11px] uppercase tracking-wider text-ink/40 dark:text-ink-dark/40">
              <TagIcon className="h-3 w-3" /> Tags
            </p>

            {tags.length > TAG_SEARCH_THRESHOLD && (
              <div className="relative mb-2 px-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30 dark:text-ink-dark/30" />
                <input
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Search tags…"
                  className="w-full rounded-lg border border-line bg-paper-card py-1.5 pl-8 pr-2.5 text-xs text-ink placeholder:text-ink/40 focus-visible:border-accent dark:border-line-dark dark:bg-paper-darkcard dark:text-ink-dark dark:placeholder:text-ink-dark/40"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              {visibleTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onTagChange(activeTag === tag.name ? null : tag.name)}
                  className={`truncate rounded-xl px-3.5 py-2 text-left text-sm transition-colors ${
                    activeTag === tag.name
                      ? "bg-line dark:bg-line-dark font-medium"
                      : "text-ink/60 hover:bg-line/40 dark:text-ink-dark/60 dark:hover:bg-line-dark/40"
                  }`}
                >
                  #{tag.name}
                </button>
              ))}
              {visibleTags.length === 0 && (
                <p className="px-3.5 py-2 text-xs text-ink/40 dark:text-ink-dark/40">No matching tags</p>
              )}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
