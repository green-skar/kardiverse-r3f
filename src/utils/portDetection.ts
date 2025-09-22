// Port Detection Utility - Phase 2: Auto-Detection Approach
// Handles dynamic port detection and platform-specific configuration

export interface PortInfo {
  currentPort: string;
  currentOrigin: string;
  isLocalhost: boolean;
  isDevelopment: boolean;
  platform: 'localhost' | 'render' | 'vercel' | 'netlify' | 'heroku' | 'custom' | 'unknown';
  environment: 'development' | 'production' | 'staging';
}

export interface ServiceURLs {
  apiUrl: string;
  frontendUrl: string;
  qrUrl: string;
}

/**
 * Detect the deployment platform based on hostname
 */
export function detectPlatform(): PortInfo['platform'] {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  } else if (hostname.includes('render.com')) {
    return 'render';
  } else if (hostname.includes('vercel.app')) {
    return 'vercel';
  } else if (hostname.includes('netlify.app')) {
    return 'netlify';
  } else if (hostname.includes('herokuapp.com')) {
    return 'heroku';
  } else if (hostname.includes('kardiverse.com') || hostname.includes('yourdomain.com')) {
    return 'custom';
  } else {
    return 'unknown';
  }
}

/**
 * Detect environment based on platform and hostname
 */
export function detectEnvironment(): PortInfo['environment'] {
  const hostname = window.location.hostname;
  const platform = detectPlatform();
  
  if (platform === 'localhost') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  } else {
    return 'production';
  }
}

/**
 * Get current port information with enhanced detection
 */
export function getCurrentPortInfo(): PortInfo {
  const currentPort = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
  const currentOrigin = window.location.origin;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isDevelopment = isLocalhost || (import.meta as any).env?.DEV;
  const platform = detectPlatform();
  const environment = detectEnvironment();

  return {
    currentPort,
    currentOrigin,
    isLocalhost,
    isDevelopment,
    platform,
    environment
  };
}

/**
 * Get QR code URL with current port and unified integration support
 */
export function getQRCodeURL(): string {
  const { currentOrigin } = getCurrentPortInfo();
  
  // Check if we're in unified integration
  if (isUnifiedIntegration()) {
    return getUnifiedQRCodeURL();
  }
  
  // Original standalone deployment logic
  return `${currentOrigin}/qr-scan`;
}

/**
 * Get QR code URL for unified integration
 */
export function getUnifiedQRCodeURL(): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  
  // If we're in a subdirectory (e.g., /hologram), use parent domain for QR
  if (pathname.includes('/hologram') || pathname.includes('/kardiverse')) {
    return `${origin}/hologram/qr-scan`;
  }
  
  // If we're on the main domain, use same domain with hologram prefix
  return `${origin}/hologram/qr-scan`;
}

/**
 * Check if we're in a unified integration deployment
 */
export function isUnifiedIntegration(): boolean {
  // Check if we're in a unified deployment based on path or domain
  const pathname = window.location.pathname;
  const hostname = window.location.hostname;
  
  // Check for unified path patterns
  if (pathname.includes('/hologram') || pathname.includes('/kardiverse')) {
    return true;
  }
  
  // Check for unified domain patterns (your main app domain)
  if (hostname.includes('yourdomain.com') || hostname.includes('yourapp.com')) {
    return true;
  }
  
  // Check environment variable
  const isUnified = (import.meta as any).env?.VITE_IS_UNIFIED;
  if (isUnified === 'true' || isUnified === true) {
    return true;
  }
  
  return false;
}

/**
 * Get API base URL with auto-detection based on platform and integration type
 */
