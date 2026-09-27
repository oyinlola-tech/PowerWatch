# PowerWatch — Deep Audit Report

**Date:** September 27, 2026
**Auditor:** opencode
**Scope:** Full-stack security, code quality, dependencies, configuration, deployment readiness

---

## Project Overview

| Layer | Tech Stack | Location |
|-------|-----------|----------|
| Frontend | React 19 + Vite 8 + Tailwind 4 + MapLibre | `apps/web/` |
| Backend | Fastify 5 + Prisma 7 + MySQL/MariaDB | `src/` |
| Mobile | Empty placeholder | `apps/mobile/` |

---

## Issue Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 10 |
| HIGH | 17 |
| MEDIUM | 23 |
| LOW | 18 |
| **Total** | **68** |

---

## CRITICAL Issues

### C1. OTP Brute-Force Protection Is Dead Code
- **File:** `src/src/repositories/otp.repository.ts:20-31`, `src/src/services/auth/commands/verifyOtp.command.ts:25-28`
- **Description:** `findValidOtp` filters by `attempts: { lt: 5 }`, but `VerifyOtpCommand.execute()` never calls `otpRepository.incrementAttempts()`. The attempt counter is never incremented, so an attacker can brute-force OTP codes indefinitely without being blocked.
- **Fix:** In `verifyOtp.command.ts`, after finding the OTP and before throwing `INVALID_OTP`, call `this.otpRepository.incrementAttempts(otp.id)`. On success, also mark used (already done).

### C2. Password Hash Leaked via `findByEmail`
- **File:** `src/src/repositories/user.repository.ts:6-29`
- **Description:** `findByEmail` includes `passwordHash` in its select. The login command calls this and uses the hash for `bcrypt.compare`, but every other caller (e.g., `forgotPassword`, `verifyOtp`) also receives the password hash in the returned object unnecessarily. If any service ever serializes or logs this object, the hash is exposed.
- **Fix:** Create a separate `findByEmailWithPassword` method (already exists at line 32) and use it only in `LoginCommand`. Remove `passwordHash` from `findByEmail`.

### C3. `updatePassword` Doesn't Filter Soft-Deleted Users
- **File:** `src/src/repositories/user.repository.ts:91-96`
- **Description:** `updatePassword(email, hash)` uses `where: { email }` without checking `deletedAt: null`. A password reset could reactivate a soft-deleted account's credentials.
- **Fix:** Add `deletedAt: null` to the where clause, or verify the user exists and isn't deleted before calling this method.

### C4. Admin Can Delete Themselves
- **File:** `src/src/services/admin/commands/deleteUser.command.ts:6-16`
- **Description:** No check prevents an admin from deleting their own account or other admin accounts. This could lock out all admins.
- **Fix:** Add a check: if `user.role === 'ADMIN'`, throw an error or require super-admin privileges. Prevent self-deletion.

### C5. Report Delete Has No Ownership Check
- **File:** `src/src/services/reports/commands/deleteReport.command.ts:11-21`, `src/src/routes/report.route.ts:330-353`
- **Description:** Any authenticated user can delete any report by ID. The `DeleteReportCommand` only checks existence, not ownership. An attacker can mass-delete reports.
- **Fix:** Pass `userId` to `DeleteReportCommand.execute()` and verify `report.userId === userId` (or the user is ADMIN).

### C6. No Route Protection — All Routes Accessible Without Auth
- **File:** `apps/web/src/App.tsx:39-53`
- **Description:** Every route (`/dashboard`, `/history`, `/settings`, `/confirm/:status`, `/report-submitted/:status`) is accessible without any authentication guard. A user can navigate directly to `/dashboard` and see all data.
- **Fix:** Add an auth context/provider and wrap protected routes in an `AuthGuard` or use a layout route with redirect logic.

