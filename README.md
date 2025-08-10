# 🧹 neatly - Premium Cleaning Services

A comprehensive web platform connecting cleaning contractors with clients in London, UK. Built with modern technologies and deployed on Google Cloud Run.

**🚀 Live Production URL: https://caas-backend-102964896009.europe-west2.run.app**

## 📚 Documentation

For engineers joining this project:

- **🏗️ [Engineering Handover](./ENGINEERING_HANDOVER.md)** - Complete technical documentation, architecture, and troubleshooting
- **⚡ [Project Context](./CLAUDE.md)** - Current system status, quick reference, and immediate priorities  
- **🔧 [Deployment Runbook](./DEPLOYMENT_RUNBOOK.md)** - Operations procedures and incident response
- **📋 This README** - Getting started and project overview

## 🎯 Overview

neatly is a full-stack SaaS platform that enables:
- **Clients** to book professional cleaning services with personalized dashboards
- **Cleaners** to find and manage cleaning jobs with professional profiles
- **Role-based Access Control** with distinct user experiences

### ✨ Key Features

- 🔐 **Real JWT Authentication** - Production-ready auth with role-based access control
- 👥 **Role-Based Profiles** - Separate client and cleaner experiences with specialized dashboards
- 🏠 **Smart Booking System** - Location-based cleaner matching with preferences
- 📊 **Professional Dashboards** - Earnings tracking, job management, and analytics
- 💼 **Complete Job Lifecycle** - From booking → matching → acceptance → completion
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS
- 🚀 **Cloud Native** - Deployed on Google Cloud Run with Firestore
- 🔄 **Unified API** - Single production URL with API proxy routing

