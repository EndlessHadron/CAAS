#!/bin/bash

# CAAS Local Development Setup Script
# This script sets up the local development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists python3; then
        print_error "Python 3 is not installed. Please install Python 3.8+"
        exit 1
    fi
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend environment..."
    
    cd caas-backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating backend .env file..."
        cat > .env << EOF
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=caas-467918
GOOGLE_APPLICATION_CREDENTIALS=

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=true
API_RELOAD=true

# Security
SECRET_KEY=dev-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
FIRESTORE_COLLECTION_PREFIX=caas_dev_

# Logging
LOG_LEVEL=DEBUG
LOG_FORMAT=simple

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
        print_success "Backend .env file created"
    else
        print_warning "Backend .env file already exists, skipping..."
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend environment..."
    
    cd caas-frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env.local file if it doesn't exist
    if [ ! -f ".env.local" ]; then
        print_status "Creating frontend .env.local file..."
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=CAAS - Cleaning as a Service (Dev)
NODE_ENV=development
EOF
        print_success "Frontend .env.local file created"
    else
        print_warning "Frontend .env.local file already exists, skipping..."
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Backend start script
    cat > start-backend.sh << 'EOF'
#!/bin/bash
cd caas-backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
EOF
    chmod +x start-backend.sh
    
    # Frontend start script
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
cd caas-frontend
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # Combined start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting CAAS Development Environment${NC}"
echo

# Function to cleanup background processes
cleanup() {
    echo -e "\n${BLUE}Stopping development servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

# Set up cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend
echo -e "${GREEN}Starting Backend (Port 8000)...${NC}"
./start-backend.sh &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}Starting Frontend (Port 3000)...${NC}"
./start-frontend.sh &
FRONTEND_PID=$!

echo
echo -e "${GREEN}✅ Development servers started:${NC}"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop all servers"

# Wait for any background job to finish
wait
EOF
    chmod +x start-dev.sh
    
    print_success "Development scripts created"
}

# Create Docker Compose for local development
create_docker_compose() {
    print_status "Creating Docker Compose configuration..."
    
    cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: ./caas-backend
    ports:
      - "8000:8000"
    environment:
      - API_HOST=0.0.0.0
      - API_PORT=8000
      - API_DEBUG=true
      - GOOGLE_CLOUD_PROJECT=caas-467918
      - ALLOWED_ORIGINS=http://localhost:3000
    volumes:
      - ./caas-backend:/app
      - /app/venv
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./caas-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NODE_ENV=development
    volumes:
      - ./caas-frontend:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  default:
    name: caas-dev-network
EOF
    
    print_success "Docker Compose configuration created"
}

# Show setup summary
show_summary() {
    print_success "🎉 Development environment setup completed!"
    echo
    echo "📍 Setup Summary:"
    echo "├── Backend: Python virtual environment with dependencies"
    echo "├── Frontend: Node.js environment with dependencies"
    echo "├── Environment files: .env and .env.local created"
    echo "└── Development scripts: start-backend.sh, start-frontend.sh, start-dev.sh"
    echo
    echo "🚀 Quick Start:"
    echo "├── Start both services: ./start-dev.sh"
    echo "├── Start backend only: ./start-backend.sh"
    echo "├── Start frontend only: ./start-frontend.sh"
    echo "└── Use Docker: docker-compose -f docker-compose.dev.yml up"
    echo
    echo "🔗 Local URLs:"
    echo "├── Frontend: http://localhost:3000"
    echo "├── Backend API: http://localhost:8000"
    echo "└── API Documentation: http://localhost:8000/docs"
    echo
    print_warning "Remember to set up your Google Cloud credentials for Firestore access!"
    print_status "Run 'gcloud auth application-default login' to authenticate"
}

# Main function
main() {
    echo "🔧 Setting up CAAS development environment..."
    echo
    
    check_prerequisites
    setup_backend
    setup_frontend
    create_dev_scripts
    create_docker_compose
    show_summary
}

# Run main function
main