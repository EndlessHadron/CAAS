# CAAS Project Context & Current Status

> **📋 For comprehensive technical documentation, see [ENGINEERING_HANDOVER.md](./ENGINEERING_HANDOVER.md)**

## Quick Project Summary
**CAAS (Cleaning as a Service)** is a live production SaaS platform connecting clients with cleaning contractors in London, UK.

- **Production URL**: https://caas-backend-102964896009.europe-west2.run.app  
- **Status**: ✅ OPERATIONAL - Authentication system fully restored
- **Architecture**: Next.js 14 + FastAPI on Google Cloud Run + Firestore
- **Last Major Issue**: bcrypt compatibility fixed August 5, 2025

## Current System Status ✅

### Recently Resolved (August 2025)
- ✅ **Authentication System Failure**: Fixed bcrypt version incompatibility causing login failures
- ✅ **Container Caching Issues**: Resolved Cloud Run deployment not updating active containers  
- ✅ **Booking System Integration**: Complete booking functionality restored
- ✅ **Prevention System**: Comprehensive monitoring and health checks implemented
- ✅ **Code Cleanup**: Removed test/debug scripts, streamlined production codebase

### System Health Monitoring (ACTIVE)
- **System Info**: `/api/v1/system/info` - Real-time service status
- **Auth Testing**: `/api/v1/system/auth-test` - Authentication component health
- **Code Integrity**: `/api/v1/system/verify-code` - Code corruption detection
- **Continuous Monitoring**: `monitoring/auth-health-monitor.py` - 24/7 health checks
- **GitHub Actions**: Automated health checks every 10 minutes

## Remaining High-Priority Tasks

### 1. User Role Caching Issue (PENDING)
**Problem**: Admin users cannot access admin endpoints after role promotions
**Root Cause**: JWT tokens contain cached role data, not refreshed after database role updates
**Impact**: Users must re-login after role changes
**Files**: `app/core/security.py`, `app/services/user_service.py`

### 2. Admin System Testing (PENDING)  
**Task**: Comprehensive end-to-end testing of admin functionality
**Dependencies**: Requires role caching fix
**Scope**: User management, platform analytics, role assignments

## Key Production Files

### Backend (FastAPI)
- **Entry Point**: `caas-backend/app/main_production_real.py`
- **Authentication**: `caas-backend/app/api/v1/auth_production.py`
- **User Profiles**: `caas-backend/app/api/v1/profiles.py`
- **Admin Panel**: `caas-backend/app/api/v1/admin.py`
- **Booking System**: `caas-backend/app/simple_bookings.py`
- **System Health**: `caas-backend/app/api/v1/system.py`

### Frontend (Next.js 14)
- **Client Dashboard**: `caas-frontend/app/(dashboard)/client/page.tsx`
- **Cleaner Dashboard**: `caas-frontend/app/(dashboard)/cleaner/page.tsx`  
- **Admin Dashboard**: `caas-frontend/app/(dashboard)/admin/page.tsx`
- **Auth Context**: `caas-frontend/lib/auth-context.tsx`

### Deployment & Operations
- **Production Deploy**: `./deploy-with-verification.sh`
- **Health Monitor**: `monitoring/auth-health-monitor.py`
- **Ops Runbook**: `DEPLOYMENT_RUNBOOK.md`
- **Dependencies**: `requirements.txt` (root), `caas-backend/requirements.txt`

## Authentication System (PRODUCTION-READY)

### Current Flow
1. **Registration**: `/api/v1/auth/register` - Creates user with role
2. **Login**: `/api/v1/auth/login` - Returns JWT access/refresh tokens  
3. **Token Refresh**: `/api/v1/auth/refresh` - Generates new access token
4. **Role Verification**: JWT middleware validates permissions

### User Roles & Permissions
- **client**: Book services, manage profile, view own bookings
- **cleaner**: Accept jobs, manage availability, view earnings
- **admin**: Full platform access, user management, analytics

### Security Features
- **JWT Tokens**: HS256 signed, 15-min access + 7-day refresh
- **Password Security**: bcrypt hashing with salt (fixed version compatibility)
- **Role-Based Access**: Endpoint-level permission checking
- **Production Monitoring**: Real-time auth component testing

## Database Schema (Firestore)

### Key Collections
- **users/{user_id}**: User profiles with role-specific data
- **bookings/{booking_id}**: Service bookings with full lifecycle  
- **sessions/{session_id}**: JWT refresh token tracking (planned)

### Access Patterns
- **Authentication**: Query users by email for login
- **Bookings**: Filter by client_id, cleaner_id, status, date ranges
- **Admin**: Aggregate queries for analytics and user management

## Production Deployment

### Single URL Architecture  
- **Primary**: Frontend serves all traffic (https://caas-frontend-...)
- **API Proxy**: Frontend routes `/api/*` to backend automatically
- **Benefits**: No CORS issues, unified authentication, seamless UX

### Deployment Process
```bash
# Full production deployment with health checks
./deploy-with-verification.sh

# Backend-only deployment
./deploy-with-verification.sh backend
```

### Health Verification (Automatic)
- ✅ Service health endpoints responding
- ✅ Authentication flow (register + login) working  
- ✅ New container revision receiving traffic
- ✅ Code integrity verified
- ⚠️ Automatic rollback on failure

## Emergency Procedures

### Authentication System Down
1. **Check system status**: `curl /api/v1/system/auth-test`
2. **Force container restart**: Update environment variable to refresh containers
3. **Verify bcrypt compatibility**: Check for version-related errors in logs
4. **Rollback if needed**: Deploy script handles automatic rollback

### Container Issues
1. **Check active revision**: `gcloud run services describe caas-backend`
2. **Verify traffic routing**: Ensure 100% traffic to latest revision
3. **Force refresh**: Update `CACHE_BUST` environment variable
4. **Monitor logs**: `gcloud logging read` for error patterns

### Database Issues
1. **Test Firestore connection**: `curl /test-firestore`
2. **Check service account permissions**: Verify IAM roles
3. **Review query performance**: Monitor slow operations
4. **Backup verification**: Ensure automated backups running

## Development Workflow

### Local Setup
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Backend development
cd caas-backend && python -m app.main_production_real

# 3. Frontend development  
cd caas-frontend && npm run dev
```

### Production Testing
```bash
# Test authentication flow
python monitoring/auth-health-monitor.py

# Verify system health
curl https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/info
```

## Critical Notes for New Engineers

1. **Never use basic deployment scripts** - Always use `deploy-with-verification.sh`
2. **Monitor system health endpoints** - They prevent issues we've already solved
3. **Role caching issue exists** - Users must re-login after role changes
4. **bcrypt version pinned** - Don't upgrade without testing compatibility
5. **Single URL strategy** - Frontend proxies API calls, don't change this pattern

## Quick Reference Commands

```bash
# System health check
curl /api/v1/system/info

# Authentication test  
curl -X POST /api/v1/auth/login -d '{"email":"test@example.com","password":"test123"}'

# Deploy to production
./deploy-with-verification.sh

# View recent logs
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# Check service status
gcloud run services describe caas-backend --region=europe-west2
```

---

**Last Updated**: August 5, 2025  
**System Status**: ✅ OPERATIONAL  
**Next Priority**: Fix user role caching issue

> **📋 For complete technical documentation, architecture details, and troubleshooting guides, see [ENGINEERING_HANDOVER.md](./ENGINEERING_HANDOVER.md)**