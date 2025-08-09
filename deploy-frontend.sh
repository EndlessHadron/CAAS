#!/bin/bash
# neatly Frontend Deployment Script
# Builds, deploys, and verifies neatly frontend to Google Cloud Run
# Ensures new revision creation and proper traffic routing

set -e

PROJECT_ID="caas-467918"
REGION="europe-west2"
SERVICE_NAME="caas-frontend"
PRODUCTION_URL="https://caas-frontend-102964896009.europe-west2.run.app"

echo "🚀 neatly Frontend Deployment"
echo "   Project: $PROJECT_ID"
echo "   Service: $SERVICE_NAME"
echo "   Region: $REGION"
echo "   Production URL: $PRODUCTION_URL"
echo ""

# Set project and authenticate
gcloud config set project $PROJECT_ID

# Get current revision for comparison
echo "📊 Getting current revision..."
CURRENT_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestReadyRevisionName)" 2>/dev/null || echo "none")
echo "   Current revision: $CURRENT_REVISION"

# Generate unique image tag
TIMESTAMP=$(date +%s)
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:deploy-$TIMESTAMP"

echo ""
echo "📦 Building frontend locally..."
cd caas-frontend
npm run build
BUILD_RESULT=$?
if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"

echo ""
echo "🔨 Building container image..."
echo "   Image: $IMAGE_NAME"

# Build container image using Cloud Build
gcloud builds submit --tag $IMAGE_NAME . --timeout=600

BUILD_RESULT=$?
if [ $BUILD_RESULT -ne 0 ]; then
    echo "❌ Container build failed"
    exit 1
fi

echo "✅ Container image built successfully"

# Deploy the image directly to Cloud Run
echo ""
echo "🚀 Deploying container to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars NEXT_PUBLIC_API_URL=/api,ENVIRONMENT=production,DEPLOY_TIMESTAMP=$TIMESTAMP \
    --memory 2Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 100 \
    --min-instances 0 \
    --max-instances 10

echo "✅ Deployment completed"

# Ensure traffic is routed to latest revision
echo ""
echo "🚦 Ensuring traffic routes to latest revision..."
gcloud run services update-traffic $SERVICE_NAME --region=$REGION --to-latest

echo "✅ Traffic routing completed"

# Verify new revision was created
echo ""
echo "🔍 Verifying deployment..."
NEW_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestReadyRevisionName)")
echo "   New revision: $NEW_REVISION"

if [ "$NEW_REVISION" = "$CURRENT_REVISION" ]; then
    echo "❌ ERROR: No new revision created!"
    exit 1
fi

# Verify and ensure traffic routing to latest revision
echo ""
echo "🔄 Ensuring traffic routes to latest revision..."

# Get current traffic allocation
CURRENT_TRAFFIC_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.traffic[0].revisionName)")
TRAFFIC_ALLOCATION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.traffic[0].percent)")

echo "   Current traffic: $TRAFFIC_ALLOCATION% → $CURRENT_TRAFFIC_REVISION"
echo "   Latest revision: $NEW_REVISION"

if [ "$CURRENT_TRAFFIC_REVISION" != "$NEW_REVISION" ] || [ "$TRAFFIC_ALLOCATION" != "100" ]; then
    echo "🚦 Routing 100% traffic to latest revision..."
    gcloud run services update-traffic $SERVICE_NAME --region=$REGION --to-latest
    
    # Verify the traffic routing was successful
    echo "⏳ Waiting for traffic routing to complete..."
    sleep 10
    
    UPDATED_TRAFFIC_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.traffic[0].revisionName)")
    UPDATED_TRAFFIC_PERCENT=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.traffic[0].percent)")
    
    echo "   Updated traffic: $UPDATED_TRAFFIC_PERCENT% → $UPDATED_TRAFFIC_REVISION"
    
    if [ "$UPDATED_TRAFFIC_REVISION" != "$NEW_REVISION" ]; then
        echo "❌ ERROR: Traffic routing failed! Still routing to old revision."
        exit 1
    fi
    
    echo "✅ Traffic successfully routed to latest revision"
else
    echo "✅ Traffic already routed correctly to latest revision"
fi

# Wait for deployment to stabilize
echo ""
echo "⏳ Waiting for deployment to stabilize..."
sleep 15

# Test deployment
echo ""
echo "🧪 Testing deployment..."

# Health check via frontend
echo "Frontend health check:"
HEALTH_RESPONSE=$(curl -s "$PRODUCTION_URL/" --max-time 10 || echo "failed")
if echo "$HEALTH_RESPONSE" | grep -q "neatly"; then
    echo "✅ Frontend responding with neatly branding"
else
    echo "❌ Frontend health check failed"
    exit 1
fi

# Check if logo loads
echo "Logo check:"
LOGO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/logo.png" --max-time 10)
if [ "$LOGO_STATUS" = "200" ]; then
    echo "✅ neatly logo accessible"
else
    echo "⚠️  Logo status: $LOGO_STATUS"
fi

# Check favicon
echo "Favicon check:"
FAVICON_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL/favicon.ico" --max-time 10)
if [ "$FAVICON_STATUS" = "200" ]; then
    echo "✅ Favicon accessible"
else
    echo "⚠️  Favicon status: $FAVICON_STATUS"
fi

cd ..

echo ""
echo "✅ FRONTEND DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📋 Deployment Summary:"
echo "   🔄 New Revision: $NEW_REVISION"
echo "   🐳 Container Image: $IMAGE_NAME"
echo "   🌐 Production URL: $PRODUCTION_URL"
echo "   🎨 Brand: neatly - Premium Cleaning Services"
echo ""
echo "🎉 neatly frontend is live and operational!"

# List recent revisions for reference
echo ""
echo "📋 Recent frontend revisions:"
gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --limit=3 --format="table(metadata.name, status.conditions[0].status, metadata.creationTimestamp)"