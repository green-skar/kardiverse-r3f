@echo off
echo 🚀 Setting up Kardiverse Django Backend...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Run the setup script
python setup.py

echo.
echo Setup completed! Press any key to continue...
pause >nul
