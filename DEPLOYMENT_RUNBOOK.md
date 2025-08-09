# Production Deployment Runbook - CAAS Backend

## 🚨 Critical: Always Use Verified Deployment Process

**Never use basic deployment scripts in production.** Always use the verified deployment process to prevent container caching issues.

## Pre-Deployment Checklist

- [ ] Code review completed and approved
- [ ] All tests passing locally
- [ ] Database migrations tested (if applicable)
- [ ] Breaking changes documented
- [ ] Rollback plan prepared

## Deployment Process

### 1. Use Verified Deployment Script

```bash
# Use the production-grade deployment script
./deploy-with-verification.sh

# DO NOT use basic deployment scripts:
# ❌ ./deploy-single-url.sh backend (basic, no verification)
# ❌ gcloud run deploy ... (manual, error-prone)
```

### 2. Post-Deployment Verification

The verified deployment script automatically performs these checks:

- ✅ Health endpoint verification
- ✅ Authentication system testing (registration + login)
- ✅ New revision traffic confirmation
- ✅ Automatic rollback on failure

### 3. Manual Verification (if needed)

```bash
# Check system status
curl https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/info

# Verify authentication components
curl https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/auth-test

# Check code integrity
curl https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/verify-code
```

## Incident Response

### Authentication System Failure

**Symptoms:**
- Users cannot log in (401 errors)
- Registration works but login fails
- Logs show `BaseQuery.select() missing 1 required positional argument`

**Immediate Actions:**

1. **Force container restart:**
   ```bash
   gcloud run services update caas-backend \
     --region=europe-west2 \
     --update-env-vars="CACHE_BUST=$(date +%s)"
   ```

2. **Verify system status:**
   ```bash
   curl https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/auth-test
   ```

3. **Check active revision:**
   ```bash
   gcloud run revisions list --service=caas-backend --region=europe-west2 --limit=3
   ```

4. **If still failing, rollback:**
   ```bash
   # Get previous working revision
   PREV_REV=$(gcloud run revisions list --service=caas-backend --region=europe-west2 --limit=2 --format="value(metadata.name)" | tail -1)
   
   # Rollback
   gcloud run services update-traffic caas-backend \
     --region=europe-west2 \
     --to-revisions="$PREV_REV=100"
   ```

### Container Caching Issues

**Root Cause:** Google Cloud Run occasionally fails to promote new revisions to active traffic.

**Prevention:**
- Always use `deploy-with-verification.sh`
- Monitor revision changes post-deployment
- Use environment variable updates to force container refresh

**Detection:**
- Deployment succeeds but issues persist
- Same error patterns after "successful" deployment
- Active revision timestamp doesn't match deployment time

## Monitoring & Alerting

### Automated Monitoring

The system includes continuous authentication monitoring:

```bash
# Start monitoring (runs in background)
python3 monitoring/auth-health-monitor.py &
```

### Key Metrics to Watch

1. **Authentication Success Rate** (should be >99%)
2. **Login Endpoint Response Time** (should be <2s)
3. **Active Revision Age** (should update with deployments)
4. **Error Rate** (should be <1%)

### Alert Conditions

- **CRITICAL:** 3+ consecutive authentication failures
- **WARNING:** Authentication failure rate >10% over 5 minutes
- **CRITICAL:** Container serving stale code (detected via system endpoints)

## Container Health Verification

### System Endpoints

- `/api/v1/system/info` - Basic system information
- `/api/v1/system/auth-test` - Authentication component testing
- `/api/v1/system/verify-code` - Code integrity verification

### Expected Responses

**Healthy System:**
```json
{
  "service": "caas-backend",
  "auth_status": "operational",
  "code_hash": "abc123def456"
}
```

**Degraded System:**
```json
{
  "service": "caas-backend",
  "auth_status": "degraded-malformed-query-detected",
  "code_hash": "abc123def456"
}
```

## Prevention Measures

### 1. Always Use Verified Deployment
- Automated health checks
- Rollback on failure
- Traffic verification

### 2. Continuous Monitoring
- Real-time authentication testing
- Failure rate tracking
- Alert integration

### 3. Code Integrity Checks
- Hash verification of critical files
- Malformed code detection
- Runtime component testing

### 4. Proper Error Handling
- Comprehensive logging
- Structured error responses
- Debugging endpoints

## Escalation

### Level 1: Automated Recovery
- Script detects issue and rolls back automatically

### Level 2: Engineering Response
- Manual verification and rollback
- Root cause analysis
- Fix deployment

### Level 3: Senior Engineering
- Complex issues requiring deep system knowledge
- Architecture changes
- Post-mortem and prevention updates

## Success Criteria

✅ **Deployment Successful When:**
- Health checks pass
- Authentication tests pass
- New revision receives 100% traffic
- System endpoints report "operational"
- No error rate spikes in logs

❌ **Deployment Failed When:**
- Any health check fails
- Authentication tests fail
- New revision not receiving traffic
- System endpoints report "degraded"
- Error rate >5% in first 5 minutes

## Post-Mortem Template

When incidents occur, use this template:

1. **Timeline** - What happened when
2. **Root Cause** - Technical cause
3. **Impact** - User and business impact
4. **Resolution** - How it was fixed
5. **Prevention** - What changes prevent recurrence
6. **Action Items** - Concrete next steps

## Contact Information

- **On-call Engineer:** Check team rotation
- **Platform Team:** @platform-team
- **Emergency Escalation:** Follow on-call procedures