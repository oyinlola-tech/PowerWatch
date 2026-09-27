# Analytics Endpoints

---

## Power Statistics

Get ON/OFF report counts, percentages, and top reported neighborhoods.

**Method:** `GET`

**Endpoint:** `/api/v1/analytics/power`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | String | No | ISO 8601 start date |
| endDate | String | No | ISO 8601 end date |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Power statistics fetched.",
  "data": {
    "totalReports": 1200,
    "onReports": 800,
    "offReports": 400,
    "onPercentage": "66.7",
    "offPercentage": "33.3",
    "topNeighborhoods": [
      {
        "neighborhoodId": 9012,
        "neighborhoodName": "Central",
        "reportCount": 150
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Outage Statistics

Get outage counts, average duration, and top outage-prone neighborhoods.

**Method:** `GET`

**Endpoint:** `/api/v1/analytics/outages`

**Authentication:** Bearer Token

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
  "message": "Outage statistics fetched.",
  "data": {
    "totalOutages": 340,
    "activeOutages": 12,
    "completedOutages": 328,
    "averageDurationMinutes": 45,
    "topNeighborhoods": [
      {
        "neighborhoodId": 9012,
        "neighborhoodName": "Central",
        "outageCount": 25,
        "averageDurationMinutes": 60
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid date format |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## User Statistics

Get user counts, verification rates, distribution by state, and top reporters.

**Method:** `GET`

**Endpoint:** `/api/v1/analytics/users`

**Authentication:** Bearer Token

---

### Success Response

```json
{
  "success": true,
  "message": "User statistics fetched.",
  "data": {
    "totalUsers": 150,
    "verifiedUsers": 120,
    "unverifiedUsers": 30,
    "adminUsers": 2,
    "verificationRate": "80.0",
    "usersByState": [
      {
        "stateId": 25,
        "stateName": "Lagos",
        "userCount": 50
      }
    ],
    "topReporters": [
      {
        "userId": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "reportCount": 200
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Location Statistics

Get per-neighborhood breakdown with report counts, outage counts, and user counts.

**Method:** `GET`

**Endpoint:** `/api/v1/analytics/locations`

**Authentication:** Bearer Token

---

### Success Response

```json
{
  "success": true,
  "message": "Location statistics fetched.",
  "data": {
    "totalNeighborhoods": 4000,
    "neighborhoods": [
      {
        "id": 9012,
        "name": "Central",
        "town": "Main Town",
        "city": "Main City",
        "lga": "Main LGA",
        "state": "Lagos",
        "reportCount": 150,
        "outageCount": 25,
        "userCount": 30
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
