from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.core.security import get_current_user_id, require_role

logger = logging.getLogger(__name__)

router = APIRouter()


class JobOffer(BaseModel):
    booking_id: str
    client_name: str
    service_type: str
    date: str
    time: str
    duration: int
    address: dict
    payment: float
    instructions: Optional[str] = None


class AvailabilitySlot(BaseModel):
    day_of_week: int  # 0-6 (Monday=0)
    start_time: str   # HH:MM
    end_time: str     # HH:MM


class UpdateAvailability(BaseModel):
    availability: List[AvailabilitySlot]
    blocked_dates: Optional[List[str]] = []  # YYYY-MM-DD format
    max_bookings_per_day: Optional[int] = 3


@router.get("/jobs", response_model=List[JobOffer])
async def get_available_jobs(current_user_id: str = Depends(require_role("cleaner"))):
    """Get available job offers for cleaner based on location and preferences"""
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        from datetime import datetime, timedelta
        
        db = get_firestore_client()
        
        # Get cleaner profile for preferences and location
        cleaner_ref = db.collection('users').document(current_user_id)
        cleaner_doc = cleaner_ref.get()
        
        if not cleaner_doc.exists:
            raise HTTPException(status_code=404, detail="Cleaner profile not found")
        
        cleaner_data = cleaner_doc.to_dict()
        cleaner_profile = cleaner_data.get('cleaner_profile', {})
        
        # Get cleaner's service radius (default 10 miles)
        max_radius = cleaner_profile.get('radius_miles', 10)
        cleaner_location = cleaner_profile.get('location', {})
        services_offered = cleaner_profile.get('services_offered', [])
        
        # Get pending bookings that haven't been assigned
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        pending_bookings = bookings_ref.where('status', '==', 'pending').where('cleaner_id', '==', None).stream()
        
        available_jobs = []
        
        for booking_doc in pending_bookings:
            booking_data = booking_doc.to_dict()
            booking_id = booking_data.get('booking_id')
            
            # Check if cleaner has already rejected this job
            rejection_ref = db.collection('job_rejections').document(f"{current_user_id}_{booking_id}")
            if rejection_ref.get().exists:
                continue
            
            # Filter by service type if cleaner has specific services
            service_type = booking_data.get('service', {}).get('type', '')
            if services_offered and service_type not in services_offered:
                continue
            
            # Get client information
            client_id = booking_data.get('client_id')
            client_ref = db.collection('users').document(client_id)
            client_doc = client_ref.get()
            client_name = "Client"
            
            if client_doc.exists:
                client_data = client_doc.to_dict()
                profile = client_data.get('profile', {})
                client_name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip() or "Client"
                # Hide last name for privacy
                if ' ' in client_name:
                    first_name = client_name.split()[0]
                    last_initial = client_name.split()[-1][0]
                    client_name = f"{first_name} {last_initial}."
            
            # Calculate distance (simplified - would need proper geolocation in production)
            booking_location = booking_data.get('location', {}).get('address', {})
            distance = calculate_distance(cleaner_location, booking_location) if cleaner_location and booking_location else 0
            
            # Skip if outside service radius
            if distance > max_radius:
                continue
            
            # Check cleaner availability for this date/time
            booking_date = booking_data.get('schedule', {}).get('date')
            booking_time = booking_data.get('schedule', {}).get('time')
            if not is_cleaner_available(current_user_id, booking_date, booking_time, booking_data.get('service', {}).get('duration', 2)):
                continue
            
            job_offer = JobOffer(
                booking_id=booking_id,
                client_name=client_name,
                service_type=service_type,
                date=booking_date,
                time=booking_time,
                duration=booking_data.get('service', {}).get('duration', 2),
                address=booking_location,
                payment=booking_data.get('service', {}).get('price', 0),
                instructions=booking_data.get('location', {}).get('instructions')
            )
            
            available_jobs.append(job_offer)
        
        # Sort by distance and date
        available_jobs.sort(key=lambda x: (x.date, x.time))
        
        return available_jobs
        
    except Exception as e:
        logger.error(f"Failed to get available jobs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job offers"
        )


