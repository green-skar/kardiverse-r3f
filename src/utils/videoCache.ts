// Video caching system for session-based video reuse
interface CachedVideo {
  blob: Blob;
  url: string;
  timestamp: number;
  sessionId: string;
}

class VideoCache {
  private cache: Map<string, CachedVideo> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 5; // Maximum 5 cached videos

  // Generate session ID
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current session ID from localStorage or create new one
  getCurrentSessionId(): string {
    const stored = localStorage.getItem('kardiverse_session_id');
    if (stored) {
      return stored;
    }
    
    const newSessionId = this.generateSessionId();
    localStorage.setItem('kardiverse_session_id', newSessionId);
    return newSessionId;
  }

  // Cache a video
  cacheVideo(sessionId: string, videoBlob: Blob): string {
    // Clean up old cache entries
    this.cleanupCache();

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    const videoUrl = URL.createObjectURL(videoBlob);
    const cachedVideo: CachedVideo = {
      blob: videoBlob,
      url: videoUrl,
      timestamp: Date.now(),
      sessionId
    };

    this.cache.set(sessionId, cachedVideo);
    console.log(`Video cached for session: ${sessionId}`);
    return videoUrl;
  }

  // Get cached video
  getCachedVideo(sessionId: string): string | null {
    const cached = this.cache.get(sessionId);
    
    if (!cached) {
      console.log(`No cached video found for session: ${sessionId}`);
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      console.log(`Cached video expired for session: ${sessionId}`);
      this.removeCachedVideo(sessionId);
      return null;
    }

    console.log(`Using cached video for session: ${sessionId}`);
    return cached.url;
  }

  // Check if video is cached
  isVideoCached(sessionId: string): boolean {
    const cached = this.cache.get(sessionId);
    if (!cached) return false;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.removeCachedVideo(sessionId);
      return false;
    }
    
    return true;
  }

  // Remove cached video
  removeCachedVideo(sessionId: string): void {
    const cached = this.cache.get(sessionId);
    if (cached) {
      URL.revokeObjectURL(cached.url);
      this.cache.delete(sessionId);
      console.log(`Removed cached video for session: ${sessionId}`);
    }
  }

  // Clean up expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    for (const [sessionId, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.removeCachedVideo(sessionId);
      }
    }
  }

  // Clear all cache
  clearAllCache(): void {
    for (const [sessionId] of this.cache.entries()) {
      this.removeCachedVideo(sessionId);
    }
    console.log('All video cache cleared');
  }

  // Get cache statistics
  getCacheStats(): { size: number; sessions: string[] } {
    return {
      size: this.cache.size,
      sessions: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const videoCache = new VideoCache();
export default videoCache;
