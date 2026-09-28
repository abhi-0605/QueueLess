# QueueLess — Database Schema (PostgreSQL / Prisma-style)

## Entity Relationship Overview
```
User ──< QueueEntry >── Queue ── Service ── Organization
User ──< Appointment
User ──< Notification
Service ──< Counter
QueueEntry ──< Notification (via reference)
QueueEntry ──< History (audit trail)
```

## Tables

### `organizations`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| name | varchar | |
| description | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK → organizations, nullable) | null for end customers, set for staff/admin |
| name | varchar | |
| email | varchar (unique) | |
| password_hash | varchar | |
| role | enum(`ROLE_USER`,`ROLE_STAFF`,`ROLE_ADMIN`) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `services`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| organization_id | UUID (FK → organizations) | |
| name | varchar | e.g. "Dermatology" |
| description | text | |
| avg_service_time_seconds | integer | rolling average, recomputed by cron job |
| priority_config | jsonb | org-defined priority rules (not hard-coded) |
| is_active | boolean | |
| created_at | timestamptz | |

### `counters`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| service_id | UUID (FK → services) | |
| name | varchar | e.g. "Counter 3" |
| status | enum(`OPEN`,`CLOSED`,`ON_BREAK`) | |
| assigned_staff_id | UUID (FK → users, nullable) | |
| created_at | timestamptz | |

### `queues`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| service_id | UUID (FK → services) | |
| date | date | queues are typically scoped per operating day |
| status | enum(`OPEN`,`CLOSED`) | |
| created_at | timestamptz | |

### `queue_entries`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| queue_id | UUID (FK → queues) | |
| user_id | UUID (FK → users) | |
| counter_id | UUID (FK → counters, nullable) | set once called |
| token_number | varchar | e.g. `D-108` |
| status | enum(`WAITING`,`CALLED`,`IN_SERVICE`,`COMPLETED`,`SKIPPED`,`CANCELLED`,`NO_SHOW`) | |
| priority_score | integer | derived from `priority_config`, default 0 |
| joined_at | timestamptz | |
| called_at | timestamptz (nullable) | |
| started_at | timestamptz (nullable) | |
| completed_at | timestamptz (nullable) | |

### `appointments`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| service_id | UUID (FK → services) | |
| scheduled_at | timestamptz | |
| status | enum(`SCHEDULED`,`CHECKED_IN`,`COMPLETED`,`NO_SHOW`,`CANCELLED`) | |
| queue_entry_id | UUID (FK → queue_entries, nullable) | linked once checked in |
| created_at | timestamptz | |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → users) | |
| queue_entry_id | UUID (FK → queue_entries, nullable) | |
| type | enum(`TOKEN_CREATED`,`POSITION_CHANGED`,`TURN_APPROACHING`,`TOKEN_CALLED`,`CANCELLED`,`SKIPPED`) | |
| channel | enum(`EMAIL`,`IN_APP`) | |
| payload | jsonb | |
| sent_at | timestamptz | |
| read_at | timestamptz (nullable) | |

### `queue_entry_history` (audit trail, Phase 2+)
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | |
| queue_entry_id | UUID (FK → queue_entries) | |
| previous_status | varchar | |
| new_status | varchar | |
| changed_by_user_id | UUID (FK → users, nullable) | staff/system actor |
| changed_at | timestamptz | |

## Indexing Notes
- `queue_entries(queue_id, status, priority_score, joined_at)` — composite index to efficiently fetch "next token" respecting priority then FIFO order.
- `queue_entries(user_id)` — for user's personal history/tracking view.
- `appointments(service_id, scheduled_at)` — for slot conflict checks.
- `notifications(user_id, read_at)` — for unread notification counts.

## Notes on Priority Config
`services.priority_config` is a JSON structure evaluated by the wait-time/priority service, e.g.:
```json
{
  "rules": [
    { "attribute": "isElderly", "boost": 100 },
    { "attribute": "isDisabled", "boost": 100 },
    { "attribute": "vipTier", "boost": 50 }
  ]
}
```
This keeps priority logic organization-configurable rather than hard-coded, per the spec's requirement.

---

## Seeded Test Accounts (Development)

| Role | Email | Password | Access |
|---|---|---|---|
| `ROLE_ADMIN` | `admin@queueless.local` | `admin123` | Full admin dashboard, org/service/counter CRUD, all queues |
| `ROLE_STAFF` | `staff@queueless.local` | `staff123` | Call next, skip, recall, complete tokens |
| `ROLE_USER` | `user@queueless.local` | `user123` | Join queue, track own token |

**Seeded organization:** City Care Hospital & Wellness Center

**Seeded services:**
- General Consultation — tokens: `GC-101`, `GC-102`, ... (counters: Counter 1, Counter 2)
- Dermatology & Skin Clinic — tokens: `DS-101`, `DS-102`, ... (counter: Counter 3)

**App URLs (local dev):**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`
