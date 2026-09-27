# PowerWatch API Documentation

## Endpoints Overview

| Module | Endpoint | Method | Auth | Details |
|--------|----------|--------|------|---------|
| Auth | `/api/v1/auth/register` | POST | No | [View](authEndpoints.md#register) |
| Auth | `/api/v1/auth/login` | POST | No | [View](authEndpoints.md#login) |
| Auth | `/api/v1/auth/logout` | POST | No | [View](authEndpoints.md#logout) |
| Auth | `/api/v1/auth/refresh-token` | POST | No | [View](authEndpoints.md#refresh-token) |
| Auth | `/api/v1/auth/send-otp` | POST | No | [View](authEndpoints.md#send-otp) |
| Auth | `/api/v1/auth/resend-otp` | POST | No | [View](authEndpoints.md#resend-otp) |
| Auth | `/api/v1/auth/verify-otp` | POST | No | [View](authEndpoints.md#verify-otp) |
| Auth | `/api/v1/auth/forgot-password` | POST | No | [View](authEndpoints.md#forgot-password) |
| Auth | `/api/v1/auth/reset-password` | POST | No | [View](authEndpoints.md#reset-password) |
| Auth | `/api/v1/auth/verify-reset-otp` | POST | No | [View](authEndpoints.md#verify-reset-otp) |
| Auth | `/api/v1/auth/me` | GET | Yes | [View](authEndpoints.md#get-my-profile) |
| Auth | `/api/v1/auth/profile` | PATCH | Yes | [View](authEndpoints.md#update-profile) |
| Auth | `/api/v1/auth/change-password` | PATCH | Yes | [View](authEndpoints.md#change-password) |
| Auth | `/api/v1/auth/update-fcm-token` | PATCH | Yes | [View](authEndpoints.md#update-fcm-token) |
| Auth | `/api/v1/auth/devices` | GET | Yes | [View](authEndpoints.md#list-devices) |
| Auth | `/api/v1/auth/devices/:deviceId` | DELETE | Yes | [View](authEndpoints.md#remove-device) |
| Auth | `/api/v1/auth/sessions` | GET | Yes | [View](authEndpoints.md#list-sessions) |
| Auth | `/api/v1/auth/sessions/:sessionId` | DELETE | Yes | [View](authEndpoints.md#revoke-session) |
| Auth | `/api/v1/auth/logout-all` | POST | Yes | [View](authEndpoints.md#logout-all-devices) |
| Auth | `/api/v1/auth/delete-account` | DELETE | Yes | [View](authEndpoints.md#delete-account) |
| Locations | `/api/v1/locations/reverse-geocode` | POST | No | [View](locationsEndpoints.md#reverse-geocode) |
| Locations | `/api/v1/locations/search` | GET | No | [View](locationsEndpoints.md#search) |
| Reports | `/api/v1/reports` | POST | Yes | [View](reportsEndpoints.md#create-report) |
| Reports | `/api/v1/reports/power-off` | POST | Yes | [View](reportsEndpoints.md#report-power-off) |
| Reports | `/api/v1/reports/power-on` | POST | Yes | [View](reportsEndpoints.md#report-power-on) |
| Reports | `/api/v1/reports` | GET | Yes | [View](reportsEndpoints.md#list-reports) |
| Reports | `/api/v1/reports/my` | GET | Yes | [View](reportsEndpoints.md#my-reports) |
| Reports | `/api/v1/reports/location` | GET | Yes | [View](reportsEndpoints.md#reports-by-location) |
| Reports | `/api/v1/reports/status` | GET | Yes | [View](reportsEndpoints.md#live-status) |
| Reports | `/api/v1/reports/outages` | GET | Yes | [View](reportsEndpoints.md#list-outages) |
| Reports | `/api/v1/reports/outages/:id` | GET | Yes | [View](reportsEndpoints.md#get-single-outage) |
| Reports | `/api/v1/reports/:id` | GET | Yes | [View](reportsEndpoints.md#get-single-report) |
| Reports | `/api/v1/reports/:id` | DELETE | Yes | [View](reportsEndpoints.md#delete-report) |
| Notifications | `/api/v1/notifications` | POST | Yes | [View](notificationsEndpoints.md#send-notification) |
| Notifications | `/api/v1/notifications` | GET | Yes | [View](notificationsEndpoints.md#list-notifications) |
| Notifications | `/api/v1/notifications/unread-count` | GET | Yes | [View](notificationsEndpoints.md#unread-count) |
| Notifications | `/api/v1/notifications/:id` | GET | Yes | [View](notificationsEndpoints.md#get-single-notification) |
| Notifications | `/api/v1/notifications/:id/read` | PATCH | Yes | [View](notificationsEndpoints.md#mark-as-read) |
| Notifications | `/api/v1/notifications/:id` | DELETE | Yes | [View](notificationsEndpoints.md#delete-notification) |
| Admin | `/api/v1/admin/dashboard` | GET | Admin | [View](adminEndpoints.md#dashboard) |
| Admin | `/api/v1/admin/analytics` | GET | Admin | [View](adminEndpoints.md#analytics) |
| Admin | `/api/v1/admin/users` | GET | Admin | [View](adminEndpoints.md#list-users) |
| Admin | `/api/v1/admin/locations` | GET | Admin | [View](adminEndpoints.md#list-locations) |
| Admin | `/api/v1/admin/locations` | PATCH | Admin | [View](adminEndpoints.md#update-location) |
| Admin | `/api/v1/admin/broadcast` | POST | Admin | [View](adminEndpoints.md#send-broadcast) |
| Admin | `/api/v1/admin/users/:userId/suspend` | POST | Admin | [View](adminEndpoints.md#suspend-user) |
| Admin | `/api/v1/admin/users/:userId` | DELETE | Admin | [View](adminEndpoints.md#delete-user) |
| Admin | `/api/v1/admin/reports/:id` | DELETE | Admin | [View](adminEndpoints.md#delete-any-report) |
| Admin | `/api/v1/admin/materialize/daily` | POST | Admin | [View](adminEndpoints.md#materialize-daily-summaries) |
| Admin | `/api/v1/admin/materialize/weekly` | POST | Admin | [View](adminEndpoints.md#materialize-weekly-summaries) |
| Admin | `/api/v1/admin/materialize/monthly` | POST | Admin | [View](adminEndpoints.md#materialize-monthly-statistics) |
| Analytics | `/api/v1/analytics/power` | GET | Yes | [View](analyticsEndpoints.md#power-statistics) |
| Analytics | `/api/v1/analytics/outages` | GET | Yes | [View](analyticsEndpoints.md#outage-statistics) |
| Analytics | `/api/v1/analytics/users` | GET | Yes | [View](analyticsEndpoints.md#user-statistics) |
| Analytics | `/api/v1/analytics/locations` | GET | Yes | [View](analyticsEndpoints.md#location-statistics) |
| History | `/api/v1/history/weekly` | GET | Yes | [View](historyEndpoints.md#weekly-history) |
| History | `/api/v1/history/monthly` | GET | Yes | [View](historyEndpoints.md#monthly-history) |
| History | `/api/v1/history/outage-hours` | GET | Yes | [View](historyEndpoints.md#outage-hours) |
| History | `/api/v1/history/power-timeline` | GET | Yes | [View](historyEndpoints.md#power-timeline) |
| Health | `/api/v1/health` | GET | No | [View](healthEndpoints.md#full-health-check) |
| Health | `/api/v1/health/database` | GET | No | [View](healthEndpoints.md#database-health) |
| Health | `/api/v1/health/firebase` | GET | No | [View](healthEndpoints.md#firebase-health) |
| System | `/health` | GET | No | Returns server uptime and timestamp |

---

## Where to Find Details

| File | Contents |
|------|----------|
| [authEndpoints.md](authEndpoints.md) | All auth endpoints (register, login, logout, refresh token, OTP flows, password reset) |
| [locationsEndpoints.md](locationsEndpoints.md) | Reverse geocode and location search endpoints |
| [reportsEndpoints.md](reportsEndpoints.md) | Power reports, live status, outages |
| [notificationsEndpoints.md](notificationsEndpoints.md) | Send, list, track, and manage notifications |
| [adminEndpoints.md](adminEndpoints.md) | Admin dashboard, user/location management, broadcast |
| [analyticsEndpoints.md](analyticsEndpoints.md) | Power, outage, user, and location statistics |
| [historyEndpoints.md](historyEndpoints.md) | Weekly, monthly, outage hours, and power timeline |
| [healthEndpoints.md](healthEndpoints.md) | Server, database, and Firebase health checks |
| [configuration.md](configuration.md) | Environment variables and SMTP settings |

---

## Configuration

See [configuration.md](configuration.md) for environment variable reference.

## Database Schema

See [database-gap-analysis.md](../../../database-gap-analysis.md) for the full schema reference and data analyst requirements status.
