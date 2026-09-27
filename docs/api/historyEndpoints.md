# History Endpoints

---

## Weekly History

Get power reports aggregated by ISO week within a given month.

**Method:** `GET`

**Endpoint:** `/api/v1/history/weekly`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | No | Filter by neighborhood |
| year | Integer | No | Year (defaults to current) |
| month | Integer | No | Month 1-12 (defaults to current) |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Weekly history fetched.",
  "data": {
    "year": 2026,
    "month": 7,
    "weeks": [
      {
        "weekStart": "2026-06-29",
        "on": 10,
        "off": 5,
        "total": 15
      },
      {
        "weekStart": "2026-07-06",
        "on": 8,
        "off": 12,
        "total": 20
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid query parameters |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Monthly History

Get power reports aggregated by month within a given year.

**Method:** `GET`

**Endpoint:** `/api/v1/history/monthly`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | No | Filter by neighborhood |
| year | Integer | No | Year (defaults to current) |

---

### Success Response

```json
{
  "success": true,
  "message": "Monthly history fetched.",
  "data": {
    "year": 2026,
    "months": [
      {
        "month": "2026-01",
        "on": 100,
        "off": 50,
        "total": 150
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid query parameters |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Outage Hours

Get total outage minutes/hours for completed outages, broken down by neighborhood.

**Method:** `GET`

**Endpoint:** `/api/v1/history/outage-hours`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | No | Filter by neighborhood |
| startDate | String | No | ISO 8601 start date |
| endDate | String | No | ISO 8601 end date |

---

### Success Response

```json
{
  "success": true,
  "message": "Outage hours fetched.",
  "data": {
    "totalOutages": 328,
    "totalMinutes": 14760,
    "totalHours": 246,
    "averageMinutes": 45,
    "byNeighborhood": [
      {
        "neighborhoodId": 9012,
        "neighborhoodName": "Central",
        "outageCount": 25,
        "totalMinutes": 1500,
        "totalHours": 25
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid query parameters |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Power Timeline

Get a granular power report timeline by hour or day for a specific neighborhood and date range. Useful for charts and graphs.

**Method:** `GET`

**Endpoint:** `/api/v1/history/power-timeline`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| neighborhoodId | Integer | **Yes** | Neighborhood ID |
| startDate | String | **Yes** | ISO 8601 start date |
| endDate | String | **Yes** | ISO 8601 end date |
| interval | Enum | No | `hour` or `day` (default `day`) |

---

### Request Example

```
GET /api/v1/history/power-timeline?neighborhoodId=9012&startDate=2026-07-01T00:00:00Z&endDate=2026-07-07T23:59:59Z&interval=day
```

---

### Success Response

```json
{
  "success": true,
  "message": "Power timeline fetched.",
  "data": {
    "neighborhoodId": 9012,
    "interval": "day",
    "startDate": "2026-07-01T00:00:00Z",
    "endDate": "2026-07-07T23:59:59Z",
    "timeline": [
      {
        "period": "2026-07-01",
        "onCount": 5,
        "offCount": 3,
        "totalCount": 8
      },
      {
        "period": "2026-07-02",
        "onCount": 2,
        "offCount": 7,
        "totalCount": 9
      }
    ]
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Missing required parameters (neighborhoodId, startDate, endDate) |
| 401 | Unauthorized - missing or invalid token |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
