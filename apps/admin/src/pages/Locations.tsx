import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { EmptyState, ErrorState, LoadingState } from "../components/DataState";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { paginate } from "../lib/paginate";
import { Table, Td, Th } from "../components/Table";
import { Badge, Button, Card, Field, Notice, PageHeader } from "../components/ui";
import { ApiError, errorMessage, request } from "../lib/api";
import { formatNumber } from "../lib/format";
import type { LocationIndex } from "../lib/locationIndex";
import { useLocations } from "../lib/locationsContext";
import { useToast } from "../lib/toastContext";
import type { LocationLevel } from "../lib/types";

const LEVELS: LocationLevel[] = ["state", "lga", "city", "town", "neighborhood"];
const LEVEL_LABEL: Record<LocationLevel, string> = { state: "State", lga: "LGA", city: "City", town: "Town", neighborhood: "Neighborhood" };
const PLURAL: Record<LocationLevel, string> = { state: "states", lga: "LGAs", city: "cities", town: "towns", neighborhood: "neighborhoods" };

interface Row {
  type: LocationLevel;
  id: number;
  name: string;
  children: number | null;
  path: string;
}

/** Parent chain ("Badagry, Ikeja, Lagos") above any location. */
function pathOf(index: LocationIndex, type: LocationLevel, id: number): string {
  const townId = type === "neighborhood" ? index.neighborhoodById.get(id)?.townId : type === "town" ? id : undefined;
  const cityId = townId !== undefined ? index.townById.get(townId)?.cityId : type === "city" ? id : undefined;
  const lgaId = cityId !== undefined ? index.cityById.get(cityId)?.lgaId : type === "lga" ? id : undefined;
  const stateId = lgaId !== undefined ? index.lgaById.get(lgaId)?.stateId : type === "state" ? id : undefined;
  const chain: [LocationLevel, string | undefined][] = [
    ["town", townId !== undefined ? index.townById.get(townId)?.name : undefined],
    ["city", cityId !== undefined ? index.cityById.get(cityId)?.name : undefined],
    ["lga", lgaId !== undefined ? index.lgaById.get(lgaId)?.name : undefined],
    ["state", stateId !== undefined ? index.stateName.get(stateId) : undefined],
  ];
  return chain
    .filter(([level, name]) => name && LEVELS.indexOf(level) < LEVELS.indexOf(type))
    .map(([, name]) => name)
    .join(", ");
}

function childrenOf(index: LocationIndex, type: LocationLevel, parentId: number | null): Row[] {
  const t = index.tree;
  const count = (list: { id: number }[]) => list.length;
  switch (type) {
    case "state":
      return t.states.map((s) => ({ type, id: s.id, name: s.name, children: count(t.lgas.filter((l) => l.stateId === s.id)), path: "" }));
    case "lga":
      return t.lgas.filter((l) => l.stateId === parentId).map((l) => ({ type, id: l.id, name: l.name, children: count(t.cities.filter((c) => c.lgaId === l.id)), path: "" }));
    case "city":
      return t.cities.filter((c) => c.lgaId === parentId).map((c) => ({ type, id: c.id, name: c.name, children: count(t.towns.filter((x) => x.cityId === c.id)), path: "" }));
    case "town":
      return t.towns.filter((x) => x.cityId === parentId).map((x) => ({ type, id: x.id, name: x.name, children: count(t.neighborhoods.filter((n) => n.townId === x.id)), path: "" }));
    case "neighborhood":
      return t.neighborhoods.filter((n) => n.townId === parentId).map((n) => ({ type, id: n.id, name: n.name, children: null, path: "" }));
  }
}

function nameOf(index: LocationIndex, type: LocationLevel, id: number) {
  switch (type) {
    case "state":
      return index.stateName.get(id);
    case "lga":
      return index.lgaById.get(id)?.name;
    case "city":
      return index.cityById.get(id)?.name;
    case "town":
      return index.townById.get(id)?.name;
    case "neighborhood":
      return index.neighborhoodById.get(id)?.name;
  }
}

