import { useState } from "react";
import { Check, Copy, Loader2, Sparkles, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { AI_ACTION_LABELS, AIAction, aiApi } from "@/api/ai.api";
import { getErrorMessage } from "@/api/axios";
import { Button } from "@/components/ui/Button";

const ACTIONS: AIAction[] = ["summarize", "grammar", "improve", "actionItems", "rewrite"];

interface AIAssistantMenuProps {
  getText: () => string;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
}

/**
 * A self-contained AI Assistant popover. Reads the note's current plain
 * text on demand (via `getText`), sends it to POST /api/ai, and lets the
 * user choose what to do with the result. The backend decides whether to
 * use a real provider or the local fallback — this component doesn't
 * need to know which.
 */
export function AIAssistantMenu({ getText, onInsert, onReplace }: AIAssistantMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function runAction(action: AIAction) {
    const text = getText().trim();
    if (!text) {
      toast.error("Write something in the note first");
      return;
    }
    setActiveAction(action);
    setResult(null);
    try {
      const { result: output } = await aiApi.run(action, text);
      setResult(output);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActiveAction(null);
    }
  }

  function reset() {
    setResult(null);
    setActiveAction(null);
    setIsOpen(false);
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        title="AI Assistant"
        aria-label="AI Assistant"
        aria-expanded={isOpen}
        className={`rounded-lg p-2 transition-colors ${
          isOpen
            ? "bg-ink text-paper dark:bg-accent dark:text-ink"
            : "text-ink/50 hover:bg-line/50 dark:text-ink-dark/50 dark:hover:bg-line-dark/50"
        }`}
      >
        <Sparkles className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={reset} />
          <div className="absolute right-0 top-11 z-20 w-72 rounded-xl border border-line bg-paper-card p-2 shadow-card-hover dark:border-line-dark dark:bg-paper-darkcard animate-scale-in">
            {!result ? (
              <div className="flex flex-col gap-0.5">
                <p className="flex items-center gap-1.5 px-2 py-1.5 font-mono text-[11px] uppercase tracking-wider text-ink/40 dark:text-ink-dark/40">
                  <Wand2 className="h-3 w-3" /> AI Assistant
                </p>
                {ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => runAction(action)}
                    disabled={activeAction !== null}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-ink/80 hover:bg-line/50 disabled:opacity-50 dark:text-ink-dark/80 dark:hover:bg-line-dark/50"
                  >
                    {AI_ACTION_LABELS[action]}
                    {activeAction === action && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-1">
                <div className="flex items-center justify-between px-1">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ink/40 dark:text-ink-dark/40">
                    Result
                  </p>
                  <button
                    onClick={copyResult}
                    title="Copy to clipboard"
                    className="rounded p-1 text-ink/40 hover:bg-line/50 dark:text-ink-dark/40 dark:hover:bg-line-dark/50"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto scrollbar-thin rounded-lg bg-line/30 px-3 py-2 text-sm leading-relaxed text-ink/80 dark:bg-line-dark/30 dark:text-ink-dark/80">
                  {result}
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button variant="ghost" size="sm" onClick={reset}>
                    Discard
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      onInsert(result);
                      reset();
                    }}
                  >
                    Insert
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      onReplace(result);
                      reset();
                    }}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