### C7. Forms Are Completely Non-Functional
- **Files:** `apps/web/src/pages/Login.tsx:41-46,71-76`, `apps/web/src/pages/Register.tsx:49-54,70-75,91-96`, `apps/web/src/pages/MonitoringArea.tsx:130-135`
- **Description:** All `<input>` elements are uncontrolled — no `useState`, no `onChange` storing values, no form submission handler. The Login button navigates directly to `/verify` without reading any input. The Register button calls `mixpanel.track` but never collects name, email, or password.
- **Fix:** Add controlled inputs with `useState` for each field, implement form validation, and wire up submission handlers.

### C8. No Form Validation Anywhere
- **Files:** `apps/web/src/pages/Login.tsx`, `Register.tsx`, `Verification.tsx`
- **Description:** No email format validation, no password strength checks (despite the "Must be at least 8 characters" hint text), no required field checks, no OTP digit validation. Users can submit empty forms.
- **Fix:** Add validation logic (or use a library like `react-hook-form`/`zod`) with inline error messages.

### C9. Navigation to Non-Existent Routes
- **Files:** Multiple — see list below
- **Description:** Numerous buttons navigate to routes that don't exist in the router. Since there's no 404 catch-all, users see a blank page:
  - `Dashboard.tsx:59` → `/set-location` (route is `/location`)
  - `Dashboard.tsx:86` → `/heatmap` (no such route)
  - `ConfirmPowerStatus.tsx:76` → `/set-location` (should be `/location`)
  - `WeeklyHistory.tsx:90` → `/report` (no such route)
  - `Profile.tsx:100` → `/neighborhoods` (no such route)
  - `Profile.tsx:108` → `/set-location` (should be `/location`)
  - `Profile.tsx:141` → `/language` (no such route)
  - `Profile.tsx:155` → `/profile-settings` (no such route)
  - `Profile.tsx:161` → `/help` (no such route)
  - `Profile.tsx:167` → `/about` (no such route)
- **Fix:** Add a catch-all `<Route path="*" element={<NotFound />} />` route and fix the broken navigation paths.

### C10. No Error Boundaries — White Screen on Any Error
- **File:** `apps/web/src/App.tsx:38`
- **Description:** No `ErrorBoundary` wraps the routes. If any lazy-loaded component throws during render, or if a chunk fails to load (network error), the entire app crashes with an unrecoverable white screen. The `Suspense` only handles loading, not errors.
- **Fix:** Add a `React.ErrorBoundary` component wrapping the `Suspense` and routes, with a fallback UI.

---

## HIGH Issues

### H1. No Rate Limiting on Auth Endpoints
- **File:** `src/src/app.ts:41-52`
- **Description:** Global rate limit is 100 req/min. Auth-sensitive endpoints (login, register, send-otp, reset-password) share this limit. An attacker can attempt ~100 logins per minute per IP. No per-endpoint or per-account throttling exists.
- **Fix:** Add endpoint-specific rate limits for auth routes (e.g., 5 login attempts per minute per email, 3 OTP requests per 10 minutes).

### H2. SendBroadcast Endpoint Has No Input Validation
- **File:** `src/src/controllers/admin.controller.ts:93-98`
- **Description:** The `sendBroadcast` controller casts `request.body` directly without Zod validation. An admin could send arbitrarily large `title`/`body` fields, or missing fields could cause runtime errors.
- **Fix:** Define and apply a Zod schema for broadcast input.

### H3. Missing Security Headers
- **File:** `src/src/app.ts`
- **Description:** No `@fastify/helmet` or equivalent. Missing `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, etc.
- **Fix:** Register `@fastify/helmet` with appropriate defaults.

### H4. CORS Configuration Too Permissive in Dev
- **File:** `src/src/configs/env.config.ts:47`, `src/src/app.ts:36-39`
- **Description:** In development, `CORS_ORIGIN` defaults to `http://localhost:5173` with `credentials: true`. The `cors.config.ts` file is empty — no validation prevents a misconfigured `CORS_ORIGIN=*` with `credentials: true`.
- **Fix:** Add validation: if `credentials: true`, reject `origin: '*'`.

