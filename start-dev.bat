@echo off
echo 🚀 Starting Kardiverse Development Environment...
echo.

echo 📡 Starting Django Backend...
start "Django Backend" cmd /k "cd django_backend && venv\Scripts\python manage.py runserver"

echo ⏳ Waiting for Django to start...
timeout /t 3 /nobreak >nul

echo 🎨 Starting React Frontend...
echo    Vite will automatically find an available port if 5173 is busy
start "React Frontend" cmd /k "npm run dev"

echo.
echo ✅ Development environment started!
echo 📡 Django Backend: http://127.0.0.1:8000
echo 🎨 React Frontend: Check the Vite output for the actual port
echo    (Common ports: 5173, 5174, 5175, etc.)
echo.
echo 🔧 Dynamic Port Support:
echo    - Frontend will work on any available port
echo    - CORS is configured to allow any localhost port
echo    - QR codes will use the current port automatically
echo.
echo Press any key to exit...
pause >nul
