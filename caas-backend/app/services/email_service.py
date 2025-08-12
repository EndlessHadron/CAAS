"""
Email Service using Gmail API
Handles all email notifications for the CAAS platform
"""

import base64
import logging
from typing import Optional, List, Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import json
import os

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

# Gmail API scope for sending emails
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class EmailService:
    """Service for sending emails via Gmail API"""
    
    def __init__(self):
        self.service = None
        self.sender_email = None
        self.sender_name = "neatly"
        self.display_email = "support@theneatlyapp.com"  # What users see
        self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Gmail API service"""
        try:
            # Try to load credentials from Secret Manager
            from app.core.secrets_manager import secret_manager
            
            # Get OAuth2 refresh token from Secret Manager
            gmail_creds = secret_manager.get_secret("gmail-oauth-credentials")
            if gmail_creds:
                creds_data = json.loads(gmail_creds)
                self.sender_email = creds_data.get("email", "noreply@theneatlyapp.com")
                
                # Create credentials from stored data
                creds = Credentials(
                    token=creds_data.get("token"),
                    refresh_token=creds_data.get("refresh_token"),
                    token_uri=creds_data.get("token_uri", "https://oauth2.googleapis.com/token"),
                    client_id=creds_data.get("client_id"),
                    client_secret=creds_data.get("client_secret"),
                    scopes=SCOPES
                )
                
                # Refresh token if expired
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                    # Update token in Secret Manager
                    self._update_stored_token(creds)
                
                # Build Gmail service
                self.service = build('gmail', 'v1', credentials=creds)
                logger.info(f"Gmail API initialized successfully for {self.sender_email}")
            else:
                logger.warning("Gmail credentials not found in Secret Manager")
                self.sender_email = os.getenv("GMAIL_SENDER_EMAIL", "noreply@theneatlyapp.com")
                
        except Exception as e:
            logger.error(f"Failed to initialize Gmail API: {e}")
            self.service = None
    
    def _update_stored_token(self, creds: Credentials):
        """Update stored token after refresh"""
        try:
            from app.core.secrets_manager import secret_manager
            
            creds_data = {
                "email": self.sender_email,
                "token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "client_secret": creds.client_secret
            }
            
            secret_manager.rotate_secret("gmail-oauth-credentials", json.dumps(creds_data))
            
        except Exception as e:
            logger.error(f"Failed to update stored token: {e}")
    
    def _create_message(self, to: str, subject: str, body_html: str, body_text: Optional[str] = None) -> Dict[str, Any]:
        """Create email message"""
        try:
            message = MIMEMultipart('alternative')
            message['From'] = f"{self.sender_name} <{self.display_email}>"
            message['Reply-To'] = self.display_email
            message['To'] = to
            message['Subject'] = subject
            
            # Add plain text part (fallback)
            if body_text:
                text_part = MIMEText(body_text, 'plain')
                message.attach(text_part)
            else:
                # Strip HTML tags for plain text version
                import re
                plain_text = re.sub('<[^<]+?>', '', body_html)
                text_part = MIMEText(plain_text, 'plain')
                message.attach(text_part)
            
            # Add HTML part
            html_part = MIMEText(body_html, 'html')
            message.attach(html_part)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            return {'raw': raw_message}
            
        except Exception as e:
            logger.error(f"Failed to create email message: {e}")
            raise
    
    async def send_email(self, to: str, subject: str, body_html: str, body_text: Optional[str] = None) -> bool:
        """Send an email"""
        if not self.service:
            logger.error("Gmail service not initialized")
            return False
        
        try:
            message = self._create_message(to, subject, body_html, body_text)
            
            # Send the message
            result = self.service.users().messages().send(
                userId='me',
                body=message
            ).execute()
            
            logger.info(f"Email sent successfully to {to}. Message ID: {result['id']}")
            return True
            
        except HttpError as e:
            logger.error(f"Gmail API error sending email: {e}")
            return False
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return False
    
    async def send_verification_email(self, to: str, name: str, verification_link: str) -> bool:
        """Send account verification email"""
        subject = "Verify your neatly account"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to neatly!</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>Thanks for signing up for neatly! Please verify your email address to complete your registration.</p>
                    <p style="text-align: center;">
                        <a href="{verification_link}" class="button">Verify Email Address</a>
                    </p>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #6366f1;">{verification_link}</p>
                    <p>This link will expire in 24 hours.</p>
                    <div class="footer">
                        <p>If you didn't create an account with neatly, you can safely ignore this email.</p>
                        <p>&copy; 2025 neatly - Premium Cleaning Services</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_booking_confirmation(self, to: str, name: str, booking_details: Dict[str, Any]) -> bool:
        """Send booking confirmation email"""
        subject = f"Booking Confirmed - {booking_details['service_type']} on {booking_details['date']}"
        
        body_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }}
                .booking-details {{ background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                .detail-row:last-child {{ border-bottom: none; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Confirmed! ✅</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>Great news! Your cleaning service has been confirmed.</p>
                    
                    <div class="booking-details">
                        <div class="detail-row">
                            <strong>Service:</strong>
                            <span>{booking_details.get('service_type', 'Regular Cleaning')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Date:</strong>
                            <span>{booking_details.get('date', 'TBD')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Time:</strong>
                            <span>{booking_details.get('time', 'TBD')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Duration:</strong>
                            <span>{booking_details.get('duration', '2')} hours</span>
                        </div>
                        <div class="detail-row">
                            <strong>Address:</strong>
                            <span>{booking_details.get('address', 'Your registered address')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Cleaner:</strong>
                            <span>{booking_details.get('cleaner_name', 'To be assigned')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Total:</strong>
                            <span>£{booking_details.get('price', '50.00')}</span>
                        </div>
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{booking_details.get('booking_id', '')}" class="button">View Booking</a>
                    </p>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>We'll send you a reminder 24 hours before your service</li>
                        <li>Your cleaner will arrive at the scheduled time</li>
                        <li>Payment will be processed after service completion</li>
                    </ul>
                    
                    <p>Need to make changes? You can modify or cancel your booking up to 24 hours before the service.</p>
                    
                    <div class="footer">
                        <p>Thank you for choosing neatly!</p>
                        <p>&copy; 2025 neatly - Premium Cleaning Services</p>
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
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }}
                .receipt {{ background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }}
                .detail-row:last-child {{ border-bottom: none; }}
                .total {{ font-size: 24px; color: #10b981; font-weight: bold; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Payment Successful! 💳</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>Thank you for your payment. Your transaction has been processed successfully.</p>
                    
                    <div class="receipt">
                        <h3 style="margin-top: 0;">Payment Receipt</h3>
                        <div class="detail-row">
                            <strong>Transaction ID:</strong>
                            <span>{payment_details.get('payment_intent_id', '')[:12]}...</span>
                        </div>
                        <div class="detail-row">
                            <strong>Date:</strong>
                            <span>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Service:</strong>
                            <span>{payment_details.get('service_type', 'Cleaning Service')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Booking Date:</strong>
                            <span>{payment_details.get('booking_date', 'As scheduled')}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Payment Method:</strong>
                            <span>{payment_details.get('payment_method', 'Card')} ending in {payment_details.get('last4', '****')}</span>
                        </div>
                        <div class="detail-row">
                            <strong class="total">Total Paid:</strong>
                            <span class="total">£{payment_details.get('amount', '0.00')}</span>
                        </div>
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{payment_details.get('booking_id', '')}" class="button">View Booking Details</a>
                    </p>
                    
                    <p>A copy of this receipt has been saved to your account for your records.</p>
                    
                    <div class="footer">
                        <p>Thank you for choosing neatly!</p>
                        <p>If you have any questions about this payment, please contact support.</p>
                        <p>&copy; 2025 neatly - Premium Cleaning Services</p>
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
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }}
                .reminder-box {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
                .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⏰ Cleaning Service Tomorrow!</h1>
                </div>
                <div class="content">
                    <h2>Hi {name},</h2>
                    <p>This is a friendly reminder about your scheduled cleaning service tomorrow.</p>
                    
                    <div class="reminder-box">
                        <strong>📅 {booking_details.get('date', 'Tomorrow')}</strong><br>
                        <strong>🕐 {booking_details.get('time', 'Scheduled time')}</strong><br>
                        <strong>📍 {booking_details.get('address', 'Your address')}</strong><br>
                        <strong>👤 Cleaner: {booking_details.get('cleaner_name', 'Your assigned cleaner')}</strong>
                    </div>
                    
                    <p><strong>Please remember to:</strong></p>
                    <ul>
                        <li>Ensure someone is home to let the cleaner in</li>
                        <li>Secure any valuables or sensitive items</li>
                        <li>Let us know if you have any special instructions</li>
                    </ul>
                    
                    <p style="text-align: center;">
                        <a href="https://theneatlyapp.com/bookings/{booking_details.get('booking_id', '')}" class="button">View Booking Details</a>
                    </p>
                    
                    <p>Need to reschedule? Please do so at least 4 hours before the service time.</p>
                    
                    <div class="footer">
                        <p>We look forward to making your space sparkle!</p>
                        <p>&copy; 2025 neatly - Premium Cleaning Services</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to, subject, body_html)
    
    async def send_welcome_email(self, to: str, name: str, user_type: str = "client") -> bool:
        """Send welcome email to new users"""
        subject = "Welcome to neatly! 🎉"
        
        if user_type == "cleaner":
            body_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                    .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to the neatly Team!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi {name},</h2>
                        <p>Congratulations on joining neatly as a cleaning professional! We're excited to have you on our platform.</p>
                        
                        <p><strong>Get started with these steps:</strong></p>
                        <ol>
                            <li>Complete your profile with availability and service areas</li>
                            <li>Set up your payment details to receive earnings</li>
                            <li>Review our cleaner guidelines and standards</li>
                            <li>Start accepting job offers!</li>
                        </ol>
                        
                        <p style="text-align: center;">
                            <a href="https://theneatlyapp.com/cleaner" class="button">Go to Dashboard</a>
                        </p>
                        
                        <p>As a neatly cleaner, you'll enjoy:</p>
                        <ul>
                            <li>Flexible scheduling - work when you want</li>
                            <li>Competitive rates</li>
                            <li>Weekly payments</li>
                            <li>Insurance coverage</li>
                            <li>Professional support</li>
                        </ul>
                        
                        <div class="footer">
                            <p>Ready to start earning? Check your dashboard for available jobs!</p>
                            <p>&copy; 2025 neatly - Premium Cleaning Services</p>
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
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }}
                    .content {{ background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }}
                    .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    .footer {{ text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to neatly!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi {name},</h2>
                        <p>Welcome to neatly - where premium cleaning meets convenience! We're thrilled to have you join our community.</p>
                        
                        <p><strong>Here's how to get started:</strong></p>
                        <ol>
                            <li>Complete your profile with your address</li>
                            <li>Browse our cleaning services</li>
                            <li>Book your first cleaning</li>
                            <li>Sit back and relax!</li>
                        </ol>
                        
                        <p style="text-align: center;">
                            <a href="https://theneatlyapp.com/bookings/new" class="button">Book Your First Cleaning</a>
                        </p>
                        
                        <p><strong>Why choose neatly?</strong></p>
                        <ul>
                            <li>✅ Vetted, professional cleaners</li>
                            <li>✅ Flexible scheduling</li>
                            <li>✅ Transparent pricing</li>
                            <li>✅ 100% satisfaction guarantee</li>
                            <li>✅ Easy online booking and payment</li>
                        </ul>
                        
                        <div class="footer">
                            <p>Questions? Reply to this email and we'll be happy to help!</p>
                            <p>&copy; 2025 neatly - Premium Cleaning Services</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
        
        return await self.send_email(to, subject, body_html)

# Global email service instance
email_service = EmailService()