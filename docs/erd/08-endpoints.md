# Auth Endpoint Feasibility

## Registration Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Fastify API
    participant S as AuthService
    participant DB as MySQL

    C->>API: POST /auth/register { email, password, location }
    API->>S: RegisterCommand.execute()
    S->>DB: Check email uniqueness
    DB-->>S: OK (not found)
    S->>DB: Hash password (bcrypt)
    S->>DB: Create User + location FK
    S->>DB: Create RefreshToken
    S->>DB: Create Session
    S->>DB: Log audit (REGISTER)
    DB-->>S: User + tokens
    S-->>API: { user, accessToken, refreshToken }
    API-->>C: 201 Created
```

## Login Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Fastify API
    participant S as AuthService
    participant DB as MySQL

    C->>API: POST /auth/login { email, password }
    API->>S: LoginCommand.execute()
    S->>DB: Find user by email
    DB-->>S: User record
    S->>S: Verify password (bcrypt.compare)
    S->>DB: Update last_login_at
    S->>DB: Create RefreshToken
    S->>DB: Create Session
    S->>DB: Log audit (LOGIN)
    DB-->>S: Tokens + session
    S-->>API: { user, accessToken, refreshToken }
    API-->>C: 200 OK
```

## Forgot / Reset Password Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Fastify API
    participant S as AuthService
    participant DB as MySQL
    participant Email as SMTP/MailService

    C->>API: POST /auth/forgot-password { email }
    API->>S: ForgotPasswordCommand
    S->>DB: Find user, invalidate old OTPs
    S->>DB: Create PASSWORD_RESET OTP
    S->>Email: Send 6-digit code
    Email-->>C: OTP email
    API-->>C: 200 OK

    C->>API: POST /auth/verify-reset-otp { email, code }
    API->>S: VerifyResetOtpCommand
    S->>DB: Find OTP by email + type + code
    DB-->>S: OTP record
    S->>S: Check expiry & attempts
    S-->>API: { verified: true }
    API-->>C: 200 OK

    C->>API: POST /auth/reset-password { email, code, newPassword }
    API->>S: ResetPasswordCommand
    S->>DB: Verify OTP again (must match)
    S->>DB: Hash new password
    S->>DB: Update user password_hash
    S->>DB: Revoke all RefreshTokens
    S->>DB: Revoke all Sessions
    S->>DB: Log audit (PASSWORD_RESET)
    DB-->>S: Done
    S-->>API: { success: true }
    API-->>C: 200 OK
```

## Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | Route, controller, service, validator fully implemented |
| ⚠️ | Partial (route exists but service empty) |
| ❌ | Missing (not yet built) |

## Endpoint Status

| # | Endpoint | Status | Notes |
|---|----------|--------|-------|
| 1 | `POST /api/v1/auth/register` | ✅ | Location hierarchy + GPS, audit logging, session creation |
| 2 | `POST /api/v1/auth/verify-otp` | ✅ | Marks email_verified, audit logging |
| 3 | `POST /api/v1/auth/resend-otp` | ✅ | Invalidates previous OTPs |
| 4 | `POST /api/v1/auth/login` | ✅ | Session + audit + lastLoginAt |
| 5 | `POST /api/v1/auth/refresh-token` | ✅ | Token rotation |
| 6 | `POST /api/v1/auth/logout` | ✅ | Audit logging |
| 7 | `POST /api/v1/auth/forgot-password` | ✅ | Sends PASSWORD_RESET OTP |
| 8 | `POST /api/v1/auth/verify-reset-otp` | ✅ | Separate endpoint for reset flow |
| 9 | `POST /api/v1/auth/reset-password` | ✅ | Audit logging |
| 10 | `GET /api/v1/auth/me` | ✅ | Profile query from JWT |
| 11 | `PATCH /api/v1/auth/profile` | ✅ | Name, notification, location |
| 12 | `PATCH /api/v1/auth/change-password` | ✅ | Validates current, revokes all tokens |
| 13 | `PATCH /api/v1/auth/update-fcm-token` | ✅ | Upsert device, audit logging |
| 14 | `GET /api/v1/auth/devices` | ✅ | List user devices |
| 15 | `DELETE /api/v1/auth/devices/:deviceId` | ✅ | Ownership verified |
| 16 | `GET /api/v1/auth/sessions` | ✅ | Active sessions with device info |
| 17 | `DELETE /api/v1/auth/sessions/:sessionId` | ✅ | Soft-revoke |
| 18 | `POST /api/v1/auth/logout-all` | ✅ | Revokes all tokens + sessions |
| 19 | `DELETE /api/v1/auth/delete-account` | ✅ | Password confirmation, soft delete |
