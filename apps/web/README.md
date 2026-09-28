# PowerWatch landing page

The marketing site for PowerWatch. It explains the app and links to the App
Store and Google Play listings. The app itself lives in `apps/mobile`.

## Develop

```bash
npm install
npm run dev
```

## Configure

Copy `.env.example` to `.env` and fill in what you have:

| Variable               | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `VITE_API_URL`         | PowerWatch API base URL, for the latest-release check. Defaults to `https://api-powerwatch.telente.site`. |
| `VITE_APP_STORE_URL`   | App Store listing. Empty shows "Coming soon on App Store".      |
| `VITE_PLAY_STORE_URL`  | Google Play listing. Empty hides the Play Store button once an APK is available, otherwise shows "Coming soon on Google Play". |
| `VITE_MIXPANEL_TOKEN`  | Mixpanel project token. Empty disables analytics.               |

## Android downloads

The Download section (`#download`) and every store-button group on the page
(`src/components/StoreButtons.tsx`) call `GET {VITE_API_URL}/api/v1/app/latest`
once per page load (`src/hooks/useLatestRelease.ts`), shared by every component
that renders a download control:

- **No release published yet** (the API returns 404, or the request fails):
  the Android button reads "Coming soon on Google Play", same as before this
  feature existed.
- **A release exists**: the Android button becomes a direct "Download for
  Android (APK)" link straight to `downloadUrl` (with a `download` attribute).
  The Download section additionally shows the version, file size and release
  date, a link to `releasePage` when present, and a short "How to install"
  note for sideloading the APK. If `VITE_PLAY_STORE_URL` is also set, the Play
  Store button is shown alongside the APK button rather than replacing it.
- While the request is in flight, the Download section shows a skeleton
  instead of flashing between states.

A slim, dismissible "Open in app" banner (`src/components/AndroidAppBanner.tsx`)
is shown above the navbar to Android visitors only (detected from
`navigator.userAgentData`/the UA string; never iOS or desktop). "Open" uses an
`intent://` URL that opens the installed app or falls back to `#download`;
"Get app" scrolls to `#download`. Dismissal is remembered in `localStorage` for
7 days.

## Build

```bash
npm run build
npm run preview
```

## Notes

- Light and dark themes: colors are tokens in `src/index.css`. The theme follows the
  system setting until the visitor uses the navbar toggle (saved in `localStorage`).
- `public/brand/logo-horizontal-dark.png` is the Figma logo with the wordmark text
  recolored to `#FCFEFF` for dark backgrounds.
- `public/images/figma/` holds photos and maps exported from the Figma screens.

- `public/brand/`, `public/mockups/` and `public/screens/` hold the logo, phone mockups and
  screens exported from the PowerWatch Figma file.
- `archive/pwa-app-src/` is the original PWA version of the app, kept for
  reference only. It is not built or deployed.