def calculate_distance(location1: dict, location2: dict) -> float:
    """Calculate approximate distance between two locations (simplified)"""
    # In production, this would use proper geolocation APIs
    # For now, return a mock distance based on postcode similarity
    if not location1 or not location2:
        return 0
    
    postcode1 = location1.get('postcode', '').upper()[:3]
    postcode2 = location2.get('postcode', '').upper()[:3]
    
    if postcode1 == postcode2:
        return 2  # Same area
    else:
        return 8  # Different area


def is_cleaner_available(cleaner_id: str, date: str, time: str, duration: int) -> bool:
    """Check if cleaner is available for the given date/time"""
    try:
        from app.core.database import get_firestore_client
        from datetime import datetime, timedelta
        
        db = get_firestore_client()
        
        # Get cleaner's existing bookings for that date
        bookings_ref = db.collection('bookings')
        existing_bookings = bookings_ref.where('cleaner_id', '==', cleaner_id).where('schedule.date', '==', date).stream()
        
        booking_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M")
        booking_end = booking_datetime + timedelta(hours=duration)
        
        for booking_doc in existing_bookings:
            booking_data = booking_doc.to_dict()
            existing_time = booking_data.get('schedule', {}).get('time')
            existing_duration = booking_data.get('service', {}).get('duration', 2)
            
            existing_start = datetime.strptime(f"{date} {existing_time}", "%Y-%m-%d %H:%M")
            existing_end = existing_start + timedelta(hours=existing_duration)
            
            # Check for overlap
            if (booking_datetime < existing_end and booking_end > existing_start):
                return False
        
        # Check cleaner's availability settings (working hours, blocked dates, max jobs)
        cleaner_ref = db.collection('users').document(cleaner_id)
        cleaner_doc = cleaner_ref.get()
        
        if cleaner_doc.exists:
            cleaner_profile = cleaner_doc.to_dict().get('cleaner_profile', {})
            
            # Check blocked dates
            blocked_dates = cleaner_profile.get('blocked_dates', [])
            if date in blocked_dates:
                return False
            
            # Check max jobs per day
            max_jobs = cleaner_profile.get('max_bookings_per_day', 3)
            jobs_count = len(list(existing_bookings))
            if jobs_count >= max_jobs:
                return False
            
            # Check working hours
            availability = cleaner_profile.get('availability', {})
            weekday = datetime.strptime(date, "%Y-%m-%d").weekday()  # 0=Monday
            day_availability = availability.get(str(weekday), {})
            
            if day_availability:
                work_start = day_availability.get('start_time')
                work_end = day_availability.get('end_time')
                
                if work_start and work_end:
                    work_start_time = datetime.strptime(f"{date} {work_start}", "%Y-%m-%d %H:%M")
                    work_end_time = datetime.strptime(f"{date} {work_end}", "%Y-%m-%d %H:%M")
                    
                    if not (booking_datetime >= work_start_time and booking_end <= work_end_time):
                        return False
        
        return True
        
    except Exception as e:
        logger.error(f"Error checking availability: {e}")
        return True  # Default to available if check fails


