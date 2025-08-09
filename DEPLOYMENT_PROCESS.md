# CAAS Deployment Process Documentation

## Overview

This document outlines the successful deployment process for CAAS backend after resolving Cloud Run source deployment issues.

## Problem Solved

**Issue**: `gcloud run deploy --source .` was building successfully but not creating new revisions or routing traffic properly.

**Root Cause**: Cloud Run source deployment was experiencing intermittent issues with revision creation despite successful builds.

**Solution**: Container-based deployment approach that builds the image first, then deploys the specific image tag.

## Deployment Methods

### 1. Container-Based Deployment (RECOMMENDED) ✅

**Script**: `./deploy-container.sh`

**Process**:
1. Build container image using Cloud Build: `gcloud builds submit --tag IMAGE_NAME`
2. Deploy image directly: `gcloud run deploy --image IMAGE_NAME`
3. Verify new revision creation and traffic routing
4. Test all endpoints (health, system, admin, auth)

**Advantages**:
- ✅ Guarantees new revision creation
- ✅ Reliable traffic routing to latest revision
- ✅ Better build caching and consistency
- ✅ Explicit image tagging for rollbacks
- ✅ Works consistently every time

**Usage**:
```bash
cd /path/to/caas
./deploy-container.sh
```

### 2. Source-Based Deployment (LEGACY) ⚠️

**Scripts**: `./deploy-simple.sh`, `./deploy-with-verification.sh`

**Issues Experienced**:
- ❌ Builds complete but no new revisions created
- ❌ Traffic not routed to latest code
- ❌ Intermittent failures despite "successful" deployments
- ❌ Difficult to troubleshoot deployment state

**Status**: Not recommended for production deployments

## Deployment Verification Checklist

After any deployment, verify:

1. **New Revision Created**: 
   ```bash
   gcloud run revisions list --service=caas-backend --region=europe-west2 --limit=3
   ```

2. **Traffic Routing**: 
   ```bash
   gcloud run services describe caas-backend --region=europe-west2 --format="value(status.traffic[0].percent)"
   ```

3. **Health Check**: 
   ```bash
   curl https://caas-backend-102964896009.europe-west2.run.app/health
   ```

4. **System Info**: 
   ```bash
   curl https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/info
   ```

5. **Admin Endpoint**: 
   ```bash
   curl -I https://caas-backend-102964896009.europe-west2.run.app/api/v1/admin/dashboard/metrics
   ```
   Expected: 401/403 (requires auth) or 200 (if authenticated)

6. **Authentication**: 
   ```bash
   curl -X POST https://caas-backend-102964896009.europe-west2.run.app/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User","role":"client"}'
   ```

## Production URLs

- **Main Service**: https://caas-backend-102964896009.europe-west2.run.app
- **Health Check**: https://caas-backend-102964896009.europe-west2.run.app/health
- **API Documentation**: https://caas-backend-102964896009.europe-west2.run.app/docs
- **System Status**: https://caas-backend-102964896009.europe-west2.run.app/api/v1/system/info
- **Admin Panel**: https://caas-backend-102964896009.europe-west2.run.app/api/v1/admin/dashboard/metrics

## Troubleshooting

### Issue: No New Revision Created

**Symptoms**: Same revision name after deployment
**Solution**: Use container-based deployment (`./deploy-container.sh`)

### Issue: Admin Endpoints Return 404

**Symptoms**: `/api/v1/admin/*` returns 404
**Diagnosis**: Check startup logs for admin router import errors
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=caas-backend AND textPayload:(admin OR Admin OR ImportError)" --limit=10 --freshness=10m
```
**Solution**: Verify admin module imports locally, then redeploy with container method

### Issue: Traffic Not Routed to New Revision

**Symptoms**: New revision exists but not receiving traffic
**Solution**: 
```bash
gcloud run services update-traffic caas-backend --region=europe-west2 --to-latest
```

### Issue: Build Timeouts

**Symptoms**: Deployment commands timeout after 2 minutes
**Diagnosis**: Build is likely still running in background
**Solution**: Check build status and wait for completion:
```bash
gcloud builds list --limit=5
```

## Environment Configuration

### Required Environment Variables

Set in Cloud Run:
- `GOOGLE_CLOUD_PROJECT=caas-467918`
- `ENVIRONMENT=production`
- `DEPLOY_TIMESTAMP=<timestamp>` (auto-set by script)

### Container Configuration

- **Memory**: 2Gi
- **CPU**: 1
- **Timeout**: 300 seconds
- **Concurrency**: 100
- **Scaling**: 0-10 instances

## Rollback Process

If deployment fails or issues occur:

1. **Identify Previous Working Revision**:
   ```bash
   gcloud run revisions list --service=caas-backend --region=europe-west2 --limit=5
   ```

2. **Route Traffic to Previous Revision**:
   ```bash
   gcloud run services update-traffic caas-backend \
     --region=europe-west2 \
     --to-revisions=PREVIOUS_REVISION_NAME=100
   ```

3. **Verify Rollback**:
   ```bash
   curl https://caas-backend-102964896009.europe-west2.run.app/health
   ```

## Container Image Management

Images are stored in Google Container Registry:
- **Registry**: `gcr.io/caas-467918/caas-backend`
- **Tagging**: `deploy-<timestamp>` format
- **Retention**: Automatic cleanup after 30 days (configurable)

### List Available Images
```bash
gcloud container images list-tags gcr.io/caas-467918/caas-backend --limit=10
```

### Deploy Specific Image
```bash
gcloud run deploy caas-backend \
  --image gcr.io/caas-467918/caas-backend:deploy-1234567890 \
  --region=europe-west2
```

## Best Practices

1. **Always Use Container-Based Deployment** for production
2. **Test Locally First** when possible
3. **Monitor Deployment Logs** during deployment
4. **Verify All Endpoints** after deployment
5. **Keep Image Tags** for easy rollbacks
6. **Document Changes** in deployment notes
7. **Use Unique Timestamps** in image tags
8. **Set Appropriate Timeouts** for build and deploy operations

## Integration with CI/CD

For automated deployments, use the container-based approach:

```yaml
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        cd caas-backend
        gcloud builds submit --tag gcr.io/$PROJECT_ID/caas-backend:$SHORT_SHA .
        gcloud run deploy caas-backend \
          --image gcr.io/$PROJECT_ID/caas-backend:$SHORT_SHA \
          --region=europe-west2 \
          --allow-unauthenticated
```

## Monitoring

Monitor deployments using:
- **Cloud Run Metrics**: CPU, Memory, Request count
- **Cloud Build Logs**: Build success/failure
- **Application Logs**: Startup errors, admin router loading
- **Health Endpoints**: Automated health checks

---

**Last Updated**: August 5, 2025  
**Deployment Method**: Container-based (proven successful)  
**Current Revision**: caas-backend-00038-xrr  
**Status**: ✅ Production Ready