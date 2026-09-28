# QueueLess — Roadmap / MVP Phases

## Phase 1 — MVP (Must Have)
- [ ] Auth: register/login (JWT), password hashing
- [ ] RBAC: `ROLE_USER`, `ROLE_STAFF`, `ROLE_ADMIN` middleware
- [ ] Organization & Service CRUD (admin)
- [ ] Join queue → token generation
- [ ] Admin dashboard: view queues, call next, skip/cancel
- [ ] Live queue position (polling acceptable for MVP if sockets aren't ready yet)
- [ ] PostgreSQL schema + migrations (Prisma)
- [ ] Basic frontend: service list, join flow, token tracker, admin queue view

**Definition of done:** A user can register, pick a service, join the queue, see their position, and staff can call/skip/cancel their token from a dashboard — all persisted in Postgres.

## Phase 2 — Strong Additions
- [ ] Real-time updates via Socket.IO (replace polling)
- [ ] Wait-time estimation service (rolling average via cron job)
- [ ] Appointment booking + check-in flow, reconciled with walk-in queue
- [ ] Notifications: email + in-app, triggered on lifecycle events
- [ ] Queue entry history / audit trail
- [ ] Analytics dashboard v1 (totals, avg wait, avg service time)
- [ ] Counter management (open/close/assign staff)
- [ ] Priority queue support via `priority_config` (org-configurable)

**Definition of done:** Queue status updates live with no refresh, users get notified at each stage, appointments and walk-ins share the same underlying queue without conflicts, and admins can see basic operational analytics.

## Phase 3 — Optional / Stretch
- [ ] QR-code generation per service + scan-to-join flow
- [ ] Redis caching for hot queue state + Socket.IO Redis adapter for horizontal scaling
- [ ] Multi-branch / multi-location organizations
- [ ] Advanced analytics (peak-hour heatmaps, no-show prediction, per-counter throughput)
- [ ] Queue optimization (dynamic counter reassignment, load balancing across counters)
- [ ] Docker deployment (docker-compose → production images)
- [ ] PWA support (installable, offline-tolerant shell)

## Suggested Milestone Order
1. Auth + RBAC + DB schema (foundation)
2. Org/Service/Counter CRUD (admin can configure a queue)
3. Join queue + token generation + basic admin call/skip (walking skeleton)
4. Socket.IO real-time layer
5. Wait-time estimation + notifications
6. Appointments
7. Analytics
8. Phase 3 stretch items as time allows
