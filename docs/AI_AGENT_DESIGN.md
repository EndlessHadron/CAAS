# AI Agent Design Document

## Overview
The AI Agent acts as an automated CTO/CEO, handling routine decisions and operations while escalating critical decisions to human operators.

## Agent Architecture

### Core Components
1. **Decision Engine**: LangChain-based reasoning system
2. **Memory Store**: Conversation and decision history in Firestore
3. **Action Framework**: Predefined actions the agent can take
4. **Approval Workflow**: Human-in-the-loop for critical decisions
5. **Monitoring Dashboard**: Real-time agent activity tracking

## Agent Capabilities

### Autonomous Actions (No Approval Needed)
1. **Customer Service**
   - Respond to booking inquiries
   - Provide service information
   - Handle scheduling questions
   - Send booking confirmations

2. **Basic Operations**
   - Match cleaners to bookings (within rules)
   - Send routine notifications
   - Update booking statuses
   - Generate standard reports

3. **Data Analysis**
   - Monitor booking patterns
   - Track cleaner performance
   - Identify service issues
   - Generate insights

### Supervised Actions (Approval Required)
1. **Financial Decisions**
   - Refunds over £50
   - Pricing changes
   - Contractor payment adjustments
   - Promotional offers

2. **Policy Changes**
   - Service area expansion
   - New service types
   - Terms of service updates
   - Contractor agreement changes

3. **Conflict Resolution**
   - Customer complaints
   - Contractor disputes
   - Service quality issues
   - Emergency situations

## Implementation Details

### LangChain Configuration
```python
from langchain import LLMChain, PromptTemplate
from langchain.memory import ConversationSummaryMemory
from langchain.agents import AgentExecutor, Tool

class CAASAgent:
    def __init__(self):
        self.memory = ConversationSummaryMemory()
        self.tools = self._setup_tools()
        self.chain = self._setup_chain()
    
    def _setup_tools(self):
        return [
            Tool(name="BookingManager", func=self.manage_booking),
            Tool(name="CustomerService", func=self.handle_inquiry),
            Tool(name="Analytics", func=self.analyze_data),
            Tool(name="Escalation", func=self.escalate_to_human)
        ]
```

### Decision Trees
```yaml
booking_request:
  - check_availability:
      if_available:
        - check_cleaner_match:
            if_match_found:
              - send_to_cleaner
              - wait_for_response(timeout: 30min)
            else:
              - broadcast_to_available_cleaners
      else:
        - suggest_alternative_times
        
customer_complaint:
  - assess_severity:
      high:
        - escalate_to_human
        - log_incident
      medium:
        - offer_standard_resolution
        - monitor_response
      low:
        - auto_respond_with_template
        - close_ticket
```

### Prompts and Context
```python
SYSTEM_PROMPT = """
You are the AI Operations Manager for CAAS, a cleaning service platform.
Your role is to optimize operations while ensuring customer satisfaction.

Core Principles:
1. Customer satisfaction is paramount
2. Contractor welfare must be protected
3. Financial prudence in all decisions
4. Escalate when uncertain

Current Context:
- Active bookings: {active_bookings}
- Available cleaners: {available_cleaners}
- Pending issues: {pending_issues}
"""

DECISION_TEMPLATE = """
Situation: {situation}
Available Actions: {actions}
Constraints: {constraints}

Analyze the situation and recommend the best action.
If this requires human approval, explain why.
"""
```

## Approval Workflow

### Approval Request Structure
```json
{
  "requestId": "string",
  "type": "financial|policy|conflict|strategic",
  "urgency": "low|medium|high|critical",
  "context": {
    "situation": "string",
    "recommendation": "string",
    "alternatives": ["string"],
    "risks": ["string"],
    "estimatedImpact": {
      "financial": "number",
      "customers": "number",
      "contractors": "number"
    }
  },
  "aiConfidence": "number (0-1)",
  "requestedAt": "timestamp",
  "expiresAt": "timestamp"
}
```

### Escalation Rules
1. **Auto-escalate if**:
   - Financial impact > £100
   - Affects > 5 customers
   - Legal/compliance implications
   - AI confidence < 0.7

2. **Notification Channels**:
   - Critical: SMS + Email + Dashboard alert
   - High: Email + Dashboard alert
   - Medium: Dashboard alert
   - Low: Dashboard queue

## Monitoring and Metrics

### Key Performance Indicators
1. **Efficiency Metrics**
   - Decisions per day
   - Average decision time
   - Automation rate (%)
   - Escalation rate (%)

2. **Quality Metrics**
   - Decision accuracy
   - Customer satisfaction impact
   - Revenue impact
   - Error rate

3. **System Health**
   - Response time
   - Token usage
   - API costs
   - Uptime

### Monitoring Dashboard Views
1. **Real-time Activity**
   - Current decisions in progress
   - Recent actions taken
   - Pending approvals
   - System alerts

2. **Analytics**
   - Decision patterns
   - Performance trends
   - Cost analysis
   - ROI metrics

## Safety Mechanisms

### Guardrails
1. **Financial Limits**
   - Max refund: £50 auto, £200 with approval
   - Max discount: 20% auto, 50% with approval
   - Daily spend limit: £500

2. **Operational Limits**
   - Max bookings per cleaner per day: 3
   - Min time between bookings: 30 minutes
   - Max travel distance: 10 miles

3. **Communication Limits**
   - Max emails per customer per day: 3
   - No marketing after 8 PM
   - Sensitive topics require human review

### Rollback Procedures
1. **Immediate Rollback Triggers**
   - Error rate > 10%
   - Customer complaints spike > 50%
   - Financial loss > £200/day

2. **Rollback Actions**
   - Disable autonomous mode
   - Route all decisions to human
   - Preserve decision history
   - Generate incident report

## Integration Points

### Internal Systems
- Booking Management API
- User Management API
- Notification Service
- Analytics Pipeline

### External Services
- Claude API (via Anthropic)
- Google Cloud Functions (for async processing)
- Firestore (for state management)
- Pub/Sub (for event handling)

## Development Phases

### Phase 1: Basic Automation (Weeks 1-2)
- Customer inquiry responses
- Booking status updates
- Basic notifications

### Phase 2: Intelligent Matching (Weeks 3-4)
- Cleaner-job matching
- Schedule optimization
- Availability management

### Phase 3: Advanced Features (Weeks 5-6)
- Predictive analytics
- Proactive problem solving
- Revenue optimization

### Phase 4: Full Autonomy (Weeks 7-8)
- Complex decision making
- Multi-step workflows
- Strategic recommendations