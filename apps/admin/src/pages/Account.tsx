import { useState, type FormEvent } from "react";
import { EmptyState, ResourceView } from "../components/DataState";
import Icon from "../components/Icon";
import { ConfirmDialog } from "../components/Modal";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Field, Kv, Notice, PageHeader } from "../components/ui";
import { ApiError, errorMessage, request } from "../lib/api";
import { useAuth } from "../lib/authContext";
import { formatDateTime, fullName } from "../lib/format";
import { useToast } from "../lib/toastContext";
import type { Profile, Session } from "../lib/types";
import { useApi } from "../lib/useApi";

const describe = (s: Session) =>
  [s.deviceName, s.browser, s.platform].filter(Boolean).join(" · ") || s.deviceType || "Unknown device";

const PASSWORD_POLICY: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  invalid,
  describedBy,
  className,
  visibleLabel,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  invalid: boolean;
  describedBy: string | undefined;
  className: string;
  visibleLabel: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={`${className} pr-10`}
        required
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? `Hide ${visibleLabel}` : `Show ${visibleLabel}`}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-soft hover:text-ink"
      >
        <Icon name="eye" size={16} />
      </button>
    </div>
  );
}

function ChangePasswordCard() {
  const { endLocalSession } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const policyMet = PASSWORD_POLICY.every((rule) => rule.test(newPassword));
  const canSubmit = currentPassword.length > 0 && policyMet && newPassword === confirmPassword;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setErrors({});
    if (!policyMet) {
      setErrors({ newPassword: "Password does not meet the requirements below." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmNewPassword: "Passwords do not match." });
      return;
    }
    setBusy(true);
    try {
      await request("/auth/change-password", {
        method: "PATCH",
        body: { currentPassword, newPassword, confirmNewPassword: confirmPassword },
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // The API revokes every session (including this one) on a password change, so return to sign-in.
      setTimeout(() => endLocalSession("Your password was changed. Sign in again with your new password."), 1600);
    } catch (err) {
      setBusy(false);
      setCurrentPassword("");
      if (err instanceof ApiError) {
        const fieldErrors = { ...err.fieldErrors };
        if (!Object.keys(fieldErrors).length) {
          const message = err.message.toLowerCase();
          if (message.includes("current password")) fieldErrors.currentPassword = err.message;
          else if (message.includes("different from current")) fieldErrors.newPassword = err.message;
          else fieldErrors.general = err.message;
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ general: errorMessage(err) });
      }
    }
  };

  return (
    <Card title="Change password" description="Changing your password signs you out of every device, including this one.">
      {success ? (
        <Notice tone="success" title="Password changed">
          Signing you out so you can sign back in with your new password…
        </Notice>
      ) : (
        <form onSubmit={submit} noValidate className="max-w-md space-y-4">
          {errors.general && <Notice tone="error">{errors.general}</Notice>}

          <Field label="Current password" error={errors.currentPassword}>
            {(p) => (
              <PasswordInput
                id={p.id}
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
                invalid={p.invalid}
                describedBy={p.describedBy}
                className={p.className}
                visibleLabel="current password"
              />
            )}
          </Field>

          <div>
            <Field label="New password" error={errors.newPassword}>
              {(p) => (
                <PasswordInput
                  id={p.id}
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                  invalid={p.invalid}
                  describedBy={p.describedBy}
                  className={p.className}
                  visibleLabel="new password"
                />
              )}
            </Field>
            {newPassword.length > 0 && (
              <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {PASSWORD_POLICY.map((rule) => {
                  const ok = rule.test(newPassword);
                  return (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? "text-on-ink" : "text-muted"}`}>
                      <Icon name={ok ? "check" : "close"} size={12} className="flex-shrink-0" />
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Field label="Confirm new password" error={errors.confirmNewPassword}>
            {(p) => (
              <PasswordInput
                id={p.id}
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                invalid={p.invalid}
                describedBy={p.describedBy}
                className={p.className}
                visibleLabel="password confirmation"
              />
            )}
          </Field>

          <Button type="submit" busy={busy} disabled={!canSubmit}>
            {busy ? "Changing…" : "Change password"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function Account() {
  const { endLocalSession, signOut } = useAuth();
  const { notify } = useToast();
  const profile = useApi("me", (signal) => request<Profile>("/auth/me", { signal }));
  const sessions = useApi("sessions", (signal) => request<Session[]>("/auth/sessions", { signal }));
  const [revoking, setRevoking] = useState<Session | null>(null);
  const [everywhere, setEverywhere] = useState(false);

  const revoke = async () => {
    if (!revoking) return;
    if (revoking.isCurrent) {
      await signOut();
      return;
    }
    await request(`/auth/sessions/${revoking.id}`, { method: "DELETE" });
    notify("That session was signed out.");
    sessions.reload();
  };

  const signOutEverywhere = async () => {
    await request("/auth/logout-all", { method: "POST" });
    endLocalSession("You were signed out on every device.");
  };

  return (
    <>
      <PageHeader title="Account" description="Your administrator profile and where you are signed in." />
      <div className="mb-6">
        <ChangePasswordCard />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card title="Profile">
          <ResourceView {...profile}>
            {(p) => (
              <Kv
                items={[
                  ["Name", fullName(p)],
                  ["Email", p.email],
                  ["Role", <Badge key="r" tone="info">{p.role}</Badge>],
                  ["Email verified", p.emailVerified ? "Yes" : "No"],
                  ["Account created", formatDateTime(p.createdAt)],
                ]}
              />
            )}
          </ResourceView>
        </Card>
        <Card
          title="Signed-in sessions"
          description="Every device or browser holding a session for this account."
          actions={<Button tone="danger" size="sm" icon="logout" onClick={() => setEverywhere(true)}>Sign out everywhere</Button>}
        >
          <ResourceView {...sessions} isEmpty={(s) => s.length === 0} empty={<EmptyState title="No active sessions" />}>
            {(list) => (
              <Table caption="Signed-in sessions" head={<><Th>Device</Th><Th>IP address</Th><Th>Last active</Th><Th>Expires</Th><Th /></>}>
                {list.map((s) => (
                  <tr key={s.id}>
                    <Td className="font-medium">
                      {describe(s)} {s.isCurrent && <Badge tone="info">This browser</Badge>}
                    </Td>
                    <Td className="text-body">{s.ipAddress ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-body">{formatDateTime(s.lastActivityAt)}</Td>
                    <Td className="whitespace-nowrap text-body">{formatDateTime(s.expiresAt)}</Td>
                    <Td className="text-right">
                      <Button size="sm" tone="secondary" onClick={() => setRevoking(s)}>
                        Sign out<span className="sr-only"> {describe(s)}</span>
                      </Button>
                    </Td>
                  </tr>
                ))}
              </Table>
            )}
          </ResourceView>
        </Card>
      </div>

      <ConfirmDialog open={revoking !== null} onClose={() => setRevoking(null)} onConfirm={revoke} tone="warning" title="Sign out this session?" confirmLabel="Sign out session">
        {revoking && (
          <p>
            <strong className="text-ink">{describe(revoking)}</strong> ({revoking.ipAddress ?? "unknown IP"}, last active {formatDateTime(revoking.lastActivityAt)})
            {revoking.isCurrent ? " is this browser, so you will return to the sign-in screen." : " will need to sign in again."}
          </p>
        )}
      </ConfirmDialog>
      <ConfirmDialog open={everywhere} onClose={() => setEverywhere(false)} onConfirm={signOutEverywhere} title="Sign out everywhere?" confirmLabel="Sign out everywhere">
        <p>Every session of this admin account, including this browser and the mobile app, is ended. You will need to sign in again.</p>
      </ConfirmDialog>
    </>
  );
}
