import { useState, type FormEvent } from "react";
import { Button, Field, Notice } from "../components/ui";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { ApiError, errorMessage } from "../lib/api";
import { useAuth } from "../lib/authContext";

export default function Login() {
  const { signIn, notice } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    const local: Record<string, string> = {};
    if (!email.trim()) local.email = "Enter your email address.";
    if (!password) local.password = "Enter your password.";
    if (Object.keys(local).length) {
      setFieldErrors(local);
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setBusy(false);
      setPassword("");
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors);
      setError(errorMessage(err));
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-screen">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <Logo height={34} />
            <p className="rounded-md bg-info-soft px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">Admin dashboard</p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6 shadow-sm sm:p-8">
            <h1 className="text-xl font-bold text-ink">Sign in</h1>
            <p className="mt-1 text-sm text-body">Use your PowerWatch administrator account.</p>

            <div className="mt-5 space-y-3" aria-live="polite">
              {notice && !error && <Notice tone="info">{notice}</Notice>}
              {error && <Notice tone="error">{error}</Notice>}
            </div>

            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
              <Field label="Email" error={fieldErrors.email}>
                {(p) => (
                  <input
                    id={p.id}
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={p.invalid || undefined}
                    aria-describedby={p.describedBy}
                    className={p.className}
                    required
                  />
                )}
              </Field>
              <Field label="Password" error={fieldErrors.password}>
                {(p) => (
                  <input
                    id={p.id}
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={p.invalid || undefined}
                    aria-describedby={p.describedBy}
                    className={p.className}
                    required
                  />
                )}
              </Field>
              <Button type="submit" busy={busy} className="w-full">
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Your session ends when you close this browser tab or window.
          </p>
        </div>
      </main>
    </div>
  );
}
