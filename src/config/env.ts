import { getCurrentPortInfo, getQRCodeURL, getAPIBaseURL, getServiceURLs, detectPlatform, detectEnvironment, isUnifiedIntegration } from '../utils/portDetection';

// Environment Configuration - Phase 2: Auto-Detection Approach with Unified Integration Support
export const ENV = {
  // Service URLs with auto-detection and unified integration support
  API_URL: getAPIBaseURL(),
  QR_URL: getQRCodeURL(),
  
  // Current frontend information
  CURRENT_PORT: getCurrentPortInfo().currentPort,
  CURRENT_ORIGIN: getCurrentPortInfo().currentOrigin,
  
  // Platform and environment detection
  PLATFORM: detectPlatform(),
  ENVIRONMENT: detectEnvironment(),
  
  // Integration type detection
  IS_UNIFIED: isUnifiedIntegration(),
  
  // Legacy compatibility flags
  IS_OFFLINE: !navigator.onLine || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  IS_DEV: getCurrentPortInfo().isDevelopment,
  IS_PROD: (import.meta as any).env?.PROD && !getCurrentPortInfo().isLocalhost,
  
  // Complete service URLs object
  SERVICES: getServiceURLs(),
};

export default ENV;
