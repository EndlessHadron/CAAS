# CAAS Deployment Guide

This guide walks you through deploying the CAAS (Cleaning as a Service) application to Google Cloud Run.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Google Cloud CLI** installed and authenticated
   ```bash
   # Install Google Cloud CLI
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   
   # Authenticate
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Docker** installed and running
   ```bash
   # On macOS
   brew install docker
   
   # On Ubuntu
   sudo apt-get update
   sudo apt-get install docker.io
   ```

3. **Google Cloud Project** set up
   - Project ID: `caas-467918`
   - Account: `destinywiki9@gmail.com`

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

Use the provided deployment script for easy deployment:

```bash
# Deploy both frontend and backend
./deploy-to-gcr.sh

# Deploy only backend
./deploy-to-gcr.sh backend

# Deploy only frontend
./deploy-to-gcr.sh frontend

# Get help
./deploy-to-gcr.sh --help
```

### Option 2: Manual Deployment

#### Step 1: Set up Google Cloud

```bash
# Set project
gcloud config set project caas-467918

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com \
  firestore.googleapis.com

# Configure Docker
gcloud auth configure-docker
```

#### Step 2: Deploy Backend

```bash
cd caas-backend

# Build and push Docker image
docker build -t gcr.io/caas-467918/caas-backend:latest .
docker push gcr.io/caas-467918/caas-backend:latest

# Deploy to Cloud Run
gcloud run deploy caas-backend \
  --image=gcr.io/caas-467918/caas-backend:latest \
  --platform=managed \
  --region=europe-west2 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --port=8000 \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=caas-467918,API_HOST=0.0.0.0,API_PORT=8000,API_DEBUG=false,LOG_LEVEL=INFO"
```

#### Step 3: Deploy Frontend

```bash
cd caas-frontend

# Get backend URL
BACKEND_URL=$(gcloud run services describe caas-backend --region=europe-west2 --format="value(status.url)")

# Build and push Docker image
docker build -t gcr.io/caas-467918/caas-frontend:latest .
docker push gcr.io/caas-467918/caas-frontend:latest

# Deploy to Cloud Run
gcloud run deploy caas-frontend \
  --image=gcr.io/caas-467918/caas-frontend:latest \
  --platform=managed \
  --region=europe-west2 \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --port=3000 \
  --set-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL}"
```

## 🔧 Configuration

### Environment Variables

#### Backend Environment Variables
- `GOOGLE_CLOUD_PROJECT`: GCP project ID
- `API_HOST`: Host address (0.0.0.0 for Cloud Run)
- `API_PORT`: Port number (8000)
- `API_DEBUG`: Debug mode (false for production)
- `LOG_LEVEL`: Logging level (INFO)
- `SECRET_KEY`: JWT secret key
- `ALLOWED_ORIGINS`: CORS allowed origins

#### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `PORT`: Frontend port (3000)
- `HOSTNAME`: Frontend hostname (0.0.0.0)

### Database Setup

1. **Enable Firestore**
   ```bash
   gcloud firestore databases create --region=europe-west2
   ```

2. **Set up IAM permissions**
   ```bash
   # Give Cloud Run service account Firestore permissions
   gcloud projects add-iam-policy-binding caas-467918 \
     --member="serviceAccount:COMPUTE_ENGINE_SA@caas-467918.iam.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```

## 🏗️ CI/CD with Cloud Build

### Automatic Deployment on Git Push

1. **Connect repository to Cloud Build**
   ```bash
   gcloud builds triggers create github \
     --repo-name="CAAS" \
     --repo-owner="YOUR_GITHUB_USERNAME" \
     --branch-pattern="^main$" \
     --build-config="caas-backend/cloudbuild.yaml"
   ```

2. **Set up build triggers**
   - Backend: Triggered on changes to `caas-backend/`
   - Frontend: Triggered on changes to `caas-frontend/`

### Manual Build and Deploy

```bash
# Deploy backend via Cloud Build
gcloud builds submit caas-backend --config=caas-backend/cloudbuild.yaml

# Deploy frontend via Cloud Build  
gcloud builds submit caas-frontend --config=caas-frontend/cloudbuild.yaml
```

