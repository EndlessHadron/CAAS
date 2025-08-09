try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Google Cloud Configuration
    google_cloud_project: str = "caas-467918"
    google_application_credentials: str = ""
    
    # API Configuration
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_debug: bool = True
    api_reload: bool = True
    
    # Security - Production settings
    secret_key: str = "your-secret-key-change-in-production"  # Fallback only
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30  # Reasonable for admin work
    refresh_token_expire_days: int = 7
    
    # Redis Configuration for rate limiting and session storage (Production)
    redis_host: str = "10.176.117.27"  # Google Cloud Memorystore Redis
    redis_port: int = 6379
    redis_password: str = ""
    redis_ssl: bool = False
    redis_timeout: int = 5
    
    # Security thresholds
    login_rate_limit: int = 5
    rate_window_minutes: int = 15
    lockout_duration_minutes: int = 30
    
    # Production domain for security headers
    production_domain: str = "neatly.app"
    
    # Database
    firestore_collection_prefix: str = "caas_"
    
    # External APIs
    anthropic_api_key: str = ""
    gmail_api_credentials: str = ""
    
    # Notification Settings
    sendgrid_api_key: str = ""
    fcm_server_key: str = ""
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://caas-frontend-url.com"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()