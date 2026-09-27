# PowerWatch — API & Screen Gap Report

**Date:** September 27, 2026
**Scope:** Mobile app (`apps/mobile`, Expo) vs. backend API (`src/`, Fastify + Prisma)

---

## Implementation status (updated September 27, 2026)

Backend work from sections A and B is done, except Google/Apple sign-in (A8), which needs developer-console setup first. All paths are under `/api/v1`; the full request/response details are in Swagger at `/docs` (non-production).

| Item | Endpoint(s) | Notes |
|------|-------------|-------|
| A1 Registration | `POST auth/register`, `PATCH auth/profile` | Accepts `fullName` (split server-side) or `firstName`/`lastName`. Location is optional and is set later with `PATCH auth/profile { neighborhoodId }`, which now fills in state/LGA/city/town automatically. The verification code is emailed on sign-up (`verificationEmailSent` in the response). |
| A2 Live status | `GET reports/status` | Returns `neighborhood`, `status` (ON/OFF/UNKNOWN), `since`, `confirmedBy`, `confidence`, `recentReporters`, `lastReportAt`. `neighborhoodId` is optional (defaults to the user's). |
| A3 Activity feed | `GET reports/activity?limit=` | Outage started/ended events across the same LGA in the last 24 h, newest first. |
| A4 History summary | `GET history/summary?days=7\|30` | Per-day off minutes and periods (local `HH:mm` for the timeline bar), total, uptime %, longest outage, `hasData` for the empty state. Days split at local midnight (`APP_TIMEZONE`). |
| A5 Status map | `GET locations/status-map?lgaId=` or `?stateId=` | Per-neighborhood points for an LGA, or per-LGA outage counts for a state (heatmap). Coordinates are backfilled at startup for 767/777 LGAs; `precision` says which level a point came from. |
| A6 Notification preferences | `GET` / `PATCH auth/notification-preferences` | `notificationEnabled` (master), `outageAlerts`, `restorationAlerts`, `communityUpdates`. Also returned by `GET auth/me`. |
| A7 Push | `PUT` / `DELETE auth/push-token` | Takes an Expo push token. Residents (primary or saved neighborhood) get "Power outage in X" / "Power restored in X" when the status flips, respecting their preferences. `communityUpdates` is stored but nothing sends community updates yet. |
| A9 Report trust | `POST reports`, `reports/power-on`, `reports/power-off` | Server time only; one report per user per neighborhood every 5 min (429); the status follows the majority of distinct recent reporters (30-min window), so one report can't flip it alone. Reports now return `neighborhoodStatus` and `statusChanged`. |
| B5 Saved neighborhoods (API) | `GET` / `POST locations/saved`, `DELETE locations/saved/:neighborhoodId` | Up to 10, each listed with its current status. The screen still needs a design. |

Other changes made along the way:
- `POST locations/reverse-geocode` now requires sign-in.
- `reports/power-on` and `reports/power-off` were rejecting valid requests and returning no data; both are fixed.

Still open: A8 (social sign-in), all screens in section B, and the mobile app still has to be connected to these endpoints.

---

## Summary

The mobile app currently makes **no backend calls** — every screen uses hardcoded mock data, and the Login button goes straight to `/verify`. The backend has 65 working endpoints, but they don't line up one-to-one with the app:

| Category | Count |
|----------|-------|
| **A.** Backend APIs missing or incomplete for screens that already exist | 9 |
| **B.** Screens the app links to that don't exist yet | 11 |
| **C.** Backend APIs that exist but have no screen in the app | 9 groups |

Priority key: **P1** blocks the core flow (sign up → pick area → see status → report) · **P2** needed for a complete v1 · **P3** can follow later.

### Already ready to wire up (no backend work needed)

| Screen | Endpoint(s) |
|--------|-------------|
| Login | `POST /api/v1/auth/login` |
| Email verification | `POST /api/v1/auth/send-otp`, `/resend-otp`, `/verify-otp` |
| Select location — search | `GET /api/v1/locations/search?q=` |
| Select location — "Use current location" | `POST /api/v1/locations/reverse-geocode` |
| Select location — Confirm | `PATCH /api/v1/auth/profile` (`neighborhoodId`, `latitude`, `longitude`) |
| Report power on/off (confirm screen) | `POST /api/v1/reports/power-on`, `/power-off` |
| Profile — name and primary neighborhood | `GET /api/v1/auth/me` |
| Profile — Sign Out | `POST /api/v1/auth/logout` |
| Token refresh (app-wide) | `POST /api/v1/auth/refresh-token` |

---

## A. Backend APIs missing for existing screens

### A1. Registration doesn't match the app's sign-up flow — **P1**
- **Screen:** `register.tsx` → `verify.tsx` → `how-it-works.tsx` → `location.tsx`
- **Problem:**
  - The app collects a single **Full Name**; `POST /auth/register` requires `firstName` + `lastName`.
  - The backend **requires a location at registration** (either the full hierarchy or GPS). The app picks the location later, on the Select Location screen.
  - Registering does **not send the verification code**; the app would need a second `send-otp` call.
- **Needed:** change `POST /auth/register`:
  - accept `fullName` (split server-side) or keep first/last and split in the app;
  - make location optional; it gets set later via `PATCH /auth/profile`;
  - send the email-verification OTP automatically on success.

### A2. Live neighborhood status is missing the numbers the Home screen shows — **P1**
- **Screen:** `dashboard.tsx` hero card: "Power is Live / Out", **Confirmed by 124**, **Confidence 98%**, **Last update 2m ago**, current neighborhood name.
- **Exists:** `GET /reports/status?neighborhoodId=` returns `latestReport`, `reportCount`, `confidenceScore`, `lastUpdatedTime`.
- **Problems:**
  - `reportCount` is **all reports ever** for the neighborhood, not the number of people confirming the current status.
  - `confidenceScore` is "share of all reports that came in the last hour", which isn't a confidence measure.
  - The neighborhood name isn't returned.
- **Needed:** rework the status endpoint to return:
  ```json
  {
    "neighborhood": { "id": 1, "name": "Adewole Estate" },
    "status": "ON | OFF | UNKNOWN",
    "since": "2026-09-27T08:10:00Z",
    "confirmedBy": 124,
    "confidence": 98,
    "lastReportAt": "2026-09-27T09:58:00Z"
  }
  ```
  `confirmedBy` should count distinct users reporting the current status since it last changed. `confidence` should come from agreeing vs. conflicting recent reports.

### A3. Neighborhood activity feed — **P1**
- **Screen:** `dashboard.tsx` "Neighborhood activity" list (e.g. "Henry Gorge Area — ON — Just now", "Adeta Area — OFF — 5m ago").
- **Exists:** `GET /reports/location?neighborhoodId=` only returns reports for **one** neighborhood, without area names.
- **Needed:** `GET /api/v1/reports/activity?neighborhoodId=&limit=` returning recent status changes in **nearby** areas (same town/LGA), each with area name, status and time.

### A4. History summary — **P1**
- **Screen:** `history.tsx`:
  - "Last 7 Days": **Total Outage Time**, **Uptime %**, **Longest Single Outage (day)**;
  - one row per day: date label, "Xh Ym Off", and a 00:00–23:59 **timeline bar** showing when power was off;
  - "Load 30 Day History" button.
- **Exists:** `/history/weekly`, `/monthly`, `/power-timeline`, `/outage-hours`. These return **report counts** or overall totals, not per-day outage time or outage periods.
- **Needed:** `GET /api/v1/history/summary?neighborhoodId=&days=7|30`:
  ```json
  {
    "totalOutageMinutes": 765,
    "uptimePercent": 92.4,
    "longestOutage": { "minutes": 320, "date": "2026-09-23" },
    "days": [
      { "date": "2026-09-27", "offMinutes": 150,
        "outages": [{ "start": "08:10", "end": "10:40" }] }
    ]
  }
  ```
  The `outages` table already has start/end times, so this is a summary on top of existing data. Outages that span midnight must be split across days.

### A5. Heatmap / map status — **P2**
- **Screens:** "View Heatmap" card on Home; **Map** tab in the bottom nav (see B1/B2).
- **Exists:** nothing returns the current status of many neighborhoods at once.
- **Needed:** `GET /api/v1/locations/status-map?lgaId=` (or a bounding box) returning each neighborhood's `{ id, name, latitude, longitude, status, confidence }`.
- **Data gap:** the seed data has **no coordinates at any level** (state, LGA, city, town or neighborhood). Only places created later through reverse geocoding carry any GPS data, and only on reports and users. Coordinates have to be added to the location data before a map can be drawn. The bundled `nigeria-lga-data` package has LGA coordinates, which is a possible starting point.

### A6. Notification preferences — **P2**
- **Screens:**
  - `notifications.tsx` (onboarding): **Outage Alerts**, **Restoration Alerts**, **Community Reports**;
  - `settings.tsx`: **Power Status Alerts**, **Community Updates**.
- **Exists:** a single `notificationEnabled` on/off setting.
- **Needed:** separate settings on the user (e.g. `outageAlerts`, `restorationAlerts`, `communityUpdates`) exposed by `GET` and `PATCH /api/v1/auth/notification-preferences`, and respected when notifications are sent.

### A7. Push-token registration that works on iPhone — **P2**
- **Screen:** `notifications.tsx` "Finish Setup". It asks for permission but never gets a push token.
- **Exists:** `PATCH /auth/update-fcm-token`; the backend sends **only through Firebase (FCM)**.
- **Problem:** an Expo app on iOS gets an APNs token, which Firebase can't send to without adding the Firebase SDK to the app.
- **Needed:** accept an **Expo push token** and send through Expo's push service, which covers Android and iOS with one token type. Also send "power off/on in your area" pushes when a neighborhood's status changes; today nothing sends them automatically.

### A8. Google / Apple sign-in — **P3**
- **Screens:** Google and Apple buttons on `login.tsx` and `register.tsx` (no handlers).
- **Needed:** `POST /api/v1/auth/oauth/google` and `POST /api/v1/auth/oauth/apple`: verify the provider's ID token, then create or log in the user.
- **Blocked on:** Google Cloud and Apple Developer app setup (client IDs / service IDs).
- **Note:** Apple requires "Sign in with Apple" if any other social login is offered on iOS.

### A9. Report trust — **P2** (recommended with A2)
Not a missing endpoint, but it decides whether A2–A5 show accurate data:
- One user's single **ON** report ends the outage for the whole neighborhood.
- Nothing stops a user from sending reports repeatedly (e.g. a cooldown per user per neighborhood).
- Reports accept a **client-supplied `timestamp`**, so they can be backdated or future-dated. The server should use its own time.

---

## B. Screens the app links to that don't exist

None of these have a design in the Figma HI-FI section; each needs a design before it can be built to the Figma standard.

| # | Screen | Linked from | Backend support | Priority |
|---|--------|-------------|-----------------|----------|
| B1 | **Map** (bottom-nav tab) | `NavBar` → "Map" (shows "not available yet") | Missing — needs A5 | P2 |
| B2 | **Heatmap** | Home → "View Heatmap" card | Missing — needs A5 | P2 |
| B3 | **Forgot password** (enter email → enter code → new password) | Login → "Forgot Password?" (no handler) | ✅ Ready — see C1 | **P1** |
| B4 | **Profile Settings** (edit name, email, change password, delete account) | Profile → "Profile Settings" | ✅ Ready — see C2, C3 | **P1** |
| B5 | **Manage Saved Neighborhoods** | Profile → "Manage Saved Neighborhoods" | ❌ Missing — no saved-neighborhoods model; users have one primary neighborhood only. Needs a new table + list/add/remove endpoints | P3 |
| B6 | **Language** | Profile → "Language" | Not needed (in-app setting), unless the language should follow the user across devices | P3 |
| B7 | **Help & FAQ** | Profile → "Help & FAQ" | Not needed (static content) | P3 |
| B8 | **About PowerWatch** | Profile → "About PowerWatch" | Not needed (static content) | P3 |
| B9 | **Terms & Conditions** | Register → "Terms & Conditions" | Not needed (static page/web link) | **P1** (store requirement) |
| B10 | **Privacy Policy** | Register → "Privacy Policy" | Not needed (static page/web link) | **P1** (store requirement) |
| B11 | **My Reports** | Report submitted → "View My Reports" (currently opens History, which is neighborhood-wide) | ✅ Ready — see C5 | P2 |

B9 and B10 are required by both app stores. They could be pages on the landing website (`apps/web`) that the app opens.

---

## C. Backend APIs with no screen in the app

These endpoints work today, but no screen uses them.

| # | Feature | Endpoints (`/api/v1/...`) | Screen that would use it | Priority |
|---|---------|---------------------------|--------------------------|----------|
| C1 | **Password reset** | `POST auth/forgot-password`, `POST auth/verify-reset-otp`, `POST auth/reset-password` | Forgot password flow (B3) | **P1** |
| C2 | **Change password** | `PATCH auth/change-password` | Profile Settings (B4) | P2 |
| C3 | **Delete account** | `DELETE auth/delete-account` | Profile Settings (B4) | **P1** — Apple and Google require in-app account deletion when users can sign up |
| C4 | **Notifications inbox** | `GET notifications`, `GET notifications/unread-count`, `GET notifications/:id`, `PATCH notifications/:id/read`, `DELETE notifications/:id` | A notifications list (e.g. bell icon on Home with an unread badge) — no design yet | P2 |
| C5 | **My reports** | `GET reports/my`, `GET reports/:id`, `DELETE reports/:id` (own reports only) | My Reports (B11) | P2 |
| C6 | **Active sessions / devices** | `GET auth/sessions`, `DELETE auth/sessions/:id`, `GET auth/devices`, `DELETE auth/devices/:id`, `POST auth/logout-all` | "Security" or "Signed-in devices" section in Profile Settings | P3 |
| C7 | **Outage records** | `GET reports/outages`, `GET reports/outages/:id` | Outage detail when tapping a History day | P3 |
| C8 | **Public statistics** | `GET analytics/power`, `/outages`, `/users`, `/locations` | Optional stats screen, or the landing page | P3 |
| C9 | **Admin** | All of `admin/*` (dashboard, users, suspend/unsuspend, delete, broadcast, location edits, summary materialization) and `health/*` | No admin panel exists; the website is a landing page only. Needs a separate admin web app or admin-only area | P2 (needed to moderate once live) |

---

## Recommended order

1. **Backend:** A1 (registration), A2 (live status), A3 (activity feed), A4 (history summary), A9 (report trust).
2. **Mobile:** add an API client (base URL, token storage, auto-refresh) and wire up the "ready" screens; replace all mock data.
3. **Mobile:** B3 Forgot password, B4 Profile Settings (with C3 Delete account), B9/B10 Terms and Privacy — required to ship.
4. **Backend + mobile:** A6/A7 notifications and push; C4 inbox.
5. **Design needed first:** B1/B2 Map and Heatmap (with A5), B5 Saved Neighborhoods, B11 My Reports, and B6–B8.
6. **Later:** A8 social login (after Google/Apple setup), C6, C7, C8, C9 admin panel.
