@echo off
echo 🚀 Starting Kardiverse Development Environment...
echo.

echo 📡 Starting Django Backend...
start "Django Backend" cmd /k "cd django_backend && venv\Scripts\python manage.py runserver"

echo ⏳ Waiting for Django to start...
timeout /t 3 /nobreak >nul

echo 🎨 Starting React Frontend...
start "React Frontend" cmd /k "npm run dev"

echo.
echo ✅ Development environment started!
echo 📡 Django Backend: http://127.0.0.1:8000
echo 🎨 React Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
