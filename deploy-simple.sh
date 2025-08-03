#!/bin/bash
# CAAS Cloud Run Deployment Script
# Builds and deploys CAAS to Google Cloud Run

set -e

PROJECT_ID="caas-467918"
REGION="europe-west2"

echo "🚀 Deploying CAAS to Cloud Run"
echo "   Project: $PROJECT_ID"
echo "   Region: $REGION"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

echo "🔨 Building and deploying backend..."
cd caas-backend
BACKEND_IMAGE="gcr.io/$PROJECT_ID/caas-backend"
gcloud builds submit --tag $BACKEND_IMAGE .

echo "🚀 Deploying backend to Cloud Run..."
gcloud run deploy caas-backend \
    --image $BACKEND_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --port 8000 \
    --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT_ID,API_HOST=0.0.0.0,API_PORT=8000

# Get backend URL
BACKEND_URL=$(gcloud run services describe caas-backend --region=$REGION --format="value(status.url)")
echo "✅ Backend deployed: $BACKEND_URL"

echo ""
echo "🔨 Building and deploying frontend..."
cd ../caas-frontend
FRONTEND_IMAGE="gcr.io/$PROJECT_ID/caas-frontend"
gcloud builds submit --tag $FRONTEND_IMAGE .

echo "🚀 Deploying frontend to Cloud Run..."
gcloud run deploy caas-frontend \
    --image $FRONTEND_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --port 3000 \
    --set-env-vars NEXT_PUBLIC_API_URL=$BACKEND_URL

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe caas-frontend --region=$REGION --format="value(status.url)")
echo "✅ Frontend deployed: $FRONTEND_URL"

echo ""
echo "🔧 Updating backend CORS..."
gcloud run services update caas-backend \
    --region=$REGION \
    --update-env-vars ALLOWED_ORIGINS=$FRONTEND_URL,http://localhost:3000

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 URLs:"
echo "   Frontend: $FRONTEND_URL"
echo "   Backend:  $BACKEND_URL"
echo ""
echo "🧪 Testing..."
echo "Backend health:"
curl -s "$BACKEND_URL/health" 2>/dev/null || echo "Backend not ready yet"
echo ""
echo "Frontend health:"
curl -s "$FRONTEND_URL/api/health" 2>/dev/null || echo "Frontend not ready yet"