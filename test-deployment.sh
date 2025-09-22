#!/bin/bash

# Kardiverse Deployment Test Script
# This script helps test your application before deploying to Render

echo "🚀 Kardiverse Deployment Test Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "django_backend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Found project files"

# Test 1: Check if all required files exist
echo ""
echo "📁 Checking required files..."

required_files=(
    "render.yaml"
    "package.json"
    "django_backend/requirements.txt"
    "django_backend/manage.py"
    "src/config/api.ts"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found $file"
    else
        print_error "Missing $file"
        exit 1
    fi
done

# Test 2: Check Python dependencies
echo ""
echo "🐍 Checking Python dependencies..."

if command -v python3 &> /dev/null; then
    print_status "Python 3 is installed"
    
    # Check if virtual environment exists
    if [ -d "django_backend/venv" ]; then
        print_status "Virtual environment found"
        
        # Activate virtual environment and check dependencies
        source django_backend/venv/bin/activate 2>/dev/null || source django_backend/venv/Scripts/activate 2>/dev/null
        
        if python -c "import django" 2>/dev/null; then
            print_status "Django is installed"
        else
            print_warning "Django not found in virtual environment"
        fi
        
        if python -c "import gunicorn" 2>/dev/null; then
            print_status "Gunicorn is installed"
        else
            print_warning "Gunicorn not found in virtual environment"
        fi
    else
        print_warning "Virtual environment not found"
    fi
else
    print_error "Python 3 is not installed"
fi

# Test 3: Check Node.js dependencies
echo ""
echo "📦 Checking Node.js dependencies..."

if command -v node &> /dev/null; then
    print_status "Node.js is installed ($(node --version))"
    
    if command -v npm &> /dev/null; then
        print_status "npm is installed ($(npm --version))"
        
        # Check if node_modules exists
        if [ -d "node_modules" ]; then
            print_status "Node modules found"
        else
            print_warning "Node modules not found. Run 'npm install' first"
        fi
    else
        print_error "npm is not installed"
    fi
else
    print_error "Node.js is not installed"
fi

# Test 4: Test Django backend
echo ""
echo "🔧 Testing Django backend..."

if [ -d "django_backend" ]; then
    cd django_backend
    
    # Check if migrations are up to date
    if python manage.py showmigrations --plan | grep -q "\[ \]"; then
        print_warning "Pending migrations found. Run 'python manage.py migrate'"
    else
        print_status "Database migrations are up to date"
    fi
    
    # Test Django configuration
    if python manage.py check --deploy 2>/dev/null; then
        print_status "Django configuration is valid"
    else
        print_warning "Django configuration issues found"
    fi
    
    cd ..
else
    print_error "Django backend directory not found"
fi

# Test 5: Test React build
echo ""
echo "⚛️  Testing React build..."

if [ -d "node_modules" ]; then
    print_status "Building React application..."
    
    if npm run build 2>/dev/null; then
        print_status "React build successful"
        
        if [ -d "dist" ]; then
            print_status "Build output directory created"
        else
            print_error "Build output directory not found"
        fi
    else
        print_error "React build failed"
    fi
else
    print_warning "Skipping React build test (node_modules not found)"
fi

# Test 6: Check environment variables
echo ""
echo "🔐 Checking environment variables..."

# Check for .env file
if [ -f ".env" ]; then
    print_status "Found .env file"
    
    # Check for required variables
    if grep -q "VITE_MUX_TOKEN_ID" .env; then
        print_status "VITE_MUX_TOKEN_ID found in .env"
    else
        print_warning "VITE_MUX_TOKEN_ID not found in .env"
    fi
    
    if grep -q "VITE_MUX_TOKEN_SECRET" .env; then
        print_status "VITE_MUX_TOKEN_SECRET found in .env"
    else
        print_warning "VITE_MUX_TOKEN_SECRET not found in .env"
    fi
else
    print_warning "No .env file found"
fi

# Test 7: Check render.yaml configuration
echo ""
echo "📋 Checking render.yaml configuration..."

if [ -f "render.yaml" ]; then
    print_status "render.yaml found"
    
    # Check for required services
    if grep -q "kardiverse-backend" render.yaml; then
        print_status "Backend service configured"
    else
        print_error "Backend service not found in render.yaml"
    fi
    
    if grep -q "kardiverse-frontend" render.yaml; then
        print_status "Frontend service configured"
    else
        print_error "Frontend service not found in render.yaml"
    fi
else
    print_error "render.yaml not found"
fi

# Test 8: Check video files
echo ""
echo "🎬 Checking video files..."

video_files=(
    "public/assets/kardiverse-demo.mp4"
    "public/assets/kardiverse-experience.mp4"
    "public/assets/poster.jpg"
)

for file in "${video_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found $file"
    else
        print_warning "Missing $file"
    fi
done

# Summary
echo ""
echo "📊 Deployment Readiness Summary"
echo "==============================="

echo ""
echo "✅ Ready for deployment if:"
echo "   - All required files are present"
echo "   - Python and Node.js are installed"
echo "   - Dependencies are installed"
echo "   - React build is successful"
echo "   - Environment variables are configured"
echo "   - render.yaml is properly configured"

echo ""
echo "🚀 Next steps:"
echo "   1. Commit all changes to GitHub"
echo "   2. Go to render.com and create a new Blueprint"
echo "   3. Connect your GitHub repository"
echo "   4. Set environment variables in Render dashboard"
echo "   5. Deploy and monitor the services"

echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"

print_status "Deployment test completed!"
