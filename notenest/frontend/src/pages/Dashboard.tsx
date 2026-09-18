import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ComposeBox } from "@/components/notes/ComposeBox";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteEditorModal } from "@/components/notes/NoteEditorModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useNotes } from "@/hooks/useNotes";
import { Note, NoteView } from "@/types";

const VIEW_TITLES: Record<NoteView, string> = {
  active: "All notes",
  pinned: "Pinned",
  archived: "Archive",
  trash: "Trash",
};

export default function Dashboard() {
  const [view, setView] = useState<NoteView>("active");
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openNote, setOpenNote] = useState<Note | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Note | null>(null);

  const {
    notes,
    tags,
    isLoading,
    createNote,
    updateNote,
    togglePin,
    trashNote,
    restoreNote,
    deleteForever,
  } = useNotes(view, search, activeTag);

  function handleViewChange(nextView: NoteView) {
    setView(nextView);
    setActiveTag(null);
    setIsSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-paper-dark">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        onMenuClick={() => setIsSidebarOpen((v) => !v)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar
          isOpen={isSidebarOpen}
          activeView={view}
          onViewChange={handleViewChange}
          tags={tags}
          activeTag={activeTag}
          onTagChange={setActiveTag}
        />

        {/* Overlay to close the sidebar on mobile when tapping outside it */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-ink/20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="mb-5 font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            {activeTag ? `#${activeTag}` : VIEW_TITLES[view]}
          </h1>

          {view === "active" && <ComposeBox onCreate={createNote} />}

          <NoteGrid
            notes={notes}
            isLoading={isLoading}
            view={view}
            onOpen={setOpenNote}
            onTogglePin={togglePin}
            onChangeColor={(note, color) => updateNote(note.id, { color })}
            onArchiveToggle={(note) => updateNote(note.id, { isArchived: !note.isArchived })}
            onTrash={(note) => trashNote(note.id)}
            onRestore={(note) => restoreNote(note.id)}
            onDeleteForever={setPendingDelete}
          />
        </main>
      </div>

      <NoteEditorModal
        note={openNote}
        allTags={tags}
        onClose={() => setOpenNote(null)}
        onSave={updateNote}
        onTrash={(note) => trashNote(note.id)}
        onArchiveToggle={(note) => updateNote(note.id, { isArchived: !note.isArchived })}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete permanently?"
        description="This note will be permanently deleted and cannot be recovered."
        confirmLabel="Delete forever"
        onConfirm={() => pendingDelete && deleteForever(pendingDelete.id)}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
