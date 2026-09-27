# PowerWatch — Entity Relationship Diagram

> **Tech Stack:** MySQL 8 · Prisma ORM · Fastify · TypeScript · CQRS  
> **Designed for:** Millions of reports, real-time status, push notifications, GIS queries, analytics

## Directory

| File | Contents |
|------|----------|
| [00-overview.md](00-overview.md) | This file: ERD diagram, table listing, architecture diagram |
| [01-tables.md](01-tables.md) | Full column definitions for all 20 tables |
| [02-relationships.md](02-relationships.md) | Cardinalities, foreign keys, cascade rules |
| [03-indexes.md](03-indexes.md) | All indexes with rationale |
| [04-constraints.md](04-constraints.md) | Unique, check, default constraints |
| [05-normalization.md](05-normalization.md) | 1NF/2NF/3NF compliance, deliberate denormalization notes |
| [06-scalability.md](06-scalability.md) | Partitioning, GIS migration, caching, archival, read replicas |
| [07-prisma-modeling.md](07-prisma-modeling.md) | Prisma schema recommendations, soft-delete middleware |
| [08-endpoints.md](08-endpoints.md) | Auth endpoint feasibility check |

---

## Mermaid ER Diagram

```mermaid
erDiagram
    User ||--o{ RefreshToken : "has"
    User ||--o{ Device : "owns"
    User ||--o{ Report : "submits"
    User ||--o{ NotificationLog : "receives"
    User ||--o{ Session : "has"
    User ||--o{ AuditLog : "initiates"
    User }o--|| Country : "resides_in"
    User }o--|| State : "resides_in"
    User }o--|| LGA : "resides_in"
    User }o--|| City : "resides_in"
    User }o--|| Town : "resides_in"
    User }o--|| Neighborhood : "resides_in"

    Country ||--o{ State : "contains"
    State   ||--o{ LGA : "contains"
    LGA     ||--o{ City : "contains"
    City    ||--o{ Town : "contains"
    Town    ||--o{ Neighborhood : "contains"

    Neighborhood ||--o{ Report : "has"
    Neighborhood ||--o{ Outage : "has"
    Outage       ||--o{ OutageReport : "includes"
    Report       ||--o{ OutageReport : "linked_to"

    Neighborhood ||--o{ DailyReportSummary : "summarized_by"
    Neighborhood ||--o{ WeeklyOutageSummary : "summarized_by"
    Neighborhood ||--o{ MonthlyStatistics : "aggregated_in"

    Otp        ||--o{ User : "verifies"

    Session    }o--|| Device : "uses_optional"

    NotificationLog }o--|| User : "belongs_to"

    AuditLog   }o--|| User : "performed_by_optional"

    model User {
        id UUID PK
        firstName VARCHAR
        lastName VARCHAR
        email VARCHAR UK
        passwordHash VARCHAR
        role ENUM
        emailVerified BOOLEAN
        notificationEnabled BOOLEAN
        latitude DECIMAL "nullable"
        longitude DECIMAL "nullable"
        countryId INT FK "nullable"
        stateId INT FK "nullable"
        lgaId INT FK "nullable"
        cityId INT FK "nullable"
        townId INT FK "nullable"
        neighborhoodId INT FK "nullable"
        lastLoginAt DATETIME "nullable"
        passwordChangedAt DATETIME "nullable"
        createdBy UUID FK "nullable,self-ref"
        updatedBy UUID FK "nullable,self-ref"
        deletedAt DATETIME "nullable,soft-delete"
        createdAt DATETIME
        updatedAt DATETIME
    }

    model RefreshToken {
        id UUID PK
        token VARCHAR UK
        userId UUID FK
        expiresAt DATETIME
        createdAt DATETIME
        revokedAt DATETIME "nullable"
    }

    model Device {
        id UUID PK
        userId UUID FK
        deviceName VARCHAR "nullable"
        deviceType ENUM "nullable"
        fcmToken TEXT "nullable"
        browser VARCHAR "nullable"
        platform VARCHAR "nullable"
        lastActive DATETIME "nullable"
        createdAt DATETIME
        updatedAt DATETIME
    }

    model Session {
        id UUID PK
        userId UUID FK
        refreshTokenId UUID FK "nullable"
        deviceId UUID FK "nullable"
        ipAddress VARCHAR "nullable"
        userAgent TEXT "nullable"
        isActive BOOLEAN
        lastActivityAt DATETIME
        expiresAt DATETIME
        createdAt DATETIME
        deletedAt DATETIME "nullable,soft-revoke"
    }

    model Otp {
        id UUID PK
        email VARCHAR
        code VARCHAR "hashed"
        type ENUM
        attempts INT "default 0"
        maxAttempts INT "default 5"
        expiresAt DATETIME
        usedAt DATETIME "nullable"
        createdAt DATETIME
        @@index(email type)
    }

    model Country  { id INT PK; name VARCHAR; latitude DECIMAL "nullable"; longitude DECIMAL "nullable" }
    model State    { id INT PK; countryId INT FK; name VARCHAR; latitude DECIMAL "nullable"; longitude DECIMAL "nullable" }
    model LGA      { id INT PK; stateId INT FK; name VARCHAR; latitude DECIMAL "nullable"; longitude DECIMAL "nullable" }
    model City     { id INT PK; lgaId INT FK; name VARCHAR; latitude DECIMAL "nullable"; longitude DECIMAL "nullable" }
    model Town     { id INT PK; cityId INT FK; name VARCHAR; latitude DECIMAL "nullable"; longitude DECIMAL "nullable" }
    model Neighborhood { id INT PK; townId INT FK; name VARCHAR; latitude DECIMAL "nullable"; longitude DECIMAL "nullable" }

    model Report {
        id UUID PK
        userId UUID FK
        neighborhoodId INT FK
        reportType ENUM
        timestamp DATETIME
        latitude DECIMAL "nullable"
        longitude DECIMAL "nullable"
        deviceType ENUM "nullable"
        createdAt DATETIME
        deletedAt DATETIME "nullable,soft-delete"
    }

    model Outage {
        id UUID PK
        neighborhoodId INT FK
        startTime DATETIME
        endTime DATETIME "nullable"
        duration INT "nullable,minutes"
        reportCount INT "default 0"
        createdAt DATETIME
        updatedAt DATETIME
    }

    model OutageReport {
        id UUID PK
        outageId UUID FK
        reportId UUID FK
        @@unique(outageId reportId)
    }

    model NotificationLog {
        id UUID PK
        userId UUID FK
        title VARCHAR
        body TEXT
        type VARCHAR "nullable"
        sent BOOLEAN
        delivered BOOLEAN
        opened BOOLEAN
        clicked BOOLEAN
        sentAt DATETIME "nullable"
        deliveredAt DATETIME "nullable"
        openedAt DATETIME "nullable"
        clickedAt DATETIME "nullable"
        createdAt DATETIME
    }

    model AuditLog {
        id UUID PK
        userId UUID FK "nullable"
        action VARCHAR
        entityType VARCHAR "nullable"
        entityId VARCHAR "nullable"
        metadata JSON "nullable"
        ipAddress VARCHAR "nullable"
        userAgent TEXT "nullable"
        timestamp DATETIME
    }

    model DailyReportSummary {
        id UUID PK
        date DATE
        neighborhoodId INT FK
        totalReports INT
        onReports INT
        offReports INT
        uniqueUsers INT
        createdAt DATETIME
        updatedAt DATETIME
        @@unique(date neighborhoodId)
    }

    model WeeklyOutageSummary {
        id UUID PK
        weekStart DATE
        neighborhoodId INT FK
        totalOutages INT
        totalDurationMinutes INT
        avgDurationMinutes DECIMAL
        maxDurationMinutes INT
        totalReports INT
        uniqueUsers INT
        createdAt DATETIME
        updatedAt DATETIME
        @@unique(weekStart neighborhoodId)
    }

    model MonthlyStatistics {
        id UUID PK
        monthStart DATE
        neighborhoodId INT FK "nullable"
        stateId INT FK "nullable"
        totalReports INT
        onReports INT
        offReports INT
        totalOutages INT
        totalOutageMinutes INT
        avgOutageMinutes DECIMAL
        uniqueReporters INT
        createdAt DATETIME
        updatedAt DATETIME
        @@unique(monthStart neighborhoodId stateId)
    }

    model RateLimit {
        id UUID PK
        key VARCHAR
        endpoint VARCHAR "nullable"
        windowStart DATETIME
        requestCount INT
        createdAt DATETIME
        updatedAt DATETIME
        @@unique(key endpoint windowStart)
        @@index(key endpoint windowStart)
    }
```

