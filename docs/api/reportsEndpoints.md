# Report Endpoints

---

## Create Report

Submit a power report (ON or OFF) for a neighborhood. Submitting `OFF` automatically starts or extends an outage. Submitting `ON` closes the active outage with duration calculation.

**Method:** `POST`

**Endpoint:** `/api/v1/reports`

**Authentication:** Bearer Token

---

### Headers

| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer \<token\> | Yes |

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | Yes | Neighborhood ID |
| reportType | Enum | Yes | `ON` or `OFF` |
| latitude | Number | No | GPS latitude |
| longitude | Number | No | GPS longitude |
| deviceType | Enum | No | `ANDROID`, `IOS`, `WEB` |
| timestamp | String | No | ISO 8601 datetime (defaults to now) |

---

### Request Example

```json
{
  "neighborhoodId": 9012,
  "reportType": "OFF",
  "latitude": 6.524379,
  "longitude": 3.379206,
  "deviceType": "ANDROID",
  "timestamp": "2026-07-13T12:00:00Z"
}
```

---

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Power report submitted successfully.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "neighborhoodId": 9012,
    "reportType": "OFF",
    "timestamp": "2026-07-13T12:00:00.000Z",
    "latitude": 6.524379,
    "longitude": 3.379206,
    "deviceType": "ANDROID",
    "createdAt": "2026-07-13T12:00:00.000Z"
  }
}
```

---

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Missing or invalid token |
| 422 | Neighborhood not found |
| 500 | Internal server error |

---

## Report Power Off

Convenience endpoint equivalent to `POST /api/v1/reports` with `reportType` set to `OFF`.

**Method:** `POST`

**Endpoint:** `/api/v1/reports/power-off`

**Authentication:** Bearer Token

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | Yes | Neighborhood ID |
| latitude | Number | No | GPS latitude |
| longitude | Number | No | GPS longitude |
| deviceType | Enum | No | `ANDROID`, `IOS`, `WEB` |
| timestamp | String | No | ISO 8601 datetime |

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 422 | Neighborhood not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Report Power On

Convenience endpoint equivalent to `POST /api/v1/reports` with `reportType` set to `ON`.

**Method:** `POST`

**Endpoint:** `/api/v1/reports/power-on`

**Authentication:** Bearer Token

---

### Body Parameters

Same as Report Power Off.

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 422 | Neighborhood not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## List Reports

Retrieve power reports with optional filters and pagination.

**Method:** `GET`

**Endpoint:** `/api/v1/reports`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | No | Filter by neighborhood |
| userId | String (UUID) | No | Filter by user |
| reportType | Enum | No | `ON` or `OFF` |
| startDate | String | No | ISO 8601 start date |
| endDate | String | No | ISO 8601 end date |
| page | Integer | No | Page number (default 1) |
| limit | Integer | No | Results per page (default 20, max 100) |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Reports fetched successfully.",
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "neighborhoodId": 9012,
        "reportType": "OFF",
        "timestamp": "2026-07-13T12:00:00.000Z",
        "latitude": null,
        "longitude": null,
        "deviceType": "ANDROID",
        "createdAt": "2026-07-13T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

## My Reports

Get the authenticated user's reports.

**Method:** `GET`

**Endpoint:** `/api/v1/reports/my`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Integer | No | Page number (default 1) |
| limit | Integer | No | Results per page (default 20) |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Reports fetched successfully.",
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "neighborhoodId": 9012,
        "reportType": "OFF",
        "timestamp": "2026-07-13T12:00:00.000Z",
        "latitude": null,
        "longitude": null,
        "deviceType": "ANDROID",
        "createdAt": "2026-07-13T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
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

## Reports by Location

Get reports filtered by neighborhood ID.

**Method:** `GET`

**Endpoint:** `/api/v1/reports/location`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | Yes | Neighborhood ID |
| page | Integer | No | Page number (default 1) |
| limit | Integer | No | Results per page (default 20) |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Reports fetched successfully.",
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "neighborhoodId": 9012,
        "reportType": "OFF",
        "timestamp": "2026-07-13T12:00:00.000Z",
        "latitude": null,
        "longitude": null,
        "deviceType": "ANDROID",
        "createdAt": "2026-07-13T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Missing or invalid neighborhoodId |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Live Status

Get real-time power status for a neighborhood.

**Method:** `GET`

**Endpoint:** `/api/v1/reports/status`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | Yes | Neighborhood ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Live status fetched successfully.",
  "data": {
    "neighborhoodId": 9012,
    "latestReport": {
      "reportType": "OFF",
      "timestamp": "2026-07-13T12:00:00.000Z"
    },
    "reportCount": 42,
    "confidenceScore": 85,
    "lastUpdatedTime": "2026-07-13T12:00:00.000Z"
  }
}
```

