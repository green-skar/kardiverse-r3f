@echo off
REM Kardiverse Deployment Test Script for Windows
REM This script helps test your application before deploying to Render

echo 🚀 Kardiverse Deployment Test Script
echo =====================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "django_backend" (
    echo ❌ Django backend directory not found
    pause
    exit /b 1
)

echo ✅ Found project files

REM Test 1: Check if all required files exist
echo.
echo 📁 Checking required files...

if exist "render.yaml" (
    echo ✅ Found render.yaml
) else (
    echo ❌ Missing render.yaml
    pause
    exit /b 1
)

if exist "package.json" (
    echo ✅ Found package.json
) else (
    echo ❌ Missing package.json
    pause
    exit /b 1
)

if exist "django_backend\requirements.txt" (
    echo ✅ Found django_backend\requirements.txt
) else (
    echo ❌ Missing django_backend\requirements.txt
    pause
    exit /b 1
)

if exist "django_backend\manage.py" (
    echo ✅ Found django_backend\manage.py
) else (
    echo ❌ Missing django_backend\manage.py
    pause
    exit /b 1
)

if exist "src\config\api.ts" (
    echo ✅ Found src\config\api.ts
) else (
    echo ❌ Missing src\config\api.ts
    pause
    exit /b 1
)

REM Test 2: Check Python dependencies
echo.
echo 🐍 Checking Python dependencies...

python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python is installed
    python --version
    
    REM Check if virtual environment exists
    if exist "django_backend\venv" (
        echo ✅ Virtual environment found
        
        REM Activate virtual environment and check dependencies
        call django_backend\venv\Scripts\activate.bat
        
        python -c "import django" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Django is installed
        ) else (
            echo ⚠️  Django not found in virtual environment
        )
        
        python -c "import gunicorn" >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Gunicorn is installed
        ) else (
            echo ⚠️  Gunicorn not found in virtual environment
        )
    ) else (
        echo ⚠️  Virtual environment not found
    )
) else (
    echo ❌ Python is not installed
)

REM Test 3: Check Node.js dependencies
echo.
echo 📦 Checking Node.js dependencies...

node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is installed
    node --version
    
    npm --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ npm is installed
        npm --version
        
        REM Check if node_modules exists
        if exist "node_modules" (
            echo ✅ Node modules found
        ) else (
            echo ⚠️  Node modules not found. Run 'npm install' first
        )
    ) else (
        echo ❌ npm is not installed
    )
) else (
    echo ❌ Node.js is not installed
)

REM Test 4: Test Django backend
echo.
echo 🔧 Testing Django backend...

if exist "django_backend" (
    cd django_backend
    
    REM Test Django configuration
    python manage.py check --deploy >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Django configuration is valid
    ) else (
        echo ⚠️  Django configuration issues found
    )
    
    cd ..
) else (
    echo ❌ Django backend directory not found
)

REM Test 5: Test React build
echo.
echo ⚛️  Testing React build...

if exist "node_modules" (
    echo ✅ Building React application...
    
    npm run build >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ React build successful
        
        if exist "dist" (
            echo ✅ Build output directory created
        ) else (
            echo ❌ Build output directory not found
        )
    ) else (
        echo ❌ React build failed
    )
) else (
    echo ⚠️  Skipping React build test (node_modules not found)
)

REM Test 6: Check environment variables
echo.
echo 🔐 Checking environment variables...

REM Check for .env file
if exist ".env" (
    echo ✅ Found .env file
    
    REM Check for required variables
    findstr /C:"VITE_MUX_TOKEN_ID" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ VITE_MUX_TOKEN_ID found in .env
    ) else (
        echo ⚠️  VITE_MUX_TOKEN_ID not found in .env
    )
    
    findstr /C:"VITE_MUX_TOKEN_SECRET" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ VITE_MUX_TOKEN_SECRET found in .env
    ) else (
        echo ⚠️  VITE_MUX_TOKEN_SECRET not found in .env
    )
) else (
    echo ⚠️  No .env file found
)

REM Test 7: Check render.yaml configuration
echo.
echo 📋 Checking render.yaml configuration...

if exist "render.yaml" (
    echo ✅ render.yaml found
    
    REM Check for required services
    findstr /C:"kardiverse-backend" render.yaml >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Backend service configured
    ) else (
        echo ❌ Backend service not found in render.yaml
    )
    
    findstr /C:"kardiverse-frontend" render.yaml >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Frontend service configured
    ) else (
        echo ❌ Frontend service not found in render.yaml
    )
) else (
    echo ❌ render.yaml not found
)

REM Test 8: Check video files
echo.
echo 🎬 Checking video files...

if exist "public\assets\kardiverse-demo.mp4" (
    echo ✅ Found public\assets\kardiverse-demo.mp4
) else (
    echo ⚠️  Missing public\assets\kardiverse-demo.mp4
)

if exist "public\assets\kardiverse-experience.mp4" (
    echo ✅ Found public\assets\kardiverse-experience.mp4
) else (
    echo ⚠️  Missing public\assets\kardiverse-experience.mp4
)

if exist "public\assets\poster.jpg" (
    echo ✅ Found public\assets\poster.jpg
) else (
    echo ⚠️  Missing public\assets\poster.jpg
)

REM Summary
echo.
echo 📊 Deployment Readiness Summary
echo ===============================

echo.
echo ✅ Ready for deployment if:
echo    - All required files are present
echo    - Python and Node.js are installed
echo    - Dependencies are installed
echo    - React build is successful
echo    - Environment variables are configured
echo    - render.yaml is properly configured

echo.
echo 🚀 Next steps:
echo    1. Commit all changes to GitHub
echo    2. Go to render.com and create a new Blueprint
echo    3. Connect your GitHub repository
echo    4. Set environment variables in Render dashboard
echo    5. Deploy and monitor the services

echo.
echo 📖 For detailed instructions, see DEPLOYMENT_GUIDE.md

echo.
echo ✅ Deployment test completed!
pause
