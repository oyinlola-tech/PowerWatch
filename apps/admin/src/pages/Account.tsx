import { useState } from "react";
import { EmptyState, ResourceView } from "../components/DataState";
import { ConfirmDialog } from "../components/Modal";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Kv, PageHeader } from "../components/ui";
import { request } from "../lib/api";
import { useAuth } from "../lib/authContext";
import { formatDateTime, fullName } from "../lib/format";
import { useToast } from "../lib/toastContext";
import type { Profile, Session } from "../lib/types";
import { useApi } from "../lib/useApi";

const describe = (s: Session) =>
  [s.deviceName, s.browser, s.platform].filter(Boolean).join(" · ") || s.deviceType || "Unknown device";

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
