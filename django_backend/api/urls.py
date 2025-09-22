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
    
    # Mux API proxy endpoints
    path('mux/assets/', views.create_mux_asset, name='create_mux_asset'),
    path('mux/assets/<str:asset_id>/', views.get_mux_asset, name='get_mux_asset'),
]
