from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.conf import settings
import json
import requests
import base64
import os

from .models import ScanCount, ScanLog, AvatarAction, DeviceCount, Device
from .serializers import ScanCountSerializer, ScanLogSerializer, AvatarActionSerializer, LogScanSerializer


@api_view(['GET'])
def health_check(request):
    """Health check endpoint for Render deployment"""
    return Response({
        'status': 'healthy',
        'service': 'kardiverse-backend',
        'version': '1.0.0'
    })


@api_view(['GET'])
def get_scan_count(request):
    """Get the current scan count"""
    try:
        print(f"DEBUG: get_scan_count called from {request.META.get('HTTP_ORIGIN', 'unknown')}")
        scan_count = ScanCount.get_or_create_default()
        serializer = ScanCountSerializer(scan_count)
        print(f"DEBUG: Returning count: {scan_count.count}")
        return Response({'count': scan_count.count})
    except Exception as e:
        print(f"DEBUG: Error in get_scan_count: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def log_scan(request):
    """Log a scan event and increment the counter"""
    try:
        # Get client IP and user agent
        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT')
        
        # Get session ID from request data or headers
        session_id = request.data.get('session_id') or request.META.get('HTTP_X_SESSION_ID')
        
        # Create scan log entry
        scan_log = ScanLog.objects.create(
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id
        )
        
        # Increment scan count
        scan_count = ScanCount.get_or_create_default()
        new_count = scan_count.increment()
        
        return Response({
            'ok': True,
            'count': new_count,
            'log_id': scan_log.id
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_scan_logs(request):
    """Get recent scan logs"""
    try:
        limit = int(request.GET.get('limit', 50))
        logs = ScanLog.objects.all()[:limit]
        serializer = ScanLogSerializer(logs, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def trigger_avatar_action(request):
    """Trigger an avatar action"""
    try:
        action_type = request.data.get('action_type', 'greet')
        triggered_by = request.data.get('triggered_by', 'remote')
        metadata = request.data.get('metadata', {})
        
        avatar_action = AvatarAction.objects.create(
            action_type=action_type,
            triggered_by=triggered_by,
            metadata=metadata
        )
        
        return Response({
            'ok': True,
            'action_id': avatar_action.id,
            'action_type': action_type
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_avatar_actions(request):
    """Get recent avatar actions"""
    try:
        limit = int(request.GET.get('limit', 20))
        actions = AvatarAction.objects.all()[:limit]
        serializer = AvatarActionSerializer(actions, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Device Tracking Endpoints
@api_view(['GET'])
def get_device_count(request):
    """Get the current device count"""
    try:
        print(f"DEBUG: get_device_count called from {request.META.get('HTTP_ORIGIN', 'unknown')}")
        device_count = DeviceCount.get_or_create_default()
        print(f"DEBUG: Returning device count: {device_count.count}")
        return Response({'count': device_count.count})
    except Exception as e:
        print(f"DEBUG: Error in get_device_count: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def log_device_scan(request):
    """Log a device scan and handle device tracking"""
    try:
        # Get device fingerprint from request
        device_fingerprint = request.data.get('device_fingerprint')
        if not device_fingerprint:
            return Response({'error': 'Device fingerprint required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get device data
        device_data = request.data.get('device_data', {})
        
        # Get or create device
        device, is_new_device = Device.get_or_create_device(device_fingerprint, device_data)
        
        # If it's a new device, increment device count
        if is_new_device:
            device_count = DeviceCount.get_or_create_default()
            device_count.increment()
            print(f"DEBUG: New device detected, device count incremented to {device_count.count}")
        else:
            # Update existing device's scan count
            device.increment_scan()
            print(f"DEBUG: Existing device, total scans: {device.total_scans}")
        
        # Always increment scan count
        scan_count = ScanCount.get_or_create_default()
        new_scan_count = scan_count.increment()
        
        # Get current device count
        current_device_count = DeviceCount.get_or_create_default().count
        
        return Response({
            'ok': True,
            'scan_count': new_scan_count,
            'device_count': current_device_count,
            'is_new_device': is_new_device,
            'device_total_scans': device.total_scans
        })
        
    except Exception as e:
        print(f"DEBUG: Error in log_device_scan: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_analytics(request):
    """Get combined analytics (scan count + device count)"""
    try:
        scan_count = ScanCount.get_or_create_default()
        device_count = DeviceCount.get_or_create_default()
        
        # Calculate average scans per device
        avg_scans_per_device = 0
        if device_count.count > 0:
            avg_scans_per_device = round(scan_count.count / device_count.count, 1)
        
        return Response({
            'scan_count': scan_count.count,
            'device_count': device_count.count,
            'avg_scans_per_device': avg_scans_per_device,
            'last_updated': scan_count.updated_at.isoformat()
        })
        
    except Exception as e:
        print(f"DEBUG: Error in get_analytics: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_devices(request):
    """Get list of devices with their scan history"""
    try:
        limit = int(request.GET.get('limit', 50))
        devices = Device.objects.all()[:limit]
        
        device_list = []
        for device in devices:
            device_list.append({
                'id': device.id,
                'fingerprint': device.device_fingerprint[:8] + '...',
                'first_scan': device.first_scan.isoformat(),
                'last_scan': device.last_scan.isoformat(),
                'total_scans': device.total_scans,
                'user_agent': device.user_agent,
                'screen_resolution': device.screen_resolution,
                'timezone': device.timezone
            })
        
        return Response({
            'devices': device_list,
            'total_devices': Device.objects.count()
        })
        
    except Exception as e:
        print(f"DEBUG: Error in get_devices: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Legacy endpoint compatibility (matching Express.js API)
@csrf_exempt
@require_http_methods(["GET", "POST"])
def legacy_log_endpoint(request):
    """Legacy endpoint to match Express.js API structure"""
    if request.method == 'POST':
        # Handle POST /api/log
        try:
            data = json.loads(request.body)
            if data.get('type') == 'scan':
                return log_scan(request)
            else:
                return JsonResponse({'ok': True})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    elif request.method == 'GET':
        # Handle GET /api/log?type=scan
        if request.GET.get('type') == 'scan':
            return get_scan_count(request)
        else:
            return JsonResponse({'ok': True})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


# Mux API Proxy Endpoints - REMOVED FOR OFFLINE MODE
# All video processing now handled locally in the frontend
# No external API dependencies required
