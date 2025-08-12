"""
Job Assignment Service for automatic cleaner assignment
Handles timeout-based auto-assignment and job recommendation logic
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from app.core.database import get_firestore_client, FirestoreCollections

logger = logging.getLogger(__name__)

class JobAssignmentService:
    """Service for handling job assignments and auto-assignment logic"""
    
    def __init__(self):
        self.assignment_timeout_hours = 2  # Auto-assign after 2 hours
        self.max_distance_miles = 15      # Maximum distance for auto-assignment
        self.max_cleaners_to_try = 5      # Try up to 5 cleaners for auto-assignment
    
    async def process_pending_jobs(self) -> Dict[str, int]:
        """Process all pending jobs for auto-assignment"""
        try:
            db = get_firestore_client()
            
            # Find jobs that need auto-assignment (pending > timeout hours)
            cutoff_time = datetime.utcnow() - timedelta(hours=self.assignment_timeout_hours)
            
            bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
            pending_jobs = bookings_ref.where('status', '==', 'pending')\
                                      .where('cleaner_id', '==', None)\
                                      .where('created_at', '<', cutoff_time).stream()
            
            stats = {
                'jobs_processed': 0,
                'jobs_assigned': 0,
                'jobs_failed': 0
            }
            
            for job_doc in pending_jobs:
                job_data = job_doc.to_dict()
                booking_id = job_data.get('booking_id')
                stats['jobs_processed'] += 1
                
                logger.info(f"Processing auto-assignment for job {booking_id}")
                
                # Try to auto-assign this job
                assigned = await self.auto_assign_job(booking_id, job_data)
                
                if assigned:
                    stats['jobs_assigned'] += 1
                    logger.info(f"Successfully auto-assigned job {booking_id}")
                else:
                    stats['jobs_failed'] += 1
                    logger.warning(f"Failed to auto-assign job {booking_id}")
            
            logger.info(f"Auto-assignment batch complete: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error processing pending jobs: {e}")
            return {'jobs_processed': 0, 'jobs_assigned': 0, 'jobs_failed': 0, 'error': str(e)}
    
    async def auto_assign_job(self, booking_id: str, job_data: Dict) -> bool:
        """Auto-assign a specific job to the best available cleaner"""
        try:
            db = get_firestore_client()
            
            # Get suitable cleaners for this job
            suitable_cleaners = await self.find_suitable_cleaners(job_data)
            
            if not suitable_cleaners:
                logger.warning(f"No suitable cleaners found for job {booking_id}")
                return False
            
            # Try to assign to each cleaner in order
            for cleaner in suitable_cleaners:
                cleaner_id = cleaner['uid']
                
                # Check if cleaner has already rejected this job
                rejection_ref = db.collection('job_rejections').document(f"{cleaner_id}_{booking_id}")
                if rejection_ref.get().exists:
                    continue
                
                # Check if cleaner is still available
                if await self.is_cleaner_available_for_job(cleaner_id, job_data):
                    # Assign the job
                    booking_ref = db.collection(FirestoreCollections.BOOKINGS).document(booking_id)
                    current_time = datetime.utcnow()
                    
                    # Check payment status for final booking status
                    payment_status = job_data.get('payment', {}).get('status')
                    is_paid = payment_status == 'succeeded' or job_data.get('status') == 'paid'
                    
                    update_data = {
                        'cleaner_id': cleaner_id,
                        'updated_at': current_time,
                        'auto_assigned_at': current_time,
                        'assignment_type': 'auto'
                    }
                    
                    if is_paid:
                        update_data['status'] = 'confirmed'
                    # If not paid, status remains 'pending'
                    
                    booking_ref.update(update_data)
                    
                    # Send notification emails
                    await self.send_auto_assignment_notifications(booking_id, job_data, cleaner)
                    
                    logger.info(f"Auto-assigned job {booking_id} to cleaner {cleaner_id}")
                    return True
            
            logger.warning(f"All suitable cleaners unavailable or have rejected job {booking_id}")
            return False
            
        except Exception as e:
            logger.error(f"Error auto-assigning job {booking_id}: {e}")
            return False
    
    async def find_suitable_cleaners(self, job_data: Dict) -> List[Dict]:
        """Find cleaners suitable for a job, sorted by preference"""
        try:
            db = get_firestore_client()
            
            # Extract job details
            service_type = job_data.get('service', {}).get('type', '')
            job_location = job_data.get('location', {}).get('address', {})
            job_postcode = job_location.get('postcode', '')
            
            # Get all cleaners
            cleaners_ref = db.collection('users').where('role', '==', 'cleaner')
            all_cleaners = cleaners_ref.stream()
            
            suitable_cleaners = []
            
            for cleaner_doc in all_cleaners:
                cleaner_data = cleaner_doc.to_dict()
                cleaner_profile = cleaner_data.get('cleaner_profile', {})
                
                # Check service type compatibility
                services_offered = cleaner_profile.get('services_offered', [])
                if services_offered and service_type not in services_offered:
                    continue
                
                # Check distance
                cleaner_location = cleaner_profile.get('location', {})
                distance = self.calculate_distance(cleaner_location, job_location)
                max_radius = cleaner_profile.get('radius_miles', self.max_distance_miles)
                
                if distance > max_radius or distance > self.max_distance_miles:
                    continue
                
                # Add cleaner with ranking data
                suitable_cleaners.append({
                    'uid': cleaner_doc.id,
                    'profile': cleaner_data,
                    'cleaner_profile': cleaner_profile,
                    'distance': distance,
                    'rating': cleaner_profile.get('rating', 0),
                    'total_jobs': cleaner_profile.get('total_jobs', 0)
                })
            
            # Sort by ranking: rating, total jobs, distance (ascending)
            suitable_cleaners.sort(key=lambda c: (
                -c['rating'],           # Higher rating first
                -c['total_jobs'],       # More experienced first
                c['distance']           # Closer distance first
            ))
            
            # Limit to max cleaners to try
            return suitable_cleaners[:self.max_cleaners_to_try]
            
        except Exception as e:
            logger.error(f"Error finding suitable cleaners: {e}")
            return []
    
    async def is_cleaner_available_for_job(self, cleaner_id: str, job_data: Dict) -> bool:
        """Check if a cleaner is available for a specific job"""
        try:
            from app.api.v1.contractors import is_cleaner_available
            
            booking_date = job_data.get('schedule', {}).get('date')
            booking_time = job_data.get('schedule', {}).get('time')
            duration = job_data.get('service', {}).get('duration', 2)
            
            return is_cleaner_available(cleaner_id, booking_date, booking_time, duration)
            
        except Exception as e:
            logger.error(f"Error checking cleaner availability: {e}")
            return False
    
    def calculate_distance(self, location1: Dict, location2: Dict) -> float:
        """Calculate approximate distance between two locations"""
        # Simple postcode-based distance calculation
        if not location1 or not location2:
            return 999  # Max distance if no location data
        
        postcode1 = location1.get('postcode', '').upper()[:3]
        postcode2 = location2.get('postcode', '').upper()[:3]
        
        if not postcode1 or not postcode2:
            return 999
        
        if postcode1 == postcode2:
            return 2  # Same area
        else:
            # Simple London distance estimation based on postcode prefixes
            london_distances = {
                ('SW', 'SW'): 4, ('N', 'N'): 4, ('E', 'E'): 4, ('W', 'W'): 4,
                ('NW', 'NW'): 4, ('SE', 'SE'): 4, ('EC', 'EC'): 2, ('WC', 'WC'): 2,
                ('SW', 'SE'): 8, ('N', 'S'): 10, ('E', 'W'): 12, ('NW', 'SE'): 15
            }
            
            prefix1 = postcode1[:2] if len(postcode1) >= 2 else postcode1[:1]
            prefix2 = postcode2[:2] if len(postcode2) >= 2 else postcode2[:1]
            
            return london_distances.get((prefix1, prefix2), 
                   london_distances.get((prefix2, prefix1), 10))
    
    async def send_auto_assignment_notifications(self, booking_id: str, job_data: Dict, cleaner: Dict):
        """Send notifications for auto-assignment"""
        try:
            db = get_firestore_client()
            
            # Get client information
            client_id = job_data.get('client_id')
            client_ref = db.collection('users').document(client_id)
            client_doc = client_ref.get()
            
            if client_doc.exists:
                client_data = client_doc.to_dict()
                cleaner_data = cleaner['profile']
                cleaner_profile = cleaner['cleaner_profile']
                
                from app.services.resend_email_service import email_service
                import asyncio
                
                cleaner_name = f"{cleaner_data.get('profile', {}).get('first_name', 'Professional')} {cleaner_data.get('profile', {}).get('last_name', 'Cleaner')}".strip()
                
                booking_details = {
                    'booking_id': booking_id,
                    'service_type': job_data.get('service', {}).get('type', 'Cleaning'),
                    'date': job_data.get('schedule', {}).get('date'),
                    'time': job_data.get('schedule', {}).get('time'),
                    'duration': job_data.get('service', {}).get('duration', 2),
                    'address': f"{job_data.get('location', {}).get('address', {}).get('line1', '')}, {job_data.get('location', {}).get('address', {}).get('city', '')} {job_data.get('location', {}).get('address', {}).get('postcode', '')}",
                    'price': f"{job_data.get('service', {}).get('price', 0):.2f}",
                    'cleaner_name': cleaner_name,
                    'cleaner_rating': cleaner_profile.get('rating', 0),
                    'cleaner_experience': cleaner_profile.get('experience_years', 0)
                }
                
                # Send client notification
                asyncio.create_task(
                    email_service.send_cleaner_assigned(
                        client_data.get('email'),
                        client_data.get('profile', {}).get('first_name', 'Customer'),
                        booking_details
                    )
                )
                
                logger.info(f"Auto-assignment notification sent for booking {booking_id}")
                
        except Exception as e:
            logger.error(f"Failed to send auto-assignment notifications: {e}")

# Global job assignment service instance
job_assignment_service = JobAssignmentService()