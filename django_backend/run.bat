@echo off
echo 🚀 Starting Kardiverse Django Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Run the Django server
python run.py

pause
