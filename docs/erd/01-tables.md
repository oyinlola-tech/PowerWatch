# Table Definitions

```mermaid
classDiagram
    class User {
        +String id PK
        +String firstName
        +String lastName
        +String email UK
        +String passwordHash
        +Role role
        +Boolean emailVerified
        +Boolean notificationEnabled
        +Float latitude?
        +Float longitude?
        +Int countryId FK?
        +Int stateId FK?
        +Int lgaId FK?
        +Int cityId FK?
        +Int townId FK?
        +Int neighborhoodId FK?
        +DateTime lastLoginAt?
        +DateTime passwordChangedAt?
        +String createdBy FK?
        +String updatedBy FK?
        +DateTime deletedAt?
    }
    class RefreshToken {
        +String id PK
        +String token UK
        +String userId FK
        +DateTime expiresAt
        +DateTime revokedAt?
    }
    class Device {
        +String id PK
        +String userId FK
        +String deviceName?
        +DeviceType deviceType?
        +String fcmToken?
        +String browser?
        +String platform?
        +DateTime lastActive?
    }
    class Session {
        +String id PK
        +String userId FK
        +String refreshTokenId FK?
        +String deviceId FK?
        +String ipAddress?
        +String userAgent?
        +Boolean isActive
        +DateTime lastActivityAt
        +DateTime expiresAt
        +DateTime deletedAt?
    }
    class Otp {
        +String id PK
        +String email
        +String code
        +OtpType type
        +Int attempts
        +Int maxAttempts
        +DateTime expiresAt
        +DateTime usedAt?
    }
    class Country { +Int id PK; +String name }
    class State { +Int id PK; +Int countryId FK; +String name }
    class LGA { +Int id PK; +Int stateId FK; +String name }
    class City { +Int id PK; +Int lgaId FK; +String name }
    class Town { +Int id PK; +Int cityId FK; +String name }
    class Neighborhood { +Int id PK; +Int townId FK; +String name }
    class Report {
        +String id PK
        +String userId FK
        +Int neighborhoodId FK
        +ReportType reportType
        +DateTime timestamp
        +Float latitude?
        +Float longitude?
        +DeviceType deviceType?
        +DateTime deletedAt?
    }
    class Outage {
        +String id PK
        +Int neighborhoodId FK
        +DateTime startTime
        +DateTime endTime?
        +Int duration?
        +Int reportCount
    }
    class OutageReport {
        +String id PK
        +String outageId FK
        +String reportId FK
    }
    class NotificationLog {
        +String id PK
        +String userId FK
        +String title
        +String body
        +String type?
        +Boolean sent
        +Boolean delivered
        +Boolean opened
        +Boolean clicked
    }
    class AuditLog {
        +String id PK
        +String userId FK?
        +AuditAction action
        +String entityType?
        +String entityId?
        +Json metadata?
        +String ipAddress?
        +String userAgent?
    }
    class DailyReportSummary {
        +String id PK
        +DateTime date
        +Int neighborhoodId FK
        +Int totalReports
        +Int onReports
        +Int offReports
        +Int uniqueUsers
    }
    class WeeklyOutageSummary {
        +String id PK
        +DateTime weekStart
        +Int neighborhoodId FK
        +Int totalOutages
        +Int totalDurationMin
        +Float avgDurationMin
        +Int maxDurationMin
        +Int totalReports
        +Int uniqueUsers
    }
    class MonthlyStatistic {
        +String id PK
        +DateTime monthStart
        +Int neighborhoodId FK?
        +Int stateId FK?
        +Int totalReports
        +Int onReports
        +Int offReports
        +Int totalOutages
        +Int totalOutageMin
        +Float avgOutageMin
        +Int uniqueReporters
    }
    class RateLimit {
        +String id PK
        +String key
        +String endpoint?
        +DateTime windowStart
        +Int requestCount
    }

    %% Auth domain
    User "1" --> "*" RefreshToken : has
    User "1" --> "*" Device : owns
    User "1" --> "*" Session : has
    User "1" --> "*" AuditLog : initiates
    User "1" --> "*" NotificationLog : receives
    Session "1" --> "1" RefreshToken : uses

    %% Location hierarchy
    Country "1" --> "*" State : contains
    State "1" --> "*" LGA : contains
    LGA "1" --> "*" City : contains
    City "1" --> "*" Town : contains
    Town "1" --> "*" Neighborhood : contains
    User "*" --> "1" Neighborhood : resides_in

    %% Reports domain
    Neighborhood "1" --> "*" Report : has
    Neighborhood "1" --> "*" Outage : has
    Report "1" --> "*" OutageReport : linked_to
    Outage "1" --> "*" OutageReport : includes

    %% Summaries domain
    Neighborhood "1" --> "*" DailyReportSummary : summarized_by
    Neighborhood "1" --> "*" WeeklyOutageSummary : summarized_by
    Neighborhood "1" --> "*" MonthlyStatistic : aggregated_in
```

