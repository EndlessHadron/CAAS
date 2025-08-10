#!/bin/bash
# Production diagnostic script for Cloud Run secret issues

echo "🔍 Running Cloud Run Secret Diagnostic"
echo "======================================="

# Execute Python diagnostic directly in Cloud Run
gcloud run execute caas-backend \
  --region=us-central1 \
  --command='python -c "
import sys
sys.path.insert(0, \"/app\")
from google.cloud import firestore
import json

try:
    # Check Firestore collections
    db = firestore.Client(project=\"caas-467918\")
    
    print(\"CHECKING FIRESTORE COLLECTIONS:\")
    print(\"--------------------------------\")
    
    # Check both possible paths
    paths = [
        \"caas_platform_settings\",
        \"platform_settings\"
    ]
    
    for path in paths:
        try:
            doc = db.collection(path).document(\"secrets\").get()
            if doc.exists:
                data = doc.to_dict()
                print(f\"✅ {path}/secrets: FOUND ({len(data)} keys)\")
                for key in data.keys():
                    print(f\"   - {key}\")
            else:
                print(f\"❌ {path}/secrets: NOT FOUND\")
        except Exception as e:
            print(f\"❌ {path}: ERROR - {e}\")
    
    # Try to load using the app module
    print(\"\nCHECKING APP SECRET LOADING:\")
    print(\"--------------------------------\")
    
    try:
        from app.core.secure_secrets import get_jwt_secret
        jwt = get_jwt_secret()
        if jwt:
            print(f\"✅ JWT Secret: LOADED ({len(jwt)} chars)\")
        else:
            print(\"❌ JWT Secret: NULL\")
    except Exception as e:
        print(f\"❌ JWT Secret: ERROR - {e}\")
    
    # Check environment
    print(\"\nENVIRONMENT:\")
    print(\"--------------------------------\")
    import os
    print(f\"GOOGLE_CLOUD_PROJECT: {os.getenv(\"GOOGLE_CLOUD_PROJECT\", \"NOT SET\")}\")
    print(f\"K_SERVICE: {os.getenv(\"K_SERVICE\", \"NOT SET\")}\")
    print(f\"K_REVISION: {os.getenv(\"K_REVISION\", \"NOT SET\")}\")
    
except Exception as e:
    print(f\"FATAL ERROR: {e}\")
    import traceback
    traceback.print_exc()
"'

echo ""
echo "📋 Diagnostic complete. Review output above for issues."