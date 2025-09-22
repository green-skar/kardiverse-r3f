from django.urls import path
from . import views

urlpatterns = [
    # Health check endpoint
    path('health/', views.health_check, name='health_check'),
    
    # Legacy endpoints (matching Express.js API)
    path('log/', views.legacy_log_endpoint, name='legacy_log'),
    
    # New REST API endpoints
    path('scan-count/', views.get_scan_count, name='scan_count'),
    path('log-scan/', views.log_scan, name='log_scan'),
    path('scan-logs/', views.get_scan_logs, name='scan_logs'),
    path('avatar-action/', views.trigger_avatar_action, name='avatar_action'),
    path('avatar-actions/', views.get_avatar_actions, name='avatar_actions'),
    
    # Mux API proxy endpoints - REMOVED FOR OFFLINE MODE
    # All video processing now handled locally in the frontend
]
