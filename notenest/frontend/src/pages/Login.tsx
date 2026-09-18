import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NotebookPen } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@notenest.app");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <NotebookPen className="h-9 w-9 text-accent" />
          <h1 className="font-display text-2xl font-semibold text-ink dark:text-ink-dark">
            Welcome back to NoteNest
          </h1>
          <p className="text-sm text-ink/50 dark:text-ink-dark/50">
            Sign in to pick up right where you left off.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-paper-card p-6 shadow-card dark:border-line-dark dark:bg-paper-darkcard"
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button type="submit" isLoading={isLoading} className="mt-1 w-full">
            Sign in
          </Button>
          <p className="text-center font-mono text-[11px] text-ink/40 dark:text-ink-dark/40">
            Demo account is pre-filled — just hit sign in.
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60 dark:text-ink-dark/60">
          New here?{" "}
          <Link to="/register" className="font-medium text-ink underline dark:text-ink-dark">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
