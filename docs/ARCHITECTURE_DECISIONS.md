# Architecture Decisions Record (ADR)

## Overview
This document tracks all major architectural decisions for the Cleaning as a Service (CAAS) platform.

## Decision Log

### ADR-001: Backend Technology Stack
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need to choose backend framework for API development  
**Decision**: Python with FastAPI  
**Rationale**: 
- Team preference for Python
- Excellent AI/ML library ecosystem
- FastAPI provides modern async support, automatic OpenAPI docs
- Strong typing with Pydantic
- Better integration with AI agents and LangChain

### ADR-002: Database Selection
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need scalable, cost-effective database solution  
**Decision**: Google Firestore (NoSQL) as primary database  
**Rationale**:
- Generous free tier (1GB storage, 50K reads/day)
- Real-time sync capabilities for notifications
- Scales automatically
- Simple data model fits our use case
- No need for complex joins initially

### ADR-003: Caching Strategy
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need to optimize performance without additional cost  
**Decision**: In-memory caching within Cloud Run instances  
**Rationale**:
- No additional infrastructure cost
- Sufficient for initial scale (<100 users)
- Can migrate to Memorystore Redis later if needed

### ADR-004: Email Service
**Date**: 2025-08-03  
**Status**: Pending  
**Context**: Need reliable email delivery for notifications  
**Options**:
1. Gmail API (free, 250 quota units/user/second)
2. SendGrid (100 emails/day free)
3. Amazon SES (62,000 emails/month free if sending from EC2)
**Decision**: TBD - Need to evaluate based on volume projections

### ADR-005: Frontend Framework
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need mobile-friendly, SEO-optimized web application  
**Decision**: Next.js 14 with App Router  
**Rationale**:
- Server-side rendering for SEO
- Excellent mobile performance
- Built-in optimizations
- Easy PWA conversion for app-like experience

### ADR-006: AI Agent Framework
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need AI orchestration for business automation  
**Decision**: LangChain with Claude API  
**Rationale**:
- Mature ecosystem
- Built-in memory management
- Easy integration with various LLMs
- Structured decision trees support

### ADR-007: Authentication Provider
**Date**: 2025-08-03  
**Status**: Pending  
**Context**: Need secure, GDPR-compliant authentication  
**Options**:
1. Firebase Auth (generous free tier)
2. Auth0 (7,000 active users free)
3. Supabase Auth (50,000 MAU free)
**Decision**: TBD - Evaluating based on integration complexity

### ADR-008: Infrastructure Platform
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need scalable, cost-effective hosting  
**Decision**: Google Cloud Platform  
**Rationale**:
- Cloud Run free tier (2M requests/month)
- Integrated services (Firestore, Cloud Functions, etc.)
- Good free tier across services
- Future scaling options

### ADR-009: Background Job Processing
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need to handle async tasks (emails, notifications, AI processing)  
**Decision**: Cloud Functions + Cloud Scheduler + Pub/Sub  
**Rationale**:
- Cloud Functions: 2M invocations free/month
- Cloud Scheduler: 3 free jobs
- Pub/Sub: 10GB free/month
- Serverless, no idle costs

### ADR-010: Development Language Standards
**Date**: 2025-08-03  
**Status**: Approved  
**Context**: Need consistent coding standards  
**Decision**: 
- Backend: Python 3.11+ with type hints
- Frontend: TypeScript
- Infrastructure: Terraform for IaC
**Rationale**:
- Type safety across stack
- Modern language features
- Industry standards