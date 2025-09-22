import React, { useState, useRef, useEffect } from 'react';

interface ResponsiveVideoPlayerProps {
  videoUrl: string;
  posterImage?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onReplay?: () => void;
  onMaximize?: () => void;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

export default function ResponsiveVideoPlayer({
  videoUrl,
  posterImage = "/assets/poster.jpg",
  onPlay,
  onPause,
  onEnded,
  onReplay,
  onMaximize,
  style,
  videoRef: externalVideoRef
}: ResponsiveVideoPlayerProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalVideoRef || internalVideoRef;

  // Detect device type and screen size
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768 || height < 600);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Handle maximize/minimize
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize?.();
  };

  // Calculate responsive dimensions
  const getPlayerDimensions = () => {
    if (isMaximized) {
      return {
        width: '100vw',
        height: '100vh',
        borderRadius: '0px'
      };
    }

    if (isMobile) {
      return {
        width: '90vw',
        height: '60vh',
        borderRadius: '15px'
      };
    }

    return {
      width: '600px',
      height: '400px',
      borderRadius: '15px'
    };
  };

  const dimensions = getPlayerDimensions();

  return (
    <div
      style={{
        position: 'fixed',
        top: isMaximized ? 0 : '50%',
        left: isMaximized ? 0 : '50%',
        transform: isMaximized ? 'none' : 'translate(-50%, -50%)',
        width: dimensions.width,
        height: dimensions.height,
        background: `
          linear-gradient(135deg, #0a2340 0%, #183a5a 100%),
          radial-gradient(circle at 20% 50%, rgba(57, 230, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(57, 230, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(57, 230, 255, 0.1) 0%, transparent 50%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="rock" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="2" fill="%23000" opacity="0.1"/><circle cx="5" cy="15" r="1" fill="%23000" opacity="0.05"/><circle cx="15" cy="5" r="1.5" fill="%23000" opacity="0.08"/></pattern></defs><rect width="100" height="100" fill="url(%23rock)"/></svg>')
        `,
        borderRadius: dimensions.borderRadius,
        border: '2px solid rgba(57, 230, 255, 0.3)',
        boxShadow: `
          0 0 30px rgba(57, 230, 255, 0.2),
          inset 0 0 30px rgba(57, 230, 255, 0.1)
        `,
        zIndex: 1000,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...style
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 15px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(57, 230, 255, 0.2)',
          height: '50px',
          minHeight: '50px'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            background: '#39e6ff',
            borderRadius: '50%',
            boxShadow: '0 0 10px #39e6ff'
          }} />
          <h3 style={{
            color: '#39e6ff',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'bold',
            margin: 0,
            textShadow: '0 0 10px rgba(57, 230, 255, 0.5)'
          }}>
            Mobile View
          </h3>
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={toggleMaximize}
            style={{
              background: 'rgba(57, 230, 255, 0.2)',
              border: '1px solid #39e6ff',
              color: '#39e6ff',
              width: isMobile ? '30px' : '35px',
              height: isMobile ? '30px' : '35px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: isMobile ? '10px' : '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(57, 230, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
            }}
          >
            {isMaximized ? '🗗' : '🗖'}
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div style={{
        width: '100%',
        height: 'calc(100% - 50px)',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterImage}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          controls
          autoPlay
          muted
        />
      </div>

      {/* Glowing arcs in background */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '-50px',
        width: '200px',
        height: '100px',
        background: 'linear-gradient(45deg, transparent, rgba(57, 230, 255, 0.1), transparent)',
        borderRadius: '50%',
        transform: 'rotate(-15deg)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '-30px',
        width: '150px',
        height: '80px',
        background: 'linear-gradient(45deg, transparent, rgba(57, 230, 255, 0.08), transparent)',
        borderRadius: '50%',
        transform: 'rotate(15deg)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
