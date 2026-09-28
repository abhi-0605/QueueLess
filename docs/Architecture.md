# QueueLess — System Architecture

## 1. High-Level Architecture

```
┌─────────────────────┐        HTTPS/REST         ┌──────────────────────────┐
│                      │ ─────────────────────────▶│                          │
│   React Client       │                            │   Express API Server    │
│  (User / Staff /     │◀─────────────────────────  │  (Node.js, TypeScript)  │
│   Admin dashboards)  │                            │                          │
│                      │◀════ WebSocket (Socket.IO) ═▶│                          │
└─────────────────────┘                            └───────────┬──────────────┘
                                                                 │
                                    ┌────────────────────────────┼───────────────────────┐
                                    │                             │                       │
                             ┌──────▼───────┐             ┌───────▼────────┐      ┌───────▼───────┐
                             │  PostgreSQL   │             │  Redis (opt.)  │      │  Email Service │
                             │  (Prisma ORM) │             │  cache/pubsub  │      │  (Nodemailer)  │
                             └───────────────┘             └────────────────┘      └────────────────┘
```

## 2. Component Breakdown

### 2.1 React Client
- **Public/User app**: service browsing, join queue, live token tracker, appointment booking, QR scan entry.
- **Staff dashboard**: assigned counter view, call/skip/transfer/cancel controls.
- **Admin dashboard**: org/service/counter CRUD, RBAC management, analytics charts.
- Shared **Socket.IO connection** subscribes to rooms per `serviceId` or `queueId`; UI reacts to `queue:update` events instead of polling.

### 2.2 Express API Server
Layered structure:
```
src/
  routes/          → route definitions (auth, users, orgs, services, counters, queues, tokens, appointments, analytics)
  controllers/      → request handling, calls services
  services/         → business logic (wait-time calc, priority resolution, token generation)
  repositories/      → Prisma queries, DB access
  middleware/         → auth (JWT verify), RBAC guard, error handler, request validation
  sockets/           → Socket.IO event handlers & room management
  jobs/              → node-cron jobs (avg service time recompute, no-show detection)
  utils/             → helpers (QR generation, email templates)
```

### 2.3 Real-Time Layer (Socket.IO)
- **Rooms**: one room per `service:{serviceId}` and optionally `org:{orgId}` for admin-wide views.
- **Events emitted by server**: `queue:update`, `token:called`, `token:cancelled`, `position:changed`.
- **Events received from client**: `join:room` (subscribe), `leave:room`.
- On any queue mutation (call next, skip, cancel, transfer, new join), the service layer emits the updated state to the relevant room(s).

### 2.4 Database Layer
- PostgreSQL as source of truth.
- Prisma ORM for type-safe queries and migrations.
- Redis (Phase 3) as a read-through cache for "current queue state" to reduce DB load on high-traffic services, and as the Socket.IO adapter for multi-instance scaling.

### 2.5 Notification Service
- Internal event bus (simple EventEmitter or a lightweight queue like BullMQ if volume grows) decouples "queue mutated" from "send notification."
- Handlers: email via Nodemailer, in-app notification row + Socket.IO push for browser notification.

### 2.6 Scheduled Jobs (node-cron)
- Recompute rolling average service time per service (used in wait-time formula).
- Sweep for no-shows (appointment time passed with no check-in → mark no-show).
- Optionally auto-expire stale queue entries.

## 3. Request Flow Examples

### 3.1 Join Queue
1. Client `POST /api/queues/:serviceId/join`.
2. Controller validates auth + payload → service layer creates `QueueEntry`, computes position and estimated wait.
3. Repository persists entry; server emits `queue:update` to `service:{serviceId}` room.
4. Notification service fires "token generated" email/push.
5. Client receives token info in the HTTP response, and live updates thereafter via socket.

### 3.2 Call Next Token (Staff)
1. Staff client `POST /api/counters/:counterId/call-next`.
2. RBAC middleware confirms `ROLE_STAFF`/`ROLE_ADMIN` and counter assignment.
3. Service layer selects next entry (respecting priority rules), updates status to `IN_SERVICE`.
4. Emits `token:called` to the service room; notifies the specific user directly (personal room `user:{userId}`).

## 4. Security
- JWT access tokens (short-lived) + refresh tokens (httpOnly cookie).
- `helmet` for HTTP header hardening, `cors` restricted to known origins.
- RBAC middleware checks role **and** resource ownership (e.g. staff can only act on assigned counters).
- Input validation (Zod) at every controller boundary.
- Rate limiting on auth and join-queue endpoints to prevent abuse/spam tokens.

## 5. Scalability Notes (Phase 3)
- Stateless Express instances behind a load balancer; Socket.IO scaled via Redis adapter so events broadcast across instances.
- Redis cache for hot queue-state reads.
- Read replicas for PostgreSQL if analytics queries grow heavy; consider a separate analytics read model.

## 6. Deployment
- Docker Compose for local dev: `app`, `postgres`, `redis` (optional), `adminer` (optional DB UI).
- Production: containers behind Nginx (TLS + static frontend serving), managed Postgres, managed Redis.