## `users` — Core Authentication & Profile

| Column               | Type             | Constraints                        |
|----------------------|------------------|------------------------------------|
| id                   | CHAR(36)         | PK, UUID                           |
| first_name           | VARCHAR(50)      | NOT NULL                           |
| last_name            | VARCHAR(50)      | NOT NULL                           |
| email                | VARCHAR(255)     | NOT NULL, UNIQUE                   |
| password_hash        | VARCHAR(255)     | NOT NULL                           |
| role                 | ENUM('USER','ADMIN') | NOT NULL, DEFAULT 'USER'       |
| email_verified       | BOOLEAN          | NOT NULL, DEFAULT false            |
| notification_enabled | BOOLEAN          | NOT NULL, DEFAULT true             |
| latitude             | DECIMAL(10,7)    | NULLABLE                           |
| longitude            | DECIMAL(10,7)    | NULLABLE                           |
| country_id           | INT              | FK → countries(id), NULLABLE       |
| state_id             | INT              | FK → states(id), NULLABLE          |
| lga_id               | INT              | FK → lgas(id), NULLABLE            |
| city_id              | INT              | FK → cities(id), NULLABLE          |
| town_id              | INT              | FK → towns(id), NULLABLE           |
| neighborhood_id      | INT              | FK → neighborhoods(id), NULLABLE   |
| last_login_at        | DATETIME         | NULLABLE                           |
| password_changed_at  | DATETIME         | NULLABLE                           |
| created_by           | CHAR(36)         | FK → users(id), NULLABLE (self)    |
| updated_by           | CHAR(36)         | FK → users(id), NULLABLE (self)    |
| deleted_at           | DATETIME         | NULLABLE (soft delete)             |
| created_at           | DATETIME         | NOT NULL, DEFAULT CURRENT_TIMESTAMP|
| updated_at           | DATETIME         | NOT NULL, ON UPDATE CURRENT_TIMESTAMP |

---

## `refresh_tokens` — Token Rotation

| Column     | Type         | Constraints                       |
|------------|--------------|-----------------------------------|
| id         | CHAR(36)     | PK, UUID                          |
| token      | VARCHAR(512) | NOT NULL, UNIQUE (hashed)         |
| user_id    | CHAR(36)     | FK → users(id), ON DELETE CASCADE |
| expires_at | DATETIME     | NOT NULL                          |
| revoked_at | DATETIME     | NULLABLE                          |
| created_at | DATETIME     | NOT NULL                          |

---

## `devices` — Push Notification Targets

| Column      | Type                         | Constraints                       |
|-------------|------------------------------|-----------------------------------|
| id          | CHAR(36)                     | PK, UUID                          |
| user_id     | CHAR(36)                     | FK → users(id), ON DELETE CASCADE |
| device_name | VARCHAR(100)                 | NULLABLE                          |
| device_type | ENUM('ANDROID','IOS','WEB')  | NULLABLE                          |
| fcm_token   | TEXT                         | NULLABLE                          |
| browser     | VARCHAR(100)                 | NULLABLE                          |
| platform    | VARCHAR(50)                  | NULLABLE                          |
| last_active | DATETIME                     | NULLABLE                          |
| created_at  | DATETIME                     | NOT NULL                          |
| updated_at  | DATETIME                     | NOT NULL                          |

---

## `sessions` — Active Session Tracking

| Column           | Type      | Constraints                       |
|------------------|-----------|-----------------------------------|
| id               | CHAR(36)  | PK, UUID                          |
| user_id          | CHAR(36)  | FK → users(id), ON DELETE CASCADE |
| refresh_token_id | CHAR(36)  | FK → refresh_tokens(id), NULLABLE |
| device_id        | CHAR(36)  | FK → devices(id), NULLABLE        |
| ip_address       | VARCHAR(45)| NULLABLE (supports IPv6)         |
| user_agent       | TEXT      | NULLABLE                          |
| is_active        | BOOLEAN   | NOT NULL, DEFAULT true            |
| last_activity_at | DATETIME  | NOT NULL                          |
| expires_at       | DATETIME  | NOT NULL                          |
| created_at       | DATETIME  | NOT NULL                          |
| deleted_at       | DATETIME  | NULLABLE (soft revoke)            |

