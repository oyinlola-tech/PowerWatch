# Prisma Modeling Recommendations

## Soft-Delete Middleware Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant MW as Prisma Middleware
    participant DB as MySQL

    Note over App,DB: findMany / findFirst
    App->>MW: prisma.user.findMany()
    MW->>MW: Inject where.deletedAt = null
    MW->>DB: SELECT * FROM users WHERE deleted_at IS NULL
    DB-->>MW: Results
    MW-->>App: Filtered results

    Note over App,DB: delete
    App->>MW: prisma.user.delete(id)
    MW->>MW: Change action to "update"
    MW->>DB: UPDATE users SET deleted_at = NOW() WHERE id = ?
    DB-->>MW: OK
    MW-->>App: Updated record

    Note over App,DB: deleteMany
    App->>MW: prisma.user.deleteMany(where)
    MW->>MW: Change action to "updateMany"
    MW->>DB: UPDATE users SET deleted_at = NOW() WHERE ...
    DB-->>MW: Count
    MW-->>App: Updated count
```

## Migration Strategy

```mermaid
flowchart LR
    subgraph DEV["Development"]
        D1[Edit schema.prisma]
        D2[npx prisma db push]
        D1 --> D2
    end

    subgraph PROD["Production"]
        P1[npx prisma migrate dev<br/>--name add_sessions]
        P2[Review migration SQL]
        P3[npx prisma migrate deploy]
        P1 --> P2 --> P3
    end

    DEV -->|Commit migration files| PROD
```

## Enum Definitions

```prisma
enum Role { USER ADMIN }
enum DeviceType { ANDROID IOS WEB }
enum ReportType { ON OFF }
enum AuditAction {
  LOGIN REGISTER LOGOUT PASSWORD_RESET PASSWORD_CHANGE
  PROFILE_UPDATE EMAIL_VERIFY REPORT_CREATE REPORT_DELETE
  ADMIN_ACTION ACCOUNT_DELETE DEVICE_REGISTER DEVICE_REMOVE
  SESSION_REVOKE LOGOUT_ALL
}
enum NotificationType { PUSH INAPP EMAIL BROADCAST }
enum OtpType { EMAIL_VERIFICATION PASSWORD_RESET }
```

## Soft-Delete Middleware

```typescript
prisma.$use(async (params, next) => {
  const softDeletable = ['User', 'Report', 'Session', 'RefreshToken'];
  if (softDeletable.includes(params.model ?? '')) {
    if (params.action === 'findMany' || params.action === 'findFirst') {
      params.args.where = { ...params.args.where, deletedAt: null };
    }
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args.data = { deletedAt: new Date() };
    }
  }
  return next(params);
});
```

## Migration Strategy

```bash
# Development
npx prisma db push

# Production
npx prisma migrate dev --name add_sessions_audit_summaries
npx prisma migrate deploy
```

## Key Modeling Decisions

1. **UUIDs over auto-increment**: Prevents ID enumeration attacks, simplifies sharding, and enables client-side ID generation.

2. **`@map()` on all columns**: Ensures snake_case in MySQL while allowing camelCase in TypeScript, following Prisma conventions.

3. **`@db.VarChar` annotations**: Explicit column types prevent Prisma from picking suboptimal defaults.

4. **`@@index` declarations**: Indexes are declared in the schema so they're part of migrations, not ad-hoc.

5. **`@@map()` on all models**: Explicit table names prevent Prisma's default pluralization from producing unexpected names.

6. **Self-referential User relations**: `createdBy`/`updatedBy` enable audit trails without a separate table for every entity.

7. **Summary tables as Prisma models**: They behave like regular models for CRUD but are only written to by materialization jobs, not by application transactions.
