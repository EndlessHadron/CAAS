# Technical Specifications

## System Architecture

### Backend API (Python/FastAPI)
```
caas-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models/              # Pydantic models
│   │   ├── users.py
│   │   ├── bookings.py
│   │   ├── notifications.py
│   │   └── ai_decisions.py
│   ├── api/                 # API endpoints
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   ├── bookings.py
│   │   │   ├── contractors.py
│   │   │   └── admin.py
│   │   └── webhooks/        # External webhooks
│   ├── core/                # Core functionality
│   │   ├── security.py      # Auth, encryption
│   │   ├── database.py      # Firestore client
│   │   ├── cache.py         # In-memory caching
│   │   └── exceptions.py
│   ├── services/            # Business logic
│   │   ├── booking_service.py
│   │   ├── notification_service.py
│   │   ├── user_service.py
│   │   └── ai_agent_service.py
│   ├── repositories/        # Data access layer
│   │   ├── base.py
│   │   ├── user_repository.py
│   │   └── booking_repository.py
│   ├── utils/              # Utilities
│   │   ├── validators.py
│   │   ├── formatters.py
│   │   └── constants.py
│   └── ai_agent/           # AI Agent module
│       ├── agent.py
│       ├── prompts.py
│       ├── decisions.py
│       └── workflows.py
├── tests/
├── requirements.txt
├── Dockerfile
└── .env.example
```

### Frontend (Next.js)
```
caas-frontend/
├── app/                    # App Router
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── client/
│   │   ├── cleaner/
│   │   └── admin/
│   ├── api/               # API routes
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # Reusable UI components
│   ├── forms/
│   └── layouts/
├── lib/                  # Utilities
│   ├── api-client.ts
│   ├── auth.ts
│   └── utils.ts
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
└── public/               # Static assets
```

## Database Schema (Firestore Collections)

### users
```json
{
  "uid": "string",
  "email": "string",
  "phone": "string",
  "role": "client|cleaner|admin",
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "address": {
      "line1": "string",
      "line2": "string",
      "city": "string",
      "postcode": "string"
    }
  },
  "verification": {
    "email": "boolean",
    "phone": "boolean",
    "identity": "boolean",
    "background": "boolean"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### bookings
```json
{
  "bookingId": "string",
  "clientId": "string",
  "cleanerId": "string|null",
  "status": "pending|confirmed|in_progress|completed|cancelled",
  "service": {
    "type": "regular|deep|move_in",
    "duration": "number (hours)",
    "price": "number"
  },
  "schedule": {
    "date": "timestamp",
    "time": "string",
    "recurring": {
      "enabled": "boolean",
      "frequency": "weekly|biweekly|monthly",
      "endDate": "timestamp|null"
    }
  },
  "location": {
    "address": "object",
    "instructions": "string"
  },
  "payment": {
    "status": "pending|paid|refunded",
    "method": "bank_transfer|card",
    "amount": "number"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### cleaner_availability
```json
{
  "cleanerId": "string",
  "availability": [
    {
      "dayOfWeek": "number (0-6)",
      "slots": [
        {
          "start": "string (HH:MM)",
          "end": "string (HH:MM)"
        }
      ]
    }
  ],
  "blockedDates": ["timestamp"],
  "maxBookingsPerDay": "number"
}
```

### notifications
```json
{
  "notificationId": "string",
  "userId": "string",
  "type": "booking|payment|system|marketing",
  "channel": "push|email|sms",
  "status": "pending|sent|failed|read",
  "content": {
    "subject": "string",
    "body": "string",
    "data": "object"
  },
  "scheduledFor": "timestamp",
  "sentAt": "timestamp|null",
  "createdAt": "timestamp"
}
```

### ai_decisions
```json
{
  "decisionId": "string",
  "type": "string",
  "context": "object",
  "recommendation": "string",
  "confidence": "number (0-1)",
  "humanApproval": {
    "required": "boolean",
    "status": "pending|approved|rejected",
    "approvedBy": "string|null",
    "approvedAt": "timestamp|null"
  },
  "outcome": "object|null",
  "createdAt": "timestamp"
}
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- POST `/api/v1/auth/refresh`
- POST `/api/v1/auth/logout`
- POST `/api/v1/auth/forgot-password`
- POST `/api/v1/auth/reset-password`

### Users
- GET `/api/v1/users/me`
- PUT `/api/v1/users/me`
- POST `/api/v1/users/verify-phone`
- POST `/api/v1/users/upload-document`

### Bookings
- POST `/api/v1/bookings`
- GET `/api/v1/bookings`
- GET `/api/v1/bookings/{id}`
- PUT `/api/v1/bookings/{id}`
- POST `/api/v1/bookings/{id}/cancel`
- GET `/api/v1/bookings/available-slots`

### Contractors
- GET `/api/v1/contractors/jobs`
- POST `/api/v1/contractors/jobs/{id}/accept`
- POST `/api/v1/contractors/jobs/{id}/reject`
- PUT `/api/v1/contractors/availability`
- GET `/api/v1/contractors/earnings`

### Admin
- GET `/api/v1/admin/users`
- PUT `/api/v1/admin/users/{id}`
- GET `/api/v1/admin/bookings`
- GET `/api/v1/admin/analytics`
- GET `/api/v1/admin/ai-decisions`

## Security Specifications

### Authentication & Authorization
- JWT tokens with 15-minute access token expiry
- Refresh tokens with 7-day expiry
- Role-based access control (RBAC)
- API key authentication for webhooks

### Data Protection
- TLS 1.3 for all communications
- Encryption at rest in Firestore
- PII data minimization
- GDPR-compliant data handling

### API Security
- Rate limiting: 100 requests/minute per IP
- CORS configuration for frontend domains only
- Input validation on all endpoints
- SQL injection protection (N/A for Firestore)
- XSS protection headers

## Performance Requirements
- API response time: <200ms (p95)
- Frontend load time: <3s on 3G
- Uptime: 99.9% availability
- Concurrent users: Support 100 simultaneous users
- Database queries: <50ms average

## Monitoring & Logging
- Structured logging with correlation IDs
- Error tracking with Sentry
- Performance monitoring with Google Cloud Monitoring
- Custom metrics for business KPIs
- Real-time alerting for critical issues