# CAAS Backend API

Cleaning as a Service (CAAS) - Backend API built with FastAPI and Google Cloud.

## Quick Start

### Prerequisites
- Python 3.11+
- Google Cloud account with project `caas-467918`
- gcloud CLI installed and authenticated

### Local Development

1. **Clone and navigate to backend directory**
   ```bash
   cd caas-backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run the development server**
   ```bash
   python run.py
   ```

6. **Access the API**
   - API: http://localhost:8000
   - Documentation: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Users
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `POST /api/v1/users/verify-phone` - Verify phone number

### Bookings
- `POST /api/v1/bookings` - Create new booking
- `GET /api/v1/bookings` - Get user bookings
- `GET /api/v1/bookings/{id}` - Get specific booking
- `POST /api/v1/bookings/{id}/cancel` - Cancel booking

### Contractors (Cleaners)
- `GET /api/v1/contractors/jobs` - Get available jobs
- `POST /api/v1/contractors/jobs/{id}/accept` - Accept job
- `POST /api/v1/contractors/jobs/{id}/reject` - Reject job
- `PUT /api/v1/contractors/availability` - Update availability
- `GET /api/v1/contractors/earnings` - Get earnings summary

### Admin
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/{id}` - Update user status
- `GET /api/v1/admin/bookings` - Get all bookings
- `GET /api/v1/admin/analytics` - Get platform analytics
- `GET /api/v1/admin/ai-decisions` - Get AI decisions

## Database Schema

The application uses Google Firestore with the following collections:
- `caas_users` - User accounts and profiles
- `caas_bookings` - Service bookings
- `caas_cleaner_availability` - Cleaner availability slots
- `caas_notifications` - System notifications
- `caas_ai_decisions` - AI agent decisions
- `caas_audit_log` - System audit trail

## Deployment

### Local Docker
```bash
docker build -t caas-backend .
docker run -p 8000:8000 -e GOOGLE_CLOUD_PROJECT=caas-467918 caas-backend
```

### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml .

# Or manual deployment
gcloud run deploy caas-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Development

### Project Structure
```
caas-backend/
├── app/
│   ├── api/v1/          # API endpoints
│   ├── core/            # Core functionality
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic
│   ├── repositories/    # Data access
│   ├── utils/           # Utilities
│   └── ai_agent/        # AI agent module
├── tests/               # Test files
├── docker/              # Docker configs
└── docs/                # Documentation
```

### Adding New Features

1. **Create models** in `app/models/`
2. **Add business logic** in `app/services/`
3. **Create API endpoints** in `app/api/v1/`
4. **Add tests** in `tests/`
5. **Update documentation**

### Environment Variables

Key environment variables in `.env`:
- `GOOGLE_CLOUD_PROJECT` - GCP project ID
- `SECRET_KEY` - JWT secret key
- `ANTHROPIC_API_KEY` - For AI agent
- `ALLOWED_ORIGINS` - CORS origins

## Security

- JWT authentication with role-based access control
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation with Pydantic

## Monitoring

- Health check endpoint: `/health`
- Structured logging
- Google Cloud Monitoring integration
- Error tracking with built-in exception handlers

## Support

For issues and questions:
1. Check the API documentation at `/docs`
2. Review logs with `gcloud logs read`
3. Check the GitHub repository issues