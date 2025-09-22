from django.contrib import admin
from .models import ScanCount, ScanLog, AvatarAction


@admin.register(ScanCount)
class ScanCountAdmin(admin.ModelAdmin):
    list_display = ['id', 'count', 'created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']


@admin.register(ScanLog)
class ScanLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'timestamp', 'ip_address', 'session_id']
    list_filter = ['timestamp', 'ip_address']
    search_fields = ['ip_address', 'session_id', 'user_agent']
    readonly_fields = ['timestamp']


@admin.register(AvatarAction)
class AvatarActionAdmin(admin.ModelAdmin):
    list_display = ['id', 'action_type', 'triggered_by', 'timestamp']
    list_filter = ['action_type', 'triggered_by', 'timestamp']
    search_fields = ['action_type', 'triggered_by']
    readonly_fields = ['timestamp']