### H5. SuspendUser Command Missing Audit Log
- **File:** `src/src/services/admin/commands/suspendUser.command.ts:5-19`
- **Description:** Suspending a user revokes tokens and devices but doesn't create an audit log entry. This is a critical admin action with no traceability.
- **Fix:** Inject `AuditRepository` and log the suspension action.

### H6. DeleteUser Command Missing Audit Log
- **File:** `src/src/services/admin/commands/deleteUser.command.ts:5-17`
- **Description:** Same as H5 — admin user deletion has no audit trail.
- **Fix:** Same as H5.

### H7. Refresh Token Rotation Doesn't Update Session
- **File:** `src/src/services/auth/commands/refreshToken.command.ts:33-44`
- **Description:** When rotating a refresh token, the old refresh token is deleted and a new one created, but the associated `Session` record still references the old `refreshTokenId`. This orphaned reference means session tracking becomes inconsistent.
- **Fix:** Update the session's `refreshTokenId` to the new token ID, or delete the old session and create a new one.

### H8. Nominatim User-Agent Contains Hardcoded Email
- **File:** `src/src/services/locations/queries/reverseGeocode.query.ts:132`
- **Description:** The User-Agent header includes a hardcoded email `oluwayemioyinlola2@gmail.com` as a fallback. This leaks PII in outbound HTTP requests.
- **Fix:** Use a configured contact email or a generic `powerwatch@example.com`.

### H9. Database Loader Doesn't Close Connection on Error
- **File:** `src/src/loaders/database.loader.ts:5-16`
- **Description:** If `CREATE DATABASE` throws, `connection.end()` is never called, leaking the connection.
- **Fix:** Wrap in try/finally: `try { ... } finally { await connection.end(); }`.

### H10. AJV Strict Mode Disabled
- **File:** `src/src/app.ts:29-33`
- **Description:** `ajv.customOptions.strict: false` disables useful validation strictness (e.g., catching unknown schema keywords). This can mask schema definition errors.
- **Fix:** Remove `strict: false` or set it to `true` and fix any schema issues.

### H11. Mixpanel `debug: true` in Production
- **File:** `apps/web/src/Services/mixpanel.ts:4`
- **Description:** `debug: true` logs every tracking event to the browser console, exposing internal event names, user data, and implementation details.
- **Fix:** Set `debug: import.meta.env.DEV` or remove the option entirely.

### H12. Map Style Fallback Can Infinite-Loop
- **File:** `apps/web/src/pages/MonitoringArea.tsx:32-38`
- **Description:** When `mapError` fires, the effect sets the next `mapStyleIndex` and resets `mapError` to `false`. If the next style also fails immediately, this creates a rapid cycle with no max-retry guard.
- **Fix:** Add a retry counter or only attempt the fallback once per style. Consider `useRef` for the retry count.

### H13. `mapbox-gl` Dependency Not Used — Unnecessary ~500KB Bundle Weight
- **File:** `apps/web/package.json`
- **Description:** `mapbox-gl` is listed as a dependency but never imported anywhere in the code. The codebase uses `maplibre-gl` exclusively.
- **Fix:** Remove `mapbox-gl` from `package.json`.

### H14. `react-map-gl` Listed Alongside `@vis.gl/react-maplibre`
- **File:** `apps/web/package.json`
- **Description:** Both `react-map-gl` (which internally depends on `mapbox-gl`) and `@vis.gl/react-maplibre` are listed. This creates duplicate map library bundles.
- **Fix:** Remove `react-map-gl` and `mapbox-gl`, and import directly from `@vis.gl/react-maplibre`.

### H15. All Data Is Hardcoded Mock — No API Integration
- **Files:** `Dashboard.tsx:13-37`, `ConfirmPowerStatus.tsx:48,62`, `WeeklyHistory.tsx:13-49`, `Profile.tsx:28-31`, `ReportSubmitted.tsx:17-18`
- **Description:** Every data source is hardcoded mock data with TODO comments. Reports contain hardcoded addresses, neighborhoods, and timestamps.
- **Fix:** Integrate with a backend API. Use React Query or similar for data fetching with proper loading/error states.