---

## `otps` — One-Time Passcodes

| Column       | Type                                    | Constraints         |
|--------------|-----------------------------------------|---------------------|
| id           | CHAR(36)                                | PK, UUID            |
| email        | VARCHAR(255)                            | NOT NULL            |
| code         | VARCHAR(255)                            | NOT NULL (hashed)   |
| type         | ENUM('EMAIL_VERIFICATION','PASSWORD_RESET') | NOT NULL       |
| attempts     | INT                                     | NOT NULL, DEFAULT 0 |
| max_attempts | INT                                     | NOT NULL, DEFAULT 5 |
| expires_at   | DATETIME                                | NOT NULL            |
| used_at      | DATETIME                                | NULLABLE            |
| created_at   | DATETIME                                | NOT NULL            |

---

## Location Hierarchy (6 tables)

| Table          | PK    | FK Parent   | Name    | Lat/Lng           |
|----------------|-------|-------------|---------|-------------------|
| `countries`    | INT   | —           | VARCHAR | DECIMAL(10,7)     |
| `states`       | INT   | country_id  | VARCHAR | DECIMAL(10,7)     |
| `lgas`         | INT   | state_id    | VARCHAR | DECIMAL(10,7)     |
| `cities`       | INT   | lga_id      | VARCHAR | DECIMAL(10,7)     |
| `towns`        | INT   | city_id     | VARCHAR | DECIMAL(10,7)     |
| `neighborhoods`| INT   | town_id     | VARCHAR | DECIMAL(10,7)     |

---

## `reports` — Core Power Status Reports

| Column         | Type                        | Constraints                       |
|----------------|-----------------------------|-----------------------------------|
| id             | CHAR(36)                    | PK, UUID                          |
| user_id        | CHAR(36)                    | FK → users(id), ON DELETE CASCADE |
| neighborhood_id| INT                         | FK → neighborhoods(id)            |
| report_type    | ENUM('ON','OFF')            | NOT NULL                          |
| timestamp      | DATETIME                    | NOT NULL                          |
| latitude       | DECIMAL(10,7)               | NULLABLE                          |
| longitude      | DECIMAL(10,7)               | NULLABLE                          |
| device_type    | ENUM('ANDROID','IOS','WEB') | NULLABLE                          |
| created_at     | DATETIME                    | NOT NULL                          |
| deleted_at     | DATETIME                    | NULLABLE (soft delete)            |

---

## `outages` — Auto-Detected Outage Windows

| Column          | Type      | Constraints                       |
|-----------------|-----------|-----------------------------------|
| id              | CHAR(36)  | PK, UUID                          |
| neighborhood_id | INT       | FK → neighborhoods(id)            |
| start_time      | DATETIME  | NOT NULL                          |
| end_time        | DATETIME  | NULLABLE (NULL = ongoing)         |
| duration        | INT       | NULLABLE (minutes)                |
| report_count    | INT       | NOT NULL, DEFAULT 0               |
| created_at      | DATETIME  | NOT NULL                          |
| updated_at      | DATETIME  | NOT NULL                          |

---

## `outage_reports` — Join Table (M:N)

| Column    | Type     | Constraints                                     |
|-----------|----------|-------------------------------------------------|
| id        | CHAR(36) | PK, UUID                                        |
| outage_id | CHAR(36) | FK → outages(id), ON DELETE CASCADE             |
| report_id | CHAR(36) | FK → reports(id), ON DELETE CASCADE             |
|           |          | UNIQUE(outage_id, report_id)                    |

---

## `notification_logs` — Delivery Tracking

| Column       | Type      | Constraints                       |
|--------------|-----------|-----------------------------------|
| id           | CHAR(36)  | PK, UUID                          |
| user_id      | CHAR(36)  | FK → users(id), ON DELETE CASCADE |
| title        | VARCHAR(255) | NOT NULL                       |
| body         | TEXT      | NOT NULL                          |
| type         | VARCHAR(50) | NULLABLE                         |
| sent         | BOOLEAN   | DEFAULT false                     |
| delivered    | BOOLEAN   | DEFAULT false                     |
| opened       | BOOLEAN   | DEFAULT false                     |
| clicked      | BOOLEAN   | DEFAULT false                     |
| sent_at      | DATETIME  | NULLABLE                          |
| delivered_at | DATETIME  | NULLABLE                          |
| opened_at    | DATETIME  | NULLABLE                          |
| clicked_at   | DATETIME  | NULLABLE                          |
| created_at   | DATETIME  | NOT NULL                          |

