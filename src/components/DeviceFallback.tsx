import React, { useEffect, useState } from 'react';
import WebARFallback from './WebARFallback';
import VideoFallback from './VideoFallback';
import CanvasVideoFallback from './CanvasVideoFallback';
import HologramScene from '../scene/HologramScene';
import ErrorBoundary from './ErrorBoundary';

interface DeviceFallbackProps {
  onActivation?: () => void;
  enableAR?: boolean;
  enableVideo?: boolean;
  enable3D?: boolean;
  videoSrc?: string;
  style?: React.CSSProperties;
}

export default function DeviceFallback({
  onActivation,
  enableAR = true,
  enableVideo = true,
  enable3D = true,
  videoSrc = '/assets/kardiverse-demo.mp4',
  style
}: DeviceFallbackProps) {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [capabilities, setCapabilities] = useState({
    webGL: false,
    webXR: false,
    video: false,
    touch: false,
    orientation: false
  });
  const [recommendedMode, setRecommendedMode] = useState<'3d' | 'ar' | 'video' | 'fallback'>('3d');
  const [isLoading, setIsLoading] = useState(true);

  // Detect device capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
      
      // Set device type
      if (isTablet) {
        setDeviceType('tablet');
      } else if (isMobile) {
        setDeviceType('mobile');
      } else {
        setDeviceType('desktop');
      }

      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const webGLSupported = !!gl;

      // Check WebXR support
      const webXRSupported = 'xr' in navigator;

      // Check video support
      const video = document.createElement('video');
      const videoSupported = !!(video.canPlayType && video.canPlayType('video/mp4'));

      // Check touch support
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Check orientation support
      const orientationSupported = 'orientation' in window;

      setCapabilities({
        webGL: webGLSupported,
        webXR: webXRSupported,
        video: videoSupported,
        touch: touchSupported,
        orientation: orientationSupported
      });

      // Determine recommended mode
      let recommended: '3d' | 'ar' | 'video' | 'fallback' = 'fallback';
      
      if (deviceType === 'desktop' && webGLSupported && enable3D) {
        recommended = '3d';
      } else if (deviceType === 'mobile' && webXRSupported && enableAR) {
        recommended = 'ar';
      } else if (videoSupported && enableVideo) {
        recommended = 'video';
      } else {
        recommended = 'fallback';
      }

      setRecommendedMode(recommended);
      setIsLoading(false);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(detectCapabilities, 100);
    return () => clearTimeout(timer);
  }, [deviceType, enable3D, enableAR, enableVideo]);

  // Loading screen
  if (isLoading) {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a2340 0%, #183a5a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}>
        <div style={{
          color: '#39e6ff',
          fontSize: '24px',
          fontWeight: 'bold',
          textShadow: '0 0 20px #39e6ff',
          marginBottom: '20px'
        }}>
          Kardiverse Avatar
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(57, 230, 255, 0.3)',
          borderTop: '3px solid #39e6ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          color: '#39e6ff',
          fontSize: '14px',
          marginTop: '20px',
          opacity: 0.7
        }}>
          Detecting device capabilities...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render appropriate component based on capabilities
  const renderContent = () => {
    switch (recommendedMode) {
      case '3d':
        return (
          <ErrorBoundary
            fallback={
              <VideoFallback
                src="/assets/kardiverse-demo.mp4"
                autoplay
                muted
                duration={30}
                onEnded={() => {
                  console.log('Video demo completed (30 seconds)');
                  onActivation?.();
                }}
              />
            }
          >
            <HologramScene
              entryMode={true}
              avatarScale={1.8}
              isActive={false}
            />
          </ErrorBoundary>
        );
      
      case 'ar':
        return (
          <WebARFallback
            onActivation={onActivation}
            enableAR={true}
            enableVideo={true}
            videoSrc={videoSrc}
          />
        );
      
      case 'video':
        return (
          <VideoFallback
            duration={30}
            onPlay={onActivation}
            onEnded={() => {
              console.log('Video demo completed (30 seconds)');
              // Optionally trigger activation when video ends
              onActivation?.();
            }}
            posterImage="/assets/poster.jpg"
          />
        );
      
      case 'fallback':
      default:
        return (
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #0a2340 0%, #183a5a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#39e6ff',
              fontSize: '28px',
              fontWeight: 'bold',
              textShadow: '0 0 20px #39e6ff',
              marginBottom: '20px'
            }}>
              Kardiverse Avatar
            </div>
            
            <div style={{
              color: '#39e6ff',
              fontSize: '18px',
              marginBottom: '30px',
              opacity: 0.9
            }}>
              Welcome to the Gates of Display
            </div>
            
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid #39e6ff',
              borderRadius: '15px',
              padding: '30px',
              maxWidth: '400px',
              color: '#39e6ff'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '15px' }}>
                🎭 Avatar Experience
              </div>
              <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.8 }}>
                Your device has limited capabilities for the full 3D experience.
                For the best experience, please try on a desktop computer or modern mobile device.
              </div>
              <button
                onClick={onActivation}
                style={{
                  background: 'rgba(57, 230, 255, 0.2)',
                  border: '1px solid #39e6ff',
                  color: '#39e6ff',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Continue Anyway
              </button>
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#39e6ff',
              fontSize: '12px',
              opacity: 0.6
            }}>
              Device: {deviceType} | WebGL: {capabilities.webGL ? '✅' : '❌'} | 
              WebXR: {capabilities.webXR ? '✅' : '❌'} | Video: {capabilities.video ? '✅' : '❌'}
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      {renderContent()}
    </div>
  );
}

