#!/bin/bash

# CAAS Deployment Script for Google Cloud Run
# This script deploys both frontend and backend to Google Cloud Run

set -e  # Exit on any error

# Configuration
PROJECT_ID="caas-467918"
REGION="europe-west2"  # London region for UK-based service
BACKEND_SERVICE="caas-backend"
FRONTEND_SERVICE="caas-frontend"
BACKEND_IMAGE="gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}"
FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to authenticate and set up Google Cloud
setup_gcloud() {
    print_status "Setting up Google Cloud configuration..."
    
    # Set project
    gcloud config set project ${PROJECT_ID}
    
    # Enable required APIs
    print_status "Enabling required Google Cloud APIs..."
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        containerregistry.googleapis.com \
        firestore.googleapis.com
    
    # Configure Docker to use gcloud as credential helper
    gcloud auth configure-docker
    
    print_success "Google Cloud setup completed"
}

# Function to build and push backend
build_backend() {
    print_status "Building and pushing backend service..."
    
    cd caas-backend
    
    # Build Docker image
    print_status "Building backend Docker image..."
    docker build -t ${BACKEND_IMAGE}:latest .
    
    # Push to Google Container Registry
    print_status "Pushing backend image to GCR..."
    docker push ${BACKEND_IMAGE}:latest
    
    cd ..
    print_success "Backend image built and pushed successfully"
}

# Function to build and push frontend
build_frontend() {
    print_status "Building and pushing frontend service..."
    
    cd caas-frontend
    
    # Build Docker image
    print_status "Building frontend Docker image..."
    docker build -t ${FRONTEND_IMAGE}:latest .
    
    # Push to Google Container Registry
    print_status "Pushing frontend image to GCR..."
    docker push ${FRONTEND_IMAGE}:latest
    
    cd ..
    print_success "Frontend image built and pushed successfully"
}

# Function to deploy backend to Cloud Run
deploy_backend() {
    print_status "Deploying backend to Cloud Run..."
    
    gcloud run deploy ${BACKEND_SERVICE} \
        --image=${BACKEND_IMAGE}:latest \
        --platform=managed \
        --region=${REGION} \
        --allow-unauthenticated \
        --memory=1Gi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=10 \
        --port=8000 \
        --set-env-vars="GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
        --set-env-vars="API_HOST=0.0.0.0" \
        --set-env-vars="API_PORT=8000" \
        --set-env-vars="API_DEBUG=false" \
        --set-env-vars="LOG_LEVEL=INFO"
    
    # Get backend URL
    BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE} --region=${REGION} --format="value(status.url)")
    print_success "Backend deployed successfully at: ${BACKEND_URL}"
    
    # Store backend URL for frontend deployment
    echo ${BACKEND_URL} > .backend_url
}

# Function to deploy frontend to Cloud Run
deploy_frontend() {
    print_status "Deploying frontend to Cloud Run..."
    
    # Get backend URL
    if [ -f .backend_url ]; then
        BACKEND_URL=$(cat .backend_url)
    else
        print_error "Backend URL not found. Please deploy backend first."
        exit 1
    fi
    
    gcloud run deploy ${FRONTEND_SERVICE} \
        --image=${FRONTEND_IMAGE}:latest \
        --platform=managed \
        --region=${REGION} \
        --allow-unauthenticated \
        --memory=512Mi \
        --cpu=1 \
        --min-instances=0 \
        --max-instances=10 \
        --port=3000 \
        --set-env-vars="NEXT_PUBLIC_API_URL=${BACKEND_URL}"
    
    # Get frontend URL
    FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE} --region=${REGION} --format="value(status.url)")
    print_success "Frontend deployed successfully at: ${FRONTEND_URL}"
    
    # Clean up temp file
    rm -f .backend_url
    
    # Update backend CORS settings
    print_status "Updating backend CORS settings..."
    gcloud run services update ${BACKEND_SERVICE} \
        --region=${REGION} \
        --update-env-vars="ALLOWED_ORIGINS=${FRONTEND_URL},http://localhost:3000"
    
    print_success "CORS settings updated for frontend URL"
}

# Function to show deployment summary
show_summary() {
    print_success "🎉 Deployment completed successfully!"
    echo
    echo "📍 Deployment Summary:"
    echo "├── Project ID: ${PROJECT_ID}"
    echo "├── Region: ${REGION}"
    echo "├── Backend Service: ${BACKEND_SERVICE}"
    echo "├── Frontend Service: ${FRONTEND_SERVICE}"
    echo
    
    # Get service URLs
    BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE} --region=${REGION} --format="value(status.url)" 2>/dev/null || echo "Not deployed")
    FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE} --region=${REGION} --format="value(status.url)" 2>/dev/null || echo "Not deployed")
    
    echo "🔗 Service URLs:"
    echo "├── Backend API: ${BACKEND_URL}"
    echo "└── Frontend App: ${FRONTEND_URL}"
    echo
    
    print_status "You can now access your CAAS application at the frontend URL above!"
    print_warning "Remember to set up your Firestore database and configure authentication."
}

# Function to deploy specific service
deploy_service() {
    case $1 in
        "backend")
            build_backend
            deploy_backend
            ;;
        "frontend")
            build_frontend
            deploy_frontend
            ;;
        *)
            print_error "Invalid service: $1. Use 'backend' or 'frontend'"
            exit 1
            ;;
    esac
}

# Main deployment function
main() {
    echo "🚀 Starting CAAS deployment to Google Cloud Run..."
    echo
    
    check_prerequisites
    setup_gcloud
    
    # Check if specific service deployment is requested
    if [ $# -eq 1 ]; then
        deploy_service $1
    else
        # Deploy both services
        build_backend
        deploy_backend
        build_frontend
        deploy_frontend
    fi
    
    show_summary
}

# Usage information
usage() {
    echo "Usage: $0 [backend|frontend]"
    echo
    echo "Deploy CAAS application to Google Cloud Run"
    echo
    echo "Options:"
    echo "  backend     Deploy only the backend service"
    echo "  frontend    Deploy only the frontend service"
    echo "  (no args)   Deploy both backend and frontend"
    echo
    echo "Prerequisites:"
    echo "  - Google Cloud CLI installed and authenticated"
    echo "  - Docker installed and running"
    echo "  - Project ID set to: ${PROJECT_ID}"
}

# Handle command line arguments
case "${1:-}" in
    -h|--help|help)
        usage
        exit 0
        ;;
    "")
        main
        ;;
    backend|frontend)
        main $1
        ;;
    *)
        print_error "Invalid argument: $1"
        usage
        exit 1
        ;;
esac