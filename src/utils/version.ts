/** Parses "1.2.3" (optionally "v1.2.3") into numbers, or null if it isn't that shape. */
export function parseVersion(value: string): [number, number, number] | null {
  const match = value.trim().match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
}

/** Negative if a < b, 0 if equal, positive if a > b. Unparseable versions sort lowest. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return (pa ? 1 : 0) - (pb ? 1 : 0);
  for (let i = 0; i < 3; i++) {
    if (pa[i]! !== pb[i]!) return pa[i]! - pb[i]!;
  }
  return 0;
}
