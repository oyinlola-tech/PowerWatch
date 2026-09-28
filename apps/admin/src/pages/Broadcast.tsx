import { useState, type FormEvent } from "react";
import { useLocation } from "react-router";
import { LocalPicker } from "../components/LocalPicker";
import { ConfirmDialog } from "../components/Modal";
import { NeighborhoodPicker } from "../components/NeighborhoodPicker";
import Icon from "../components/Icon";
import { Button, Card, Field, Kv, Notice, PageHeader, Spinner } from "../components/ui";
import { ApiError, request } from "../lib/api";
import { formatDateTime, formatNumber, fullName } from "../lib/format";
import { neighborhoodArea, neighborhoodLabel } from "../lib/locationIndex";
import { useLocations } from "../lib/locationsContext";
import { useToast } from "../lib/toastContext";
import type { AdminUser, BroadcastAudience, BroadcastResult, Paged } from "../lib/types";
import { useApi, useDebounced } from "../lib/useApi";

const TITLE_MAX = 100;
const BODY_MAX = 500;
const MAX_USERS = 500;

type AudienceKind = "all" | "users" | "location";
type LocationKind = "neighborhood" | "lga" | "state";

function UsersAudiencePicker({ selected, onChange }: { selected: AdminUser[]; onChange: (users: AdminUser[]) => void }) {
  const [text, setText] = useState("");
  const q = useDebounced(text.trim(), 350);
  const results = useApi(q.length >= 2 ? `broadcast-users:${q}` : null, (signal) =>
    request<Paged<AdminUser>>("/admin/users", { query: { search: q, limit: 20 }, signal }),
  );
  const selectedIds = new Set(selected.map((u) => u.id));
  const atMax = selected.length >= MAX_USERS;

  const toggle = (u: AdminUser) => {
    if (selectedIds.has(u.id)) onChange(selected.filter((s) => s.id !== u.id));
    else if (!atMax) onChange([...selected, u]);
  };

  return (
    <div className="space-y-3">
      <Field label="Search users" hint="First name, last name or email">
        {(p) => (
          <input
            id={p.id}
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type at least 2 characters"
            className={p.className}
          />
        )}
      </Field>

      {q.length >= 2 && (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-line">
          {results.loading && !results.data && (
            <div className="flex justify-center p-4">
              <Spinner label="Searching" />
            </div>
          )}
          {results.error && <p className="p-3 text-sm text-off-ink">{results.error.message}</p>}
          {results.data && results.data.data.length === 0 && <p className="p-3 text-sm text-muted">No users match “{q}”.</p>}
          {results.data?.data.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-soft">
              <input
                type="checkbox"
                checked={selectedIds.has(u.id)}
                disabled={!selectedIds.has(u.id) && atMax}
                onChange={() => toggle(u)}
                className="h-4 w-4 flex-shrink-0 rounded border-line"
              />
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium text-ink">{fullName(u)}</span> <span className="text-muted">{u.email}</span>
              </span>
            </label>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">
            {selected.length} selected{atMax ? ` (maximum ${MAX_USERS})` : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((u) => (
              <span key={u.id} className="inline-flex items-center gap-1 rounded-full bg-info-soft py-1 pl-2.5 pr-1.5 text-xs font-medium text-accent">
                {fullName(u)}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((s) => s.id !== u.id))}
                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-accent/20"
                >
                  <Icon name="close" size={11} label={`Remove ${fullName(u)}`} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Broadcast() {
  const { notify } = useToast();
  const { index } = useLocations();
  const location = useLocation();
  const prefillUser = (location.state as { prefillUser?: AdminUser } | null)?.prefillUser;

  const [kind, setKind] = useState<AudienceKind>(prefillUser ? "users" : "all");
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>(prefillUser ? [prefillUser] : []);
  const [locationKind, setLocationKind] = useState<LocationKind>("neighborhood");
  const [neighborhoodId, setNeighborhoodId] = useState<number | null>(null);
  const [lgaId, setLgaId] = useState<number | null>(null);
  const [stateId, setStateId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checking, setChecking] = useState(false);
  const [preview, setPreview] = useState<{ key: string; data: BroadcastResult } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<(BroadcastResult & { title: string; audienceLabel: string; sentAt: string }) | null>(null);

  const lgaOptions = (index?.tree.lgas ?? []).map((l) => ({ id: l.id, label: l.name, sublabel: index?.stateName.get(l.stateId) }));
  const stateOptions = (index?.tree.states ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));

  const audience: BroadcastAudience | null =
    kind === "all"
      ? { type: "all" }
      : kind === "users"
        ? selectedUsers.length
          ? { type: "users", userIds: selectedUsers.map((u) => u.id) }
          : null
        : locationKind === "neighborhood"
          ? neighborhoodId !== null
            ? { type: "neighborhood", neighborhoodId }
            : null
          : locationKind === "lga"
            ? lgaId !== null
              ? { type: "lga", lgaId }
              : null
            : stateId !== null
              ? { type: "state", stateId }
              : null;

  const describeAudience = (a: BroadcastAudience): string => {
    if (a.type === "all") return "everyone";
    if (a.type === "users") return `${a.userIds.length} selected user${a.userIds.length === 1 ? "" : "s"}`;
    if (a.type === "neighborhood") return `${neighborhoodLabel(index, a.neighborhoodId)} (${neighborhoodArea(index, a.neighborhoodId) || "neighborhood"})`;
    if (a.type === "lga") return `${index?.lgaById.get(a.lgaId)?.name ?? `LGA #${a.lgaId}`} LGA`;
    return `${index?.stateName.get(a.stateId) ?? `state #${a.stateId}`} state`;
  };

  const formKey = JSON.stringify({ audience, title: title.trim(), body: body.trim() });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Enter a title.";
    else if (title.trim().length > TITLE_MAX) next.title = `Titles can be at most ${TITLE_MAX} characters.`;
    if (!body.trim()) next.body = "Enter a message.";
    else if (body.trim().length > BODY_MAX) next.body = `Messages can be at most ${BODY_MAX} characters.`;
    if (!audience) next.audience = "Choose who should receive this message.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const checkAudience = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || !audience) return;
    setChecking(true);
    setErrors((e) => ({ ...e, audience: "" }));
    try {
      const data = await request<BroadcastResult>("/admin/broadcast", {
        method: "POST",
        body: { title: title.trim(), body: body.trim(), audience, dryRun: true },
      });
      setPreview({ key: formKey, data });
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) setErrors((e) => ({ ...e, ...err.fieldErrors }));
      notify(err instanceof ApiError ? err.message : "Couldn't check the audience.", "error");
    } finally {
      setChecking(false);
    }
  };

  const send = async () => {
    if (!audience) return;
    const data = await request<BroadcastResult>("/admin/broadcast", {
      method: "POST",
      body: { title: title.trim(), body: body.trim(), audience },
    });
    setResult({ ...data, title: title.trim(), audienceLabel: describeAudience(audience), sentAt: new Date().toISOString() });
    setTitle("");
    setBody("");
    setPreview(null);
    notify("Message sent.");
  };

  const previewFresh = preview !== null && preview.key === formKey;
  const audienceReady = audience !== null;

  return (
    <>
      <PageHeader
        title="Send a message"
        description="Every recipient gets this in their in-app inbox; those with notifications on also get a push alert. Use it for service announcements, not routine outages."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          <Card title="Audience" description="Who should get this message?">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  ["all", "Everyone"],
                  ["users", "Specific users"],
                  ["location", "A location"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  aria-pressed={kind === value}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition ${
                    kind === value ? "border-accent bg-info-soft text-accent" : "border-line text-body hover:border-accent hover:text-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {kind === "all" && <p className="text-sm text-body">Every resident with notifications enabled gets a push alert; everyone gets it in their inbox.</p>}
              {kind === "users" && <UsersAudiencePicker selected={selectedUsers} onChange={setSelectedUsers} />}
              {kind === "location" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["neighborhood", "Neighborhood"],
                        ["lga", "LGA"],
                        ["state", "State"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLocationKind(value)}
                        aria-pressed={locationKind === value}
                        className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition ${
                          locationKind === value ? "border-accent bg-info-soft text-accent" : "border-line text-body hover:border-accent hover:text-accent"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {locationKind === "neighborhood" && <NeighborhoodPicker value={neighborhoodId} onChange={setNeighborhoodId} label="Neighborhood" />}
                  {locationKind === "lga" && <LocalPicker value={lgaId} onChange={setLgaId} options={lgaOptions} label="LGA" placeholder="Search LGAs" />}
                  {locationKind === "state" && (
                    <LocalPicker
                      value={stateId}
                      onChange={setStateId}
                      options={stateOptions.map((s) => ({ id: s.id, label: s.name }))}
                      label="State"
                      placeholder="Search states"
                    />
                  )}
                  <p className="text-xs text-muted">Everyone living in — or who saved — a neighborhood inside this area is included.</p>
                </div>
              )}
              {errors.audience && <p className="mt-2 text-xs font-medium text-off-ink">{errors.audience}</p>}
            </div>
          </Card>

          <Card title="Message">
            <form onSubmit={checkAudience} noValidate className="space-y-4">
              <Field label="Title" error={errors.title} hint={`${title.trim().length}/${TITLE_MAX} characters`}>
                {(p) => (
                  <input id={p.id} value={title} maxLength={TITLE_MAX} onChange={(e) => { setTitle(e.target.value); setPreview(null); }} aria-invalid={p.invalid || undefined} aria-describedby={p.describedBy} className={p.className} />
                )}
              </Field>
              <Field label="Message" error={errors.body} hint={`${body.trim().length}/${BODY_MAX} characters`}>
                {(p) => (
                  <textarea id={p.id} rows={5} value={body} maxLength={BODY_MAX} onChange={(e) => { setBody(e.target.value); setPreview(null); }} aria-invalid={p.invalid || undefined} aria-describedby={p.describedBy} className={`${p.className} resize-y`} />
                )}
              </Field>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" tone="secondary" icon="search" busy={checking}>
                  Check audience
                </Button>
                <Button type="button" icon="send" disabled={!previewFresh} onClick={() => setConfirming(true)}>
                  Review and send
                </Button>
                {!previewFresh && audienceReady && <p className="text-xs text-muted">Check the audience to see who this reaches before sending.</p>}
              </div>

              {preview && previewFresh && (
                <Notice tone="info" title="Audience checked">
                  <Kv
                    items={[
                      ["Recipients", formatNumber(preview.data.recipients)],
                      ["Will get a push", formatNumber(preview.data.pushEnabledRecipients)],
                      ["Devices found", formatNumber(preview.data.devices)],
                    ]}
                  />
                </Notice>
              )}
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Preview" description="Roughly how it appears on a phone's lock screen.">
            <div className="rounded-2xl bg-soft p-4">
              <div className="flex items-start gap-3 rounded-xl bg-card p-3 shadow-sm">
                <img src="/brand/favicon.png" alt="" width={36} height={36} className="h-9 w-9 rounded-lg" />
                <div className="min-w-0">
                  <p className="text-xs text-muted">PowerWatch · now</p>
                  <p className="break-words text-sm font-semibold text-ink">{title.trim() || "Title"}</p>
                  <p className="line-clamp-4 break-words text-sm text-body">{body.trim() || "Your message"}</p>
                </div>
              </div>
            </div>
          </Card>

          {result && (
            <Card title="Last message sent" description={`“${result.title}” to ${result.audienceLabel} at ${formatDateTime(result.sentAt)}`}>
              <Kv
                items={[
                  ["Recipients", formatNumber(result.recipients)],
                  ["Push-enabled recipients", formatNumber(result.pushEnabledRecipients)],
                  ["Devices found", formatNumber(result.devices)],
                  ["Push delivered", formatNumber(result.pushSent)],
                  ["Push failed", formatNumber(result.pushFailed)],
                ]}
              />
              {result.devices === 0 && (
                <div className="mt-4">
                  <Notice tone="warn">No registered devices were found. Everyone in the audience still received it in their in-app inbox.</Notice>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={send}
        tone="danger"
        title="Send this message?"
        confirmLabel="Send message"
      >
        {audience && preview && (
          <>
            <p>
              <strong className="text-ink">“{title.trim()}”</strong> will go to <strong className="text-ink">{describeAudience(audience)}</strong>.
            </p>
            <Kv
              items={[
                ["Recipients", formatNumber(preview.data.recipients)],
                ["Will get a push", formatNumber(preview.data.pushEnabledRecipients)],
                ["Devices found", formatNumber(preview.data.devices)],
              ]}
            />
            <p className="font-semibold text-off-ink">A sent message cannot be recalled.</p>
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