### H16. No 404 / Not Found Route
- **File:** `apps/web/src/App.tsx`
- **Description:** No catch-all route exists. Any URL that doesn't match a defined route renders nothing — a blank white page.
- **Fix:** Add `<Route path="*" element={<NotFound />} />` as the last route.

### H17. Hardcoded Admin Default Credentials in `.env.example`
- **File:** `src/.env.example:23-26`
- **Description:** Default admin credentials (`admin@powerwatch.com` / `Admin@123`) are in a version-controlled file. Developers may forget to change them.
- **Fix:** Remove password from `.env.example`, document that it must be set.

---

## MEDIUM Issues

### M1. No Graceful Shutdown Handler
- **File:** `src/src/server.ts`
- **Description:** No `SIGTERM`/`SIGINT` handlers to disconnect Prisma and close the HTTP server. In production (Docker/K8s), the process may be killed mid-request, causing data corruption.
- **Fix:** Add `process.on('SIGTERM', ...)` to call `prisma.$disconnect()` and `app.close()`.

### M2. OTP Logged to Console in Development
- **File:** `src/src/services/auth/commands/sendOtp.command.ts:56-58`
- **Description:** `console.log('[DEV] OTP for ...')` leaks OTP codes to stdout/logs. In shared dev environments or log aggregation, this is a security risk.
- **Fix:** Use `request.log.debug()` or remove entirely.

### M3. Broadcast Notification Logs Created N+1
- **File:** `src/src/services/admin/commands/sendBroadcast.command.ts:46-48`
- **Description:** Each notification log is created in a loop with `await this.notificationRepository.create(log)`. For 10k users, this is 10k sequential DB writes.
- **Fix:** Use `prisma.notificationLog.createMany()` for batch insertion.

### M4. Missing Request ID for Tracing
- **File:** `src/src/configs/logger.config.ts` (empty), `src/src/middlewares/logger.middleware.ts` (empty)
- **Description:** No request ID generation or correlation. In production, debugging requires correlating logs across services, which is impossible without request IDs.
- **Fix:** Generate a UUID per request, attach it to `request.id`, and include it in response headers and logs.

### M5. SuspendUser Doesn't Actually Prevent Login
- **File:** `src/src/services/admin/commands/suspendUser.command.ts:12-18`
- **Description:** Suspending a user sets `notificationEnabled: false` and deletes refresh tokens/devices, but doesn't set `deletedAt` or a dedicated `suspendedAt` field. The user can still log in with a valid password.
- **Fix:** Add a `suspended` or `banned` field to the User model, check it during login, or set `deletedAt`.

### M6. Health Check Endpoints Unauthenticated
- **File:** `src/src/routes/health.route.ts`, `src/src/app.ts:70-74`
- **Description:** Health endpoints (`/health`, `/api/v1/health/*`) have no auth. They expose internal system state (DB latency, Firebase status) to unauthenticated users.
- **Fix:** Consider requiring auth for detailed health checks, or ensure only summary info is exposed publicly.

### M7. Admin Route Schemas Missing Security Declarations
- **File:** `src/src/routes/admin.route.ts`
- **Description:** Admin routes don't include `security: [{ bearerAuth: [] }]` in their Swagger schemas, unlike auth routes.
- **Fix:** Add `security: [{ bearerAuth: [] }]` to all admin route schemas.

### M8. Race Condition in Reverse Geocode FindOrCreate
- **File:** `src/src/services/locations/queries/reverseGeocode.query.ts:37-123`
- **Description:** The find-then-create pattern has a race window. Concurrent requests could create duplicate entries for the same state/LGA/city before the unique constraint kicks in.
- **Fix:** Use `prisma.$transaction` with `upsert` or `findFirst` + `create` inside a serializable transaction.

