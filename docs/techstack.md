# QueueLess — Tech Stack

> Note: The original spec suggested a Java/Spring Boot backend. This version is adapted to a **Node.js + Express** backend with a **React** frontend, per your stack preference. Functional requirements are unchanged.

## Frontend
| Concern | Choice |
|---|---|
| Framework | React (Vite) |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP client | Axios |
| Real-time client | Socket.IO client |
| State management | React Query (server state) + Zustand or Context (UI state) |
| Charts (analytics) | Recharts or Chart.js |
| Forms/validation | React Hook Form + Zod |
| QR generation/scanning | `qrcode` (generate) / `html5-qrcode` (scan) |

## Backend
| Concern | Choice |
|---|---|
| Runtime | Node.js (LTS) |
| Framework | Express.js |
| Language | JavaScript |
| Real-time | Socket.IO (server) — replaces WebSocket/STOMP |
| Auth | JWT (access + refresh tokens), `bcrypt` for password hashing |
| Authorization | Custom RBAC middleware (`ROLE_USER`, `ROLE_STAFF`, `ROLE_ADMIN`) |
| ORM | Prisma (recommended) or Sequelize |
| Validation | Zod or Joi at the route/controller boundary |
| Scheduling/jobs | `node-cron` (e.g. recompute avg service time, no-show sweeps) |
| Email | Nodemailer + SMTP provider (or SES/SendGrid) |
| Logging | Pino or Winston |
| API docs | OpenAPI/Swagger via `swagger-jsdoc` + `swagger-ui-express` |

## Database
| Concern | Choice |
|---|---|
| Primary DB | PostgreSQL |
| Migrations | Prisma Migrate (or Sequelize CLI / node-pg-migrate) |
| Caching (optional, Phase 3) | Redis — queue position cache, rate limiting, pub/sub scaling for Socket.IO |

## Infrastructure / DevOps
| Concern | Choice |
|---|---|
| Containerization | Docker + docker-compose (app, Postgres, Redis) |
| Process management | PM2 (or container orchestrator in prod) |
| CI | GitHub Actions (lint, test, build) |
| Env config | `.env` + `dotenv`, validated at boot with Zod |
| Reverse proxy / prod | Nginx (TLS termination, static asset serving) |

## Testing
| Layer | Tool |
|---|---|
| Backend unit/integration | Jest + Supertest |
| Frontend unit | Vitest + React Testing Library |
| E2E | Playwright or Cypress |

## Package Overview (backend `package.json` core deps)
```
express, cors, helmet, dotenv, jsonwebtoken, bcrypt,
prisma, @prisma/client, socket.io, zod, nodemailer,
node-cron, pino, swagger-jsdoc, swagger-ui-express
```

## Package Overview (frontend `package.json` core deps)
```
react, react-dom, react-router-dom, axios, socket.io-client,
@tanstack/react-query, zustand, react-hook-form, zod,
recharts, tailwindcss, qrcode, html5-qrcode
```

## Why Socket.IO over STOMP
- Simpler to wire up with Express and a single Node process.
- Native room/namespace support maps cleanly onto "one room per queue/service" for broadcasting updates only to relevant subscribers.
- Easy horizontal scaling later via the Redis adapter (`socket.io-redis`) if multiple server instances are needed.