import React, { useEffect, useState } from 'react';
import { enhancedModelCache } from '../utils/modelCache';

interface ModelPreloaderProps {
  onPreloadComplete?: () => void;
  onPreloadProgress?: (progress: number) => void;
  onModelReady?: (url: string, gltf: any) => void;
  essentialModels?: string[];
  preloadOnMount?: boolean;
}

const DEFAULT_ESSENTIAL_MODELS = [
  '/avatar.glb',
  '/mascots/mascot2.glb',
  '/mascots/mascot3.glb'
];

export default function ModelPreloader({ 
  onPreloadComplete, 
  onPreloadProgress,
  onModelReady,
  essentialModels = DEFAULT_ESSENTIAL_MODELS,
  preloadOnMount = true
}: ModelPreloaderProps) {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadedModels, setPreloadedModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState<string>('');
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    if (!preloadOnMount) return;

    const startSmartPreloading = async () => {
      setIsPreloading(true);
      setPreloadProgress(0);
      setPreloadedModels([]);

      console.log('ModelPreloader: Starting intelligent preloading...');

      try {
        // Check cache status first
        const stats = enhancedModelCache.getCacheStats();
        setCacheStats(stats);
        
        console.log('ModelPreloader: Cache status:', stats);

        // Filter out already cached models
        const modelsToPreload = essentialModels.filter(url => 
          !enhancedModelCache.isModelCached(url)
        );

        if (modelsToPreload.length === 0) {
          console.log('ModelPreloader: All models already cached, instant loading');
          setPreloadProgress(100);
          onPreloadComplete?.();
          setIsPreloading(false);
          return;
        }

        console.log(`ModelPreloader: Need to preload ${modelsToPreload.length} models`);

        // Preload models with individual progress tracking
        for (let i = 0; i < modelsToPreload.length; i++) {
          const modelUrl = modelsToPreload[i];
          setCurrentModel(modelUrl);
          
          try {
            console.log(`ModelPreloader: Preloading ${i + 1}/${modelsToPreload.length}: ${modelUrl}`);
            
            const gltf = await enhancedModelCache.preloadModel(modelUrl, (progress) => {
              // Calculate overall progress including this model
              const modelProgress = progress.percentage / 100;
              const overallProgress = ((i + modelProgress) / modelsToPreload.length) * 100;
              setPreloadProgress(overallProgress);
              onPreloadProgress?.(overallProgress);
            });
            
            setPreloadedModels(prev => [...prev, modelUrl]);
            onModelReady?.(modelUrl, gltf);
            
            console.log(`ModelPreloader: Model preloaded successfully: ${modelUrl}`);
          } catch (error) {
            console.warn(`ModelPreloader: Failed to preload model ${modelUrl}:`, error);
            // Continue with other models even if one fails
          }
        }

        console.log('ModelPreloader: Intelligent preloading completed');
        onPreloadComplete?.();
      } catch (error) {
        console.error('ModelPreloader: Preloading failed:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    startSmartPreloading();
  }, [essentialModels, preloadOnMount, onPreloadComplete, onPreloadProgress, onModelReady]);

  // Warm up cache on component mount
  useEffect(() => {
    const warmUpCache = async () => {
      try {
        await enhancedModelCache.warmUpCache();
      } catch (error) {
        console.warn('ModelPreloader: Cache warm-up failed:', error);
      }
    };

    warmUpCache();
  }, []);

  // Expose cache status for debugging
  useEffect(() => {
    const updateCacheStats = () => {
      const stats = enhancedModelCache.getCacheStats();
      setCacheStats(stats);
    };

    // Update stats every 2 seconds during preloading
    let interval: NodeJS.Timeout;
    if (isPreloading) {
      interval = setInterval(updateCacheStats, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPreloading]);

  // This component doesn't render anything visible itself
  return null;
}

// Hook for accessing preload status
export function useModelPreloadStatus() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cacheStats, setCacheStats] = useState<any>(null);

  useEffect(() => {
    const updateStatus = () => {
      const stats = enhancedModelCache.getCacheStats();
      setCacheStats(stats);
      
      // Check if essential models are cached
      const essentialModels = ['/avatar.glb'];
      const allCached = essentialModels.every(url => enhancedModelCache.isModelCached(url));
      setIsPreloaded(allCached);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return { isPreloaded, progress, cacheStats };
}

// Hook for getting model loading status
export function useModelStatus(url: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      setIsLoading(enhancedModelCache.isModelLoading(url));
      setIsCached(enhancedModelCache.isModelCached(url));
      setProgress(enhancedModelCache.getLoadingProgress(url));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 500);

    return () => clearInterval(interval);
  }, [url]);

  return { isLoading, isCached, progress, error };
}
