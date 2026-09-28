import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { EmptyState, ResourceView } from "../components/DataState";
import Icon from "../components/Icon";
import { ConfirmDialog } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Field, Notice, PageHeader } from "../components/ui";
import { request } from "../lib/api";
import { useAuth } from "../lib/authContext";
import { formatDate, formatDateTime, fullName, isDeletedAccount } from "../lib/format";
import { useToast } from "../lib/toastContext";
import type { AdminUser, Paged } from "../lib/types";
import { useApi, useDebounced } from "../lib/useApi";

type Action = "suspend" | "unsuspend" | "delete";

export default function Users() {
  const { user: me } = useAuth();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState("");
  const search = useDebounced(text.trim(), 350);
  const role = params.get("role") ?? "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Number(params.get("limit")) || 20;
  const [pending, setPending] = useState<{ action: Action; user: AdminUser } | null>(null);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    setParams(next, { replace: true });
  };

  const users = useApi(`users:${search}|${role}|${page}|${limit}`, (signal) =>
    request<Paged<AdminUser>>("/admin/users", { query: { search, role, page, limit }, signal }),
  );

  const run = async () => {
    if (!pending) return;
    const { action, user } = pending;
    if (action === "delete") {
      await request(`/admin/users/${user.id}`, { method: "DELETE" });
      notify(`${fullName(user)}'s account was deleted.`);
    } else {
      await request(`/admin/users/${user.id}/${action}`, { method: "POST" });
      notify(action === "suspend" ? `${fullName(user)} is suspended.` : `${fullName(user)} can sign in again.`);
    }
    users.reload();
  };

  const canModify = (u: AdminUser) => u.role !== "ADMIN" && u.id !== me?.id && !isDeletedAccount(u.email);

  return (
    <>
      <PageHeader
        title="Users"
        description="Find accounts, suspend or restore access, and delete accounts. Admin accounts cannot be changed here."
        actions={<Button tone="secondary" icon="refresh" onClick={users.reload} busy={users.loading}>Refresh</Button>}
      />

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Field label="Search" hint="First name, last name or email">
            {(p) => (
              <input id={p.id} type="search" value={text} onChange={(e) => { setText(e.target.value); update({ page: null }); }} aria-describedby={p.describedBy} className={p.className} />
            )}
          </Field>
          <Field label="Role">
            {(p) => (
              <select id={p.id} value={role} onChange={(e) => update({ role: e.target.value, page: null })} className={p.className}>
                <option value="">All roles</option>
                <option value="USER">Residents (USER)</option>
                <option value="ADMIN">Admins</option>
              </select>
            )}
          </Field>
        </div>

        <div className="mb-4">
          <Notice tone="info">
            The API does not say whether an account is currently suspended, so both Suspend and Restore are offered. Each is safe to repeat.
          </Notice>
        </div>

        <ResourceView
          {...users}
          isEmpty={(p) => p.data.length === 0}
          empty={<EmptyState title="No users found">{search || role ? "Try a different search or role." : "No accounts exist yet."}</EmptyState>}
        >
          {(p) => (
            <>
              <Table
                caption="Users"
                head={<><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Email verified</Th><Th>Push alerts</Th><Th>Joined</Th><Th className="text-right">Actions</Th></>}
              >
                {p.data.map((u) => {
                  const deleted = isDeletedAccount(u.email);
                  return (
                    <tr key={u.id}>
                      <Td className="font-medium">
                        {fullName(u)}
                        {u.id === me?.id && <span className="ml-2 text-xs font-normal text-muted">(you)</span>}
                      </Td>
                      <Td className="max-w-[16rem] break-all text-body">{deleted ? <Badge tone="warn">Deleted account</Badge> : u.email}</Td>
                      <Td>{u.role === "ADMIN" ? <Badge tone="info">Admin</Badge> : <Badge>Resident</Badge>}</Td>
                      <Td>{u.emailVerified ? <Badge tone="on">Verified</Badge> : <Badge>Not verified</Badge>}</Td>
                      <Td className="text-body">{u.notificationEnabled ? "On" : "Off"}</Td>
                      <Td className="whitespace-nowrap text-body" >
                        <span title={formatDateTime(u.createdAt)}>{formatDate(u.createdAt)}</span>
                      </Td>
                      <Td>
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {!deleted && (
                            <Link
                              to="/broadcast"
                              state={{ prefillUser: u }}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                            >
                              <Icon name="send" size={16} /> Message<span className="sr-only"> {fullName(u)}</span>
                            </Link>
                          )}
                          {canModify(u) && (
                            <>
                              <Button size="sm" tone="warning" icon="pause" onClick={() => setPending({ action: "suspend", user: u })}>
                                Suspend<span className="sr-only"> {fullName(u)}</span>
                              </Button>
                              <Button size="sm" tone="secondary" icon="play" onClick={() => setPending({ action: "unsuspend", user: u })}>
                                Restore<span className="sr-only"> {fullName(u)}</span>
                              </Button>
                              <Button size="sm" tone="ghost" icon="trash" className="text-off-ink hover:text-off-ink" onClick={() => setPending({ action: "delete", user: u })}>
                                Delete<span className="sr-only"> {fullName(u)}</span>
                              </Button>
                            </>
                          )}
                        </div>
                        {!canModify(u) && (
                          <p className="mt-1 text-right text-xs text-muted">
                            {deleted ? "Already deleted" : u.id === me?.id ? "Your account" : "Admins can't be changed"}
                          </p>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </Table>
              <Pagination
                pagination={p.pagination}
                onPage={(n) => update({ page: String(n) })}
                onLimit={(n) => update({ limit: String(n), page: null })}
                noun="users"
              />
            </>
          )}
        </ResourceView>
      </Card>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={run}
        tone={pending?.action === "unsuspend" ? "primary" : pending?.action === "suspend" ? "warning" : "danger"}
        title={
          pending?.action === "delete" ? "Delete this account?" : pending?.action === "suspend" ? "Suspend this account?" : "Restore this account?"
        }
        confirmLabel={pending?.action === "delete" ? "Delete account" : pending?.action === "suspend" ? "Suspend" : "Restore access"}
      >
        {pending && (
          <>
            <p>
              <strong className="text-ink">{fullName(pending.user)}</strong> ({pending.user.email})
            </p>
            {pending.action === "suspend" && (
              <ul className="list-disc space-y-1 pl-5">
                <li>They can't sign in or refresh their session until restored.</li>
                <li>All their sessions are revoked and their push devices removed.</li>
                <li>An app already open may keep working for a few minutes until its access token expires.</li>
              </ul>
            )}
            {pending.action === "unsuspend" && <p>They will be able to sign in again. Their devices re-register for push alerts when they next sign in.</p>}
            {pending.action === "delete" && (
              <ul className="list-disc space-y-1 pl-5">
                <li>Their name, email, password, home location, devices, sessions, saved places and notifications are erased.</li>
                <li>Their ON/OFF reports stay (without GPS), so neighborhood history remains accurate.</li>
                <li className="font-semibold text-off-ink">This cannot be undone.</li>
              </ul>
            )}
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
