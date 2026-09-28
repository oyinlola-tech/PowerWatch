// Store listing URLs. Set these in `.env` once the app is published; until
// then the App Store button shows as "Coming soon". Android never shows
// "Coming soon": it always links straight to an APK (see StoreButtons.tsx).
export const APP_STORE_URL: string | undefined = import.meta.env.VITE_APP_STORE_URL || undefined;
// Optional: shown as an extra button alongside the Android APK download, never in place of it.
export const PLAY_STORE_URL: string | undefined = import.meta.env.VITE_PLAY_STORE_URL || undefined;

// Fallback for Android visitors when the API has no published release yet (or
// the request fails): GitHub's own "always the latest" release page.
export const GITHUB_RELEASES_URL = "https://github.com/oyinlola-tech/PowerWatch/releases/latest";
