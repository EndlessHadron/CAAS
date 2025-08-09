#!/usr/bin/env python3
"""Script to create an admin user for CAAS system"""

import asyncio
import uuid
from datetime import datetime
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.core.database import get_firestore_client
from app.models.users import UserRole, UserStatus
from app.core.security import get_password_hash

async def create_admin_user(email: str, password: str, role: UserRole = UserRole.SUPER_ADMIN):
    """Create an admin user in Firestore"""
    try:
        db = get_firestore_client()
        
        # Check if user already exists
        existing_users = db.collection("users").where("email", "==", email).get()
        if len(list(existing_users)) > 0:
            print(f"❌ User with email {email} already exists")
            return False
        
        # Create admin user
        admin_id = str(uuid.uuid4())
        hashed_password = get_password_hash(password)
        
        admin_user_data = {
            "uid": admin_id,
            "email": email,
            "hashed_password": hashed_password,
            "role": role.value,
            "status": UserStatus.ACTIVE.value,
            "created_at": datetime.utcnow(),
            "profile": {
                "first_name": "Admin",
                "last_name": "User",
                "phone": None
            },
            "verification": {
                "email": True,
                "phone": False,
                "identity": True,
                "background": True
            }
        }
        
        # Store in Firestore
        db.collection("users").document(admin_id).set(admin_user_data)
        
        print(f"✅ Successfully created {role.value} user:")
        print(f"   Email: {email}")
        print(f"   User ID: {admin_id}")
        print(f"   Role: {role.value}")
        print(f"   Status: {UserStatus.ACTIVE.value}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create admin user: {e}")
        return False

async def main():
    """Main function to create admin users"""
    print("🚀 CAAS Admin User Creation Script")
    print("=" * 50)
    
    # Create super admin
    await create_admin_user(
        email="admin@caas.com",
        password="admin123!",
        role=UserRole.SUPER_ADMIN
    )
    
    print()
    
    # Create operations manager
    await create_admin_user(
        email="ops@caas.com", 
        password="ops123!",
        role=UserRole.OPERATIONS_MANAGER
    )
    
    print()
    
    # Create support agent
    await create_admin_user(
        email="support@caas.com",
        password="support123!",
        role=UserRole.SUPPORT_AGENT
    )
    
    print()
    print("🎉 Admin user creation completed!")
    print()
    print("You can now log in to the admin panel with:")
    print("- Super Admin: admin@caas.com / admin123!")
    print("- Operations Manager: ops@caas.com / ops123!")
    print("- Support Agent: support@caas.com / support123!")

if __name__ == "__main__":
    asyncio.run(main())