---

## Table Catalog (20 tables)

| # | Table | Type | Purpose |
|---|-------|------|---------|
| 1 | `users` | Core | Authentication, profile, location |
| 2 | `refresh_tokens` | Auth | Token rotation, multi-device support |
| 3 | `devices` | Auth | Push notification targets (FCM) |
| 4 | `sessions` | Auth | Active session tracking |
| 5 | `otps` | Auth | One-time passcodes (email verification, password reset) |
| 6 | `countries` | Location | Country hierarchy root |
| 7 | `states` | Location | State/province level |
| 8 | `lgas` | Location | Local government area |
| 9 | `cities` | Location | City level |
| 10 | `towns` | Location | Town level |
| 11 | `neighborhoods` | Location | Leaf-level granularity for reports |
| 12 | `reports` | Transactional | Power status reports (ON/OFF) |
| 13 | `outages` | Transactional | Auto-detected outage windows |
| 14 | `outage_reports` | Join | M:N between outages and reports |
| 15 | `notification_logs` | Notification | Push/in-app delivery tracking |
| 16 | `audit_logs` | Audit | Immutable action trail |
| 17 | `daily_report_summaries` | Analytics | Materialized daily report counts |
| 18 | `weekly_outage_summaries` | Analytics | Materialized weekly outage metrics |
| 19 | `monthly_statistics` | Analytics | Materialized monthly rollup |
| 20 | `rate_limits` | Infrastructure | DB-backed rate limit counters |

