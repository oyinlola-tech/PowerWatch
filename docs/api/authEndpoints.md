# Authentication Endpoints

---

## Register

Creates a new user account. Provide either the full location hierarchy (`stateId`, `lgaId`, `cityId`, `townId`, `neighborhoodId`) or GPS coordinates (`latitude`, `longitude`). The system auto-resolves coordinates via reverse geocoding.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/register`

**Authentication:** No

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Accept | application/json | Yes |

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| firstName | String | Yes | User's first name (1-50 chars) |
| lastName | String | Yes | User's last name (1-50 chars) |
| email | String | Yes | Unique, valid email |
| password | String | Yes | Strong password (min 8 chars, uppercase, lowercase, number, special char) |
| confirmPassword | String | No | Must match `password` if present |
| countryId | Integer | No | Existing country ID (optional, defaults to Nigeria) |
| stateId | Integer | Conditional | Required with hierarchy mode |
| lgaId | Integer | Conditional | Required with hierarchy mode |
| cityId | Integer | Conditional | Required with hierarchy mode |
| townId | Integer | Conditional | Required with hierarchy mode |
| neighborhoodId | Integer | Conditional | Required with hierarchy mode |
| latitude | Number | Conditional | Required with coordinate mode |
| longitude | Number | Conditional | Required with coordinate mode |
| notificationEnabled | Boolean | No | Push notification preference (defaults to true) |
| deviceName | String | No | Device model name (max 100 chars) |
| deviceType | Enum | No | Device platform: `ANDROID`, `IOS`, `WEB` |

> Provide either the full location hierarchy or GPS coordinates, not both.

---

### Request Examples

**Option 1: Full location hierarchy**
```json
{
  "firstName": "Oluwayemi",
  "lastName": "Oyinlola",
  "email": "user@example.com",
  "password": "StrongPassword@123",
  "confirmPassword": "StrongPassword@123",
  "countryId": 1,
  "stateId": 25,
  "lgaId": 210,
  "cityId": 815,
  "townId": 4200,
  "neighborhoodId": 9012,
  "notificationEnabled": true,
  "deviceName": "iPhone 15 Pro",
  "deviceType": "IOS"
}
```

**Option 2: GPS coordinates (auto-resolved)**
```json
{
  "firstName": "Oluwayemi",
  "lastName": "Oyinlola",
  "email": "user@example.com",
  "password": "StrongPassword@123",
  "confirmPassword": "StrongPassword@123",
  "latitude": 6.524379,
  "longitude": 3.379206,
  "notificationEnabled": true,
  "deviceName": "iPhone 15 Pro",
  "deviceType": "IOS"
}
```

---

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "Oluwayemi",
      "lastName": "Oyinlola",
      "email": "user@example.com",
      "role": "USER",
      "emailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Validation Rules

| Field | Rules |
|-------|-------|
| firstName | Required, 1-50 chars |
| lastName | Required, 1-50 chars |
| email | Required, valid email, lowercased |
| password | Required, 8-128 chars, uppercase, lowercase, number, special char |
| confirmPassword | Optional, must match `password` if present |
| countryId | Optional, positive integer |
| stateId | Required with hierarchy mode |
| lgaId | Required with hierarchy mode |
| cityId | Required with hierarchy mode |
| townId | Required with hierarchy mode |
| neighborhoodId | Required with hierarchy mode |
| latitude | Required with coordinate mode |
| longitude | Required with coordinate mode |
| deviceName | Optional, max 100 chars |
| deviceType | Optional, one of `ANDROID`, `IOS`, `WEB` |

---

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or invalid request payload |
| 409 | Email already registered |
| 422 | Invalid location hierarchy or missing coordinates |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Login

Authenticate a user and return access and refresh tokens.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/login`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |
| password | String | Yes | User password |

---

### Request Example

```json
{
  "email": "user@example.com",
  "password": "StrongPassword@123"
}
```

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "Oluwayemi",
      "lastName": "Oyinlola",
      "email": "user@example.com",
      "role": "USER",
      "emailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Invalid email or password |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Logout

Invalidate a refresh token.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/logout`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| refreshToken | String | Yes | Refresh token to revoke |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Logout successful.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed - missing refreshToken |
| 401 | Invalid refresh token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Refresh Token

Refresh access and refresh tokens using a valid refresh token.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/refresh-token`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| refreshToken | String | Yes | Valid refresh token |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Invalid refresh token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Send OTP

Send a one-time code for email verification or password reset.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/send-otp`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |
| type | Enum | No | `EMAIL_VERIFICATION` or `PASSWORD_RESET` |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "OTP sent successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or email already verified |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Resend OTP

Resend a previously requested OTP code.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/resend-otp`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |
| type | Enum | No | `EMAIL_VERIFICATION` or `PASSWORD_RESET` |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "OTP resent successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or email already verified |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Verify OTP

Verify a one-time code for email verification or password reset.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/verify-otp`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |
| code | String | Yes | 6-digit OTP code |
| type | Enum | No | `EMAIL_VERIFICATION` or `PASSWORD_RESET` |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "data": {
    "verified": true,
    "type": "EMAIL_VERIFICATION"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or invalid or expired OTP |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Forgot Password

Request a password reset OTP.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/forgot-password`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset OTP sent.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Reset Password

