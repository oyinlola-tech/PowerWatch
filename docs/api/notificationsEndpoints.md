# Notification Endpoints

---

## Send Notification

Create an in-app notification for the authenticated user.

**Method:** `POST`

**Endpoint:** `/api/v1/notifications`

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
| title | String | Yes | Notification title (max 200 chars) |
| body | String | Yes | Notification body (max 1000 chars) |

---

### Request Example

```json
{
  "title": "Power Restored",
  "body": "Power has been restored in your area."
}
```

---

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Notification sent successfully.",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Power Restored",
    "body": "Power has been restored in your area.",
    "sent": true,
    "delivered": true,
    "opened": false,
    "clicked": false,
    "sentAt": "2026-07-13T12:00:00.000Z",
    "deliveredAt": "2026-07-13T12:00:00.000Z",
    "openedAt": null,
    "clickedAt": null,
    "createdAt": "2026-07-13T12:00:00.000Z"
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

## List Notifications

Retrieve notifications for the authenticated user with pagination.

**Method:** `GET`

**Endpoint:** `/api/v1/notifications`

**Authentication:** Bearer Token

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | Integer | No | Page number (default 1) |
| limit | Integer | No | Results per page (default 20) |
| unreadOnly | Boolean | No | Show only unread notifications (default false) |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Notifications fetched successfully.",
  "data": {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "title": "Power Restored",
        "body": "Power has been restored in your area.",
        "sent": true,
        "delivered": true,
        "opened": false,
        "clicked": false,
        "sentAt": "2026-07-13T12:00:00.000Z",
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

## Unread Count

Get the count of unread notifications.

**Method:** `GET`

**Endpoint:** `/api/v1/notifications/unread-count`

**Authentication:** Bearer Token

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Unread count fetched.",
  "data": {
    "unreadCount": 5
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

## Get Single Notification

Retrieve a notification by ID.

**Method:** `GET`

**Endpoint:** `/api/v1/notifications/:id`

**Authentication:** Bearer Token

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String (UUID) | Yes | Notification ID |

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Notification fetched successfully.",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "title": "Power Restored",
    "body": "Power has been restored in your area.",
    "sent": true,
    "delivered": true,
    "opened": false,
    "clicked": false,
    "sentAt": "2026-07-13T12:00:00.000Z",
    "createdAt": "2026-07-13T12:00:00.000Z"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid or missing notification ID |
| 401 | Unauthorized - missing or invalid token |
| 404 | Notification not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Mark as Read

Mark a notification as opened and/or clicked with timestamps.

**Method:** `PATCH`

**Endpoint:** `/api/v1/notifications/:id/read`

**Authentication:** Bearer Token

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String (UUID) | Yes | Notification ID |

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| opened | Boolean | No | Mark as opened |
| clicked | Boolean | No | Mark as clicked |

---

### Request Example

```json
{
  "opened": true,
  "clicked": true
}
```

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Notification marked as read.",
  "data": {
    "id": "uuid",
    "opened": true,
    "openedAt": "2026-07-13T12:05:00.000Z",
    "clicked": true,
    "clickedAt": "2026-07-13T12:05:01.000Z"
  }
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Validation failed |
| 401 | Unauthorized - missing or invalid token |
| 404 | Notification not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Delete Notification

Delete a notification by ID.

**Method:** `DELETE`

**Endpoint:** `/api/v1/notifications/:id`

**Authentication:** Bearer Token

---

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String (UUID) | Yes | Notification ID |

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Notification deleted successfully.",
  "data": {}
}
```

### Possible Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid or missing notification ID |
| 401 | Unauthorized - missing or invalid token |
| 404 | Notification not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Notification Tracking

Notifications support a four-stage tracking pipeline:

| Stage | DB Field | Set When |
|-------|----------|----------|
| Sent | `sent`, `sentAt` | Notification is created |
| Delivered | `delivered`, `deliveredAt` | Device confirms delivery |
| Opened | `opened`, `openedAt` | User opens the notification |
| Clicked | `clicked`, `clickedAt` | User clicks on the notification |

This data feeds directly into the analyst's notification funnel metrics.
