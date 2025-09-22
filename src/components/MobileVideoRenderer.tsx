import React, { useRef, useEffect, useState, useCallback } from 'react';

interface MobileVideoRendererProps {
  onVideoReady?: (videoBlob: Blob) => void;
  onProgress?: (progress: number) => void;
  duration?: number;
  posterImage?: string;
}

export default function MobileVideoRenderer({ 
  onVideoReady, 
  onProgress, 
  duration = 30,
  posterImage = "/assets/poster.jpg"
}: MobileVideoRendererProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadPreGeneratedVideo = useCallback(async () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate loading progress
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Load the pre-generated video file
      console.log('Loading pre-generated video...');
      const response = await fetch('/assets/kardiverse-demo.mp4');
      
      if (!response.ok) {
        throw new Error(`Failed to load video: ${response.status} ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      console.log('Pre-generated video loaded successfully, size:', videoBlob.size);
      
      setProgress(100);
      onVideoReady?.(videoBlob);

    } catch (err) {
      console.error('Failed to load pre-generated video:', err);
      setError(err instanceof Error ? err.message : 'Failed to load video');
    } finally {
      setIsLoading(false);
    }
  }, [onVideoReady]);

  // Auto-load the video when component mounts
  useEffect(() => {
    loadPreGeneratedVideo();
  }, [loadPreGeneratedVideo]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#39e6ff',
          zIndex: 1000
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '0 0 20px #39e6ff'
          }}>
            Loading Video...
          </div>
          
          <div style={{
            width: '300px',
            height: '6px',
            background: 'rgba(57, 230, 255, 0.2)',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #39e6ff, #00c8ff)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{ fontSize: '16px', opacity: 0.8 }}>
            {progress.toFixed(0)}% Complete
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ff6b6b',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '20px', marginBottom: '20px' }}>
            Video Loading Failed
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
          <button
            onClick={loadPreGeneratedVideo}
            style={{
              padding: '10px 20px',
              background: 'rgba(57, 230, 255, 0.2)',
              border: '1px solid #39e6ff',
              color: '#39e6ff',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