export default function Locations() {
  const { index, error, loading, reload } = useLocations();
  const { notify } = useToast();
  const [params, setParams] = useSearchParams();
  const [text, setText] = useState("");
  const [everywhere, setEverywhere] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [editing, setEditing] = useState<Row | null>(null);

  // Drill-down path: ?state=1&lga=2&city=3&town=4
  const trail = LEVELS.slice(0, 4).map((level) => ({ level, id: Number(params.get(level)) || null }));
  const depth = trail.findIndex((t) => t.id === null);
  const currentLevel: LocationLevel = LEVELS[depth === -1 ? 4 : depth] ?? "state";
  const parentLevel = depth === -1 ? "town" : depth > 0 ? LEVELS[depth - 1] : undefined;
  const parentId: number | null = parentLevel ? Number(params.get(parentLevel)) || null : null;

  const rows = useMemo(() => {
    if (!index) return [];
    const needle = text.trim().toLowerCase();
    if (everywhere && needle.length >= 2) {
      const matches: Row[] = [];
      const t = index.tree;
      const add = (type: LocationLevel, list: { id: number; name: string }[]) => {
        for (const item of list) {
          if (item.name.toLowerCase().includes(needle)) matches.push({ type, id: item.id, name: item.name, children: null, path: pathOf(index, type, item.id) });
        }
      };
      add("state", t.states);
      add("lga", t.lgas);
      add("city", t.cities);
      add("town", t.towns);
      add("neighborhood", t.neighborhoods);
      return matches;
    }
    const list = childrenOf(index, currentLevel, parentId);
    return needle ? list.filter((r) => r.name.toLowerCase().includes(needle)) : list;
  }, [index, text, everywhere, currentLevel, parentId]);

  const { rows: pageRows, pagination } = paginate(rows, page, limit);

  const open = (level: LocationLevel, id: number) => {
    const next = new URLSearchParams();
    const levelIndex = LEVELS.indexOf(level);
    for (const t of trail.slice(0, levelIndex)) if (t.id) next.set(t.level, String(t.id));
    next.set(level, String(id));
    setParams(next);
    setText("");
    setPage(1);
  };

  const goTo = (levelIndex: number) => {
    const next = new URLSearchParams();
    for (const t of trail.slice(0, levelIndex)) if (t.id) next.set(t.level, String(t.id));
    setParams(next);
    setText("");
    setPage(1);
  };

  const crumbs = index
    ? trail.filter((t) => t.id !== null).map((t, i) => ({ label: nameOf(index, t.level, t.id as number) ?? `#${t.id}`, level: t.level, index: i + 1 }))
    : [];

  return (
    <>
      <PageHeader
        title="Locations"
        description="Browse the location hierarchy and correct names. Residents see the new name in the app right away."
        actions={<Button tone="secondary" icon="refresh" onClick={reload} busy={loading}>Refresh</Button>}
      />

      {error ? (
        <Card><ErrorState error={error} onRetry={reload} /></Card>
      ) : !index ? (
        <Card><LoadingState label="Loading locations…" /></Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {(
              [
                ["Country", index.tree.countries.map((c) => c.name).join(", ") || "—"],
                ["States", formatNumber(index.tree.states.length)],
                ["LGAs", formatNumber(index.tree.lgas.length)],
                ["Cities", formatNumber(index.tree.cities.length)],
                ["Towns", formatNumber(index.tree.towns.length)],
                ["Neighborhoods", formatNumber(index.tree.neighborhoods.length)],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-line bg-card p-3">
                <p className="text-xs font-medium text-muted">{label}</p>
                <p className="mt-1 truncate text-lg font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>

          <Card>
            <nav aria-label="Location path" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1 text-sm">
                <li>
                  <button type="button" onClick={() => goTo(0)} className="rounded px-1 font-semibold text-accent hover:underline" aria-current={crumbs.length === 0 && !everywhere ? "page" : undefined}>
                    All states
                  </button>
                </li>
                {crumbs.map((c) => (
                  <li key={c.level} className="flex items-center gap-1">
                    <span aria-hidden className="text-muted">/</span>
                    <button type="button" onClick={() => goTo(c.index)} className="rounded px-1 font-semibold text-accent hover:underline" aria-current={c.index === crumbs.length ? "page" : undefined}>
                      {c.label}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mb-4 grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Field label={everywhere ? "Search every level" : `Filter ${PLURAL[currentLevel]}`} hint={everywhere ? "Type at least two letters" : undefined}>
                {(p) => (
                  <input id={p.id} type="search" value={text} onChange={(e) => { setText(e.target.value); setPage(1); }} aria-describedby={p.describedBy} className={p.className} />
                )}
              </Field>
              <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={everywhere} onChange={(e) => { setEverywhere(e.target.checked); setPage(1); }} className="h-4 w-4 accent-[var(--color-primary)]" />
                Search all levels
              </label>
            </div>

            {rows.length === 0 ? (
              <EmptyState title={everywhere && text.trim().length < 2 ? "Type a name to search" : "Nothing matches"}>
                {everywhere ? "Names are matched anywhere in the hierarchy." : `No ${PLURAL[currentLevel]} here match your filter.`}
              </EmptyState>
            ) : (
              <>
                <Table
                  caption={`Locations: ${PLURAL[currentLevel]}`}
                  head={<><Th>Name</Th><Th>Level</Th><Th>{everywhere ? "Inside" : "Contains"}</Th><Th>ID</Th><Th className="text-right">Actions</Th></>}
                >
                  {pageRows.map((r) => (
                    <tr key={`${r.type}-${r.id}`}>
                      <Td className="font-medium">{r.name}</Td>
                      <Td><Badge>{LEVEL_LABEL[r.type]}</Badge></Td>
                      <Td className="text-body">
                        {everywhere
                          ? r.path || "—"
                          : r.children === null
                            ? "—"
                            : `${formatNumber(r.children)} ${PLURAL[LEVELS[LEVELS.indexOf(r.type) + 1] ?? "neighborhood"]}`}
                      </Td>
                      <Td className="tabular-nums text-muted">{r.id}</Td>
                      <Td>
                        <div className="flex justify-end gap-1.5">
                          {r.type !== "neighborhood" && !everywhere && (
                            <Button size="sm" tone="secondary" icon="chevronRight" onClick={() => open(r.type, r.id)}>
                              Open<span className="sr-only"> {r.name}</span>
                            </Button>
                          )}
                          <Button size="sm" tone="ghost" icon="pencil" onClick={() => setEditing(r)}>
                            Rename<span className="sr-only"> {r.name}</span>
                          </Button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </Table>
                <Pagination pagination={pagination} onPage={setPage} onLimit={(l) => { setLimit(l); setPage(1); }} noun={everywhere ? "matches" : PLURAL[currentLevel]} />
              </>
            )}
          </Card>
        </>
      )}

      {editing && (
        <RenameDialog
          key={`${editing.type}-${editing.id}`}
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={(name) => {
            notify(`${LEVEL_LABEL[editing.type]} renamed to “${name}”.`);
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function RenameDialog({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: (name: string) => void }) {
  const [name, setName] = useState(row.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    setError(null);
    setFieldError(undefined);
    if (!trimmed) return setFieldError("Enter a name.");
    if (trimmed.length > 100) return setFieldError("Names can be at most 100 characters.");
    if (trimmed === row.name) return setFieldError("The name hasn't changed.");
    setBusy(true);
    try {
      await request("/admin/locations", { method: "PATCH", body: { type: row.type, id: row.id, name: trimmed } });
      onSaved(trimmed);
    } catch (err) {
      setBusy(false);
      if (err instanceof ApiError && err.fieldErrors.name) setFieldError(err.fieldErrors.name);
      else setError(errorMessage(err));
    }
  };

  const formId = `rename-${row.type}-${row.id}`;

  return (
    <Modal
      open
      title={`Rename ${LEVEL_LABEL[row.type].toLowerCase()}`}
      onClose={() => !busy && onClose()}
      footer={
        <>
          <Button tone="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button type="submit" form={formId} busy={busy}>Save name</Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-body">
          Current name: <strong className="text-ink">{row.name}</strong> (ID {row.id}). Every user and report linked to it follows the new name.
        </p>
        <Field label="New name" error={fieldError} hint={`${name.trim().length}/100 characters`}>
          {(p) => (
            <input id={p.id} value={name} maxLength={100} autoFocus onChange={(e) => setName(e.target.value)} aria-invalid={p.invalid || undefined} aria-describedby={p.describedBy} className={p.className} />
          )}
        </Field>
        {error && <Notice tone="error">{error}</Notice>}
      </form>
    </Modal>
  );
}
