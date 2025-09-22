from django.db import models
from django.utils import timezone


class ScanCount(models.Model):
    """Model to track QR code scan counts"""
    count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Scan Count"
        verbose_name_plural = "Scan Counts"

    def __str__(self):
        return f"Scan Count: {self.count}"

    @classmethod
    def get_or_create_default(cls):
        """Get or create the default scan count record"""
        obj, created = cls.objects.get_or_create(
            id=1,
            defaults={'count': 0}
        )
        return obj

    def increment(self):
        """Increment the scan count"""
        self.count += 1
        self.save()
        return self.count


class ScanLog(models.Model):
    """Model to log individual scan events"""
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    session_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        verbose_name = "Scan Log"
        verbose_name_plural = "Scan Logs"
        ordering = ['-timestamp']

    def __str__(self):
        return f"Scan at {self.timestamp}"


class AvatarAction(models.Model):
    """Model to track avatar actions/commands"""
    ACTION_CHOICES = [
        ('greet', 'Greet'),
        ('wave', 'Wave'),
        ('dance', 'Dance'),
        ('idle', 'Idle'),
        ('custom', 'Custom'),
    ]
    
    action_type = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)
    triggered_by = models.CharField(max_length=100, null=True, blank=True)  # 'qr_scan', 'remote', etc.
    metadata = models.JSONField(null=True, blank=True)  # Additional data

    class Meta:
        verbose_name = "Avatar Action"
        verbose_name_plural = "Avatar Actions"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action_type} at {self.timestamp}"