**Confidence Score:** Percentage of reports submitted in the last hour relative to total reports for the neighborhood.

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Missing neighborhoodId parameter |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## List Outages

Retrieve outage records with optional filters.

**Method:** `GET`

**Endpoint:** `/api/v1/reports/outages`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | No | Filter by neighborhood |
| activeOnly | Boolean | No | Show only active outages (default false) |
| page | Integer | No | Page number (default 1) |
| limit | Integer | No | Results per page (default 20) |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Outages fetched successfully.",
  "data": {
    "data": [
      {
        "id": "uuid",
        "neighborhoodId": 9012,
        "neighborhood": { "id": 9012, "name": "Central" },
        "startTime": "2026-07-13T10:00:00.000Z",
        "endTime": null,
        "duration": null,
        "reportCount": 5,
        "createdAt": "2026-07-13T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
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

## Get Single Outage

Retrieve a single outage with its associated reports.

**Method:** `GET`

**Endpoint:** `/api/v1/reports/outages/:id`

**Authentication:** Bearer Token

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String (UUID) | Yes | Outage ID |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Outage fetched.",
  "data": {
    "id": "uuid",
    "neighborhoodId": 9012,
    "neighborhood": { "id": 9012, "name": "Central" },
    "startTime": "2026-07-13T10:00:00.000Z",
    "endTime": null,
    "duration": null,
    "reportCount": 5,
    "createdAt": "2026-07-13T10:00:00.000Z",
    "outageReports": [
      {
        "report": {
          "id": "uuid",
          "reportType": "OFF",
          "timestamp": "2026-07-13T10:00:00.000Z",
          "userId": "uuid"
        }
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid or missing outage ID |
| 401 | Unauthorized - missing or invalid token |
| 404 | Outage not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Get Single Report

Retrieve a single power report by ID.

**Method:** `GET`

**Endpoint:** `/api/v1/reports/:id`

**Authentication:** Bearer Token

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String (UUID) | Yes | Report ID |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Report fetched successfully.",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "neighborhoodId": 9012,
    "reportType": "OFF",
    "timestamp": "2026-07-13T12:00:00.000Z",
    "latitude": null,
    "longitude": null,
    "deviceType": "ANDROID",
    "createdAt": "2026-07-13T12:00:00.000Z"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid or missing report ID |
| 401 | Unauthorized - missing or invalid token |
| 404 | Report not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Delete Report

Delete a power report and its outage associations.

**Method:** `DELETE`

**Endpoint:** `/api/v1/reports/:id`

**Authentication:** Bearer Token

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
  "message": "Power report deleted successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid or missing report ID |
| 401 | Unauthorized - missing or invalid token |
| 404 | Report not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Outage Detection Logic

- When an `OFF` report is submitted: if no active outage exists for the neighborhood, a new outage is created. If one exists, the report count is incremented.
- When an `ON` report is submitted: the active outage (if any) is closed. `endTime` is set, `duration` is calculated in minutes, and the report count is incremented.
- Outage-to-report associations are stored in the `outage_reports` junction table.
