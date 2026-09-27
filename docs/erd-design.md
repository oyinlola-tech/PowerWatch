# PowerWatch — Production ERD Design

This document has been split into focused files for easier reading. See the [erd directory](erd/00-overview.md) for the full content.

## Directory

| File | Contents |
|------|----------|
| [erd/00-overview.md](erd/00-overview.md) | ERD diagram, table catalog, architecture diagram |
| [erd/01-tables.md](erd/01-tables.md) | Full column definitions for all 20 tables |
| [erd/02-relationships.md](erd/02-relationships.md) | 26 relationship definitions with cardinalities |
| [erd/03-indexes.md](erd/03-indexes.md) | 25+ recommended indexes with rationale |
| [erd/04-constraints.md](erd/04-constraints.md) | Referential integrity, unique, check, default constraints |
| [erd/05-normalization.md](erd/05-normalization.md) | 1NF/2NF/3NF analysis, deliberate denormalization |
| [erd/06-scalability.md](erd/06-scalability.md) | Partitioning, GIS spatial indexes, caching, read replicas, archival |
| [erd/07-prisma-modeling.md](erd/07-prisma-modeling.md) | Prisma schema patterns, soft-delete middleware |
| [erd/08-endpoints.md](erd/08-endpoints.md) | Auth endpoint feasibility status |
