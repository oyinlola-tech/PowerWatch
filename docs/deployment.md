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
| `LOG_STREAM` | `stderr` (the host keeps only stderr, in `stderr.log`) |
| `LOG_LEVEL` | `warn` (keeps `stderr.log` to warnings and errors) |
| `GOOGLE_CLIENT_IDS` | The three Google OAuth client IDs, comma-separated (see Google sign-in) |

Background problems (emails that failed, failed jobs, push errors, server errors) are also
recorded in the database and shown in the admin dashboard under System problems.

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

## Android releases (APK)

Android builds are published as GitHub Releases in `oyinlola-tech/PowerWatch`, and everything
else follows from the newest release:

1. Push a tag: `git tag -a v1.0.2 -m "What changed, for users" && git push origin v1.0.2` (or run **Android release** from the
   repository's Actions tab and type `1.0.2`).
2. `.github/workflows/android-release.yml` sets the app version from the tag, builds the APK on
   EAS (`preview` profile), and publishes the GitHub Release `v1.0.2` with the APK attached.
3. `GET /api/v1/app/latest` reads the newest release (cached 5 minutes). The landing page's
   Android download button and the app's update prompt both use it.

The workflow needs the repository secret `EXPO_TOKEN` (an Expo access token for the
`oyinlola141` account, created at expo.dev → Account settings → Access tokens).

To force everyone on an older version to update, set `ANDROID_MIN_VERSION` (e.g. `1.0.2`) in
Application Manager. Each APK gets a higher Android version code automatically, so it installs
over the previous one.

### Opening links in the app

`https://powerwatch.oyinlola.site/.well-known/assetlinks.json` tells Android that links to the
site may open the app (package `com.powerwatch.app`, signed with the EAS upload key, SHA-256
`EC:AC:26:CB:59:80:64:4A:69:6D:C5:86:CC:6A:2C:BE:09:CE:74:95:36:CF:C6:EE:72:32:56:2A:D3:F1:DD:13`).
If the app is ever distributed through Google Play, add Play's app-signing SHA-256 to that file.

## Google sign-in

Configured in Google Cloud project `powerwatch141` (the Firebase project), under Google Auth
Platform. Publishing status: In production, external users; only name, email and profile are
requested, so no Google review is needed. Adding a logo on the Branding page would start one.

| Client | ID |
| --- | --- |
| Web (the ID tokens are issued to this one) | `387458458442-70qgjv004ffo2bkhh1nu6arshdn7l2r4.apps.googleusercontent.com` |
| Android (`com.powerwatch.app`, EAS upload key SHA-1 `11:B5:E9:99:DA:CE:F8:80:00:F8:36:82:0C:10:D9:BD:A4:C1:07:0A`) | `387458458442-ofglme8elijkon89dm3qqbkoo20lsok4.apps.googleusercontent.com` |
| iOS (`com.powerwatch.app`) | `387458458442-8d0voqu3u6os7pf6139bf7n9u6ervqu8.apps.googleusercontent.com` |

The API accepts ID tokens for all three through `GOOGLE_CLIENT_IDS` (Application Manager).
When the app is on Google Play, add the Play app-signing SHA-1 (Play Console → App integrity)
as another Android client, or Google sign-in will fail for store installs.

Sign in with Apple needs an Apple Developer Program membership; until then the app shows a
"coming soon" message on that button.

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
