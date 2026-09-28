# QueueLess — API Specification (REST + Socket.IO)

Base URL: `/api/v1`
Auth: `Authorization: Bearer <access_token>` unless noted.

## Auth
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user (`ROLE_USER` by default) |
| POST | `/auth/login` | Public | Returns access + refresh token |
| POST | `/auth/refresh` | Public (cookie) | Rotate access token |
| POST | `/auth/logout` | Authenticated | Invalidate refresh token |

## Organizations
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/organizations` | Public | List organizations |
| POST | `/organizations` | ADMIN | Create organization |
| GET | `/organizations/:id` | Public | Get organization detail |
| PATCH | `/organizations/:id` | ADMIN | Update organization |
| DELETE | `/organizations/:id` | ADMIN | Delete organization |

## Services
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/organizations/:orgId/services` | Public | List services + current queue size/wait |
| POST | `/organizations/:orgId/services` | ADMIN | Create service |
| GET | `/services/:id` | Public | Service detail |
| PATCH | `/services/:id` | ADMIN | Update service / priority_config |
| DELETE | `/services/:id` | ADMIN | Deactivate service |

## Counters
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/services/:serviceId/counters` | STAFF/ADMIN | List counters |
| POST | `/services/:serviceId/counters` | ADMIN | Create counter |
| PATCH | `/counters/:id` | ADMIN/STAFF | Update status / assign staff |
| DELETE | `/counters/:id` | ADMIN | Remove counter |

## Queues & Tokens
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/services/:serviceId/queue` | Public | Current queue state (size, currently serving, est. wait) |
| POST | `/services/:serviceId/queue/join` | USER | Join queue, returns token |
| GET | `/queue-entries/:id` | USER (owner) | Track a specific token |
| DELETE | `/queue-entries/:id` | USER (owner) | Cancel own entry |
| POST | `/counters/:counterId/call-next` | STAFF/ADMIN | Call next token (priority-aware) |
| POST | `/queue-entries/:id/skip` | STAFF/ADMIN | Skip a token |
| POST | `/queue-entries/:id/recall` | STAFF/ADMIN | Recall a skipped token |
| POST | `/queue-entries/:id/transfer` | STAFF/ADMIN | Transfer to another counter/service |
| POST | `/queue-entries/:id/complete` | STAFF/ADMIN | Mark service complete |

## Appointments
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/services/:serviceId/appointments/slots` | Public | Available slots |
| POST | `/appointments` | USER | Book a slot |
| POST | `/appointments/:id/check-in` | USER | Check in → creates linked queue entry |
| DELETE | `/appointments/:id` | USER (owner) | Cancel appointment |

## QR Entry
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/qr/:serviceId` | Public | Resolves QR code to service join page |

## Notifications
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | List own notifications |
| PATCH | `/notifications/:id/read` | Authenticated | Mark as read |

## Analytics (Admin)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/organizations/:orgId/analytics/summary` | ADMIN | Totals: users, completed, cancelled, no-shows |
| GET | `/organizations/:orgId/analytics/wait-times` | ADMIN | Avg wait/service time trends |
| GET | `/organizations/:orgId/analytics/peak-hours` | ADMIN | Peak queue hour breakdown |

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join:room` | `{ room: "service:<id>" }` | Subscribe to live updates for a service |
| `leave:room` | `{ room: "service:<id>" }` | Unsubscribe |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `queue:update` | `{ serviceId, currentlyServing, queueSize, estimatedWait }` | Broadcast on any queue mutation |
| `token:called` | `{ tokenNumber, counterId }` | Sent to service room + directly to the called user |
| `token:cancelled` | `{ tokenNumber }` | Broadcast + direct to affected user |
| `position:changed` | `{ userId, newPosition, estimatedWait }` | Direct to affected user's personal room `user:<id>` |

## Example: Join Queue Response
```json
{
  "queueEntryId": "b3f1...",
  "tokenNumber": "D-108",
  "position": 5,
  "estimatedWaitMinutes": 22,
  "status": "WAITING"
}
```

## Error Format
```json
{
  "error": {
    "code": "QUEUE_CLOSED",
    "message": "This queue is not currently accepting new entries."
  }
}
```