@router.post("/jobs/{booking_id}/accept")
async def accept_job(
    booking_id: str,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Accept a job offer"""
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        from datetime import datetime
        
        db = get_firestore_client()
        
        # Find the booking
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        booking_query = bookings_ref.where('booking_id', '==', booking_id).where('status', '==', 'pending').where('cleaner_id', '==', None)
        booking_docs = list(booking_query.stream())
        
        if not booking_docs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found or already assigned"
            )
        
        booking_doc = booking_docs[0]
        booking_data = booking_doc.to_dict()
        
        # Verify cleaner is still available
        booking_date = booking_data.get('schedule', {}).get('date')
        booking_time = booking_data.get('schedule', {}).get('time')
        duration = booking_data.get('service', {}).get('duration', 2)
        
        if not is_cleaner_available(current_user_id, booking_date, booking_time, duration):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are no longer available for this time slot"
            )
        
        # Update booking with cleaner assignment
        current_time = datetime.utcnow()
        
        # Check if payment is already completed to determine final status
        payment_status = booking_data.get('payment', {}).get('status')
        is_paid = payment_status == 'succeeded' or booking_data.get('status') == 'paid'
        
        update_data = {
            'cleaner_id': current_user_id,
            'updated_at': current_time,
            'accepted_at': current_time,
        }
        
        # Update status based on payment completion
        if is_paid:
            # Both cleaner assigned AND payment completed = confirmed
            update_data['status'] = 'confirmed'
        # If not paid, status remains 'pending' until payment is completed
        
        booking_doc.reference.update(update_data)
        
        # Remove any existing rejection record
        rejection_ref = db.collection('job_rejections').document(f"{current_user_id}_{booking_id}")
        if rejection_ref.get().exists:
            rejection_ref.delete()
        
        # Send notification to client (email)
        try:
            client_id = booking_data.get('client_id')
            if client_id:
                client_ref = db.collection('users').document(client_id)
                client_doc = client_ref.get()
                
                cleaner_ref = db.collection('users').document(current_user_id)
                cleaner_doc = cleaner_ref.get()
                
                if client_doc.exists and cleaner_doc.exists:
                    client_data = client_doc.to_dict()
                    cleaner_data = cleaner_doc.to_dict()
                    
                    from app.services.resend_email_service import email_service
                    import asyncio
                    
                    cleaner_profile = cleaner_data.get('cleaner_profile', {})
                    cleaner_name = f"{cleaner_data.get('profile', {}).get('first_name', 'Professional')} {cleaner_data.get('profile', {}).get('last_name', 'Cleaner')}".strip()
                    
                    booking_details = {
                        'booking_id': booking_id,
                        'service_type': booking_data.get('service', {}).get('type', 'Cleaning'),
                        'date': booking_date,
                        'time': booking_time,
                        'duration': duration,
                        'address': f"{booking_data.get('location', {}).get('address', {}).get('line1', '')}, {booking_data.get('location', {}).get('address', {}).get('city', '')} {booking_data.get('location', {}).get('address', {}).get('postcode', '')}",
                        'price': f"{booking_data.get('service', {}).get('price', 0):.2f}",
                        'cleaner_name': cleaner_name,
                        'cleaner_rating': cleaner_profile.get('rating', 0),
                        'cleaner_experience': cleaner_profile.get('experience_years', 0)
                    }
                    
                    # Send cleaner assignment notification
                    asyncio.create_task(
                        email_service.send_cleaner_assigned(
                            client_data.get('email'),
                            client_data.get('profile', {}).get('first_name', 'Customer'),
                            booking_details
                        )
                    )
                    
                    logger.info(f"Cleaner assignment notification sent for booking {booking_id}")
        except Exception as e:
            logger.error(f"Failed to send cleaner assignment notification: {e}")
            # Don't fail the job acceptance if email fails
        
        final_status = 'confirmed' if is_paid else 'pending'
        message = "Job accepted successfully"
        note = None
        
        if is_paid:
            note = "Booking is now confirmed - you're all set!"
        else:
            note = "Booking will be confirmed once the client completes payment"
        
        return {
            "message": message, 
            "booking_id": booking_id,
            "status": final_status,
            "note": note
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to accept job {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to accept job offer"
        )


@router.post("/jobs/{booking_id}/reject")
async def reject_job(
    booking_id: str,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Reject a job offer"""
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        from datetime import datetime
        
        db = get_firestore_client()
        
        # Verify the booking exists and is still available
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        booking_query = bookings_ref.where('booking_id', '==', booking_id).where('status', '==', 'pending')
        booking_docs = list(booking_query.stream())
        
        if not booking_docs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found or no longer available"
            )
        
        booking_data = booking_docs[0].to_dict()
        
        # Check if cleaner has already rejected this job
        rejection_ref = db.collection('job_rejections').document(f"{current_user_id}_{booking_id}")
        if rejection_ref.get().exists:
            return {"message": "Job already rejected"}
        
        # Log the rejection
        current_time = datetime.utcnow()
        rejection_data = {
            'cleaner_id': current_user_id,
            'booking_id': booking_id,
            'rejected_at': current_time,
            'reason': 'cleaner_declined'
        }
        
        rejection_ref.set(rejection_data)
        
        # Optional: Trigger auto-assignment process for other cleaners
        # This could be implemented as a background task
        try:
            # Check if this was the only available cleaner and trigger broader search
            logger.info(f"Job {booking_id} rejected by cleaner {current_user_id}, checking for alternative cleaners")
        except Exception as e:
            logger.error(f"Failed to trigger alternative cleaner search: {e}")
        
        return {"message": "Job rejected successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to reject job {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject job offer"
        )


