# Action Items Tracker

## Immediate Actions (This Week)

### Day 1-2: Project Setup
- [ ] Create GCP project named "caas-platform"
- [ ] Enable required APIs:
  - [ ] Cloud Run API
  - [ ] Firestore API
  - [ ] Cloud Functions API
  - [ ] Cloud Scheduler API
  - [ ] Pub/Sub API
  - [ ] Firebase Cloud Messaging
- [ ] Set up local development environment:
  - [ ] Install Python 3.11+
  - [ ] Install Node.js 18+
  - [ ] Install gcloud CLI
  - [ ] Install Firebase CLI
- [ ] Initialize Git repository
- [ ] Create .gitignore with proper exclusions

### Day 3-4: Backend Foundation
- [ ] Create FastAPI project structure
- [ ] Set up virtual environment
- [ ] Install core dependencies:
  ```
  fastapi
  uvicorn
  pydantic
  google-cloud-firestore
  python-jose[cryptography]
  passlib[bcrypt]
  python-multipart
  email-validator
  ```
- [ ] Create basic health check endpoint
- [ ] Set up environment configuration
- [ ] Create Dockerfile for Cloud Run

### Day 5-7: Database & Models
- [ ] Initialize Firestore database
- [ ] Create Pydantic models for all entities
- [ ] Set up repository pattern
- [ ] Create database seed script
- [ ] Test CRUD operations

## Week 2: Core Features

### Authentication System
- [ ] Implement JWT token generation
- [ ] Create registration endpoint
- [ ] Create login endpoint
- [ ] Add role-based middleware
- [ ] Test with different user types

### User Management
- [ ] Client registration flow
- [ ] Cleaner onboarding flow
- [ ] Profile update endpoints
- [ ] Document upload handling
- [ ] Verification workflows

## Week 3: Booking System

### Booking Logic
- [ ] Create booking request endpoint
- [ ] Implement availability checking
- [ ] Add booking confirmation
- [ ] Handle cancellations
- [ ] Set up recurring bookings

### Notifications
- [ ] Set up Firebase Cloud Messaging
- [ ] Create notification templates
- [ ] Implement email service (Gmail API)
- [ ] Add in-app notifications
- [ ] Test notification delivery

## Decision Points Needed

### Immediate Decisions
1. **Email Service**: Gmail API vs SendGrid?
   - Evaluate based on expected volume
   - Consider ease of integration
   - Review cost implications

2. **Authentication Provider**: 
   - Firebase Auth (integrated with FCM)
   - Auth0 (more features)
   - Supabase (generous free tier)

3. **Payment Timeline**:
   - When to implement automated payments?
   - Which provider? (Stripe vs others)
   - Compliance requirements?

### Technical Decisions
1. **Testing Framework**:
   - pytest for backend
   - Jest for frontend
   - Cypress for E2E?

2. **Monitoring Solution**:
   - Google Cloud Monitoring only?
   - Add Sentry for errors?
   - Custom analytics?

3. **CI/CD Pipeline**:
   - GitHub Actions?
   - Cloud Build?
   - Deployment strategy?

## Blockers & Risks

### Current Blockers
- None yet - project starting

### Identified Risks
1. **GDPR Compliance**:
   - Need legal review of data handling
   - Privacy policy required
   - Data deletion procedures

2. **Contractor Classification**:
   - UK tax laws for gig workers
   - Insurance requirements
   - Contract templates needed

3. **Background Checks**:
   - Which service to use?
   - Cost per check?
   - Legal requirements?

## Questions for Stakeholder

### Business Model
1. What's the commission structure? (% of booking)
2. Cancellation policy details?
3. Service area boundaries in London?
4. Pricing for different service types?
5. Cleaner quality standards?

### Operations
1. How to handle emergencies?
2. Customer support hours?
3. Dispute resolution process?
4. Cleaner recruitment process?
5. Quality assurance measures?

### Growth
1. Marketing strategy?
2. Launch timeline expectations?
3. Initial cleaner recruitment target?
4. Beta testing approach?
5. Success metrics?

## Daily Checklist

### Development Workflow
- [ ] Check action items for the day
- [ ] Update progress in this document
- [ ] Commit code with clear messages
- [ ] Update technical documentation
- [ ] Note any blockers or decisions
- [ ] Plan next day's tasks

### Before Major Decisions
- [ ] Document options in ARCHITECTURE_DECISIONS.md
- [ ] Consider cost implications
- [ ] Evaluate complexity
- [ ] Check compliance requirements
- [ ] Get stakeholder input if needed

## Progress Tracking

### Completed Items
- ✅ Architecture decisions documented
- ✅ Implementation plan created
- ✅ Technical specifications defined
- ✅ AI agent design completed
- ✅ Project structure planned

### In Progress
- 🔄 Project setup
- 🔄 Evaluating email service options
- 🔄 Evaluating auth providers

### Upcoming
- ⏳ Backend development
- ⏳ Frontend development
- ⏳ AI agent implementation
- ⏳ Testing and deployment