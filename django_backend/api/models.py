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


class DeviceCount(models.Model):
    """Model to track unique device counts"""
    count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Device Count"
        verbose_name_plural = "Device Counts"

    def __str__(self):
        return f"Device Count: {self.count}"

    @classmethod
    def get_or_create_default(cls):
        """Get or create the default device count record"""
        obj, created = cls.objects.get_or_create(
            id=1,
            defaults={'count': 0}
        )
        return obj

    def increment(self):
        """Increment the device count"""
        self.count += 1
        self.save()
        return self.count


class Device(models.Model):
    """Model to track individual devices and their scan history"""
    device_fingerprint = models.CharField(max_length=255, unique=True)
    first_scan = models.DateTimeField(auto_now_add=True)
    last_scan = models.DateTimeField(auto_now=True)
    total_scans = models.IntegerField(default=1)
    user_agent = models.TextField(null=True, blank=True)
    screen_resolution = models.CharField(max_length=20, null=True, blank=True)
    timezone = models.CharField(max_length=50, null=True, blank=True)
    browser_info = models.JSONField(null=True, blank=True)  # Store browser details
    hardware_info = models.JSONField(null=True, blank=True)  # Store hardware details
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Device"
        verbose_name_plural = "Devices"
        ordering = ['-last_scan']

    def __str__(self):
        return f"Device {self.device_fingerprint[:8]}... ({self.total_scans} scans)"

    @classmethod
    def get_or_create_device(cls, device_fingerprint, device_data=None):
        """Get or create a device record"""
        device, created = cls.objects.get_or_create(
            device_fingerprint=device_fingerprint,
            defaults={
                'user_agent': device_data.get('user_agent') if device_data else None,
                'screen_resolution': device_data.get('screen_resolution') if device_data else None,
                'timezone': device_data.get('timezone') if device_data else None,
                'browser_info': device_data.get('browser_info') if device_data else None,
                'hardware_info': device_data.get('hardware_info') if device_data else None,
            }
        )
        
        if not created:
            # Update last scan time and increment total scans
            device.last_scan = timezone.now()
            device.total_scans += 1
            device.save()
        
        return device, created

    def increment_scan(self):
        """Increment scan count for this device"""
        self.total_scans += 1
        self.last_scan = timezone.now()
        self.save()
        return self.total_scans
