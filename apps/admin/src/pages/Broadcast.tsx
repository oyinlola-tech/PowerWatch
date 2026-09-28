import { useState, type FormEvent } from "react";
import { ConfirmDialog } from "../components/Modal";
import { Button, Card, Field, Kv, Notice, PageHeader } from "../components/ui";
import { ApiError, request } from "../lib/api";
import { formatDateTime, formatNumber } from "../lib/format";
import { useToast } from "../lib/toastContext";
import type { BroadcastResult } from "../lib/types";

const TITLE_MAX = 200;
const BODY_MAX = 1000;

export default function Broadcast() {
  const { notify } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<(BroadcastResult & { title: string; sentAt: string }) | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Enter a title.";
    else if (title.trim().length > TITLE_MAX) next.title = `Titles can be at most ${TITLE_MAX} characters.`;
    if (!body.trim()) next.body = "Enter a message.";
    else if (body.trim().length > BODY_MAX) next.body = `Messages can be at most ${BODY_MAX} characters.`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const review = (event: FormEvent) => {
    event.preventDefault();
    if (validate()) setConfirming(true);
  };

  const send = async () => {
    try {
      const data = await request<BroadcastResult>("/admin/broadcast", {
        method: "POST",
        body: { title: title.trim(), body: body.trim() },
      });
      setResult({ ...data, title: title.trim(), sentAt: new Date().toISOString() });
      setTitle("");
      setBody("");
      notify("Broadcast sent.");
    } catch (err) {
      // Field errors belong next to the fields; close the dialog so they are visible.
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length) {
        setErrors(err.fieldErrors);
        setConfirming(false);
      }
      throw err;
    }
  };

  return (
    <>
      <PageHeader
        title="Broadcast"
        description="Send a push notification to every resident who has the app installed with notifications allowed. Use it for service announcements, not routine outages."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="New broadcast">
          <form onSubmit={review} noValidate className="space-y-4">
            <Field label="Title" error={errors.title} hint={`${title.trim().length}/${TITLE_MAX} characters`}>
              {(p) => (
                <input id={p.id} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} aria-invalid={p.invalid || undefined} aria-describedby={p.describedBy} className={p.className} />
              )}
            </Field>
            <Field label="Message" error={errors.body} hint={`${body.trim().length}/${BODY_MAX} characters`}>
              {(p) => (
                <textarea id={p.id} rows={5} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} aria-invalid={p.invalid || undefined} aria-describedby={p.describedBy} className={`${p.className} resize-y`} />
              )}
            </Field>
            <Button type="submit" icon="send">Review and send</Button>
          </form>
        </Card>

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
            <Card title="Last broadcast" description={`“${result.title}” at ${formatDateTime(result.sentAt)}`}>
              <Kv
                items={[
                  ["Residents reached", formatNumber(result.totalUsers)],
                  ["Devices found", formatNumber(result.devicesFound)],
                  ["Delivered to push service", formatNumber(result.pushSuccess)],
                  ["Failed", formatNumber(result.pushFailed)],
                ]}
              />
              {result.devicesFound === 0 && (
                <div className="mt-4">
                  <Notice tone="warn">No registered devices were found, so nobody received a push. The message was not logged for anyone.</Notice>
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
        title="Send to everyone?"
        confirmLabel="Send broadcast"
      >
        <p>
          <strong className="text-ink">“{title.trim()}”</strong> will be pushed to <strong className="text-ink">every resident</strong> with a
          registered device (suspended and deleted accounts are skipped) and saved in each one's notification list.
        </p>
        <p className="font-semibold text-off-ink">A sent broadcast cannot be recalled.</p>
      </ConfirmDialog>
    </>
  );
}
