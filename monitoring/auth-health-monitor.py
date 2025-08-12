#!/usr/bin/env python3
"""
Production authentication health monitor
Runs continuously to detect authentication system degradation
"""

import requests
import time
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/auth-monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AuthHealthMonitor:
    """Monitor authentication system health"""
    
    def __init__(self, base_url: str, check_interval: int = 60):
        self.base_url = base_url.rstrip('/')
        self.check_interval = check_interval
        self.consecutive_failures = 0
        self.last_success = datetime.now()
        self.alert_thresholds = {
            'consecutive_failures': 3,
            'failure_rate_window': timedelta(minutes=5),
            'max_failure_rate': 0.5  # 50% failure rate
        }
        self.recent_results = []
        
    def test_registration(self) -> bool:
        """Test user registration endpoint"""
        try:
            test_email = f"monitor-{int(time.time())}@healthcheck.com"
            payload = {
                "email": test_email,
                "password": "Monitor123!",
                "first_name": "Health",
                "last_name": "Monitor",
                "role": "client"
            }
            
            response = requests.post(
                f"{self.base_url}/api/v1/auth/register",
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                logger.debug("Registration test passed")
                return True
            else:
                logger.error(f"Registration failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Registration test exception: {e}")
            return False
    
    def test_login(self) -> bool:
        """Test user login with known credentials"""
        try:
            # Create a test user first
            test_email = f"login-test-{int(time.time())}@healthcheck.com"
            
            # Register user
            reg_payload = {
                "email": test_email,
                "password": "LoginTest123!",
                "first_name": "Login",
                "last_name": "Test",
                "role": "client"
            }
            
            reg_response = requests.post(
                f"{self.base_url}/api/v1/auth/register",
                json=reg_payload,
                timeout=10
            )
            
            if reg_response.status_code != 200:
                logger.error(f"Setup for login test failed: {reg_response.status_code}")
                return False
            
            # Test login immediately
            login_payload = {
                "email": test_email,
                "password": "LoginTest123!"
            }
            
            login_response = requests.post(
                f"{self.base_url}/api/v1/auth/login",
                json=login_payload,
                timeout=10
            )
            
            if login_response.status_code == 200:
                logger.debug("Login test passed")
                return True
            else:
                logger.error(f"Login failed: {login_response.status_code} - {login_response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Login test exception: {e}")
            return False
    
    def test_health_endpoint(self) -> bool:
        """Test service health endpoint"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Health endpoint test exception: {e}")
            return False
    
    def run_health_check(self) -> Dict[str, Any]:
        """Run complete health check suite"""
        start_time = datetime.now()
        
        results = {
            'timestamp': start_time.isoformat(),
            'health_endpoint': self.test_health_endpoint(),
            'registration': self.test_registration(),
            'login': self.test_login(),
            'overall_success': False
        }
        
        results['overall_success'] = all([
            results['health_endpoint'],
            results['registration'],
            results['login']
        ])
        
        # Track results for failure rate calculation
        self.recent_results.append({
            'timestamp': start_time,
            'success': results['overall_success']
        })
        
        # Keep only recent results (last 10 minutes)
        cutoff = start_time - timedelta(minutes=10)
        self.recent_results = [
            r for r in self.recent_results 
            if r['timestamp'] > cutoff
        ]
        
        return results
    
    def calculate_failure_rate(self) -> float:
        """Calculate recent failure rate"""
        if not self.recent_results:
            return 0.0
        
        failures = sum(1 for r in self.recent_results if not r['success'])
        return failures / len(self.recent_results)
    
    def should_alert(self, current_result: Dict[str, Any]) -> bool:
        """Determine if an alert should be sent"""
        if current_result['overall_success']:
            self.consecutive_failures = 0
            self.last_success = datetime.now()
            return False
        
        self.consecutive_failures += 1
        
        # Alert on consecutive failures
        if self.consecutive_failures >= self.alert_thresholds['consecutive_failures']:
            return True
        
        # Alert on high failure rate
        failure_rate = self.calculate_failure_rate()
        if failure_rate >= self.alert_thresholds['max_failure_rate']:
            return True
        
        return False
    
    def send_alert(self, result: Dict[str, Any]) -> None:
        """Send alert notification"""
        failure_rate = self.calculate_failure_rate()
        
        alert_data = {
            'severity': 'CRITICAL',
            'service': 'caas-authentication',
            'timestamp': result['timestamp'],
            'consecutive_failures': self.consecutive_failures,
            'failure_rate': failure_rate,
            'last_success': self.last_success.isoformat(),
            'failed_checks': [
                check for check, success in result.items() 
                if check not in ['timestamp', 'overall_success'] and not success
            ]
        }
        
        logger.critical(f"AUTHENTICATION SYSTEM ALERT: {json.dumps(alert_data, indent=2)}")
        
        # In production, send to alerting system (PagerDuty, Slack, etc.)
        # self.send_to_alerting_system(alert_data)
    
    def run_continuous_monitoring(self):
        """Run continuous monitoring loop"""
        logger.info(f"Starting authentication health monitoring for {self.base_url}")
        logger.info(f"Check interval: {self.check_interval} seconds")
        
        while True:
            try:
                result = self.run_health_check()
                
                if result['overall_success']:
                    logger.info("✅ Authentication system healthy")
                else:
                    logger.warning(f"❌ Authentication system issues detected: {result}")
                
                if self.should_alert(result):
                    self.send_alert(result)
                
                time.sleep(self.check_interval)
                
            except KeyboardInterrupt:
                logger.info("Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"Monitor exception: {e}")
                time.sleep(self.check_interval)

def main():
    """Main entry point"""
    base_url = os.getenv('CAAS_BASE_URL', 'https://caas-backend-102964896009.us-central1.run.app')
    check_interval = int(os.getenv('CHECK_INTERVAL', '60'))
    
    monitor = AuthHealthMonitor(base_url, check_interval)
    monitor.run_continuous_monitoring()

if __name__ == "__main__":
    main()