@router.put("/availability")
async def update_availability(
    availability_data: UpdateAvailability,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Update cleaner availability settings"""
    try:
        from app.core.database import get_firestore_client
        from datetime import datetime
        
        db = get_firestore_client()
        
        # Get cleaner's user document
        user_ref = db.collection('users').document(current_user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cleaner profile not found"
            )
        
        # Convert availability slots to dictionary format
        availability_dict = {}
        for slot in availability_data.availability:
            day_key = str(slot.day_of_week)  # 0-6 (Monday=0)
            if day_key not in availability_dict:
                availability_dict[day_key] = []
            availability_dict[day_key].append({
                'start_time': slot.start_time,
                'end_time': slot.end_time
            })
        
        # Update cleaner profile
        current_time = datetime.utcnow()
        cleaner_profile_updates = {
            'cleaner_profile.availability': availability_dict,
            'cleaner_profile.blocked_dates': availability_data.blocked_dates or [],
            'cleaner_profile.max_bookings_per_day': availability_data.max_bookings_per_day or 3,
            'updated_at': current_time
        }
        
        user_ref.update(cleaner_profile_updates)
        
        logger.info(f"Updated availability for cleaner {current_user_id}")
        
        return {
            "message": "Availability updated successfully",
            "availability": availability_dict,
            "blocked_dates": availability_data.blocked_dates or [],
            "max_bookings_per_day": availability_data.max_bookings_per_day or 3
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update availability: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update availability"
        )


@router.post("/jobs/{booking_id}/complete")
async def complete_job(
    booking_id: str,
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Mark a job as completed"""
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        from datetime import datetime
        
        db = get_firestore_client()
        
        # Find the booking assigned to this cleaner
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        booking_query = bookings_ref.where('booking_id', '==', booking_id).where('cleaner_id', '==', current_user_id)
        booking_docs = list(booking_query.stream())
        
        if not booking_docs:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found or not assigned to you"
            )
        
        booking_doc = booking_docs[0]
        booking_data = booking_doc.to_dict()
        current_status = booking_data.get('status')
        
        # Only allow completion from confirmed or in_progress status
        if current_status not in ['confirmed', 'in_progress']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Job cannot be completed from status: {current_status}"
            )
        
        # Update booking status to completed
        current_time = datetime.utcnow()
        booking_doc.reference.update({
            'status': 'completed',
            'completed_at': current_time,
            'updated_at': current_time
        })
        
        # Send completion notification to client
        try:
            client_id = booking_data.get('client_id')
            if client_id:
                client_ref = db.collection('users').document(client_id)
                client_doc = client_ref.get()
                
                if client_doc.exists:
                    client_data = client_doc.to_dict()
                    
                    from app.services.resend_email_service import email_service
                    import asyncio
                    
                    booking_details = {
                        'booking_id': booking_id,
                        'service_type': booking_data.get('service', {}).get('type', 'Cleaning'),
                        'date': booking_data.get('schedule', {}).get('date'),
                        'time': booking_data.get('schedule', {}).get('time'),
                        'address': f"{booking_data.get('location', {}).get('address', {}).get('line1', '')}, {booking_data.get('location', {}).get('address', {}).get('city', '')}"
                    }
                    
                    # Send completion notification
                    asyncio.create_task(
                        email_service.send_booking_completion(
                            client_data.get('email'),
                            client_data.get('profile', {}).get('first_name', 'Customer'),
                            booking_details
                        )
                    )
                    
                    logger.info(f"Job completion notification sent for booking {booking_id}")
        except Exception as e:
            logger.error(f"Failed to send completion notification: {e}")
            # Don't fail the completion if email fails
        
        return {
            "message": "Job completed successfully",
            "booking_id": booking_id,
            "status": "completed",
            "completed_at": current_time.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to complete job {booking_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete job"
        )


@router.get("/earnings")
async def get_earnings(
    current_user_id: str = Depends(require_role("cleaner"))
):
    """Get cleaner earnings summary"""
    try:
        from app.core.database import get_firestore_client, FirestoreCollections
        from datetime import datetime, timedelta
        
        db = get_firestore_client()
        
        # Get all completed bookings for this cleaner
        bookings_ref = db.collection(FirestoreCollections.BOOKINGS)
        completed_bookings = bookings_ref.where('cleaner_id', '==', current_user_id).where('status', '==', 'completed').stream()
        
        total_earnings = 0.0
        monthly_earnings = 0.0
        weekly_earnings = 0.0
        completed_jobs = 0
        rating_sum = 0.0
        rating_count = 0
        
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_week = now - timedelta(days=now.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        
        for booking_doc in completed_bookings:
            booking_data = booking_doc.to_dict()
            price = booking_data.get('service', {}).get('price', 0)
            completed_at = booking_data.get('completed_at')
            rating = booking_data.get('cleaner_rating')
            
            total_earnings += price
            completed_jobs += 1
            
            if rating:
                rating_sum += rating
                rating_count += 1
            
            if completed_at:
                if isinstance(completed_at, str):
                    completed_at = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
                elif hasattr(completed_at, 'timestamp'):
                    completed_at = completed_at.to_datetime()
                
                if completed_at >= start_of_month:
                    monthly_earnings += price
                
                if completed_at >= start_of_week:
                    weekly_earnings += price
        
        # Get pending payments (confirmed bookings that haven't been completed yet)
        pending_bookings = bookings_ref.where('cleaner_id', '==', current_user_id).where('status', '==', 'confirmed').stream()
        pending_payments = sum(booking.to_dict().get('service', {}).get('price', 0) for booking in pending_bookings)
        
        average_rating = rating_sum / rating_count if rating_count > 0 else 0.0
        
        return {
            "total_earnings": total_earnings,
            "this_month": monthly_earnings,
            "this_week": weekly_earnings,
            "pending_payments": pending_payments,
            "completed_jobs": completed_jobs,
            "average_rating": round(average_rating, 2)
        }
        
    except Exception as e:
        logger.error(f"Failed to get earnings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve earnings"
        )


@router.post("/jobs/auto-assign")
async def trigger_auto_assignment():
    """Trigger auto-assignment for pending jobs (admin/system use)"""
    try:
        from app.services.job_assignment_service import job_assignment_service
        
        stats = await job_assignment_service.process_pending_jobs()
        
        return {
            "message": "Auto-assignment process completed",
            "statistics": stats
        }
        
    except Exception as e:
        logger.error(f"Auto-assignment failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Auto-assignment process failed"
        )