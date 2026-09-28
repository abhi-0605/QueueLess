# QueueLess — Product Requirements Document (PRD)

## 1. Overview
**Product name:** QueueLess — Smart Digital Queue Management System
**One-liner:** A real-time queue orchestration platform that lets organizations digitize physical queues, dynamically manage service counters, estimate waiting times, and keep users synchronized with queue status.

**Problem statement:** Physical queues waste customer time, give no visibility into wait times, and are hard for staff to manage fairly (priority cases, no-shows, transfers). Organizations need a system that digitizes the queue, gives customers live status, and gives staff full control over service flow.

**Target users:**
- **End users / customers** — join a queue or book an appointment, track their token in real time.
- **Staff** — serve assigned queues, call/skip/transfer tokens.
- **Admins** — configure organizations, services, counters, roles, and view analytics.

## 2. Goals
- Let users join a virtual queue or book a slot without physically waiting in line.
- Provide live, no-refresh-needed queue status and wait-time estimates.
- Give staff/admins full operational control over queues and counters.
- Support configurable priority rules per organization (not hard-coded).
- Provide notifications at key lifecycle events (token created, position changed, turn approaching, called, cancelled/skipped).
- Provide analytics to help admins spot bottlenecks.

## 3. Non-Goals (for MVP)
- Payments / billing integration.
- Native mobile apps (a responsive PWA-friendly web app is sufficient).
- Multi-language / i18n support.
- SMS notifications (email/browser push only for MVP).

## 4. Core Workflow
```
User/Admin → Service Selection → Queue/Appointment → Token Generation
→ Live Queue → Real-Time Updates → Notification → User's Turn
```

## 5. Functional Requirements

### 5.1 User Side
- Register/login (JWT-based auth).
- Browse organizations and available services.
- View current queue size and estimated wait time per service.
- Join a queue and receive a token (e.g. `D-108`).
- View: currently serving token, people ahead, estimated wait.
- Optionally scan a QR code at a physical location to jump straight to the service page and get a token.
- Book an appointment slot as an alternative to walk-in queueing.
- Receive notifications on status changes.
- View personal queue/appointment history.

### 5.2 Staff Side
- View and manage only assigned queues/counters.
- Call next token, skip, recall, transfer, or cancel a token.
- Update service/counter status (open/closed/on-break).
- View list of waiting users for their counter.

### 5.3 Admin Side
- CRUD for organizations, services, counters, and users.
- Configure priority rules per organization (e.g. elderly/disabled priority, VIP tiers) via configuration, not hard-coded logic.
- Full visibility into all queues across the organization.
- View analytics dashboard (see 5.5).
- Manage RBAC role assignment.

### 5.4 Real-Time Queue
- Queue state updates push to all connected clients without a page refresh.
- When staff calls the next token, all relevant subscribed clients update immediately.

### 5.5 Analytics
- Total users, completed services, cancellations, no-shows.
- Average waiting time, average service time.
- Peak queue hours (chart).
- Per-service and per-counter breakdowns.

### 5.6 Notifications
Triggered on: token generated, queue position changed, turn approaching (configurable threshold, e.g. "3 people ahead"), token called, entry cancelled/skipped.
Channels for MVP: email + in-app/browser push.

### 5.7 Appointment + Queue Hybrid
- Users choose: join live queue now, or book a future time slot.
- Backend reconciles appointment slots with walk-in queue entries to avoid double-booking a counter/time.

## 6. Roles (RBAC)
| Role | Permissions |
|---|---|
| `ROLE_USER` | Join queues, book appointments, track tokens, view own history |
| `ROLE_STAFF` | Manage assigned queues/counters, call/skip/transfer tokens, update service status |
| `ROLE_ADMIN` | Full config: organizations, services, counters, users, roles, analytics |

## 7. Estimated Wait Time (MVP formula)
```
Estimated Wait ≈ People Ahead × Average Service Time
```
`Average Service Time` is computed from historical completed `QueueEntry` records (rolling average, e.g. last 50 completions per service).

## 8. Success Metrics
- Reduction in perceived/actual wait time vs. physical queueing.
- % of users who use QR/self-service join vs. manual join.
- Staff efficiency: average handling time per token.
- Notification delivery reliability (>95% delivered within a few seconds of the event).

## 9. Release Phases

**Phase 1 — MVP (Must Have)**
Registration/login, RBAC, organization/service creation, join queue, token generation, admin dashboard, call next, skip/cancel, live queue position (poll or basic real-time), PostgreSQL persistence.

**Phase 2 — Strong Additions**
Real-time via WebSockets (Socket.IO), wait-time estimation, appointments, notifications, queue history, analytics dashboard.

**Phase 3 — Optional / Stretch**
QR-code joining, Redis caching, multi-branch organizations, advanced analytics, queue optimization algorithms, Docker deployment, installable PWA.

## 10. Open Questions
- Do priority queues need weighted scoring, or simple tiered jump-the-line rules?
- Should transfers between counters preserve original join timestamp for fairness?
- Is email delivery via a third-party provider (e.g. SES, SendGrid) acceptable for MVP notification SLAs?