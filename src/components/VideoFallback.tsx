import React, { useState, useRef, useEffect } from 'react';
import MobileVideoRenderer from './MobileVideoRenderer';
import ResponsiveVideoPlayer from './ResponsiveVideoPlayer';
import { videoCache } from '../utils/videoCache';

interface VideoFallbackProps {
  onVideoReady?: (videoBlob: Blob) => void;
  onPlay?: () => void;
  onEnded?: () => void;
  posterImage?: string;
  duration?: number;
  style?: React.CSSProperties;
}

export default function VideoFallback({
  onVideoReady,
  onPlay,
  onEnded,
  posterImage = "/assets/poster.jpg",
  duration = 30,
  style
}: VideoFallbackProps) {
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize session ID
  useEffect(() => {
    const currentSessionId = videoCache.getCurrentSessionId();
    setSessionId(currentSessionId);
    
    // Check if we have a cached video for this session
    const cachedVideoUrl = videoCache.getCachedVideo(currentSessionId);
    if (cachedVideoUrl) {
      setVideoUrl(cachedVideoUrl);
      setIsGenerating(false);
      console.log('Using cached video for session:', currentSessionId);
    } else {
      // No cached video, show the video generator
      setIsGenerating(true);
    }
  }, []);

  // Handle video generation completion
  const handleVideoReady = (videoBlob: Blob) => {
    setVideoBlob(videoBlob);
    
    // Cache the video for this session
    const url = videoCache.cacheVideo(sessionId, videoBlob);
    setVideoUrl(url);
    setIsGenerating(false);
    onVideoReady?.(videoBlob);
    
    console.log('Video with embedded audio generated and cached for session:', sessionId);
    
    // Auto-start video after generation (only once)
    if (!hasAutoStarted) {
      setTimeout(() => {
        setHasAutoStarted(true);
        // The video will auto-start in the EnhancedVideoPlayer
      }, 2000);
    }
  };

  // Handle video play
    const handlePlay = () => {
      setIsPlaying(true);
    
    // Check if video has embedded audio
    if (videoRef.current) {
      const video = videoRef.current;
      console.log('Video muted:', video.muted);
      
      // Unmute the video to play any embedded audio
      video.muted = false;
      console.log('Video unmuted for playback');
    }
    
      onPlay?.();
    };

  // Handle video end
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

  // Handle reload video
  const handleReloadVideo = () => {
    setIsGenerating(true);
    setVideoUrl(null);
    setVideoBlob(null);
    // Clear cached video for this session
    videoCache.clearAllCache();
  };

  // Download video function
  const downloadVideo = () => {
    if (videoBlob) {
      console.log('Downloading video with embedded audio...');
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      
      // Determine file extension based on blob type
      let extension = 'mp4';
      if (videoBlob.type.includes('webm')) {
        extension = 'webm';
      } else if (videoBlob.type.includes('mp4')) {
        extension = 'mp4';
      }
      
      a.download = `kardiverse-avatar-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log('Download completed with embedded audio');
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <div style={{ 
        width: '100%',
        height: '100%',
      position: 'relative',
        background: 'linear-gradient(135deg, #0a2340 0%, #183a5a 100%)',
        ...style
    }}>
      {/* Video generation component */}
      {isGenerating && (
        <MobileVideoRenderer
          onVideoReady={handleVideoReady}
          posterImage={posterImage}
          duration={duration}
        />
      )}

      {/* Responsive Video Player */}
      {videoUrl && !isGenerating && (
        <ResponsiveVideoPlayer
          videoUrl={videoUrl}
          posterImage={posterImage}
          onPlay={handlePlay}
          onEnded={handleEnded}
          onReplay={() => {
            setIsPlaying(false);
          }}
          onMaximize={() => console.log('Video maximized')}
          videoRef={videoRef}
        />
      )}

      {/* Download and Navigation Controls */}
      {videoUrl && !isGenerating && (
          <div style={{
            position: 'absolute',
          top: '20px',
          right: '20px',
            display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 300
        }}>
          <button
            onClick={handleReloadVideo}
            style={{
              background: 'rgba(255, 165, 0, 0.2)',
              border: '2px solid #ffa500',
              color: '#ffa500',
              padding: '8px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 165, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)';
            }}
          >
            🔄 Reload
          </button>
            <button
            onClick={downloadVideo}
              style={{
                background: 'rgba(57, 230, 255, 0.2)',
              border: '2px solid #39e6ff',
                color: '#39e6ff',
              padding: '10px 15px',
              borderRadius: '25px',
                cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57, 230, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            📥 Download
            </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'rgba(57, 230, 255, 0.2)',
              border: '2px solid #39e6ff',
              color: '#39e6ff',
              padding: '10px 15px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57, 230, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🏠 Home
          </button>
          </div>
        )}

      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        color: '#39e6ff',
        fontSize: '12px',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '5px 10px',
        borderRadius: '15px',
        border: '1px solid rgba(57, 230, 255, 0.3)'
      }}>
        {isGenerating ? 'Generating...' : isPlaying ? 'Playing' : 'Ready'}
      </div>
    </div>
  );
}
