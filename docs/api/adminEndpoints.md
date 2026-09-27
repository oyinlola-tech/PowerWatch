# Admin Endpoints

> All admin endpoints require `Bearer Token` authentication with `ADMIN` role.

---

## Dashboard

Get summary counts for the admin dashboard.

**Method:** `GET`

**Endpoint:** `/api/v1/admin/dashboard`

**Authentication:** Bearer Token (Admin)

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dashboard fetched.",
  "data": {
    "totalUsers": 150,
    "newUsersToday": 3,
    "totalReports": 1200,
    "reportsToday": 15,
    "reportsThisWeek": 80,
    "activeOutages": 12,
    "totalOutages": 340,
    "totalNeighborhoods": 4000
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Analytics

Get ON/OFF report counts, totals, and ratio within an optional date range.

**Method:** `GET`

**Endpoint:** `/api/v1/admin/analytics`

**Authentication:** Bearer Token (Admin)

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | String | No | ISO 8601 start date |
| endDate | String | No | ISO 8601 end date |

---

### Success Response

```json
{
  "success": true,
  "message": "Analytics fetched.",
  "data": {
    "onReports": 800,
    "offReports": 400,
    "totalReports": 1200,
    "totalUsers": 150,
    "totalOutages": 340,
    "onOffRatio": "2.00"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## List Users

List all users with optional search and role filter.

**Method:** `GET`

**Endpoint:** `/api/v1/admin/users`

**Authentication:** Bearer Token (Admin)

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Integer | No | Page number (default 1) |
| limit | Integer | No | Results per page (default 20) |
| search | String | No | Search by name or email |
| role | Enum | No | `USER` or `ADMIN` |

---

### Success Response

```json
{
  "success": true,
  "message": "Users fetched.",
  "data": {
    "data": [
      {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "USER",
        "emailVerified": true,
        "notificationEnabled": true,
        "createdAt": "2026-01-01T00:00:00.000Z",
        "updatedAt": "2026-07-13T00:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid query parameters |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## List Locations

Get all location hierarchy data (countries, states, LGAs, cities, towns, neighborhoods).

**Method:** `GET`

**Endpoint:** `/api/v1/admin/locations`

**Authentication:** Bearer Token (Admin)

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Locations fetched.",
  "data": {
    "countries": [{ "id": 1, "name": "Nigeria" }],
    "states": [{ "id": 25, "name": "Lagos", "countryId": 1 }],
    "lgas": [{ "id": 210, "name": "Ikeja", "stateId": 25 }],
    "cities": [{ "id": 815, "name": "Ikeja", "lgaId": 210 }],
    "towns": [{ "id": 4200, "name": "Ikeja", "cityId": 815 }],
    "neighborhoods": [{ "id": 9012, "name": "Ikeja GRA", "townId": 4200 }]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Update Location

Update a location name.

**Method:** `PATCH`

**Endpoint:** `/api/v1/admin/locations`

**Authentication:** Bearer Token (Admin)

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | Enum | Yes | `state`, `lga`, `city`, `town`, or `neighborhood` |
| id | Integer | Yes | Location ID |
| name | String | Yes | New name |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Location updated.",
  "data": {
    "id": 4200,
    "type": "town",
    "name": "New Town Name"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid location type or missing fields |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 404 | Location not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

### Request Example

```json
{
  "type": "town",
  "id": 4200,
  "name": "New Town Name"
}
```

---

## Send Broadcast

Send a push notification to all registered users.

**Method:** `POST`

**Endpoint:** `/api/v1/admin/broadcast`

**Authentication:** Bearer Token (Admin)

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| title | String | Yes | Notification title (max 200 chars) |
| body | String | Yes | Notification body (max 1000 chars) |
| topic | String | No | Firebase topic (defaults to `all_users`) |

---

### Request Example

```json
{
  "title": "Scheduled Maintenance",
  "body": "Power will be interrupted from 2-4 AM tomorrow."
}
```

---

### Success Response

```json
{
  "success": true,
  "message": "Broadcast sent.",
  "data": {
    "totalUsers": 150,
    "devicesFound": 200,
    "pushSuccess": 198,
    "pushFailed": 2,
    "topic": "all_users"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Suspend User

Suspend a user: revokes all sessions, removes device tokens, disables notifications.

**Method:** `POST`

**Endpoint:** `/api/v1/admin/users/:userId/suspend`

**Authentication:** Bearer Token (Admin)

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String (UUID) | Yes | User ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "User suspended.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid user ID |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Delete User

Permanently delete a user account.

**Method:** `DELETE`

**Endpoint:** `/api/v1/admin/users/:userId`

**Authentication:** Bearer Token (Admin)

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String (UUID) | Yes | User ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "User deleted.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid user ID |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 404 | User not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Delete Any Report

Permanently delete any report by ID (admin override).

**Method:** `DELETE`

**Endpoint:** `/api/v1/admin/reports/:id`

**Authentication:** Bearer Token (Admin)

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String (UUID) | Yes | Report ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Report deleted.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid report ID |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 404 | Report not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Materialize Daily Summaries

```http
POST /api/v1/admin/materialize/daily
```

Compute and upsert daily report summaries for a given date. Populates `daily_report_summaries` table from transactional `reports` data.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| date | String (YYYY-MM-DD) | No | Today | Date to materialize |

### Response

```json
{
  "success": true,
  "message": "Daily summaries materialized.",
  "data": {
    "neighborhoodsProcessed": 4452
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Materialize Weekly Summaries

```http
POST /api/v1/admin/materialize/weekly
```

Compute and upsert weekly outage summaries. Populates `weekly_outage_summaries` table.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| weekStart | String (YYYY-MM-DD) | No | Current week's Monday | Start of the week |

### Response

```json
{
  "success": true,
  "message": "Weekly summaries materialized.",
  "data": {
    "neighborhoodsProcessed": 3200
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Materialize Monthly Statistics

```http
POST /api/v1/admin/materialize/monthly
```

Roll up daily and weekly summaries into monthly statistics. Populates `monthly_statistics` table.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| monthStart | String (YYYY-MM-DD) | No | Current month | First day of the month |

### Response

```json
{
  "success": true,
  "message": "Monthly summaries materialized.",
  "data": {
    "neighborhoodsProcessed": 4452
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - admin role required |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
