#!/usr/bin/env python
"""
Migration script for Render deployment
This script ensures the database is properly set up with all required tables
"""

import os
import sys
import django
from django.core.management import execute_from_command_line

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kardiverse_backend.settings')
django.setup()

def run_migrations():
    """Run Django migrations and create initial data"""
    print("🔄 Running Django migrations...")
    
    # Run migrations
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create initial scan count if it doesn't exist
    from api.models import ScanCount
    scan_count = ScanCount.get_or_create_default()
    print(f"✅ Scan count initialized: {scan_count.count}")
    
    print("✅ Database setup complete!")

if __name__ == '__main__':
    run_migrations()