### M9. `getRefreshTokenExpiryDate` Silent Fallback
- **File:** `src/src/configs/jwt.config.ts:62,76`
- **Description:** If the `expiresIn` format doesn't match any pattern, it silently falls back to 30 days. A misconfigured env var (e.g., `JWT_REFRESH_EXPIRES_IN=30`) would be parsed as 30 seconds (numeric match), not 30 days.
- **Fix:** Log a warning when using the fallback. Consider stricter parsing.

### M10. Search Location Performs Unbounded Sequential Queries
- **File:** `src/src/services/locations/queries/searchLocation.query.ts:19-150`
- **Description:** The search runs up to 5 sequential database queries (neighborhoods, towns, cities, LGAs) each with `take: limit`. For limit=100, this could fetch 500 rows across 5 queries.
- **Fix:** Use a single UNION query or cap each sub-query to a smaller number.

### M11. Notification Ownership Not Verified
- **File:** `src/src/services/notifications/commands/markAsRead.command.ts:10-27`, `src/src/controllers/notification.controller.ts:61-68`
- **Description:** `MarkAsReadCommand` finds notification by ID but doesn't verify it belongs to the authenticated user. Any user can mark any notification as read.
- **Fix:** Pass `userId` to the command and verify ownership.

### M12. `getNotification` Query Missing Ownership Check
- **File:** `src/src/controllers/notification.controller.ts:37-41`
- **Description:** Fetching a notification by ID doesn't verify it belongs to the requesting user.
- **Fix:** Add `userId` filter to the query.

### M13. `deleteNotification` Missing Ownership Check
- **File:** `src/src/controllers/notification.controller.ts:71-75`
- **Description:** Any authenticated user can delete any notification by ID.
- **Fix:** Verify ownership before deletion.

### M14. Missing `aria-label` on All Interactive Elements
- **Files:** `FloatingActionButton.tsx:8-13`, `BottomNav.tsx:23-38`, `Verification.tsx:69-84`, `Onboarding.tsx:91-115`, `DashboardHeader.tsx:20`, `PageHeader.tsx:13-18`, `FinishSetup.tsx:34-45`
- **Description:** Icon-only buttons have no accessible labels, making them invisible to screen readers. Custom toggles lack `role="switch"` and `aria-checked`.
- **Fix:** Add `aria-label` to all icon-only buttons. Add `role="switch"` and `aria-checked` to custom toggles.

### M15. `slides` Array Recreated Every Render
- **File:** `apps/web/src/pages/Onboarding.tsx:9-25`
- **Description:** The `slides` array is defined inside the component body, creating a new reference every render.
- **Fix:** Move the `slides` array outside the component or wrap it in `useMemo`.

### M16. Redundant `useState` for Constant Data
- **File:** `apps/web/src/pages/WeeklyHistory.tsx:53`
- **Description:** `const [history] = useState<DayRecord[]>(mockHistory)` uses React state to hold a value that never changes.
- **Fix:** Use `const history = mockHistory` or `useMemo(() => mockHistory, [])`.

### M17. No Error Handling for Failed Lazy Chunk Loads
- **File:** `apps/web/src/App.tsx:38`
- **Description:** The `Suspense` boundary handles loading states but not chunk load failures. If the network drops during a lazy import, the error propagates uncaught.
- **Fix:** Add `onError` handling to lazy imports or use `ErrorBoundary` with retry logic.

### M18. Inconsistent Toggle Component Implementation
- **Files:** `apps/web/src/pages/FinishSetup.tsx:33-46` vs `apps/web/src/components/shared/Toggle.tsx`
- **Description:** `FinishSetup.tsx` defines its own inline toggle that lacks ARIA attributes, while the shared `Toggle` component properly implements them.
- **Fix:** Refactor `FinishSetup.tsx` to use the shared `Toggle` component.

