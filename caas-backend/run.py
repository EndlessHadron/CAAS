#!/usr/bin/env python3
"""
Development server for CAAS API
"""

import uvicorn
from app.config import settings

if __name__ == "__main__":
    print("🚀 Starting CAAS API Development Server")
    print(f"📖 API Documentation: http://{settings.api_host}:{settings.api_port}/docs")
    print(f"🔧 Project: {settings.google_cloud_project}")
    print("⚡ Press CTRL+C to stop")
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        log_level=settings.log_level.lower()
    )