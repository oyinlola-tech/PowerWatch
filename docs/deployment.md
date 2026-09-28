# Deployment

| Part | Where | Address |
| --- | --- | --- |
| Landing page (`apps/web`) | Vercel, project `powerwatch` | https://powerwatch.oyinlola.site |
| Admin dashboard (`apps/admin`) | Vercel, project `powerwatch-admin` | https://admin-powerwatch.oyinlola.site |
| API (`src`) | cPanel, Application Manager | https://api-powerwatch.telente.site |
| Database | MariaDB on the same cPanel account | `telente_powerwatch` |
| Mobile app (`apps/mobile`) | EAS Build | uses the API address above |

The three parts are deployed separately. None of them needs SSH.

## Landing page

Vercel builds `apps/web` on every push to `main` (framework preset: Vite, root directory:
`apps/web`). Environment variables are set in the Vercel project, not in the repository.
The page does not call the API.

## API

The host has no SSH and its "Setup Node.js App" tool has no Node.js version installed.
The API runs through **Application Manager** instead, which uses Node.js 22.

| Setting | Value |
| --- | --- |
| Application name | `powerwatch-api` |
| Application root | `/home/telente/powerwatch-api` (outside `public_html`) |
| Domain | `api-powerwatch.telente.site` |
| Environment | Production (sets `NODE_ENV=production`) |
| Start-up file | `app.js` (fixed by Application Manager) |

### What the host needs that a normal server does not

These are handled by the files in `src/deploy/cpanel/`, not by the application code.

| Host behavior | Handled by |
| --- | --- |
| Always starts `app.js`; there is no start command | `app.js` loads `dist/server.js` |
| Starts the app and npm with a `PATH` that has no `node` or `npx` | `app.js` adds it for the server; `.npmrc` and `npm-shell.sh` add it for `npm install` |
| Picks the port itself | Nothing to set: leave `PORT` out of `.env` |
| Sits in front of the app as a proxy | `TRUST_PROXY=1` in `.env`, so rate limits count real visitors |
| Adds a 30-day cache lifetime to responses without one | The API sends `Cache-Control: no-store` |
| Its memory cap refuses the large block Node reserves for WebAssembly, which Prisma uses (`RangeError: WebAssembly.Instance(): Out of memory`) | `--disable-wasm-trap-handler`: in `.npmrc` (`node-options`) for installs, and as the `NODE_OPTIONS` environment variable of the application in Application Manager for the running server |
| Force HTTPS Redirect has no effect on Application Manager apps | Plain `http://` still answers. The API sends `Strict-Transport-Security`, and the mobile app refuses non-HTTPS addresses |

`npm install` runs `prisma generate` (the `postinstall` script), so **Ensure dependencies**
also rebuilds the database client.

### Release a new version

1. In `src/`, run `bash deploy/cpanel/package.sh`. It builds the API and creates
   `deploy/cpanel/powerwatch-api.zip` (no secrets, no `node_modules`).
2. In cPanel **File Manager**, upload the zip to `/home/telente/powerwatch-api` and extract it
   there, replacing the existing files. Delete the zip.
3. If `package.json` changed, open **Application Manager** and choose **Ensure dependencies**.
4. Restart the app: in Application Manager, switch the application off and on again.
5. Check https://api-powerwatch.telente.site/health.

The server updates the database tables from `prisma/schema.prisma` each time it starts. It
refuses changes that would delete data, and stops with an error instead.

### Settings and secrets

Settings live in `/home/telente/powerwatch-api/.env` on the server (permissions `600`). The
file is never committed. `src/.env.example` lists every variable. The production file sets:

`NODE_ENV`, `HOST`, `TRUST_PROXY`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`,
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`,
`APP_TIMEZONE`, `CORS_ORIGIN`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`, `NOMINATIM_CONTACT_EMAIL`.

Application Manager also sets these variables for the app. They win over `.env`, because
dotenv never overrides a variable that is already set:

| Variable | Value |
| --- | --- |
| `NODE_OPTIONS` | `--disable-wasm-trap-handler` (see above) |
| `CORS_ORIGIN` | `https://powerwatch.oyinlola.site,https://admin-powerwatch.oyinlola.site` |
| `SUPPORT_EMAIL` | `help@telente.site` |
| `APP_WEB_URL` | `https://powerwatch.oyinlola.site` |

The admin dashboard builds on Vercel from `apps/admin` with `VITE_API_URL` set to the API
address. If the API address changes, also change `connect-src` in `apps/admin/vercel.json` and
`CORS_ORIGIN` here.

### Location data

The Nigerian states, LGAs, towns and neighborhoods are loaded once with `prisma/seed.ts`. It
skips itself if locations already exist. Without SSH, run it from cPanel **Cron Jobs** with a
job set to every minute, and delete the job as soon as `seed.log` shows it finished:

```sh
cd /home/telente/powerwatch-api && /opt/cpanel/ea-nodejs22/bin/node --disable-wasm-trap-handler node_modules/tsx/dist/cli.mjs prisma/seed.ts > seed.log 2>&1
```

Restart the app afterwards so it fills in map coordinates for the new locations.

Changing `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` signs everyone out and makes unused
verification codes invalid.

### Logs

Errors written by the app are in `/home/telente/powerwatch-api/stderr.log`.

## Email

| Address | Purpose |
| --- | --- |
| `no-reply@telente.site` | Mailbox the API sends verification and reset codes from |
| `help@telente.site` | Support contact shown in the app and on the site |
| `privacy@telente.site` | Data protection requests |

All three forward to the owner's personal inbox (cPanel **Forwarders**).

## Mobile app

`apps/mobile/eas.json` sets `EXPO_PUBLIC_API_URL` for the `preview` and `production` build
profiles, so builds made with EAS use the production API. Development with `expo start`
still uses the API on your own computer.