export function getAPIBaseURL(): string {
  // Check for environment variable first (highest priority)
  const envApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Check if we're in unified integration
  if (isUnifiedIntegration()) {
    return getUnifiedAPIBaseURL();
  }
  
  // Original standalone deployment logic
  const platform = detectPlatform();
  const hostname = window.location.hostname;
  
  switch (platform) {
    case 'localhost':
      return 'http://localhost:8000';
      
    case 'render':
      // Auto-detect Render backend URL
      if (hostname.includes('kardiverse-frontend')) {
        return 'https://kardiverse-backend.onrender.com';
      } else if (hostname.includes('kardiverse-r3f')) {
        return 'https://kardiverse-backend.onrender.com';
      } else {
        // Generic Render pattern: replace 'frontend' with 'backend'
        const backendHostname = hostname.replace(/frontend|r3f|app/, 'backend');
        return `https://${backendHostname}`;
      }
      
    case 'vercel':
      // Auto-detect Vercel backend URL
      if (hostname.includes('kardiverse-frontend')) {
        return 'https://kardiverse-backend.vercel.app';
      } else {
        const backendHostname = hostname.replace(/frontend|r3f|app/, 'backend');
        return `https://${backendHostname}`;
      }
      
    case 'netlify':
      // Auto-detect Netlify backend URL
      if (hostname.includes('kardiverse-frontend')) {
        return 'https://kardiverse-backend.netlify.app';
      } else {
        const backendHostname = hostname.replace(/frontend|r3f|app/, 'backend');
        return `https://${backendHostname}`;
      }
      
    case 'heroku':
      // Auto-detect Heroku backend URL
      if (hostname.includes('kardiverse-frontend')) {
        return 'https://kardiverse-backend.herokuapp.com';
      } else {
        const backendHostname = hostname.replace(/frontend|r3f|app/, 'backend');
        return `https://${backendHostname}`;
      }
      
    case 'custom':
      // Custom domain - try to construct API URL
      if (hostname.includes('kardiverse.com')) {
        return 'https://api.kardiverse.com';
      } else {
        return `https://api.${hostname}`;
      }
      
    default:
      // Fallback for unknown platforms
      console.warn('Unknown platform detected, using localhost fallback');
      return 'http://localhost:8000';
  }
}

/**
 * Get API base URL for unified integration
 */
export function getUnifiedAPIBaseURL(): string {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  
  // If we're in a subdirectory (e.g., /hologram), use parent domain for API
  if (pathname.includes('/hologram') || pathname.includes('/kardiverse')) {
    return `${origin}/api/kardiverse`;
  }
  
  // If we're on the main domain, use same domain with API prefix
  return `${origin}/api/kardiverse`;
}

/**
 * Get all service URLs with auto-detection
 */
export function getServiceURLs(): ServiceURLs {
  const portInfo = getCurrentPortInfo();
  const apiUrl = getAPIBaseURL();
  const frontendUrl = portInfo.currentOrigin;
  const qrUrl = getQRCodeURL();
  
  return {
    apiUrl,
    frontendUrl,
    qrUrl
  };
}

/**
 * Check if current port is in allowed range for development
 */
export function isPortAllowed(port: string): boolean {
  const portNum = parseInt(port);
  // Allow common development ports (3000-6000, 8000-9000, 5173-5180)
  return (
    (portNum >= 3000 && portNum <= 6000) ||
    (portNum >= 8000 && portNum <= 9000) ||
    (portNum >= 5173 && portNum <= 5180)
  );
}

/**
 * Enhanced logging for debugging with platform detection and unified integration
 */
export function logPortInfo(): void {
  const portInfo = getCurrentPortInfo();
  const serviceUrls = getServiceURLs();
  const isUnified = isUnifiedIntegration();
  
  console.log('🔌 Phase 2 Auto-Detection Info (Unified Integration Ready):', {
    ...portInfo,
    serviceUrls,
    isPortAllowed: isPortAllowed(portInfo.currentPort),
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    detection: {
      platform: portInfo.platform,
      environment: portInfo.environment,
      autoDetectedApiUrl: serviceUrls.apiUrl,
      autoDetectedQrUrl: serviceUrls.qrUrl,
      isUnifiedIntegration: isUnified,
      integrationType: isUnified ? 'unified' : 'standalone'
    }
  });
}

// Auto-log port info on import (for debugging)
if (typeof window !== 'undefined') {
  logPortInfo();
}
