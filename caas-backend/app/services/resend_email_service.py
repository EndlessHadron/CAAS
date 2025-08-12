"""
Resend Email Service for CAAS
Modern email API with great developer experience
"""

import logging
import os
from typing import Optional, Dict, Any
from datetime import datetime

import resend

logger = logging.getLogger(__name__)

class ResendEmailService:
    """Service for sending emails via Resend"""
    
    def __init__(self):
        self.api_key = None
        # Updated to use info@ as main sender
        self.sender_email = "info@theneatlyapp.com"
        self.sender_name = "neatly"
        self.support_email = "support@theneatlyapp.com"
        self.admin_emails = {
            "max": "max@theneatlyapp.com",
            "yehisn": "yehisn@theneatlyapp.com"
        }
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Resend client"""
        try:
            # Try to get API key from Secret Manager first
            from app.core.secrets_manager import secret_manager
            
            try:
                self.api_key = secret_manager.get_secret("resend-api-key")
                logger.info("Resend API key loaded from Secret Manager")
            except:
                # Fallback to environment variable
                self.api_key = os.environ.get('RESEND_API_KEY')
                if self.api_key:
                    logger.info("Resend API key loaded from environment")
                else:
                    logger.warning("Resend API key not found - email sending disabled")
                    return
            
            # Set Resend API key
            resend.api_key = self.api_key
            logger.info("Resend client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Resend: {e}")
    
    async def send_email(self, to: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
        """Send an email using Resend"""
        if not self.api_key:
            logger.error("Resend API key not configured")
            return False
        
        try:
            # Send email via Resend with anti-spam headers
            response = resend.Emails.send({
                "from": f"{self.sender_name} <{self.sender_email}>",
                "to": to,
                "subject": subject,
                "html": body_html,
                "text": body_text or self._html_to_text(body_html),
                "headers": {
                    "X-Entity-Ref-ID": f"neatly-{datetime.now().timestamp()}",
                    "List-Unsubscribe": "<mailto:unsubscribe@theneatlyapp.com>",
                    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                    "X-Priority": "3",
                    "X-Mailer": "neatly-app/1.0"
                },
                "reply_to": self.support_email
            })
            
            if response.get("id"):
                logger.info(f"Email sent successfully to {to}. ID: {response['id']}")
                return True
            else:
                logger.error(f"Resend error: {response}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email via Resend: {e}")
            return False
    
    def _html_to_text(self, html: str) -> str:
        """Simple HTML to text conversion"""
        import re
        # Remove HTML tags
        text = re.sub('<[^<]+?>', '', html)
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def _get_email_styles(self) -> str:
        """Get consistent email styles for professional look"""
        return """
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                background: #f9fafb; 
                margin: 0; 
                padding: 0;
                color: #111827;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.07);
            }
            .header { 
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%); 
                color: white; 
                padding: 40px 30px; 
                text-align: center;
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 600;
                letter-spacing: -0.5px;
            }
            .header p { 
                margin: 10px 0 0 0; 
                font-size: 15px; 
                opacity: 0.9;
            }
            .content { 
                padding: 40px 35px;
            }
            .content h2 { 
                color: #111827; 
                margin-top: 0;
                font-size: 20px;
                font-weight: 600;
            }
            .content p { 
                color: #4b5563; 
                line-height: 1.6; 
                font-size: 15px;
                margin: 16px 0;
            }
            .button { 
                display: inline-block; 
                padding: 14px 32px; 
                background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%); 
                color: white; 
                text-decoration: none; 
                border-radius: 8px; 
                margin: 24px 0; 
                font-weight: 500; 
                font-size: 15px;
            }
            .info-box {
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                margin: 24px 0;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .info-row:last-child {
                border-bottom: none;
            }
            .info-label {
                color: #6b7280;
                font-weight: 500;
            }
            .info-value {
                color: #111827;
                font-weight: 600;
            }
            .divider { 
                border-top: 1px solid #e5e7eb; 
                margin: 32px 0;
            }
            .footer { 
                text-align: center; 
                color: #6b7280; 
                font-size: 13px; 
                margin-top: 32px;
                padding: 0 20px 32px 20px;
                line-height: 1.5;
            }
            .footer a { 
                color: #2563eb; 
                text-decoration: none;
            }
            .footer a:hover {
                text-decoration: underline;
            }
        """
    
    async def send_verification_email(self, to: str, name: str, verification_link: str) -> bool:
        """Send account verification email"""
        subject = f"Verify Your neatly Account"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {self._get_email_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email Address</h1>
                    <p>Complete your neatly account setup</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>Thank you for signing up with neatly. To complete your registration and access all features, please verify your email address.</p>
                    
                    <p>This verification helps us ensure the security of your account and enables you to receive important updates about your cleaning services.</p>
                    
                    <p style="text-align: center;">
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                    </p>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 14px; color: #6b7280;">
                        If the button above doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; color: #2563eb; font-size: 13px; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                        {verification_link}
                    </p>
                    
                    <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
                        This verification link will expire in 24 hours for security reasons.
                    </p>
                    
                    <div class="footer">
                        <p>If you didn't create an account with neatly, please ignore this email.</p>
                        <p style="margin-top: 16px;">
                            Need help? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                        </p>
                        <p style="margin-top: 16px; color: #9ca3af;">
                            neatly - Professional Cleaning Services<br/>
                            London, United Kingdom
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_booking_confirmation(self, to: str, name: str, booking_details: Dict[str, Any]) -> bool:
        """Send booking confirmation email"""
        subject = f"Booking Confirmation - {booking_details['date']}"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {self._get_email_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Confirmed</h1>
                    <p>Your cleaning service has been scheduled</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>Your booking has been successfully confirmed. Our professional cleaner will arrive at your scheduled time.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Booking Details</h3>
                        <div class="info-row">
                            <span class="info-label">Service Type</span>
                            <span class="info-value">{booking_details.get('service_type', 'Regular Cleaning')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date</span>
                            <span class="info-value">{booking_details.get('date', 'TBD')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Time</span>
                            <span class="info-value">{booking_details.get('time', 'TBD')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Duration</span>
                            <span class="info-value">{booking_details.get('duration', '2')} hours</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Total Amount</span>
                            <span class="info-value" style="font-size: 18px; color: #2563eb;">£{booking_details.get('price', '50.00')}</span>
                        </div>
                    </div>
                    
                    <p><strong>Preparation Tips:</strong></p>
                    <ul style="color: #4b5563; margin: 12px 0; padding-left: 20px;">
                        <li style="margin: 8px 0;">Clear surfaces of personal items for thorough cleaning</li>
                        <li style="margin: 8px 0;">Secure valuables and important documents</li>
                        <li style="margin: 8px 0;">Ensure access to all areas requiring cleaning</li>
                        <li style="margin: 8px 0;">Leave any special instructions in a visible location</li>
                    </ul>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{booking_details.get('booking_id', '')}" class="button">View Booking Details</a>
                    </p>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">
                        Need to make changes? You can reschedule or cancel your booking up to 24 hours before the scheduled time.
                    </p>
                    
                    <div class="footer">
                        <p>Thank you for choosing neatly for your cleaning needs.</p>
                        <p style="margin-top: 16px;">
                            Questions? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                        </p>
                        <p style="margin-top: 16px; color: #9ca3af;">
                            neatly - Professional Cleaning Services<br/>
                            London, United Kingdom
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_payment_confirmation(self, to: str, name: str, payment_details: Dict[str, Any]) -> bool:
        """Send payment confirmation email"""
        subject = f"Payment Receipt - £{payment_details.get('amount', '0.00')}"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {self._get_email_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Received</h1>
                    <p>Thank you for your payment</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>Your payment has been successfully processed. This email serves as your official receipt.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Payment Receipt</h3>
                        <div class="info-row">
                            <span class="info-label">Transaction ID</span>
                            <span class="info-value" style="font-family: monospace; font-size: 13px;">{payment_details.get('payment_intent_id', '')[:16]}...</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date</span>
                            <span class="info-value">{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Service</span>
                            <span class="info-value">{payment_details.get('service_type', 'Cleaning Service')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Payment Method</span>
                            <span class="info-value">Card ending in {payment_details.get('last4', '****')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Amount Paid</span>
                            <span class="info-value" style="font-size: 20px; color: #059669; font-weight: 700;">£{payment_details.get('amount', '0.00')}</span>
                        </div>
                    </div>
                    
                    <p>Your cleaning service has been secured and your cleaner will arrive at the scheduled time.</p>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings" class="button">View My Bookings</a>
                    </p>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 13px; color: #6b7280; text-align: center;">
                        Please keep this receipt for your records. A copy is also available in your account dashboard.
                    </p>
                    
                    <div class="footer">
                        <p>Thank you for your payment.</p>
                        <p style="margin-top: 16px;">
                            Need assistance? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                        </p>
                        <p style="margin-top: 16px; color: #9ca3af;">
                            neatly - Professional Cleaning Services<br/>
                            London, United Kingdom
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_welcome_email(self, to: str, name: str, user_type: str = "client") -> bool:
        """Send welcome email to new users"""
        subject = f"Welcome to neatly, {name}"
        
        if user_type == "cleaner":
            body_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    {self._get_email_styles()}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to the neatly Team</h1>
                        <p>You're now part of our professional cleaning network</p>
                    </div>
                    <div class="content">
                        <h2>Hello {name},</h2>
                        <p>Welcome to neatly! We're pleased to have you join our network of professional cleaners serving London.</p>
                        
                        <p>As a neatly cleaner, you'll have access to:</p>
                        <ul style="color: #4b5563; margin: 16px 0; padding-left: 20px;">
                            <li style="margin: 8px 0;">Flexible scheduling that works around your availability</li>
                            <li style="margin: 8px 0;">Competitive rates with weekly payments</li>
                            <li style="margin: 8px 0;">A steady stream of clients in your preferred areas</li>
                            <li style="margin: 8px 0;">Professional support and resources</li>
                            <li style="margin: 8px 0;">Opportunities for growth and additional earnings</li>
                        </ul>
                        
                        <p><strong>Next Steps:</strong></p>
                        <ol style="color: #4b5563; margin: 16px 0; padding-left: 20px;">
                            <li style="margin: 8px 0;">Complete your profile with availability and service areas</li>
                            <li style="margin: 8px 0;">Upload required documentation</li>
                            <li style="margin: 8px 0;">Complete the onboarding process</li>
                            <li style="margin: 8px 0;">Start accepting bookings</li>
                        </ol>
                        
                        <p style="text-align: center;">
                            <a href="https://theneatlyapp.com/cleaner" class="button">Access Cleaner Dashboard</a>
                        </p>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #6b7280;">
                            Our support team is available to help you get started and answer any questions you may have.
                        </p>
                        
                        <div class="footer">
                            <p>We look forward to working with you.</p>
                            <p style="margin-top: 16px;">
                                Cleaner support: <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                            </p>
                            <p style="margin-top: 16px; color: #9ca3af;">
                                neatly - Professional Cleaning Services<br/>
                                London, United Kingdom
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
        else:
            body_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    {self._get_email_styles()}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to neatly</h1>
                        <p>Professional cleaning services at your fingertips</p>
                    </div>
                    <div class="content">
                        <h2>Hello {name},</h2>
                        <p>Thank you for joining neatly. We're committed to providing you with exceptional cleaning services that give you more time to focus on what matters most.</p>
                        
                        <p><strong>What you can expect from neatly:</strong></p>
                        <ul style="color: #4b5563; margin: 16px 0; padding-left: 20px;">
                            <li style="margin: 8px 0;">Vetted and insured professional cleaners</li>
                            <li style="margin: 8px 0;">Easy online booking and management</li>
                            <li style="margin: 8px 0;">Flexible scheduling options</li>
                            <li style="margin: 8px 0;">Transparent, competitive pricing</li>
                            <li style="margin: 8px 0;">100% satisfaction guarantee</li>
                        </ul>
                        
                        
                        <p>Ready to book your first cleaning? It only takes a few minutes to schedule your service.</p>
                        
                        <p style="text-align: center;">
                            <a href="https://theneatlyapp.com/bookings/new" class="button">Book Your First Cleaning</a>
                        </p>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #6b7280;">
                            Average booking time: 60 seconds. Join thousands of satisfied customers across London.
                        </p>
                        
                        <div class="footer">
                            <p>Welcome aboard!</p>
                            <p style="margin-top: 16px;">
                                Questions? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                            </p>
                            <p style="margin-top: 16px; color: #9ca3af;">
                                neatly - Professional Cleaning Services<br/>
                                London, United Kingdom
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_booking_reminder(self, to: str, name: str, booking_details: Dict[str, Any]) -> bool:
        """Send booking reminder email"""
        subject = f"Reminder: Cleaning Service Tomorrow at {booking_details.get('time', '')}"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {self._get_email_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Service Reminder</h1>
                    <p>Your cleaning is scheduled for tomorrow</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>This is a reminder that your cleaning service is scheduled for tomorrow. Your cleaner will arrive at the specified time.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Tomorrow's Service</h3>
                        <div class="info-row">
                            <span class="info-label">Date</span>
                            <span class="info-value">{booking_details.get('date', 'Tomorrow')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Arrival Time</span>
                            <span class="info-value">{booking_details.get('time', 'Scheduled time')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Duration</span>
                            <span class="info-value">{booking_details.get('duration', '2')} hours</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Location</span>
                            <span class="info-value">{booking_details.get('address', 'Your registered address')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Cleaner</span>
                            <span class="info-value">{booking_details.get('cleaner_name', 'Assigned professional')}</span>
                        </div>
                    </div>
                    
                    <p><strong>Preparation Checklist:</strong></p>
                    <ul style="color: #4b5563; margin: 12px 0; padding-left: 20px;">
                        <li style="margin: 8px 0;">Clear surfaces for thorough cleaning</li>
                        <li style="margin: 8px 0;">Secure pets in a safe area</li>
                        <li style="margin: 8px 0;">Ensure access to all areas</li>
                        <li style="margin: 8px 0;">Leave any special instructions</li>
                    </ul>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{booking_details.get('booking_id', '')}" class="button">View Booking Details</a>
                    </p>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">
                        Need to reschedule? Changes can be made up to 4 hours before your appointment.
                    </p>
                    
                    <div class="footer">
                        <p>We look forward to serving you tomorrow.</p>
                        <p style="margin-top: 16px;">
                            Need help? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                        </p>
                        <p style="margin-top: 16px; color: #9ca3af;">
                            neatly - Professional Cleaning Services<br/>
                            London, United Kingdom
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_cleaner_assigned(self, to: str, name: str, booking_details: Dict[str, Any]) -> bool:
        """Send cleaner assignment notification email"""
        subject = f"Great News! Your Cleaner Has Been Assigned"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {self._get_email_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Cleaner Assigned ✨</h1>
                    <p>Your cleaning service is confirmed</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>Great news! We've assigned a professional cleaner to your booking. Your service is confirmed and ready to go.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Your Assigned Cleaner</h3>
                        <div class="info-row">
                            <span class="info-label">Cleaner</span>
                            <span class="info-value">{booking_details.get('cleaner_name', 'Professional Cleaner')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Experience</span>
                            <span class="info-value">{booking_details.get('cleaner_experience', 'Professional')} years</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Rating</span>
                            <span class="info-value">⭐ {booking_details.get('cleaner_rating', 'N/A')}</span>
                        </div>
                        <div class="divider" style="margin: 16px 0;"></div>
                        <div class="info-row">
                            <span class="info-label">Service Date</span>
                            <span class="info-value">{booking_details.get('date', 'TBD')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Time</span>
                            <span class="info-value">{booking_details.get('time', 'TBD')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Duration</span>
                            <span class="info-value">{booking_details.get('duration', '2')} hours</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Service Type</span>
                            <span class="info-value">{booking_details.get('service_type', 'Cleaning')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Location</span>
                            <span class="info-value">{booking_details.get('address', 'Your address')}</span>
                        </div>
                    </div>
                    
                    <div style="background: #10b981; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <strong>✅ Your booking is confirmed!</strong><br/>
                        Complete your payment to secure this service.
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{booking_details.get('booking_id', '')}" class="button">Complete Payment & View Details</a>
                    </p>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 14px; color: #6b7280;">
                        <strong>Next Steps:</strong> Complete your payment to confirm this booking. You'll receive a reminder email 24 hours before your service.
                    </p>
                    
                    <div class="footer">
                        <p>Thank you for choosing neatly.</p>
                        <p style="margin-top: 16px;">
                            Questions? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                        </p>
                        <p style="margin-top: 16px; color: #9ca3af;">
                            neatly - Professional Cleaning Services<br/>
                            London, United Kingdom
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_booking_completion(self, to: str, name: str, booking_details: Dict[str, Any]) -> bool:
        """Send booking completion notification email"""
        subject = f"Service Complete - How Did We Do?"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                {self._get_email_styles()}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Service Complete! ✨</h1>
                    <p>Your cleaning service has been completed</p>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>Your cleaning service has been completed! We hope you're delighted with the results.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0; color: #111827; font-size: 16px; font-weight: 600;">Service Summary</h3>
                        <div class="info-row">
                            <span class="info-label">Service</span>
                            <span class="info-value">{booking_details.get('service_type', 'Cleaning Service')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Date</span>
                            <span class="info-value">{booking_details.get('date', 'Today')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Time</span>
                            <span class="info-value">{booking_details.get('time', 'Completed')}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Location</span>
                            <span class="info-value">{booking_details.get('address', 'Your address')}</span>
                        </div>
                    </div>
                    
                    <div style="background: #f3f4f6; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
                        <p style="margin: 0; color: #374151;"><strong>Quality Guarantee:</strong> If you're not completely satisfied with your service, please let us know within 24 hours and we'll make it right.</p>
                    </div>
                    
                    <p><strong>We'd love to hear from you!</strong> Your feedback helps us maintain our high standards and improve our service.</p>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{booking_details.get('booking_id', '')}/rate" class="button">Rate Your Service</a>
                    </p>
                    
                    <div class="divider"></div>
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">
                        Need another cleaning? Book your next service in just 60 seconds.
                    </p>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/new" style="display: inline-block; padding: 12px 24px; background-color: #f9fafb; color: #374151; text-decoration: none; border-radius: 6px; border: 1px solid #d1d5db; font-weight: 500; margin-top: 12px;">Book Again</a>
                    </p>
                    
                    <div class="footer">
                        <p>Thank you for choosing neatly.</p>
                        <p style="margin-top: 16px;">
                            Questions? Contact us at <a href="mailto:support@theneatlyapp.com">support@theneatlyapp.com</a>
                        </p>
                        <p style="margin-top: 16px; color: #9ca3af;">
                            neatly - Professional Cleaning Services<br/>
                            London, United Kingdom
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_admin_notification(self, to: str, subject: str, body_html: str, admin_name: str = "max", body_text: Optional[str] = None) -> bool:
        """Send email from admin address (max@ or yehisn@)"""
        if admin_name not in self.admin_emails:
            logger.error(f"Unknown admin name: {admin_name}")
            return False
            
        return await self.send_email_from(
            from_email=self.admin_emails[admin_name],
            from_name=admin_name.title(),
            to=to,
            subject=subject,
            body_html=body_html,
            body_text=body_text
        )
    
    async def send_support_email(self, to: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
        """Send email from support address"""
        return await self.send_email_from(
            from_email=self.support_email,
            from_name="neatly Support",
            to=to,
            subject=subject,
            body_html=body_html,
            body_text=body_text
        )
    
    async def send_email_from(self, from_email: str, from_name: str, to: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
        """Send email from specific address"""
        if not self.api_key:
            logger.error("Resend API key not configured")
            return False
        
        try:
            response = resend.Emails.send({
                "from": f"{from_name} <{from_email}>",
                "to": to,
                "subject": subject,
                "html": body_html,
                "text": body_text or self._html_to_text(body_html),
                "headers": {
                    "X-Entity-Ref-ID": f"neatly-{datetime.now().timestamp()}",
                    "List-Unsubscribe": f"<mailto:unsubscribe@theneatlyapp.com>",
                    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                    "X-Priority": "3",
                    "X-Mailer": "neatly-app/1.0"
                },
                "reply_to": self.support_email
            })
            
            if response.get("id"):
                logger.info(f"Email sent successfully from {from_email} to {to}. ID: {response['id']}")
                return True
            else:
                logger.error(f"Resend error: {response}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending email from {from_email}: {e}")
            return False

# Global email service instance
email_service = ResendEmailService()