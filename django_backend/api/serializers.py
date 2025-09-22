from rest_framework import serializers
from .models import ScanCount, ScanLog, AvatarAction


class ScanCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanCount
        fields = ['id', 'count', 'created_at', 'updated_at']


class ScanLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanLog
        fields = ['id', 'timestamp', 'ip_address', 'user_agent', 'session_id']


class AvatarActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvatarAction
        fields = ['id', 'action_type', 'timestamp', 'triggered_by', 'metadata']


class LogScanSerializer(serializers.Serializer):
    """Serializer for logging scan events"""
    type = serializers.CharField(default='scan')
    session_id = serializers.CharField(required=False, allow_blank=True)
    metadata = serializers.JSONField(required=False)
