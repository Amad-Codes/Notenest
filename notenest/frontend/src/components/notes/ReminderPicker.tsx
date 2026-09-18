import { useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ReminderPickerProps {
  /** ISO datetime string, or null if no reminder is set. */
  reminderAt: string | null;
  onChange: (reminderAt: string | null) => void;
}

/** Converts an ISO datetime string to the `YYYY-MM-DDTHH:mm` format `<input type="datetime-local">` expects, in local time. */
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ReminderPicker({ reminderAt, onChange }: ReminderPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(() => toLocalInputValue(reminderAt));

  function handleSet() {
    if (!draft) return;
    onChange(new Date(draft).toISOString());
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setDraft("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setDraft(toLocalInputValue(reminderAt));
          setIsOpen((v) => !v);
        }}
        title={reminderAt ? "Edit reminder" : "Set reminder"}
        aria-label={reminderAt ? "Edit reminder" : "Set reminder"}
        className={`rounded-lg p-2 transition-colors ${
          reminderAt
            ? "bg-accent/20 text-accent-hover dark:text-accent"
            : "text-ink/50 hover:bg-line/50 dark:text-ink-dark/50 dark:hover:bg-line-dark/50"
        }`}
      >
        {reminderAt ? <Bell className="h-4 w-4 fill-current" /> : <Bell className="h-4 w-4" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-11 z-20 w-64 rounded-xl border border-line bg-paper-card p-3 shadow-card-hover dark:border-line-dark dark:bg-paper-darkcard animate-scale-in">
            <label className="mb-1.5 block text-xs font-medium text-ink/60 dark:text-ink-dark/60">
              Remind me at
            </label>
            <input
              type="datetime-local"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full rounded-lg border border-line bg-paper px-2.5 py-2 text-sm text-ink dark:border-line-dark dark:bg-paper-dark dark:text-ink-dark"
            />
            <div className="mt-3 flex justify-end gap-1.5">
              {reminderAt && (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <BellOff className="h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
              <Button size="sm" onClick={handleSet} disabled={!draft}>
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