---

## `audit_logs` — Immutable Activity Record

| Column      | Type      | Constraints                           |
|-------------|-----------|---------------------------------------|
| id          | CHAR(36)  | PK, UUID                              |
| user_id     | CHAR(36)  | FK → users(id), NULLABLE (anonymous)  |
| action      | VARCHAR(50) | NOT NULL                            |
| entity_type | VARCHAR(50) | NULLABLE                            |
| entity_id   | VARCHAR(36) | NULLABLE                            |
| metadata    | JSON      | NULLABLE                              |
| ip_address  | VARCHAR(45) | NULLABLE                            |
| user_agent  | TEXT      | NULLABLE                              |
| timestamp   | DATETIME  | NOT NULL, DEFAULT CURRENT_TIMESTAMP   |

---

## `daily_report_summaries` — Materialized Daily Rollup

| Column          | Type    | Constraints                  |
|-----------------|---------|------------------------------|
| id              | CHAR(36)| PK, UUID                     |
| date            | DATE    | NOT NULL                     |
| neighborhood_id | INT     | FK → neighborhoods(id)       |
| total_reports   | INT     | NOT NULL                     |
| on_reports      | INT     | NOT NULL                     |
| off_reports     | INT     | NOT NULL                     |
| unique_users    | INT     | NOT NULL                     |
| created_at      | DATETIME| NOT NULL                     |
| updated_at      | DATETIME| NOT NULL                     |
|                 |         | UNIQUE(date, neighborhood_id)|

---

## `weekly_outage_summaries` — Materialized Weekly Rollup

| Column              | Type         | Constraints                  |
|---------------------|--------------|------------------------------|
| id                  | CHAR(36)     | PK, UUID                     |
| week_start          | DATE         | NOT NULL (Monday)            |
| neighborhood_id     | INT          | FK → neighborhoods(id)       |
| total_outages       | INT          | NOT NULL                     |
| total_duration_min  | INT          | NOT NULL                     |
| avg_duration_min    | DECIMAL(10,2)| NOT NULL                     |
| max_duration_min    | INT          | NOT NULL                     |
| total_reports       | INT          | NOT NULL                     |
| unique_users        | INT          | NOT NULL                     |
| created_at          | DATETIME     | NOT NULL                     |
| updated_at          | DATETIME     | NOT NULL                     |
|                     |              | UNIQUE(week_start, neighborhood_id) |

---

## `monthly_statistics` — Materialized Monthly Rollup

| Column             | Type         | Constraints                        |
|--------------------|--------------|------------------------------------|
| id                 | CHAR(36)     | PK, UUID                           |
| month_start        | DATE         | NOT NULL                           |
| neighborhood_id    | INT          | FK → neighborhoods(id), NULLABLE   |
| state_id           | INT          | FK → states(id), NULLABLE          |
| total_reports      | INT          | NOT NULL                           |
| on_reports         | INT          | NOT NULL                           |
| off_reports        | INT          | NOT NULL                           |
| total_outages      | INT          | NOT NULL                           |
| total_outage_min   | INT          | NOT NULL                           |
| avg_outage_min     | DECIMAL(10,2)| NOT NULL                           |
| unique_reporters   | INT          | NOT NULL                           |
| created_at         | DATETIME     | NOT NULL                           |
| updated_at         | DATETIME     | NOT NULL                           |
|                    |              | UNIQUE(month_start, neighborhood_id, state_id) |

---

## `rate_limits` — API Rate Limit Tracking

| Column       | Type         | Constraints                       |
|--------------|--------------|-----------------------------------|
| id           | CHAR(36)     | PK, UUID                          |
| key          | VARCHAR(255) | NOT NULL (IP or user_id or email) |
| endpoint     | VARCHAR(100) | NULLABLE                          |
| window_start | DATETIME     | NOT NULL                          |
| request_count| INT          | NOT NULL                          |
| created_at   | DATETIME     | NOT NULL                          |
| updated_at   | DATETIME     | NOT NULL                          |
|              |              | UNIQUE(key, endpoint, window_start) |