## 🏗️ Production Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              CAAS Production Platform                       │
├─────────────────────────────────────────────────────────────┤
│  Single Production URL: caas-frontend-102964896009.europe-west2.run.app │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14)          │  Backend (FastAPI)        │
│  ├── API Proxy (/api/* routes)  │  ├── Profile Management   │
│  ├── Role-Based Dashboards      │  ├── JWT Authentication   │
│  ├── Client Booking Flow        │  ├── Cleaner Matching     │
│  ├── Cleaner Job Management     │  ├── Real-time Job Board  │
│  └── Responsive UI Components   │  └── Firestore Integration│
├─────────────────────────────────────────────────────────────┤
│                 Google Cloud Platform                       │
│  ├── Cloud Run (Unified Deployment)                        │
│  ├── Firestore (User Profiles & Bookings)                 │
│  ├── Container Registry (Docker Images)                    │
│  └── Cloud Build (Automated CI/CD)                         │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd CAAS

# Set up development environment
./dev-setup.sh

# Start development servers
./start-dev.sh
```

### Option 2: Manual Setup

#### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Cloud CLI
- Docker (optional)

#### Backend Setup
```bash
cd caas-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Configure your environment
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd caas-frontend
npm install
cp .env.local.example .env.local  # Configure your environment
npm run dev
```

## 📦 Project Structure

```
CAAS/
├── 📁 caas-backend/          # FastAPI backend
│   ├── 📁 app/
│   │   ├── 📁 api/           # API endpoints
│   │   ├── 📁 core/          # Core functionality
│   │   ├── 📁 models/        # Pydantic models
│   │   ├── 📁 repositories/  # Data access layer
│   │   ├── 📁 services/      # Business logic
│   │   └── 📁 utils/         # Utility functions
│   ├── 🐳 Dockerfile
│   ├── ☁️ cloudbuild.yaml
│   └── 📋 requirements.txt
├── 📁 caas-frontend/         # Next.js frontend
│   ├── 📁 app/              # App router pages
│   ├── 📁 components/       # React components
│   ├── 📁 lib/              # Utilities & API client
│   ├── 🐳 Dockerfile
│   ├── ☁️ cloudbuild.yaml
│   └── 📦 package.json
├── 🚀 deploy-to-gcr.sh      # Deployment script
├── 🔧 dev-setup.sh          # Development setup
├── 📖 DEPLOYMENT.md         # Deployment guide
└── 📋 README.md             # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **State Management**: React Query + Context
- **HTTP Client**: Axios
- **Icons**: Heroicons

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Database**: Google Firestore
- **Authentication**: JWT with passlib
- **Validation**: Pydantic v2
- **Documentation**: OpenAPI/Swagger

### Infrastructure
- **Compute**: Google Cloud Run
- **Database**: Google Firestore
- **Storage**: Google Container Registry
- **CI/CD**: Google Cloud Build
- **Region**: Europe West 2 (London)

## 🔧 Development

### Available Scripts

```bash
# Development
./start-dev.sh          # Start both frontend and backend
./start-backend.sh      # Start backend only
./start-frontend.sh     # Start frontend only

# Deployment (Production)
./deploy-container.sh   # 🔥 RECOMMENDED: Container-based deployment
./deploy-simple.sh      # Simple source deployment (legacy)
./deploy-with-verification.sh  # With health checks (legacy)

# Legacy deployment methods (not recommended for production)
./deploy-to-gcr.sh      # Deploy to Google Cloud Run  
./deploy-to-gcr.sh backend    # Deploy backend only
./deploy-to-gcr.sh frontend   # Deploy frontend only

# Docker
docker-compose -f docker-compose.dev.yml up  # Run with Docker
```

### API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Environment Variables

#### Backend (.env)
```env
GOOGLE_CLOUD_PROJECT=caas-467918
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=CAAS - Cleaning as a Service
```

## 🚀 Deployment

### Google Cloud Run (Production)

1. **Automated Deployment**
   ```bash
   ./deploy-to-gcr.sh
   ```

2. **Manual Deployment**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions

### Features Ready for Production

- ✅ **Authentication System** - JWT with refresh tokens
- ✅ **Booking Management** - Complete CRUD operations
- ✅ **User Management** - Clients, cleaners, and admin roles
- ✅ **API Documentation** - OpenAPI/Swagger integration
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Data Validation** - Pydantic models with validation
- ✅ **Responsive Design** - Mobile-first UI
- ✅ **Security** - CORS, input validation, auth middleware
- ✅ **Database** - Firestore integration with repositories
- ✅ **CI/CD** - Cloud Build configurations
- ✅ **Monitoring** - Health checks and logging

## 👥 User Experiences

### 🏠 Client Experience
- **Personalized Dashboard** - Booking history, upcoming services, spending analytics
- **Smart Booking Flow** - Pre-populated preferences, cleaner selection, location matching  
- **Profile-Driven Service** - Property details, special requirements, access instructions
- **Cleaner Selection** - Browse and choose from available cleaners with ratings and reviews
- **Real-time Updates** - Booking status, cleaner assignment, completion notifications

**Client Journey:**
1. Register → Complete property profile → Book service → Select cleaner → Track progress → Rate experience

### 🧽 Cleaner Experience  
- **Professional Dashboard** - Available jobs, earnings tracking, completion statistics
- **Business Profile Management** - Services offered, rates, availability, service radius
- **Job Board** - Accept/reject jobs with full client details and requirements
- **Earnings Analytics** - Weekly/monthly income, job completion rates, client ratings
- **Professional Tools** - Pricing management, availability scheduling, skill cataloging

**Cleaner Journey:**
1. Register → Set up business profile → Configure availability → Browse jobs → Accept bookings → Complete work → Get paid

## 🔐 Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Data Validation**: Pydantic models with strict validation
- **CORS Protection**: Configured allowed origins
- **Input Sanitization**: SQL injection prevention
- **HTTPS**: SSL/TLS encryption in production
- **Rate Limiting**: API request throttling
- **Error Handling**: Secure error messages

## 📈 Monitoring & Analytics

### Available Metrics
- User registrations and activity
- Booking creation and completion rates
- Service area coverage
- Revenue tracking
- Performance metrics

### Logging
- Structured JSON logging
- Request/response tracking
- Error monitoring
- Performance profiling

## 🧪 Testing

```bash
# Backend tests
cd caas-backend
pytest

# Frontend tests (when implemented)
cd caas-frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Endpoints

All API endpoints are accessible through the unified production URL at `/api/*` routes.

### Authentication
- `POST /api/v1/auth/register` - User registration with role selection
- `POST /api/v1/auth/login` - User login with JWT tokens
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Role-Based Profiles
- `GET /api/v1/profiles/me` - Get current user profile with role-specific data
- `PUT /api/v1/profiles/me/client` - Update client-specific profile
- `PUT /api/v1/profiles/me/cleaner` - Update cleaner-specific profile
- `GET /api/v1/profiles/client/{id}` - Get client public profile
- `GET /api/v1/profiles/cleaner/{id}` - Get cleaner public profile
- `GET /api/v1/profiles/cleaners/search` - Search cleaners by location/criteria

### Bookings
- `POST /api/v1/bookings` - Create booking with optional cleaner selection
- `GET /api/v1/bookings` - List user bookings
- `GET /api/v1/bookings/{id}` - Get booking details
- `POST /api/v1/bookings/{id}/cancel` - Cancel booking
- `POST /api/v1/bookings/{id}/rate` - Rate completed booking

### Job Management (Cleaners)
- `GET /api/v1/contractors/jobs` - Available jobs for cleaners
- `POST /api/v1/contractors/jobs/{id}/accept` - Accept job
- `POST /api/v1/contractors/jobs/{id}/complete` - Complete job
- `GET /api/v1/contractors/earnings` - Earnings summary and analytics

## 🎯 Current Status & Roadmap

### ✅ Phase 1 - Complete (Production Ready)
- ✅ **Role-Based Authentication System** - JWT with client/cleaner/admin roles
- ✅ **Comprehensive Profile Management** - Separate client and cleaner profiles
- ✅ **Client Dashboard & Booking System** - Full booking lifecycle with cleaner selection
- ✅ **Cleaner Dashboard & Job Management** - Professional job board and earnings tracking
- ✅ **Location-Based Matching** - Search cleaners by location and service type
- ✅ **Unified Production Deployment** - Single URL with API proxy routing
- ✅ **Real Database Integration** - Firestore with proper data modeling
- ✅ **Production Security** - HTTPS, CORS, input validation, error handling

### 🔄 Phase 2 - Next Enhancements
- 🔄 **Payment Integration** - Stripe checkout and earnings distribution
- 🔄 **Real-time Notifications** - Job updates, booking confirmations
- 🔄 **Mobile App Development** - React Native or PWA
- 🔄 **Advanced Analytics** - Business intelligence dashboard

### 📅 Phase 3 - Future Expansion
- 📅 **Multi-city Support** - Expand beyond London
- 📅 **AI-Powered Matching** - Intelligent cleaner-client pairing
- 📅 **Integration APIs** - Calendar sync, external booking systems
- 📅 **White-label Solutions** - Platform-as-a-Service for other markets

## 📞 Support

For development questions or deployment issues:
- 📖 Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- 🐛 Open an issue on GitHub
- 📚 Review API documentation at `/docs`

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the cleaning services industry in London, UK**

## 🔑 Test Credentials

For testing the platform, use these pre-created accounts:

### Admin User (Full Platform Access)
- **Email**: `admin@neatly.com`
- **Password**: `NeatlyAdmin123!`
- **Dashboard**: [/admin](https://caas-frontend-102964896009.europe-west2.run.app/admin)
- **Permissions**: User management, platform analytics, system configuration

### Client User (Customer Account)
- **Email**: `client@neatly.com`
- **Password**: `Client123!`
- **Dashboard**: [/client](https://caas-frontend-102964896009.europe-west2.run.app/client)
- **Features**: Book services, manage profile, view bookings, select cleaners

### Cleaner User (Service Provider)
- **Email**: `cleaner@neatly.com`
- **Password**: `Cleaner123!`
- **Dashboard**: [/cleaner](https://caas-frontend-102964896009.europe-west2.run.app/cleaner)
- **Features**: Accept jobs, manage availability, track earnings

**Login URL**: https://caas-frontend-102964896009.europe-west2.run.app/auth/login

> ⚠️ **Note**: These are test accounts for development and demonstration purposes. Do not use these credentials patterns in production environments.
