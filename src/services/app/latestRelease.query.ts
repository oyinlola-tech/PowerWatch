import { env } from '../../configs/env.config.js';
import { AppError } from '../../errors/index.js';
import { compareVersions, parseVersion } from '../../utils/version.js';
import { describeError, recordSystemEvent } from '../systemEvents/recordSystemEvent.js';

export interface AndroidRelease {
  platform: 'android';
  version: string;
  downloadUrl: string;
  fileName: string;
  sizeBytes: number;
  publishedAt: string;
  notes: string;
  releasePage: string;
  /** Versions older than this must update before using the app (empty when not enforced) */
  minimumVersion: string | null;
}

interface GithubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
  published_at: string | null;
  assets: Array<{ name: string; size: number; browser_download_url: string; content_type: string }>;
}

// GitHub allows 60 unauthenticated requests an hour per IP; a few minutes of caching keeps
// well inside that while new releases still show up quickly.
const CACHE_MS = 5 * 60 * 1000;
let cached: { release: AndroidRelease | null; fetchedAt: number } | null = null;

async function fetchLatest(): Promise<AndroidRelease | null> {
  const response = await fetch(`https://api.github.com/repos/${env.releases.githubRepo}/releases?per_page=20`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'PowerWatch-API' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`GitHub releases returned ${response.status}`);
  const releases = (await response.json()) as GithubRelease[];

  // Published releases tagged like v1.2.3 that carry an APK; the highest version wins
  const candidates = releases
    .filter((r) => !r.draft && !r.prerelease && parseVersion(r.tag_name))
    .map((r) => ({ release: r, apk: r.assets.find((a) => a.name.toLowerCase().endsWith('.apk')) }))
    .filter((c): c is { release: GithubRelease; apk: GithubRelease['assets'][number] } => Boolean(c.apk))
    .sort((a, b) => compareVersions(b.release.tag_name, a.release.tag_name));

  const latest = candidates[0];
  if (!latest) return null;
  return {
    platform: 'android',
    version: latest.release.tag_name.replace(/^v/, ''),
    downloadUrl: latest.apk.browser_download_url,
    fileName: latest.apk.name,
    sizeBytes: latest.apk.size,
    publishedAt: latest.release.published_at ?? '',
    notes: (latest.release.body ?? '').trim().slice(0, 2000),
    releasePage: latest.release.html_url,
    minimumVersion: env.releases.androidMinVersion || null,
  };
}

/** The newest Android build published on GitHub Releases. */
export class GetLatestReleaseQuery {
  async execute(): Promise<AndroidRelease> {
    if (!cached || Date.now() - cached.fetchedAt > CACHE_MS) {
      try {
        cached = { release: await fetchLatest(), fetchedAt: Date.now() };
      } catch (error) {
        await recordSystemEvent({
          level: 'WARNING',
          source: 'api',
          message: 'Could not read the latest app release from GitHub.',
          details: describeError(error),
        });
        // Keep serving the last known release rather than failing update checks
        if (!cached) throw new AppError(503, 'Release information is not available right now.');
        cached.fetchedAt = Date.now() - CACHE_MS + 60_000;
      }
    }
    if (!cached.release) throw new AppError(404, 'No Android release has been published yet.');
    return cached.release;
  }
}
