// API Configuration
// Priority: 1. VITE_API_URL env var, 2. localhost detection, 3. default to production
const viteApiUrl = (import.meta as any).env?.VITE_API_URL;
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_BASE_URL = viteApiUrl || 
  (isLocalhost ? 'http://localhost:8000' : 'https://kardiverse-r3f-1.onrender.com');

// Debug logging to see what's happening
console.log('API Config Debug:', {
  hostname: window.location.hostname,
  origin: window.location.origin,
  isLocalhost: isLocalhost,
  viteApiUrl: viteApiUrl,
  finalApiBaseUrl: API_BASE_URL,
  allEnvVars: (import.meta as any).env
});

export const API_ENDPOINTS = {
  // Legacy endpoints (Express.js compatible)
  LOG: `${API_BASE_URL}/api/log`,
  LOG_SCAN: `${API_BASE_URL}/api/log?type=scan`,
  
  // New Django REST API endpoints
  SCAN_COUNT: `${API_BASE_URL}/api/scan-count/`,
  LOG_SCAN_NEW: `${API_BASE_URL}/api/log-scan/`,
  SCAN_LOGS: `${API_BASE_URL}/api/scan-logs/`,
  AVATAR_ACTION: `${API_BASE_URL}/api/avatar-action/`,
  AVATAR_ACTIONS: `${API_BASE_URL}/api/avatar-actions/`,
};

// API helper functions with error handling
export const api = {
  baseURL: API_BASE_URL,
  
  // Get scan count
  async getScanCount() {
    try {
      console.log('API: Fetching scan count from:', API_ENDPOINTS.SCAN_COUNT);
      const response = await fetch(API_ENDPOINTS.SCAN_COUNT, {
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });
      console.log('API: Scan count response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Scan count error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API: Scan count data:', data);
      return data.count || 0;
    } catch (error) {
      console.error('API: Get scan count failed:', error);
      return 0; // Return default value on error
    }
  },

  // Log a scan event
  async logScan(sessionId?: string, metadata?: any) {
    try {
      console.log('API: Logging scan to:', API_ENDPOINTS.LOG_SCAN_NEW);
      console.log('API: Request data:', { session_id: sessionId, metadata });
      
      const response = await fetch(API_ENDPOINTS.LOG_SCAN_NEW, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          metadata: metadata,
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      console.log('API: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API: Log scan successful:', result);
      return result;
    } catch (error) {
      console.error('API: Log scan failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Trigger avatar action
  async triggerAvatarAction(actionType: string, triggeredBy: string = 'remote', metadata?: any) {
    try {
      const response = await fetch(API_ENDPOINTS.AVATAR_ACTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_type: actionType,
          triggered_by: triggeredBy,
          metadata: metadata,
        }),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // Silently handle API errors - backend might not be running
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Legacy method for backward compatibility
  async logLegacy(type: string, timestamp?: number) {
    try {
      const response = await fetch(API_ENDPOINTS.LOG, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: type,
          ts: timestamp || Date.now(),
        }),
        signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      // Silently handle API errors - backend might not be running
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
};

export default api;