---

## Architecture Diagram

```mermaid
flowchart TB
    subgraph API["API Layer (Fastify)"]
        direction TB
        AR[Auth Routes] --> AC[Auth Controller]
        RR[Report Routes] --> RC[Report Controller]
        ADR[Admin Routes] --> ADC[Admin Controller]
        NR[Notification Routes] --> NC[Notification Controller]
        HR[Health Routes] --> HC[Health Controller]
        AC --> AS[Auth Services<br/>CQRS]
        RC --> RS[Report Services<br/>CQRS]
        ADC --> ADS[Admin Services<br/>CQRS]
        NC --> NS[Notification Services<br/>CQRS]
        HC --> HS[Health Services]
    end

    subgraph ORM["Prisma ORM Layer"]
        direction TB
        AM[Auth Models<br/>User, RefreshToken,<br/>Device, Session, Otp]
        LM[Location Models<br/>Country, State, LGA,<br/>City, Town, Neighborhood]
        RPM[Report Models<br/>Report, Outage,<br/>OutageReport]
        NM[Notification Model<br/>NotificationLog]
        ASM[Audit + Summary Models<br/>AuditLog, DailyReportSummary,<br/>WeeklyOutageSummary,<br/>MonthlyStatistic, RateLimit]
    end

    subgraph DB["MySQL 8 Database (Partitioned)"]
        DB1[(reports<br/>partitioned by year)]
        DB2[(audit_logs<br/>partitioned by year)]
        DB3[(other tables)]
    end

    subgraph AUX["Auxiliary Services"]
        REDIS[Redis Cache<br/>Rate Limiter]
        QUEUE["Queue (RabbitMQ)<br/>Summary Workers"]
        S3[S3<br/>Audit Archive]
        FCM[Firebase FCM]
    end

    AS --> AM
    RS --> RPM
    ADC --> ASM
    NC --> NM
    HS --> DB3

    AM --> DB3
    LM --> DB3
    RPM --> DB1
    NM --> DB3
    ASM --> DB2

    DB1 --> REDIS
    DB2 --> S3
    ASM --> QUEUE
    NC --> FCM
```
