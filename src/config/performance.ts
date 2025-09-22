// Performance optimization settings for Kardiverse Avatar Demo

export const PERFORMANCE_CONFIG = {
  // 3D Rendering
  RENDERING: {
    // Canvas performance settings
    DPR_LIMIT: [1, 2], // Limit device pixel ratio
    PERFORMANCE_MIN: 0.5, // Minimum performance threshold
    
    // Avatar optimization
    GLOW_UPDATE_FREQUENCY: 0.2, // Update glow every 0.2 seconds
    GLOW_FREQUENCY_REDUCTION: 1.5, // Reduced glow animation speed
    
    // Environment optimization
    ENVIRONMENT_BACKGROUND: false, // Disable environment background
  },

  // Audio Processing
  AUDIO: {
    // Lip sync optimization
    FFT_SIZE: 256, // Reduced from 1024 for better performance
    SMOOTHING_TIME_CONSTANT: 0.3, // Faster response
    MORPH_SEARCH_INTERVAL: 3000, // Search for morphs every 3 seconds
    HISTORY_LENGTH: 5, // Reduced history buffer
    
    // Audio analysis
    MIN_DECIBELS: -90,
    MAX_DECIBELS: -10,
  },

  // Frontend Updates
  FRONTEND: {
    // Scan count updates
    SCAN_COUNT_INTERVAL: 10000, // Update every 10 seconds instead of 5
    
    // API calls
    API_TIMEOUT: 5000, // 5 second timeout
    RETRY_ATTEMPTS: 2, // Retry failed requests twice
  },

  // Development vs Production
  DEVELOPMENT: {
    DEBUG_MODE: false, // Disable debug by default
    CONSOLE_LOGS: false, // Disable console logs in production
  }
};

// Performance monitoring
export const performanceMonitor = {
  startTime: Date.now(),
  
  logPerformance: (label: string) => {
    if (PERFORMANCE_CONFIG.DEVELOPMENT.CONSOLE_LOGS) {
      console.log(`${label}: ${Date.now() - performanceMonitor.startTime}ms`);
    }
  },
  
  measureRender: (callback: () => void) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    
    if (PERFORMANCE_CONFIG.DEVELOPMENT.CONSOLE_LOGS) {
      console.log(`Render time: ${end - start}ms`);
    }
  }
};

export default PERFORMANCE_CONFIG;
