# Location Endpoints

---

## Reverse Geocode

Resolve GPS coordinates to the nearest country, state, LGA, city, town, and neighborhood. Uses OSM Nominatim with Nigeria LGA data fallback.

**Method:** `POST`

**Endpoint:** `/api/v1/locations/reverse-geocode`

**Authentication:** No

---

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | Number | Yes | GPS latitude value |
| longitude | Number | Yes | GPS longitude value |

---

### Request Example

```json
{
  "latitude": 6.524379,
  "longitude": 3.379206
}
```

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Location resolved successfully.",
  "data": {
    "countryId": 1,
    "country": "Nigeria",
    "stateId": 25,
    "state": "Ondo",
    "lgaId": 210,
    "lga": "Okitipupa",
    "cityId": 815,
    "city": "Okitipupa",
    "townId": 4200,
    "town": "Ipogun",
    "neighborhoodId": 9012,
    "neighborhood": "Central",
    "distanceKm": 0,
    "suburb": "Ikeja",
    "village": "Abule Egba",
    "road": "Opebi Road"
  }
}
```

---

### Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Invalid coordinates |
| 404 | No location found for coordinates |
| 500 | Internal server error |

---

## Search

Search for locations by name and return full hierarchy results.

**Method:** `GET`

**Endpoint:** `/api/v1/locations/search`

**Authentication:** No

---

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | String | Yes | Search term for neighborhood, town, city, or LGA |
| limit | Integer | No | Maximum results (default 20, max 100) |

---

### Request Example

`GET /api/v1/locations/search?q=Ikeja&limit=20`

---

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Locations found.",
  "data": [
    {
      "type": "neighborhood",
      "id": 9012,
      "name": "Ikeja",
      "stateId": 25,
      "state": "Lagos",
      "lgaId": 210,
      "lga": "Ikeja",
      "cityId": 815,
      "city": "Ikeja",
      "townId": 4200,
      "town": "Ikeja",
      "neighborhoodId": 9012,
      "neighborhood": "Ikeja"
    }
  ]
}
```

---

### Errors

| Status Code | Description |
|-------------|-------------|
| 400 | Missing or invalid search query |
| 500 | Internal server error |
