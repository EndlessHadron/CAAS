# 🧹 CAAS - Cleaning as a Service

A comprehensive web platform connecting cleaning contractors with clients in London, UK. Built with modern technologies and deployed on Google Cloud Run.

## 🎯 Overview

CAAS is a full-stack SaaS platform that enables:
- **Clients** to book professional cleaning services
- **Cleaners** to find and manage cleaning jobs
- **Admins** to oversee platform operations

### Key Features

- 🔐 **Authentication & Authorization** - JWT-based auth with role-based access
- 📅 **Booking Management** - Complete booking lifecycle with real-time updates
- 💳 **Payment Integration** - Secure payment processing (ready for Stripe)
- 📱 **Responsive Design** - Mobile-first UI with Tailwind CSS
- 🚀 **Cloud Native** - Deployed on Google Cloud Run with Firestore
- 🤖 **AI Integration** - Ready for AI agent automation
- 📊 **Analytics Dashboard** - Real-time stats and performance metrics

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CAAS Platform                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14)     │  Backend (FastAPI)             │
│  ├── React Components      │  ├── REST API                  │
│  ├── TypeScript            │  ├── JWT Authentication        │
│  ├── Tailwind CSS          │  ├── Pydantic Models           │
│  └── React Query           │  └── Business Logic            │
├─────────────────────────────────────────────────────────────┤
│                 Google Cloud Platform                       │
│  ├── Cloud Run (Compute)                                   │
│  ├── Firestore (Database)                                  │
│  ├── Container Registry (Images)                           │
│  └── Cloud Build (CI/CD)                                   │
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

# Deployment
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

## 📊 User Flows

### Client Journey
1. **Registration** → Email, name, phone, address
2. **Browse Services** → Regular, deep, move-in/out cleaning
3. **Book Service** → Date, time, location, requirements
4. **Track Booking** → Status updates, cleaner assignment
5. **Payment** → Secure payment processing
6. **Rate & Review** → Service feedback

### Cleaner Journey
1. **Registration** → Profile, availability, service areas
2. **Browse Jobs** → Available bookings in their area
3. **Accept Jobs** → Confirm availability and accept
4. **Manage Schedule** → View upcoming assignments
5. **Complete Jobs** → Mark as completed
6. **Track Earnings** → Payment and statistics

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

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Current user info

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - List user bookings
- `GET /api/v1/bookings/{id}` - Get booking details
- `POST /api/v1/bookings/{id}/cancel` - Cancel booking
- `POST /api/v1/bookings/{id}/rate` - Rate completed booking

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Contractors (Cleaners)
- `GET /api/v1/contractors/jobs` - Available jobs
- `POST /api/v1/contractors/jobs/{id}/accept` - Accept job
- `POST /api/v1/contractors/jobs/{id}/complete` - Complete job
- `GET /api/v1/contractors/earnings` - Earnings summary

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ User authentication and management
- ✅ Booking system
- ✅ Basic payment integration

### Phase 2 (Next)
- 🔄 Mobile app development
- 🔄 Advanced search and filtering
- 🔄 Real-time notifications
- 🔄 AI-powered matching

### Phase 3 (Future)
- 📅 Multi-city expansion
- 📅 Advanced analytics
- 📅 Integration with external services
- 📅 White-label solutions

## 📞 Support

For development questions or deployment issues:
- 📖 Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- 🐛 Open an issue on GitHub
- 📚 Review API documentation at `/docs`

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the cleaning services industry in London, UK**