### M19. PWA Manifest Missing Required Icon Sizes
- **File:** `apps/web/vite.config.ts:28-33`
- **Description:** Only one icon (`Logo.svg` with `"sizes": "any"`) is provided. PWA install prompts on Android require 192x192 and 512x512 PNG icons.
- **Fix:** Generate and include 192x192 and 512x512 PNG icons.

### M20. No Dynamic `<title>` Per Route
- **File:** `apps/web/index.html:7`, `apps/web/src/App.tsx`
- **Description:** The page title is always "PowerWatch" regardless of which page the user is on.
- **Fix:** Use `react-helmet-async` or `document.title` in each page component.

### M21. No Meta Description for SEO
- **File:** `apps/web/index.html`
- **Description:** Missing `<meta name="description">` tag. Bad for search engine indexing and social sharing.
- **Fix:** Add a meta description.

### M22. `HeatmapPreview` Hardcoded Map Style Without Fallback
- **File:** `apps/web/src/components/Dashboard/HeatmapPreview.tsx:103`
- **Description:** Unlike `MonitoringArea.tsx` which tries multiple map styles, `HeatmapPreview` hardcodes a single style URL. If Carto's CDN is down, the heatmap shows a broken map.
- **Fix:** Add error handling and a fallback style, or extract the style-fallback logic into a shared hook.

### M23. Missing `loading="lazy"` on Below-the-Fold Images
- **File:** `apps/web/src/pages/Onboarding.tsx:68`
- **Description:** Onboarding carousel images are always loaded eagerly. The `LazyImage` component exists but is never used.
- **Fix:** Use the existing `LazyImage` component or add `loading="lazy"` to non-critical images.

---

## LOW Issues

### L1. Empty/Stub Files
- `src/src/configs/cors.config.ts` — Empty, exports nothing
- `src/src/configs/firebase.config.ts` — Empty
- `src/src/configs/logger.config.ts` — Empty
- `src/src/middlewares/logger.middleware.ts` — Empty
- `src/src/dtos/auth.dto.ts` — Empty
- `src/src/dtos/location.dto.ts` — Empty
- `src/src/dtos/history.dto.ts` — Empty
- `src/src/constants/status.constant.ts` — Empty
- `src/src/constants/app.constant.ts` — Empty
- `src/src/constants/api.constant.ts` — Empty
- `src/src/index.ts` — Empty
- `src/src/databases/index.ts` — Empty
- `src/src/apis/index.ts` — Empty
- **Fix:** Remove unused files or implement them.

### L2. Duplicate `DeleteReportCommand` Classes
- **Files:** `src/src/services/reports/commands/deleteReport.command.ts` and `src/src/services/admin/commands/deleteReport.command.ts`
- **Description:** Two separate `DeleteReportCommand` classes exist with identical logic.
- **Fix:** Consolidate into one shared command.

### L3. Dynamic Import in Report Controller
- **File:** `src/src/controllers/report.controller.ts:52,61`
- **Description:** `reportPowerOff` and `reportPowerOn` use `await import(...)` to load commands unnecessarily.
- **Fix:** Import at the top of the file like all other commands.

### L4. `strict: true` + `exactOptionalPropertyTypes` May Cause Build Friction
- **File:** `src/tsconfig.json:17-18`
- **Description:** These strict settings can cause unexpected type errors during development. This is intentional for code quality but worth noting.

### L5. No `body` Size Limit Configuration
- **File:** `src/src/app.ts`
- **Description:** No `bodyLimit` configured on the Fastify instance. Default is ~1MB.
- **Fix:** Set `bodyLimit` in Fastify options.

### L6. Materialize Endpoints Could Be Resource-Intensive
- **File:** `src/src/services/analytics/commands/materialize*.command.ts`
- **Description:** Materialization commands could run heavy aggregations with no timeout or pagination protection.
- **Fix:** Add timeouts or chunked processing for large datasets.

