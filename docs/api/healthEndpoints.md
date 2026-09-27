# Health Endpoints

---

## Full Health Check

Check server, database, and Firebase status in a single call.

**Method:** `GET`

**Endpoint:** `/api/v1/health`

**Authentication:** No

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "All systems healthy.",
  "data": {
    "server": {
      "status": "healthy",
      "uptime": 12345.67,
      "timestamp": "2026-07-13T12:00:00.000Z"
    },
    "database": {
      "status": "healthy",
      "latencyMs": 5,
      "timestamp": "2026-07-13T12:00:00.000Z"
    },
    "firebase": {
      "status": "healthy",
      "projectId": "my-firebase-project",
      "timestamp": "2026-07-13T12:00:00.000Z"
    }
  }
}
```

Returns `503 Service Unavailable` if the database is unhealthy.

---

## Database Health

Ping the database and return connection latency.

**Method:** `GET`

**Endpoint:** `/api/v1/health/database`

**Authentication:** No

---

### Success Response

```json
{
  "success": true,
  "message": "Database health check.",
  "data": {
    "status": "healthy",
    "latencyMs": 5,
    "timestamp": "2026-07-13T12:00:00.000Z"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 500 | Internal server error |

---

## Firebase Health

Check Firebase initialization status.

**Method:** `GET`

**Endpoint:** `/api/v1/health/firebase`

**Authentication:** No

---

### Success Response

```json
{
  "success": true,
  "message": "Firebase health check.",
  "data": {
    "status": "healthy",
    "projectId": "my-firebase-project",
    "timestamp": "2026-07-13T12:00:00.000Z"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 500 | Internal server error |
