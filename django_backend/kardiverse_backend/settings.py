"""
Django settings for kardiverse_backend project.
"""

from pathlib import Path
from decouple import config
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-this-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,kardiverse-backend.onrender.com').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'kardiverse_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'kardiverse_backend.wsgi.application'

# Database - SQLite Only for Offline Mode
# Force SQLite for all environments to ensure offline operation
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# PostgreSQL configuration removed for offline mode
# All database operations use local SQLite file

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# CORS settings - Phase 2: Auto-Detection Approach
# Get CORS origins from environment or use defaults
if DEBUG:
    # Development: Allow localhost origins with dynamic port support
    cors_origins_default = 'http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:5180'
else:
    # Production: Auto-detect common deployment platforms
    cors_origins_default = 'https://kardiverse-frontend.onrender.com,https://kardiverse-r3f.onrender.com,https://kardiverse-frontend.vercel.app,https://kardiverse-r3f.vercel.app,https://kardiverse-frontend.netlify.app,https://kardiverse-r3f.netlify.app,https://kardiverse-frontend.herokuapp.com,https://kardiverse-r3f.herokuapp.com'

CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default=cors_origins_default).split(',')

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for production
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only allow all origins in development

# Enhanced CORS origin function with platform auto-detection
def cors_allow_origin(origin, request):
    """Enhanced CORS origin function with platform auto-detection and unified integration support"""
    if not origin:
        return False
    
    # For unified integration, allow same-origin requests
    if origin == request.META.get('HTTP_ORIGIN'):
        return True
    
    # Development: Allow any localhost origin
    if DEBUG and origin.startswith('http://localhost:'):
        return True
    
    # Production: Auto-detect platform patterns
    if not DEBUG:
        # Render.com patterns
        if origin.startswith('https://') and 'render.com' in origin:
            return True
        
        # Vercel patterns
        if origin.startswith('https://') and 'vercel.app' in origin:
            return True
        
        # Netlify patterns
        if origin.startswith('https://') and 'netlify.app' in origin:
            return True
        
        # Heroku patterns
        if origin.startswith('https://') and 'herokuapp.com' in origin:
            return True
        
        # Custom domain patterns (unified integration)
        if origin.startswith('https://') and ('kardiverse.com' in origin or 'yourdomain.com' in origin or 'yourapp.com' in origin):
            return True
        
        # Subdomains for unified integration
        if origin.startswith('https://') and any(domain in origin for domain in ['yourdomain.com', 'yourapp.com']):
            return True
    
    # Fallback to explicit list
    return origin in CORS_ALLOWED_ORIGINS

# Set the custom origin function
CORS_ALLOW_ORIGIN_FUNC = cors_allow_origin

# Ensure production frontend is always allowed (even if not in env var)
if not DEBUG:
    production_origins = [
        'https://kardiverse-frontend.onrender.com',
        'https://kardiverse-r3f-1.onrender.com',
    ]
    
    # Add production origins if not already present
    for origin in production_origins:
        if origin not in CORS_ALLOWED_ORIGINS:
            CORS_ALLOWED_ORIGINS.append(origin)

print(f"DEBUG: CORS_ALLOWED_ORIGINS = {CORS_ALLOWED_ORIGINS}")
print(f"DEBUG: DEBUG mode = {DEBUG}")

# Additional CORS headers for better compatibility
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-session-id',
]

CORS_EXPOSE_HEADERS = [
    'content-type',
    'x-csrftoken',
]

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
}
