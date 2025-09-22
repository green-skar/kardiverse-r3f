#!/usr/bin/env python3
"""
Run script for Kardiverse Django Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Run the Django development server"""
    print("🚀 Starting Kardiverse Django Backend...")
    
    # Check if we're in the right directory
    if not Path("manage.py").exists():
        print("❌ Error: manage.py not found. Please run this script from the django_backend directory.")
        sys.exit(1)
    
    # Check if virtual environment exists
    venv_path = Path("venv")
    if not venv_path.exists():
        print("❌ Virtual environment not found. Please run setup.py first.")
        sys.exit(1)
    
    # Determine the correct Python command
    if os.name == 'nt':  # Windows
        python_cmd = "venv\\Scripts\\python"
    else:  # Unix/Linux/Mac
        python_cmd = "venv/bin/python"
    
    # Check if .env file exists
    if not Path(".env").exists():
        print("⚠️  .env file not found. Using default settings.")
        print("   For production, create a .env file with your database credentials.")
    
    print("🌐 Starting Django development server...")
    print("📡 API will be available at: http://localhost:8000/api/")
    print("🔧 Admin interface at: http://localhost:8000/admin/")
    print("⏹️  Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Run Django development server
        subprocess.run([python_cmd, "manage.py", "runserver"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
