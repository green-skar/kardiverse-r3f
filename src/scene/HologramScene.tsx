import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import InteractiveAvatar from "../components/InteractiveAvatar";
import Avatar2DFallback from "../components/Avatar2DFallback";
import LogoGlow from "../components/LogoGlow";
import WebGLErrorBoundary from "../components/WebGLErrorBoundary";
import { useAppStore } from "../store";
import { detectDevice } from "../utils/deviceDetection";
import { enhancedModelCache } from "../utils/modelCache";

export default function HologramScene({
  entryMode = false,
  projectorMode = false,
  avatarScale = 1.0,
  isActive = false,
  onModelLoaded,
  onPreloadComplete,
  on2DFallback,
}: {
  entryMode?: boolean;
  projectorMode?: boolean;
  avatarScale?: number;
  isActive?: boolean;
  onModelLoaded?: () => void;
  onPreloadComplete?: () => void;
  on2DFallback?: () => void;
}) {
  const setPlaying = useAppStore((s) => s.setPlaying);
  const addActivation = useAppStore((s) => s.addActivation);
  const [use2DFallback, setUse2DFallback] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Device detection
  useEffect(() => {
    const device = detectDevice();
    setDeviceInfo(device);
    console.log('HologramScene: Device detected:', device);
  }, []);

  // Responsive sizing function
  const getResponsiveSizing = () => {
    const { width } = screenSize;
    
    if (width < 768) {
      return {
        cameraPosition: [0, 2, 8] as [number, number, number],
        cameraFov: 60
      };
    } else if (width < 1024) {
      return {
        cameraPosition: [0, 1.5, 9] as [number, number, number],
        cameraFov: 55
      };
    } else {
      return {
        cameraPosition: [0, 1, 10] as [number, number, number],
        cameraFov: 50
      };
    }
  };

  const responsiveSizing = getResponsiveSizing();

  // Smart preloading function
  const startPreloading = async () => {
    console.log('HologramScene: Starting smart preloading...');
    setIsPreloading(true);
    setPreloadProgress(0);
    
    try {
      // Check if avatar is already cached
      const isCached = enhancedModelCache.isModelCached('/avatar.glb');
      if (isCached) {
        console.log('HologramScene: Avatar already cached, instant loading');
        setPreloadProgress(100);
        setIsPreloading(false);
        onPreloadComplete?.(); // Notify parent that preloading is complete
        return;
      }
      
      // Preload with progress tracking
      const preloadPromise = enhancedModelCache.preloadModel('/avatar.glb');
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setPreloadProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until real loading completes
          return prev + Math.random() * 10;
        });
      }, 100);
      
      await preloadPromise;
      
      clearInterval(progressInterval);
      setPreloadProgress(100);
      console.log('HologramScene: Preloading completed');
      onPreloadComplete?.(); // Notify parent that preloading is complete
    } catch (error) {
      console.warn('HologramScene: Preloading failed:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  // Start preloading when component mounts
  useEffect(() => {
    startPreloading();
  }, []);

  // Re-check preload status when isActive changes (when button is clicked)
  useEffect(() => {
    if (isActive) {
      console.log('HologramScene: isActive changed to true, checking preload status');
      // Use setTimeout to ensure this runs after state updates are processed
      setTimeout(() => {
        const isCached = enhancedModelCache.isModelCached('/avatar.glb');
        if (isCached) {
          console.log('HologramScene: Avatar is cached, notifying parent immediately');
          onPreloadComplete?.();
        } else if (!isPreloading) {
          console.log('HologramScene: Avatar not cached and not preloading, starting preload');
          startPreloading();
        }
      }, 0);
    }
  }, [isActive]);

  // WebGL support check
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, using 2D fallback');
      setUse2DFallback(true);
      // Trigger 2D fallback callback for AI speech
      if (on2DFallback) {
        on2DFallback();
      }
    } else {
      console.log('WebGL supported, using 3D avatar');
      setUse2DFallback(false);
    }
  }, []);

  // Separate effect for model loading timeout (reduced to 2 seconds)
  useEffect(() => {
    if (isActive && !modelLoaded && !isPreloading) { // Only apply timeout if not preloading
      // Don't start timeout if model is already cached
      const isCached = enhancedModelCache.isModelCached('/avatar.glb');
      if (!isCached) {
        console.log('Setting model loading timeout for isActive:', isActive);
        const modelTimeout = setTimeout(() => {
          if (!modelLoaded) {
            console.warn('3D model loading timeout after 2 seconds, using 2D fallback temporarily');
            setUse2DFallback(true);
            // Trigger 2D fallback callback for AI speech
            if (on2DFallback) {
              on2DFallback();
            }
          }
        }, 2000); // 2 second timeout - give models time to load

        return () => clearTimeout(modelTimeout);
      } else {
        console.log('Model is cached, skipping timeout - should display immediately');
      }
    }
  }, [isActive, modelLoaded, isPreloading]);

  // Reset model loading state when isActive changes (but only if model isn't already cached)
  useEffect(() => {
    if (isActive) {
      // Check if model is already cached - if so, don't reset modelLoaded
      const isCached = enhancedModelCache.isModelCached('/avatar.glb');
      if (!isCached) {
        setModelLoaded(false);
        console.log('Reset model loading state for new activation (model not cached)');
      } else {
        console.log('Model is cached, keeping modelLoaded=true for instant display');
      }
      setUse2DFallback(false);
    }
  }, [isActive]);

  // Clear 2D fallback when model loads successfully
  useEffect(() => {
    if (modelLoaded && use2DFallback) {
      console.log('Model loaded successfully, clearing 2D fallback');
      setUse2DFallback(false);
    }
  }, [modelLoaded, use2DFallback]);

  // Broadcast channel for external cues
  useEffect(() => {
    const bc = new BroadcastChannel("kardi-cue");
    bc.onmessage = (ev) => {
      if (ev.data === "cue") {
        addActivation();
        setPlaying(true);

        // Replay greeting audio on cue
        const audio = document.getElementById("kardi-voice") as HTMLAudioElement | null;
        if (audio) {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }

        setTimeout(() => setPlaying(false), 28000);
      }
    };
    return () => bc.close();
  }, [addActivation, setPlaying]);

  // Canvas creation handler
  const onCreated = ({ gl }: any) => {
    try {
      // Handle WebGL context lost
      gl.domElement.addEventListener('webglcontextlost', (event: Event) => {
        console.log('WebGL context lost, preventing default');
        event.preventDefault();
      });
      
      // Handle WebGL context restored
      gl.domElement.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored');
        gl.domElement.dispatchEvent(new Event('resize'));
      });
    } catch (e) {
      console.error('Error in onCreated:', e);
    }
  };

  // Use 2D fallback for unsupported devices or when model fails to load
  if (use2DFallback) {
    console.log('HologramScene: Using 2D fallback, isActive:', isActive);
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
      }}>
        <Avatar2DFallback isActive={isActive} scale={avatarScale} />
      </div>
    );
  }

  console.log('HologramScene: Rendering 3D scene, isActive:', isActive, 'modelLoaded:', modelLoaded);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      background: 'transparent'
    }}>
      {/* HUD Background - Same as QRScan implementation */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/hud.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
          filter: "drop-shadow(0 0 8px cyan) brightness(1.1)",
          zIndex: 1,
        }}
      />
      
      {/* Loading Avatar Overlay - Only show if not preloading and model not loaded */}
      {!modelLoaded && !isPreloading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Avatar2DFallback isActive={isActive} scale={avatarScale} />
        </div>
      )}
      
      {/* Preloading Progress Overlay */}
      {isPreloading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#39e6ff',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(57, 230, 255, 0.3)',
            borderTop: '3px solid #39e6ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '10px'
          }} />
          <div>Preloading 3D Model... {Math.round(preloadProgress)}%</div>
        </div>
      )}
      
      <WebGLErrorBoundary 
        fallback={<div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 100
        }}>
          <Avatar2DFallback isActive={isActive} scale={avatarScale} />
        </div>}
      >
        <Canvas 
          camera={{ 
            position: responsiveSizing.cameraPosition, 
            fov: responsiveSizing.cameraFov 
          }} 
          onCreated={onCreated}
          performance={{ min: 0.5 }}
          dpr={[1, 2]}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            precision: "highp",
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false,
            stencil: false,
            depth: true
          }}
          onError={(error) => {
            console.error('Canvas error:', error);
          }}
        >
          {/* Lighting Setup */}
          <ambientLight intensity={0.4} color="#39e6ff" />
          <directionalLight 
            intensity={0.3} 
            position={[5, 5, 5]} 
            color="#39e6ff"
            castShadow
          />
          <pointLight 
            intensity={0.5} 
            position={[0, 2, 0]} 
            color="#00c8ff"
            distance={10}
          />
          
          <Suspense fallback={
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial
                color="#39e6ff"
                transparent
                opacity={0.6}
                wireframe={true}
              />
            </mesh>
          }>
            {/* Interactive Avatar with immediate feedback */}
            <InteractiveAvatar
              modelUrl="/avatar.glb"
              scale={avatarScale}
              isActive={isActive}
              showImmediateFeedback={true}
              onModelLoaded={() => {
                setModelLoaded(true);
                if (onModelLoaded) {
                  onModelLoaded();
                }
              }}
            />
            <LogoGlow />
            <Environment preset="city" background={false} />
          </Suspense>
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
