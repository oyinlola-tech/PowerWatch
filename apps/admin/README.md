# PowerWatch Admin

Web dashboard for PowerWatch administrators. It talks to the PowerWatch API (`src/` in this
repo) and gives every admin endpoint a screen.

Stack: React 19, Vite 8, Tailwind CSS 4, TypeScript (strict), React Router 8. No other runtime
dependencies; charts are plain HTML/CSS bars.

## Screens

| Screen | Path | API endpoints |
| --- | --- | --- |
| Sign in | any path while signed out | `POST /auth/login`, `POST /auth/logout` (revokes a non-admin's session), `POST /auth/refresh-token`, `GET /auth/me` |
| Overview | `/` | `GET /admin/dashboard`, `GET /reports/outages?activeOnly=true`, `GET /health` |
| Analytics | `/analytics` | `GET /admin/analytics`, `GET /analytics/power`, `GET /analytics/outages`, `GET /analytics/users` |
| Neighborhood stats | `/neighborhood-stats` | `GET /analytics/locations` |
| Live status | `/status` | `GET /locations/status-map?stateId=` / `?lgaId=`, `GET /reports/status`, `GET /reports/activity` |
| Users | `/users` | `GET /admin/users`, `POST /admin/users/:id/suspend`, `POST /admin/users/:id/unsuspend`, `DELETE /admin/users/:id` |
| Reports | `/reports` | `GET /reports`, `GET /reports/:id`, `DELETE /admin/reports/:id`, `GET /locations/search` |
| Outages | `/outages` | `GET /reports/outages`, `GET /reports/outages/:id`, `DELETE /admin/reports/:id` |
| Locations | `/locations` | `GET /admin/locations`, `PATCH /admin/locations` |
| Broadcast | `/broadcast` | `POST /admin/broadcast` |
| Summaries | `/summaries` | `POST /admin/materialize/daily`, `/weekly`, `/monthly` |
| System health | `/health` | `GET /health`, `GET /health/database`, `GET /health/firebase` |
| Account | `/account` | `GET /auth/me`, `GET /auth/sessions`, `DELETE /auth/sessions/:id`, `POST /auth/logout-all` |

## Running locally

```bash
npm install
npm run dev        # http://localhost:5190
```

The API must be running on `http://localhost:3000` (`npm run dev` in `src/`) and
`http://localhost:5190` must be listed in the API's `CORS_ORIGIN`. To get an admin account locally,
set `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `src/.env`; the
API seeds that admin at start-up.

## Build and deploy

```bash
npm run build      # type-checks, then writes the static site to dist/
npm run lint
```

Environment variables (see `.env.example`):

| Variable | Required | Default |
| --- | --- | --- |
| `VITE_API_URL` | no | `http://localhost:3000` in development, `https://api-powerwatch.telente.site` in production builds |

`vercel.json` rewrites every path to `index.html` (client-side routes survive a refresh) and sets
security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex`, a `Permissions-Policy`, and a
`Content-Security-Policy` that allows scripts, styles, fonts and images from the site itself and
API calls only to `https://api-powerwatch.telente.site`. **If the API moves, change `connect-src`
in `vercel.json` as well as `VITE_API_URL`.** The API must also list the dashboard's production
origin in its `CORS_ORIGIN`.

The theme is applied before first paint by `public/theme-init.js` (an external file, so the CSP
needs no `unsafe-inline` for scripts).

## Sessions and token storage

This is an admin tool, so it keeps as little as possible in the browser:

- **Access token: memory only.** It is never written to any storage, so a script that reads storage
  can't take it, and it disappears on reload.
- **Refresh token: `sessionStorage`.** A reload keeps you signed in (the app swaps the refresh token
  for a new access token), but closing the tab or window ends the session. A new tab needs its own
  sign-in. `localStorage` is not used because it would keep an admin signed in indefinitely on a
  shared machine.
- On a `401`, the app refreshes once (parallel requests share one refresh) and retries. If the
  refresh is rejected, the local session is cleared and the sign-in screen explains why.
- Signing out calls `POST /auth/logout`, which revokes the refresh token on the server.
- Accounts whose role is not `ADMIN` are refused after login and the session the API created for
  them is revoked immediately; their tokens are never stored.

## Behaviour notes

- **Times** are shown in Nigerian time (`Africa/Lagos`, WAT, UTC+1), which the UI states in the top
  bar. Date filters are Lagos calendar days.
- **No client caching.** Every screen fetches on open and after each action, so moderation views
  never show data from before an action. The location hierarchy (names only) is loaded once per
  session and reloaded after a rename.
- **Errors.** The server's message is shown as-is, including rate-limit (`429`) messages.
  Validation errors (`errors: [{ field, message }]`) are shown under the matching field.
- **Rate limits.** The API allows 100 requests a minute per IP address in total. Every full page
  reload costs a refresh-token call plus the page's own requests, so moving between screens inside
  the app is cheaper than reloading.
- Destructive actions (suspend, delete user, delete report, broadcast, revoke sessions) always ask
  for confirmation and name what will be affected.

## Screenshots

`docs/screenshots/` holds screenshots at 360, 768 and 1440 px wide in light and dark mode, taken
against a local API with test data.
