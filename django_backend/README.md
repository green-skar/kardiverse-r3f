# Kardiverse Django Backend

Django REST API backend for the Kardiverse Hologram Demo project.

## Features

- **Scan Tracking**: Track QR code scans with PostgreSQL database
- **Avatar Actions**: Log and trigger avatar actions remotely
- **REST API**: Clean REST API endpoints with Django REST Framework
- **Legacy Compatibility**: Maintains compatibility with existing Express.js API endpoints
- **Admin Interface**: Django admin for managing data
- **CORS Support**: Configured for frontend integration

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure:

```bash
cp env.example .env
```

Edit `.env` with your database credentials and settings.

### 3. Database Setup

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 4. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Legacy Endpoints (Express.js Compatible)

- `POST /api/log/` - Log scan events
- `GET /api/log/?type=scan` - Get scan count

### New REST API Endpoints

- `GET /api/scan-count/` - Get current scan count
- `POST /api/log-scan/` - Log a scan event
- `GET /api/scan-logs/` - Get recent scan logs
- `POST /api/avatar-action/` - Trigger avatar action
- `GET /api/avatar-actions/` - Get recent avatar actions

## Models

### ScanCount
Tracks the total number of QR code scans.

### ScanLog
Logs individual scan events with metadata (IP, user agent, session).

### AvatarAction
Tracks avatar actions and commands triggered remotely.

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` to:
- View and manage scan counts
- Review scan logs
- Monitor avatar actions
- Create superuser accounts

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in environment
2. Configure proper `ALLOWED_HOSTS`
3. Set up PostgreSQL database
4. Use `gunicorn` for WSGI server
5. Configure static file serving with `whitenoise`

## Integration with Frontend

The Django backend maintains compatibility with the existing Express.js API, so your React frontend should work without changes. The backend provides the same endpoints:

- `POST /api/log` with `{"type": "scan"}` to log scans
- `GET /api/log?type=scan` to get scan count

Additional features are available through the new REST API endpoints.
