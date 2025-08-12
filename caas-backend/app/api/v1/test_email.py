"""
Test endpoint for email service
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class TestEmailRequest(BaseModel):
    to_email: EmailStr
    
@router.post("/test-email")
async def test_email_send(request: TestEmailRequest):
    """Test email sending functionality"""
    try:
        from app.services.resend_email_service import email_service
        
        # Send a test welcome email
        success = await email_service.send_welcome_email(
            to=request.to_email,
            name="Test User",
            user_type="client"
        )
        
        if success:
            logger.info(f"Test email sent successfully to {request.to_email}")
            return {
                "success": True,
                "message": f"Test email sent to {request.to_email}",
                "note": "Check your email inbox"
            }
        else:
            logger.error(f"Failed to send test email to {request.to_email}")
            return {
                "success": False,
                "message": "Failed to send email",
                "note": "Check logs for details"
            }
            
    except Exception as e:
        logger.error(f"Email test error: {e}")
        raise HTTPException(status_code=500, detail=str(e))