import { useState } from "react";
import { LogOut, Menu, Moon, NotebookPen, Search, Sun, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

interface NavbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function Navbar({ search, onSearchChange, onMenuClick, isSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur-md dark:border-line-dark dark:bg-paper-dark/90 sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink/60 hover:bg-line/50 dark:text-ink-dark/60 dark:hover:bg-line-dark/50 lg:hidden"
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <a href="/" className="hidden items-center gap-2 sm:flex">
        <NotebookPen className="h-6 w-6 text-accent" />
        <span className="font-display text-lg font-semibold tracking-tight">NoteNest</span>
      </a>

      <div className="relative mx-auto flex max-w-xl flex-1 items-center">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-ink/40 dark:text-ink-dark/40" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your notes…"
          aria-label="Search notes"
          className="w-full rounded-xl border border-line bg-paper-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink/40 focus-visible:border-accent dark:border-line-dark dark:bg-paper-darkcard dark:text-ink-dark dark:placeholder:text-ink-dark/40"
        />
      </div>

      <button
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="rounded-lg p-2 text-ink/60 hover:bg-line/50 dark:text-ink-dark/60 dark:hover:bg-line-dark/50"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="relative">
        <button
          onClick={() => setShowUserMenu((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm font-medium text-paper dark:bg-accent dark:text-ink"
          aria-label="Account menu"
          aria-expanded={showUserMenu}
        >
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </button>

        {showUserMenu && (
          <>
            {/* Click-away catcher */}
            <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
            <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-line bg-paper-card p-1.5 shadow-card-hover dark:border-line-dark dark:bg-paper-darkcard animate-scale-in">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-ink/50 dark:text-ink-dark/50">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-line dark:bg-line-dark" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