## 🔒 Security Configuration

### 1. Authentication Setup
- Configure JWT secret keys
- Set up secure cookie settings
- Enable HTTPS-only cookies in production

### 2. CORS Configuration
Update backend CORS settings to include your frontend URLs:
```bash
gcloud run services update caas-backend \
  --region=europe-west2 \
  --update-env-vars="ALLOWED_ORIGINS=https://your-frontend-url.com,http://localhost:3000"
```

### 3. Service Account Permissions
```bash
# Create dedicated service account
gcloud iam service-accounts create caas-service-account

# Grant necessary permissions
gcloud projects add-iam-policy-binding caas-467918 \
  --member="serviceAccount:caas-service-account@caas-467918.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding caas-467918 \
  --member="serviceAccount:caas-service-account@caas-467918.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

## 📊 Monitoring and Logging

### View Logs
```bash
# Backend logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=caas-backend" --limit=50

# Frontend logs
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=caas-frontend" --limit=50
```

### Monitor Performance
- Access Cloud Console > Cloud Run
- View metrics for CPU, memory, and request counts
- Set up alerting for error rates and latency

## 🧪 Testing Deployment

### Health Checks
```bash
# Test backend health
curl https://your-backend-url.com/health

# Test frontend health
curl https://your-frontend-url.com/api/health
```

### Smoke Tests
1. Open frontend URL in browser
2. Test user registration
3. Test login functionality
4. Create a test booking
5. Verify API endpoints respond correctly

## 🔄 Updates and Rollbacks

### Deploy Updates
```bash
# Redeploy with new image
./deploy-to-gcr.sh

# Or deploy specific service
./deploy-to-gcr.sh backend
```

### Rollback Deployment
```bash
# List revisions
gcloud run revisions list --service=caas-backend --region=europe-west2

# Rollback to previous revision
gcloud run services update-traffic caas-backend \
  --to-revisions=REVISION_NAME=100 \
  --region=europe-west2
```

## 💰 Cost Optimization

### Free Tier Usage
- Cloud Run: 2 million requests/month free
- Firestore: 1GB storage + 50K reads/writes per day free
- Container Registry: 0.5GB storage free

### Resource Limits
```yaml
# Recommended settings for cost optimization
Backend:
  memory: 1Gi
  cpu: 1
  min-instances: 0
  max-instances: 10

Frontend:
  memory: 512Mi
  cpu: 1
  min-instances: 0
  max-instances: 10
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs
   gcloud builds log [BUILD_ID]
   ```

2. **Service Not Accessible**
   - Check IAM permissions
   - Verify CORS settings
   - Ensure services are publicly accessible

3. **Database Connection Issues**
   - Verify Firestore is enabled
   - Check service account permissions
   - Validate environment variables

### Debug Commands
```bash
# Check service status
gcloud run services describe caas-backend --region=europe-west2

# View environment variables
gcloud run services describe caas-backend --region=europe-west2 --format="export"

# Test local Docker builds
docker run -p 8000:8000 gcr.io/caas-467918/caas-backend:latest
docker run -p 3000:3000 gcr.io/caas-467918/caas-frontend:latest
```

## 📞 Support

For deployment issues:
1. Check Cloud Console logs
2. Review this deployment guide
3. Verify all prerequisites are met
4. Test with local Docker builds first

## 🎯 Production Checklist

Before going live:
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure monitoring and alerting
- [ ] Set up backup procedures
- [ ] Review security settings
- [ ] Test all user flows
- [ ] Configure error reporting
- [ ] Set up log retention policies
- [ ] Review resource quotas
- [ ] Test disaster recovery procedures

---

## Quick Reference

### Service URLs
- Backend: `https://caas-backend-[hash]-ew.a.run.app`
- Frontend: `https://caas-frontend-[hash]-ew.a.run.app`

### Key Commands
```bash
# Deploy everything
./deploy-to-gcr.sh

# Check status
gcloud run services list --region=europe-west2

# View logs
gcloud logs tail "resource.type=cloud_run_revision"

# Update service
gcloud run services update [SERVICE_NAME] --region=europe-west2
```