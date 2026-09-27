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
| `VITE_APP_STORE_URL`   | App Store listing. Empty shows "Coming soon on App Store".      |
| `VITE_PLAY_STORE_URL`  | Google Play listing. Empty shows "Coming soon on Google Play".  |
| `VITE_MIXPANEL_TOKEN`  | Mixpanel project token. Empty disables analytics.               |

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