### L7. Frontend `tsconfig.app.json` Missing `strict: true`
- **File:** `apps/web/tsconfig.app.json`
- **Description:** The strict family is not enabled. Only `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are set.
- **Fix:** Enable `strict: true` and add `forceConsistentCasingInFileNames`.

### L8. TypeScript Version Mismatch
- **Files:** `src/package.json` (7.x) vs `apps/web/package.json` (6.x)
- **Description:** Different major TypeScript versions across packages can cause type-checking inconsistencies.
- **Fix:** Align to same major version across packages.

### L9. No Production Sourcemaps
- **File:** `apps/web/vite.config.ts`
- **Description:** No sourcemap configuration for production builds makes debugging production issues harder.
- **Fix:** Add `build.sourcemap: 'hidden'` for error tracking.

### L10. No Build Chunk Splitting
- **File:** `apps/web/vite.config.ts`
- **Description:** No `build.rollupOptions.output.manualChunks` configured. Large bundle likely.
- **Fix:** Split MapLibre GL, React, and React Router into separate chunks.

### L11. 184 Lines of Dead CSS
- **File:** `apps/web/src/App.css`
- **Description:** Contains unused styles from the Vite template (`.counter`, `.hero`, `#center`, `#next-steps`, etc.).
- **Fix:** Delete the file. Only `index.css` with Tailwind is needed.

### L12. Commented-Out Code
- **Files:** `apps/web/src/components/Dashboard/PowerStatusCard.tsx:11`, `apps/web/src/components/Dashboard/HeatmapPreview.tsx:64`
- **Description:** Commented-out variables clutter the codebase.
- **Fix:** Remove dead comments.

### L13. Inconsistent File/Export Naming
- **Files:** `FinishSetup.tsx` exports `NotificationSetup`, `Verification.tsx` exports `OtpVerification`, `NeighborHoodActivity.tsx` has non-standard casing
- **Fix:** Rename files to match exports, or vice versa. Standardize to `NeighborhoodActivity.tsx`.

### L14. No Focus Ring Strategy
- **Files:** Multiple button components
- **Description:** Most buttons lack `focus-visible` styles. Keyboard-only users can't see which button is focused.
- **Fix:** Add a global `focus-visible` style in `index.css` or add `focus-visible:ring-2 focus-visible:ring-[#0663EA]` to all interactive elements.

### L15. "Verify Email" Button Skips OTP Validation
- **File:** `apps/web/src/pages/Verification.tsx:88-93`
- **Description:** The "Verify Email" button navigates directly to `/how-it-works` without checking if the OTP is complete or correct.
- **Fix:** Validate that all 6 digits are entered before allowing navigation.

### L16. "Forgot Password?" Button Has No Handler
- **File:** `apps/web/src/pages/Login.tsx:60-65`
- **Description:** The "Forgot Password?" button has no `onClick` handler and no `href`.
- **Fix:** Add navigation to a password reset route or implement the feature.

### L17. Social Login Buttons Have No Handlers
- **Files:** `apps/web/src/pages/Login.tsx:104-112`, `apps/web/src/pages/Register.tsx:148-156`
- **Description:** Google and Apple login buttons render but have no `onClick` handlers.
- **Fix:** Implement OAuth flows or remove the buttons until ready.

### L18. Empty `README.md`
- **File:** `README.md`
- **Description:** Completely empty (0 lines). No project documentation exists.
- **Fix:** Populate with setup instructions, project overview, and contribution guide.

---

## Dependency Audit

### Unused Dependencies (Remove)

| Package | Location | Reason |
|---------|----------|--------|
| `mapbox-gl` | `apps/web/package.json` | Never imported — code uses `maplibre-gl` |
| `@vis.gl/react-maplibre` | `apps/web/package.json` | Never imported — code uses `react-map-gl/maplibre` |
| `nigeria-state-lga-data` | `src/package.json` | Never imported — only `nigeria-lga-data` is used |

### Version Concerns

| Package | Version | Concern |
|---------|---------|---------|
| `bcryptjs` | `^3.0.3` | Unusual major version — verify this is a legitimate release |
| `vite` | `^8.1.1` | Very new major version — verify stability for production |
| `typescript` | `^7.0.2` (backend) / `~6.0.2` (frontend) | Major version mismatch across packages |