Reset a user password using a password reset OTP.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/reset-password`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |
| code | String | Yes | 6-digit password reset OTP code |
| password | String | Yes | New password |
| confirmPassword | String | No | Must match `password` if present |

---

### How it works

1. Request a password reset OTP using `/api/v1/auth/forgot-password`.
2. The system generates a 6-digit OTP, stores it, and sends it by email if SMTP is configured.
3. Use `/api/v1/auth/reset-password` with the email, OTP code, and new password.
4. If the OTP is valid and not expired, the password is updated and the OTP is invalidated.

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password reset successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or invalid or expired OTP |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Verify Reset OTP

Verify a password reset OTP code before allowing password change. This is a separate step from `verify-otp` to distinguish email verification from password reset authorization.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/verify-reset-otp`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | String | Yes | User email |
| code | String | Yes | 6-digit OTP code |
| type | Enum | No | Defaults to `PASSWORD_RESET` |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "data": {
    "verified": true,
    "type": "PASSWORD_RESET"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or invalid or expired OTP |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Get My Profile

Fetch the currently authenticated user's profile.

**Method:** `GET`

**Endpoint:** `/api/v1/auth/me`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Profile fetched successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Oluwayemi",
    "lastName": "Oyinlola",
    "email": "user@example.com",
    "role": "USER",
    "emailVerified": true,
    "notificationEnabled": true,
    "neighborhood": { "id": 9012, "name": "Ikeja GRA" },
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Update Profile

Update the authenticated user's profile information.

**Method:** `PATCH`

**Endpoint:** `/api/v1/auth/profile`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| firstName | String | No | New first name |
| lastName | String | No | New last name |
| notificationEnabled | Boolean | No | Push notification preference |
| latitude | Number | No | GPS latitude (nullable) |
| longitude | Number | No | GPS longitude (nullable) |
| neighborhoodId | Integer | No | New neighborhood ID (nullable) |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Oluwayemi",
    "lastName": "Oyinlola"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Change Password

Change the authenticated user's password. Requires the current password for verification.

**Method:** `PATCH`

**Endpoint:** `/api/v1/auth/change-password`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| currentPassword | String | Yes | Current password |
| newPassword | String | Yes | New password (min 8 chars) |
| confirmNewPassword | String | No | Must match `newPassword` if present |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Password changed successfully.",
  "data": {}
}
```

> Changing the password revokes all existing refresh tokens and sessions except the current one.

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed, current password incorrect, or new password must be different |
| 401 | Unauthorized - missing or invalid token |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Update FCM Token

Register or update a Firebase Cloud Messaging token for push notifications.

**Method:** `PATCH`

**Endpoint:** `/api/v1/auth/update-fcm-token`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| fcmToken | String | No | Firebase Cloud Messaging token |
| deviceName | String | No | Device model name |
| deviceType | Enum | No | `ANDROID`, `IOS`, or `WEB` |
| browser | String | No | Browser name (e.g., "Chrome 120") |
| platform | String | No | OS version (e.g., "iOS 17.2") |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "FCM token updated.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## List Devices

List all registered devices for the authenticated user.

**Method:** `GET`

**Endpoint:** `/api/v1/auth/devices`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Devices fetched successfully.",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceName": "iPhone 15 Pro",
      "deviceType": "IOS",
      "lastActive": "2025-06-15T10:30:00.000Z"
    }
  ]
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Remove Device

Remove a registered device by ID.

**Method:** `DELETE`

**Endpoint:** `/api/v1/auth/devices/:deviceId`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deviceId | String (UUID) | Yes | Device ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Device removed successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 404 | Device not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## List Sessions

List all active sessions for the authenticated user.

**Method:** `GET`

**Endpoint:** `/api/v1/auth/sessions`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Sessions fetched successfully.",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "device": { "deviceName": "iPhone 15 Pro", "deviceType": "IOS" },
      "ipAddress": "192.168.1.1",
      "lastActivityAt": "2025-06-15T10:30:00.000Z",
      "createdAt": "2025-06-14T08:00:00.000Z"
    }
  ]
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Revoke Session

Revoke an active session by ID (soft revoke — marks `deleted_at`).

**Method:** `DELETE`

**Endpoint:** `/api/v1/auth/sessions/:sessionId`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | String (UUID) | Yes | Session ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Session revoked successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 404 | Session not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Logout All Devices

Revoke all refresh tokens and sessions for the authenticated user.

**Method:** `POST`

**Endpoint:** `/api/v1/auth/logout-all`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Logged out of all devices.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Delete Account

Permanently delete the authenticated user account. Requires password confirmation.

**Method:** `DELETE`

**Endpoint:** `/api/v1/auth/delete-account`

**Authentication:** Yes (Bearer Token)

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer `<access_token>` | Yes |

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| password | String | Yes | Current password for confirmation |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Account deleted successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed or password is incorrect |
| 401 | Unauthorized - missing or invalid token |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## OTP Delivery and Validation

PowerWatch supports OTPs for two use cases:

- `EMAIL_VERIFICATION`: Verify a newly registered user email.
- `PASSWORD_RESET`: Verify ownership of an email address before password reset.

### OTP Behavior

- OTPs are 6-digit numeric strings.
- OTPs expire after `OTP_EXPIRY_MINUTES` (default 10 minutes).
- Previous unused OTPs of the same type are invalidated when a new OTP is generated.
- Once a code is used, it is marked as used and cannot be reused.

### Email Delivery

- If SMTP is configured, OTP codes are sent via email using the `MailService`.
- If SMTP is not configured, OTP codes are logged to the console in non-production environments.
- Configure SMTP in `.env` using `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, and `SMTP_FROM_NAME`.

### Common OTP Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid or expired OTP |
| 404 | User not found | 
| 500 | Internal server error |
