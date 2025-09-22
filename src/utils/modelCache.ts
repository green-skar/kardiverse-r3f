// Enhanced GLB Model caching and preloading system with progressive loading
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';

interface CachedModel {
  gltf: any;
  url: string;
  timestamp: number;
  loading: boolean;
  error?: string;
  loadingProgress?: number;
}

interface LoadingProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class EnhancedModelCache {
  private cache: Map<string, CachedModel> = new Map();
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 10; // Maximum 10 cached models
  private preloadPromises: Map<string, Promise<any>> = new Map();
  private progressCallbacks: Map<string, (progress: LoadingProgress) => void> = new Map();

  constructor() {
    // Initialize DRACO loader for compressed GLB files
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    this.dracoLoader.setWorkerLimit(1);
    
    // Initialize GLTF loader with DRACO support
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);
    
    console.log('EnhancedModelCache: Initialized with progressive loading support');
  }

  // Preload a model with progress tracking
  async preloadModel(url: string, onProgress?: (progress: LoadingProgress) => void): Promise<any> {
    // Check if already cached
    const cached = this.cache.get(url);
    if (cached && !cached.loading && !cached.error) {
      console.log(`Model already cached: ${url}`);
      if (onProgress) onProgress({ loaded: 1, total: 1, percentage: 100 });
      return cached.gltf;
    }

    // Check if already loading
    if (this.preloadPromises.has(url)) {
      console.log(`Model already loading: ${url}`);
      if (onProgress) {
        this.progressCallbacks.set(url, onProgress);
      }
      return this.preloadPromises.get(url);
    }

    // Start loading with progress tracking
    console.log(`Preloading model with progress tracking: ${url}`);
    const loadPromise = this.loadModelWithProgress(url, onProgress);
    this.preloadPromises.set(url, loadPromise);

    try {
      const gltf = await loadPromise;
      this.preloadPromises.delete(url);
      this.progressCallbacks.delete(url);
      return gltf;
    } catch (error) {
      this.preloadPromises.delete(url);
      this.progressCallbacks.delete(url);
      throw error;
    }
  }

  // Load a model with detailed progress tracking
  private async loadModelWithProgress(url: string, onProgress?: (progress: LoadingProgress) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check cache first
      const cached = this.cache.get(url);
      if (cached && !cached.loading && !cached.error) {
        if (Date.now() - cached.timestamp < this.CACHE_DURATION) {
          console.log(`Using cached model: ${url}`);
          if (onProgress) onProgress({ loaded: 1, total: 1, percentage: 100 });
          resolve(cached.gltf);
          return;
        } else {
          // Cache expired, remove it
          this.cache.delete(url);
        }
      }

      // Mark as loading
      this.cache.set(url, {
        gltf: null,
        url,
        timestamp: Date.now(),
        loading: true,
        loadingProgress: 0
      });

      // Load the model with progress tracking
      this.loader.load(
        url,
        (gltf) => {
          console.log(`Model loaded successfully with progress tracking: ${url}`);
          
          // Cache the loaded model
          this.cache.set(url, {
            gltf,
            url,
            timestamp: Date.now(),
            loading: false,
            loadingProgress: 100
          });

          // Clean up cache if needed
          this.cleanupCache();
          
          resolve(gltf);
        },
        (progress) => {
          const progressData: LoadingProgress = {
            loaded: progress.loaded,
            total: progress.total,
            percentage: progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0
          };
          
          // Update cache with progress
          const cached = this.cache.get(url);
          if (cached) {
            cached.loadingProgress = progressData.percentage;
          }
          
          // Notify progress callback
          if (onProgress) {
            onProgress(progressData);
          }
          
          // Notify any other progress callbacks for this URL
          const callback = this.progressCallbacks.get(url);
          if (callback) {
            callback(progressData);
          }
          
          if (progress.total > 0) {
            console.log(`Loading ${url}: ${progressData.percentage.toFixed(1)}%`);
          }
        },
        (error) => {
          console.error(`Failed to load model ${url}:`, error);
          
          // Cache the error
          this.cache.set(url, {
            gltf: null,
            url,
            timestamp: Date.now(),
            loading: false,
            error: error.message || 'Unknown error'
          });
          
          reject(error);
        }
      );
    });
  }

  // Get a cached model
  getCachedModel(url: string): any | null {
    const cached = this.cache.get(url);
    if (!cached || cached.loading || cached.error) {
      return null;
    }

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(url);
      return null;
    }

    return cached.gltf;
  }

  // Check if model is cached and valid
  isModelCached(url: string): boolean {
    const cached = this.cache.get(url);
    if (!cached || cached.loading || cached.error) {
      return false;
    }

    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  // Check if model is currently loading
  isModelLoading(url: string): boolean {
    const cached = this.cache.get(url);
    return cached ? cached.loading : false;
  }

  // Get loading progress for a model
  getLoadingProgress(url: string): number {
    const cached = this.cache.get(url);
    return cached ? (cached.loadingProgress || 0) : 0;
  }

  // Preload multiple models with priority and progress tracking
  async preloadModels(urls: string[], onOverallProgress?: (progress: number) => void): Promise<void> {
    console.log(`Preloading ${urls.length} models with progress tracking...`);
    
    // Prioritize avatar.glb first (most important)
    const priorityOrder = urls.sort((a, b) => {
      if (a.includes('avatar.glb')) return -1;
      if (b.includes('avatar.glb')) return 1;
      return 0;
    });
    
    let completedCount = 0;
    
    // Load models sequentially to avoid overwhelming the browser
    for (const url of priorityOrder) {
      try {
        console.log(`Preloading priority model: ${url}`);
        
        await this.preloadModel(url, (progress) => {
          // Calculate overall progress
          const overallProgress = ((completedCount + (progress.percentage / 100)) / priorityOrder.length) * 100;
          if (onOverallProgress) {
            onOverallProgress(overallProgress);
          }
        });
        
        completedCount++;
        
        // Small delay between models to prevent browser freezing
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error);
        completedCount++; // Still count as completed to avoid hanging
      }
    }
    
    console.log('Model preloading completed');
  }

  // Clean up expired cache entries
  private cleanupCache(): void {
    const now = Date.now();
    for (const [url, cached] of this.cache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.cache.delete(url);
      }
    }

    // Remove oldest entries if cache is too large
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([url]) => this.cache.delete(url));
    }
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    this.preloadPromises.clear();
    this.progressCallbacks.clear();
    console.log('Enhanced model cache cleared');
  }

  // Cleanup resources
  dispose(): void {
    this.clearCache();
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
  }

  // Get cache statistics
  getCacheStats(): { 
    size: number; 
    urls: string[]; 
    loading: string[]; 
    progress: { [url: string]: number } 
  } {
    const urls = Array.from(this.cache.keys());
    const loading = urls.filter(url => this.isModelLoading(url));
    const progress: { [url: string]: number } = {};
    
    urls.forEach(url => {
      progress[url] = this.getLoadingProgress(url);
    });
    
    return {
      size: this.cache.size,
      urls,
      loading,
      progress
    };
  }

  // Warm up cache with essential models
  async warmUpCache(): Promise<void> {
    const essentialModels = ['/avatar.glb'];
    console.log('Warming up cache with essential models...');
    
    try {
      await this.preloadModels(essentialModels, (progress) => {
        console.log(`Cache warm-up progress: ${progress.toFixed(1)}%`);
      });
      console.log('Cache warm-up completed');
    } catch (error) {
      console.warn('Cache warm-up failed:', error);
    }
  }
}

// Export singleton instance
export const enhancedModelCache = new EnhancedModelCache();
export default enhancedModelCache;