### Missing from `.env.example`

| Variable | Used In | Default |
|----------|---------|---------|
| `OTP_EXPIRY_MINUTES` | `env.config.ts:64` | `10` |

---

## Configuration Issues

### Frontend TypeScript (`apps/web/tsconfig.app.json`)
- Missing `strict: true`
- Missing `noUncheckedIndexedAccess`
- Missing `forceConsistentCasingInFileNames`
- Missing `resolveJsonModule`

### Backend TypeScript (`src/tsconfig.json`)
- `skipLibCheck: true` — acceptable for performance but can mask issues in third-party types

### Build Config (`apps/web/vite.config.ts`)
- No `build.rollupOptions.output.manualChunks`
- No `build.sourcemap` for production
- No `resolve.alias` for path aliases (deep relative imports used)

### Security Config (`src/src/app.ts`)
- No `@fastify/helmet` registered
- `ajv.customOptions.strict: false`
- No `bodyLimit` configured

---

## Production Deployment Checklist

### Must-Fix Before Launch

| # | Task | Category |
|---|------|----------|
| 1 | Fix OTP brute-force protection (increment attempts) | Security |
| 2 | Fix password hash leak in `findByEmail` | Security |
| 3 | Add ownership checks on report delete | Security |
| 4 | Add ownership checks on notification operations | Security |
| 5 | Prevent admin self-deletion | Security |
| 6 | Add `@fastify/helmet` for security headers | Security |
| 7 | Add per-endpoint rate limiting on auth routes | Security |
| 8 | Remove hardcoded admin credentials from `.env.example` | Security |
| 9 | Add route protection (auth guards) on frontend | Frontend |
| 10 | Implement controlled forms with validation | Frontend |
| 11 | Fix all broken navigation paths | Frontend |
| 12 | Add ErrorBoundary component | Frontend |
| 13 | Add 404 catch-all route | Frontend |
| 14 | Remove `debug: true` from Mixpanel | Frontend |
| 15 | Add graceful shutdown handler (`SIGTERM`/`SIGINT`) | Backend |
| 16 | Fix refresh token session orphaning | Backend |
| 17 | Add audit logging to admin actions | Backend |
| 18 | Integrate frontend with backend API | Integration |

### Should-Fix Before Launch

| # | Task | Category |
|---|------|----------|
| 19 | Remove unused dependencies | Dependencies |
| 20 | Enable `strict: true` in frontend tsconfig | Config |
| 21 | Align TypeScript versions across packages | Config |
| 22 | Add request ID generation for tracing | Observability |
| 23 | Fix broadcast N+1 notification creation | Performance |
| 24 | Add batch processing for search location queries | Performance |
| 25 | Add production sourcemaps (hidden) | Debugging |
| 26 | Configure build chunk splitting | Performance |
| 27 | Write README with setup instructions | Documentation |
| 28 | Add Docker + CI/CD pipeline | DevOps |
| 29 | Generate PWA icons (192x192, 512x512) | PWA |
| 30 | Add error boundaries and loading states | Frontend |

### Nice-to-Have

| # | Task | Category |
|---|------|----------|
| 31 | Clean up empty stub files | Code Quality |
| 32 | Remove dead CSS (`App.css`) | Code Quality |
| 33 | Consolidate duplicate `DeleteReportCommand` | Code Quality |
| 34 | Add focus-visible ring strategy | Accessibility |
| 35 | Add dynamic `<title>` per route | SEO |
| 36 | Add `<meta name="description">` | SEO |
| 37 | Remove redundant icon libraries | Bundle Size |
| 38 | Clean up commented-out code | Code Quality |
| 39 | Fix inconsistent file/export naming | Code Quality |
| 40 | Remove `.kilo/worktrees` duplicate directory | Cleanup |

---

*Report generated by opencode on September 27, 2026*
