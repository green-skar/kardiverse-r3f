import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

interface WebARFallbackProps {
  onActivation?: () => void;
  enableAR?: boolean;
  enableVideo?: boolean;
  videoSrc?: string;
  style?: React.CSSProperties;
}

export default function WebARFallback({
  onActivation,
  enableAR = true,
  enableVideo = true,
  videoSrc = '/assets/kardiverse-demo.mp4',
  style
}: WebARFallbackProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isVideoSupported, setIsVideoSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arSessionRef = useRef<any>(null);
  const avatarRef = useRef<any>(null);
  const { scene } = useGLTF('/avatar.glb') as any;

  // Detect device type and capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
      
      if (isTablet) {
        setDeviceType('tablet');
      } else if (isMobile) {
        setDeviceType('mobile');
      } else {
        setDeviceType('desktop');
      }

      // Check WebAR support
      if (enableAR && 'xr' in navigator) {
        navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
          setIsARSupported(supported);
        }).catch(() => {
          setIsARSupported(false);
        });
      }

      // Check video support
      if (enableVideo && videoRef.current) {
        const video = videoRef.current;
        setIsVideoSupported(!!(video.canPlayType && video.canPlayType('video/mp4')));
      }
    };

    detectCapabilities();
  }, [enableAR, enableVideo]);

  // Setup AR session
  const startARSession = async () => {
    if (!isARSupported || !navigator.xr) return;

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['local'],
        optionalFeatures: ['hit-test', 'dom-overlay']
      });

      arSessionRef.current = session;
      setIsARActive(true);

      // Setup AR rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const gl = canvas.getContext('webgl2', { xrCompatible: true });
        if (gl) {
          await gl.makeXRCompatible();
        }
      }

      // Add AR avatar
      if (avatarRef.current && scene) {
        // Position avatar in AR space
        avatarRef.current.position.set(0, 0, -1);
        avatarRef.current.scale.set(0.5, 0.5, 0.5);
      }

      session.addEventListener('end', () => {
        setIsARActive(false);
        arSessionRef.current = null;
      });

    } catch (error) {
      console.error('AR session failed:', error);
      setIsARSupported(false);
    }
  };

  // Stop AR session
  const stopARSession = () => {
    if (arSessionRef.current) {
      arSessionRef.current.end();
    }
  };

  // Play video fallback
  const playVideo = () => {
    if (videoRef.current && isVideoSupported) {
      videoRef.current.play().then(() => {
        setIsVideoPlaying(true);
        onActivation?.();
      }).catch((error) => {
        console.error('Video play failed:', error);
      });
    }
  };

  // Stop video
  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsVideoPlaying(false);
    }
  };

  // AR rendering loop
  useFrame(({ gl, scene, camera }) => {
    if (isARActive && arSessionRef.current) {
      // AR-specific rendering
      gl.render(scene, camera);
    }
  });

  // Auto-activate based on device type
  useEffect(() => {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      // Try AR first, fallback to video
      if (isARSupported) {
        startARSession();
      } else if (isVideoSupported) {
        playVideo();
      }
    }
  }, [deviceType, isARSupported, isVideoSupported]);

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
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#39e6ff',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '0 0 20px #39e6ff',
        textAlign: 'center',
        zIndex: 10
      }}>
        Kardiverse Avatar Experience
      </div>

      {/* Device-specific content */}
      {deviceType === 'mobile' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          padding: '20px'
        }}>
          {/* AR Option */}
          {isARSupported && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid #39e6ff',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              color: '#39e6ff'
            }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                📱 Augmented Reality
              </div>
              <div style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>
                Experience the avatar in your world
              </div>
              <button
                onClick={isARActive ? stopARSession : startARSession}
                style={{
                  background: isARActive ? 'rgba(255, 0, 0, 0.2)' : 'rgba(57, 230, 255, 0.2)',
                  border: '1px solid #39e6ff',
                  color: '#39e6ff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {isARActive ? 'Stop AR' : 'Start AR'}
              </button>
            </div>
          )}

          {/* Video Option */}
          {isVideoSupported && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '2px solid #39e6ff',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              color: '#39e6ff'
            }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                🎬 Video Experience
              </div>
              <div style={{ fontSize: '14px', marginBottom: '15px', opacity: 0.8 }}>
                Watch the avatar demonstration
              </div>
              <button
                onClick={isVideoPlaying ? stopVideo : playVideo}
                style={{
                  background: isVideoPlaying ? 'rgba(255, 0, 0, 0.2)' : 'rgba(57, 230, 255, 0.2)',
                  border: '1px solid #39e6ff',
                  color: '#39e6ff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {isVideoPlaying ? 'Stop Video' : 'Play Video'}
              </button>
            </div>
          )}

          {/* Fallback message */}
          {!isARSupported && !isVideoSupported && (
            <div style={{
              background: 'rgba(255, 0, 0, 0.2)',
              border: '2px solid #ff6666',
              borderRadius: '15px',
              padding: '20px',
              textAlign: 'center',
              color: '#ff6666'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                ⚠️ Limited Support
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Your device doesn't support AR or video playback.
                Please try on a different device or use the desktop version.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Element */}
      {isVideoSupported && (
        <video
          ref={videoRef}
          src={videoSrc}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90%',
            maxHeight: '70%',
            borderRadius: '10px',
            boxShadow: '0 0 30px rgba(57, 230, 255, 0.5)',
            display: isVideoPlaying ? 'block' : 'none'
          }}
          onEnded={() => setIsVideoPlaying(false)}
          onError={(e) => {
            console.error('Video error:', e);
            setIsVideoSupported(false);
          }}
        />
      )}

      {/* AR Canvas */}
      {isARSupported && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: isARActive ? 'block' : 'none'
          }}
        />
      )}

      {/* Status indicator */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#39e6ff',
        fontSize: '12px',
        textAlign: 'center',
        opacity: 0.7
      }}>
        Device: {deviceType} | AR: {isARSupported ? '✅' : '❌'} | Video: {isVideoSupported ? '✅' : '❌'}
      </div>
    </div>
  );
}

