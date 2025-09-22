// Device detection utility
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasWebGL: boolean;
  hasWebXR: boolean;
  hasTouch: boolean;
  userAgent: string;
}

export function detectDevice(): DeviceInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Mobile detection
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Tablet detection
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  // Desktop detection
  const isDesktop = !isMobile && !isTablet;
  
  // WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  const hasWebGL = !!gl;
  
  // WebXR support
  const hasWebXR = 'xr' in navigator;
  
  // Touch support
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    hasWebGL,
    hasWebXR,
    hasTouch,
    userAgent
  };
}

// Determine the best experience for the device
export function getRecommendedExperience(deviceInfo: DeviceInfo): '3d' | 'video' | 'qr-scan' {
  // Mobile devices should go to video page
  if (deviceInfo.isMobile) {
    return 'video';
  }
  
  // Tablets and desktop with good WebGL support can use 3D
  if (deviceInfo.isDesktop && deviceInfo.hasWebGL) {
    return '3d';
  }
  
  // Default fallback
  return 'video';
}

// Check if device should be redirected to mobile video
export function shouldRedirectToMobile(deviceInfo: DeviceInfo): boolean {
  return deviceInfo.isMobile || (!deviceInfo.hasWebGL && deviceInfo.isTablet);
}

// Check if device should be redirected to QR scan (projector mode)
export function shouldRedirectToProjector(deviceInfo: DeviceInfo): boolean {
  // For projector mode, we want desktop devices with good WebGL support
  return deviceInfo.isDesktop && deviceInfo.hasWebGL;
}
