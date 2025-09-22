import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import api from '../config/api';
import Avatar2DFallback from '../components/Avatar2DFallback';
import { useAppStore } from '../store';
import { detectDevice } from '../utils/deviceDetection';
import ENV from '../config/env';

// 3D Avatar Component
function AvatarScene({ isMobile, speechCompleted, setSpeechCompleted, isActivated, mascotsVisible, isAxisRotating, axisRotationSpeed, isDesktopRotating, setIsAxisRotating, setAxisRotationSpeed, setIsDesktopRotating, isSpeechPlaying, onModelsLoaded }: { 
  isMobile: boolean; 
  speechCompleted: boolean; 
  setSpeechCompleted: (value: boolean) => void; 
  isActivated: boolean;
  mascotsVisible: boolean;
  isAxisRotating: boolean;
  axisRotationSpeed: number;
  isDesktopRotating: boolean;
  setIsAxisRotating: (value: boolean) => void;
  setAxisRotationSpeed: (value: number) => void;
  setIsDesktopRotating: (value: boolean) => void;
  isSpeechPlaying: boolean;
  onModelsLoaded?: () => void;
}) {
  // Load GLB files with error handling
  let gltf1, gltf2, gltf3;
  try {
    gltf1 = useGLTF('/mascots/mascot2.glb') as any;
  } catch (error) {
    console.warn('Failed to load mascot2.glb:', error);
    gltf1 = null;
  }
  
  try {
    gltf2 = useGLTF('/avatar.glb') as any;
  } catch (error) {
    console.warn('Failed to load avatar.glb:', error);
    gltf2 = null;
  }
  
  try {
    gltf3 = useGLTF('/mascots/mascot3.glb') as any;
  } catch (error) {
    console.warn('Failed to load mascot3.glb:', error);
    gltf3 = null;
  }
  
  const avatarRefs = useRef<any[]>([null, null, null]);

  // Check if models are loaded - show them individually as they load
  useEffect(() => {
    // Mark as loaded when at least one model is ready (more responsive)
    if ((gltf1 || gltf2 || gltf3) && onModelsLoaded) {
      onModelsLoaded();
    }
  }, [gltf1, gltf2, gltf3, onModelsLoaded]);

  // Individual model loading detection (not used in current implementation)
  // Keeping for potential future use
  const [rotationAxis, setRotationAxis] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isUserDragging, setIsUserDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState(0);
  
  // Triangle formation states
  const [isInTriangleFormation, setIsInTriangleFormation] = useState(false);
  const [triangleAnimationProgress, setTriangleAnimationProgress] = useState(0);

  // Start rotation when speech is completed and activated
  useEffect(() => {
    if (isActivated && speechCompleted) {
      if (isMobile) {
        // Start triangle formation animation
        setIsInTriangleFormation(true);
        setTriangleAnimationProgress(0);
        
        // Animate triangle formation over 2 seconds
        const triangleAnimation = setInterval(() => {
          setTriangleAnimationProgress(prev => {
            if (prev >= 1) {
              clearInterval(triangleAnimation);
              setIsAxisRotating(true);
              setAxisRotationSpeed(-0.02); // Default anticlockwise rotation
              return 1;
            }
            return prev + 0.02; // 2 second animation
          });
        }, 40);
        
        return () => clearInterval(triangleAnimation);
      } else {
        setIsDesktopRotating(true);
      }
    }
  }, [isActivated, speechCompleted, isMobile]);

  // Animation logic
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (isMobile) {
      // Mobile: Only rotate after speech is completed, and not when user is dragging
      if (isAxisRotating && speechCompleted && !isUserDragging) {
        setRotationAxis(prev => prev + axisRotationSpeed);
      }
      
      // Triangle formation rotation logic
      
      // Mobile rotation logic
    } else {
      // Desktop rotation logic
      
      // Desktop individual rotations with enhanced visibility
      avatarRefs.current.forEach((ref, index) => {
        if (ref) {
          if (index === 0) { // Left avatar - anticlockwise
            if (isDesktopRotating) {
              ref.rotation.y = Math.PI + (time * 0.2); // 30 seconds for full rotation
            }
          } else if (index === 1) { // Center avatar - continuous rotation when not interacting
            if (isDesktopRotating && !isDragging) {
              ref.rotation.y = (ref.rotation.y || 0) + 0.01; // Continuous rotation
            }
            if (isDesktopRotating) {
              ref.position.y = Math.sin(time * 2) * 0.1;
            }
            
            // Animate scan lines position with different speeds (only when rotating)
            if (isDesktopRotating) {
              const scanLines = ref.children.filter((child: any) => child.geometry?.type === 'PlaneGeometry');
              scanLines.forEach((scanLine: any, scanIndex: number) => {
                if (scanIndex === 0) {
                  // First horizontal scan line - slower movement
                  scanLine.position.y = Math.sin(time * 1.2) * 1.8;
                  scanLine.material.opacity = 0.6 + Math.sin(time * 3) * 0.3;
                } else if (scanIndex === 1) {
                  // Second horizontal scan line - faster movement, offset
                  scanLine.position.y = Math.sin(time * 2.1 + Math.PI) * 1.6;
                  scanLine.material.opacity = 0.4 + Math.sin(time * 4 + Math.PI) * 0.3;
                } else if (scanIndex >= 2 && scanIndex <= 9) {
                  // Circular scan lines (8 lines) - rotating around avatar
                  const circularIndex = scanIndex - 2;
                  const baseAngle = (circularIndex * Math.PI * 2) / 8;
                  const rotationSpeed = 0.5;
                  const currentAngle = baseAngle + time * rotationSpeed;
                  const radius = 1.5;
                  
                  scanLine.position.x = Math.cos(currentAngle) * radius;
                  scanLine.position.z = Math.sin(currentAngle) * radius + 1.7;
                  scanLine.rotation.y = currentAngle + Math.PI / 2;
                  
                  // Pulsing opacity for circular lines
                  scanLine.material.opacity = 0.4 + Math.sin(time * 2 + circularIndex) * 0.2;
                } else if (scanIndex >= 10 && scanIndex <= 11) {
                  // Front scan lines - vertical movement
                  const frontIndex = scanIndex - 10;
                  scanLine.position.y = Math.sin(time * 1.8 + frontIndex * Math.PI) * 1.2;
                  scanLine.material.opacity = 0.3 + Math.sin(time * 2.5 + frontIndex) * 0.2;
                }
              });
            }
          } else if (index === 2) { // Right avatar - clockwise
            if (isDesktopRotating) {
              ref.rotation.y = Math.PI - (time * 0.2); // 30 seconds for full rotation
            }
          }
          
           // Add glowing effect to all avatars (dynamic intensity based on speech)
           ref.traverse((child: any) => {
             if (child.isMesh && child.material) {
               // Make materials emissive for glowing effect
               if (child.material.emissive) {
                 child.material.emissive.setHex(0x39e6ff);
                 
                 // Dynamic glow intensity based on speech state
                 if (isSpeechPlaying) {
                   // Enhanced glow during speech
                   child.material.emissiveIntensity = 0.3;
                   child.material.transparent = true;
                   child.material.opacity = 0.9;
                 } else {
                   // Normal glow
                   child.material.emissiveIntensity = 0.05;
                   child.material.transparent = false;
                   child.material.opacity = 1.0;
                 }
               }
               // Ensure material is bright and glowing
               child.material.needsUpdate = true;
             }
           });
        }
      });
    }
  });

  // Handle mouse/touch interactions
  const handlePointerDown = (event: any) => {
    if (isMobile) {
      // Start user dragging on mobile
      setIsUserDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    } else {
      // Desktop center avatar interaction
      setIsDragging(true);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handleMobileAxisDrag = (event: any) => {
    if (isMobile && isUserDragging) {
      const deltaX = event.clientX - dragStart.x;
      setRotationAxis(prev => prev + deltaX * 0.01);
      setDragDirection(deltaX > 0 ? 1 : -1); // Track drag direction
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handlePointerMove = (event: any) => {
    if (isMobile) {
      handleMobileAxisDrag(event);
    } else if (isDragging && avatarRefs.current[1]) {
      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;
      
      avatarRefs.current[1].rotation.y += deltaX * 0.01;
      avatarRefs.current[1].rotation.x += deltaY * 0.01;
      
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handlePointerUp = () => {
    if (isMobile && isUserDragging) {
      // Continue rotation in the direction user was dragging
      setAxisRotationSpeed(dragDirection * 0.02);
      setIsUserDragging(false);
    } else {
      setIsDragging(false);
    }
  };

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    } else {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      
      return () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, isUserDragging, dragStart]);

  // If mascots are not visible, return null
  if (!mascotsVisible) return null;
  
  // Show models individually as they load - don't wait for all three
  const scenes = [
    gltf1?.scene?.clone() || null,
    gltf2?.scene?.clone() || null, 
    gltf3?.scene?.clone() || null
  ];

  if (isMobile) {
    // Mobile view - Triangle formation with scanning effects
    return (
      <group>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[0, 3, 3]} intensity={1.0} color="#39e6ff" />
        <pointLight position={[-2, 2, 2]} intensity={0.8} color="#39e6ff" />
        <pointLight position={[2, 2, 2]} intensity={0.8} color="#39e6ff" />
        
        {/* Triangle formation with scanning effects */}
        <group 
          rotation={[0, rotationAxis, 0]}
          onPointerDown={handlePointerDown}
        >
          {/* Triangle base beneath avatars */}
          {triangleAnimationProgress > 0 && (
            <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={3}
                  array={new Float32Array([
                    // Triangle vertices
                    0, 0, 1.5,      // Top vertex
                    -1.3, 0, -0.75, // Bottom left vertex
                    1.3, 0, -0.75   // Bottom right vertex
                  ])}
                  itemSize={3}
                />
                <bufferAttribute
                  attach="attributes-normal"
                  count={3}
                  array={new Float32Array([
                    0, 1, 0, // All normals point up
                    0, 1, 0,
                    0, 1, 0
                  ])}
                  itemSize={3}
                />
                <bufferAttribute
                  attach="index"
                  count={3}
                  array={new Uint16Array([0, 1, 2])}
                  itemSize={1}
                />
              </bufferGeometry>
              <meshStandardMaterial
                color="#39e6ff"
                transparent
                opacity={0.3}
                emissive="#39e6ff"
                emissiveIntensity={0.2}
                side={2} // DoubleSide
              />
            </mesh>
          )}
          
          {scenes.filter(scene => scene !== null).map((scene, index) => {
            // Triangle vertex positions - avatars at each vertex
            const trianglePositions = [
              [0, 0, 1.5],      // Top vertex
              [-1.3, 0, -0.75], // Bottom left vertex
              [1.3, 0, -0.75]   // Bottom right vertex
            ];
            
            // Initial straight line positions (before triangle formation)
            const straightLinePositions = [
              [-1.5, 0, 0],     // Left
              [0, 0, 0],        // Center
              [1.5, 0, 0]       // Right
            ];
            
            // Interpolate between straight line and triangle formation
            const startPos = straightLinePositions[index];
            const endPos = trianglePositions[index];
            const currentPos = [
              startPos[0] + (endPos[0] - startPos[0]) * triangleAnimationProgress,
              startPos[1] + (endPos[1] - startPos[1]) * triangleAnimationProgress,
              startPos[2] + (endPos[2] - startPos[2]) * triangleAnimationProgress
            ];
            
            // Calculate rotation to face outward from triangle center (backs to each other)
            let rotation = [0, 0, 0];
            if (triangleAnimationProgress > 0) {
              // Each avatar faces outward from the triangle center
              const centerX = 0;
              const centerZ = 0;
              const angle = Math.atan2(currentPos[0] - centerX, currentPos[2] - centerZ);
              rotation = [0, angle, 0]; // Face outward (not inward)
            }
            
            // Clone scene and add dynamic glowing materials
            const glowingScene = scene.clone();
            glowingScene.traverse((child: any) => {
              if (child.isMesh && child.material) {
                if (child.material.emissive) {
                  child.material.emissive.setHex(0x39e6ff);
                  
                  if (isSpeechPlaying) {
                    child.material.emissiveIntensity = 0.3;
                    child.material.transparent = true;
                    child.material.opacity = 0.9;
                  } else {
                    child.material.emissiveIntensity = 0.1;
                    child.material.transparent = false;
                    child.material.opacity = 1.0;
                  }
                }
                child.material.needsUpdate = true;
              }
            });
            
            return (
              <group
                key={index}
                position={currentPos as [number, number, number]}
                rotation={rotation as [number, number, number]}
              >
                <primitive 
                  object={glowingScene} 
                  scale={[1.8, 1.8, 1.8]} // Increased size
                  position={[0, 0, 0]} 
                />
              </group>
            );
          })}
        </group>
        
        {/* Triangle axis scanning effects */}
        {triangleAnimationProgress > 0 && (
          <group rotation={[0, rotationAxis, 0]}>
            {/* Rotating scan lines that follow the triangle edges */}
            {Array.from({ length: 3 }, (_, i) => {
              const vertices = [
                [0, 0, 1.5],      // Top vertex
                [-1.3, 0, -0.75], // Bottom left vertex
                [1.3, 0, -0.75]   // Bottom right vertex
              ];
              
              const startVertex = vertices[i];
              const endVertex = vertices[(i + 1) % 3];
              
              // Calculate edge direction and length
              const edgeLength = Math.sqrt(
                Math.pow(endVertex[0] - startVertex[0], 2) + 
                Math.pow(endVertex[2] - startVertex[2], 2)
              );
              
              const edgeAngle = Math.atan2(
                endVertex[2] - startVertex[2], 
                endVertex[0] - startVertex[0]
              );
              
              // Position scan line along the edge
              const midX = (startVertex[0] + endVertex[0]) / 2;
              const midZ = (startVertex[2] + endVertex[2]) / 2;
              
              return (
                <mesh 
                  key={i}
                  position={[midX, 0.05, midZ]} 
                  rotation={[0, edgeAngle, 0]}
                >
                  <planeGeometry args={[edgeLength, 0.02]} />
                  <meshStandardMaterial
                    color="#39e6ff"
                    transparent
                    opacity={0.8}
                    emissive="#39e6ff"
                    emissiveIntensity={1.0}
                  />
                </mesh>
              );
            })}
            
            {/* Central rotating scan ring */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.5, 0.7, 32]} />
              <meshStandardMaterial
                color="#00ffff"
                transparent
                opacity={0.6}
                emissive="#00ffff"
                emissiveIntensity={0.8}
                side={2} // DoubleSide
              />
            </mesh>
            
            {/* Rotating scan beams from center */}
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i * Math.PI * 2) / 6;
              const radius = 1.0;
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius;
              
              return (
                <mesh key={i} position={[x, 0.05, z]} rotation={[0, angle, 0]}>
                  <planeGeometry args={[0.8, 0.01]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? "#39e6ff" : "#00ffff"}
                    transparent
                    opacity={0.7}
                    emissive={i % 2 === 0 ? "#39e6ff" : "#00ffff"}
                    emissiveIntensity={0.9}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>
    );
  }

  // Desktop view - avatars in wide formation spanning full view width
  return (
    <group>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 3, 3]} intensity={1.0} color="#39e6ff" />
      <pointLight position={[-6, 2, 2]} intensity={0.8} color="#39e6ff" />
      <pointLight position={[6, 2, 2]} intensity={0.8} color="#39e6ff" />
      
      {/* Parent group spanning full view width */}
      <group position={[0, 0, 0]}>
        {/* Left Avatar - Far left position (20-25% from left edge) */}
        <group
          ref={(el) => (avatarRefs.current[0] = el)}
          position={[-8, 0, 0]}
          rotation={[0, 0, 0]}
        >
          {scenes[0] && <primitive object={scenes[0]} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]} />}
        </group>
        
        {/* Center Avatar - Interactive, center position */}
        <group
          ref={(el) => (avatarRefs.current[1] = el)}
          position={[0, 0, 0]}
          onPointerDown={handlePointerDown}
        >
          {scenes[1] && <primitive object={scenes[1]} scale={[2.5, 2.5, 2.5]} position={[0, 0, 0]} />}
          
          {/* Triangle Formation Scanning Effects */}
          {/* Horizontal scan lines */}
          <mesh position={[0, 0, 1.5]}>
            <planeGeometry args={[4, 0.03]} />
            <meshStandardMaterial
              color="#39e6ff"
              transparent
              opacity={0.8}
              emissive="#39e6ff"
              emissiveIntensity={1.0}
            />
          </mesh>
          <mesh position={[0, 0, 1.5]}>
            <planeGeometry args={[4, 0.02]} />
            <meshStandardMaterial
              color="#00ffff"
              transparent
              opacity={0.6}
              emissive="#00ffff"
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>
        
        {/* Right Avatar - Far right position (75-80% from left edge) */}
        <group
          ref={(el) => (avatarRefs.current[2] = el)}
          position={[8, 0, 0]}
          rotation={[0, 0, 0]}
        >
          {scenes[2] && <primitive object={scenes[2]} scale={[1.5, 1.5, 1.5]} position={[0, 0, 0]} />}
        </group>
      </group>
    </group>
  );
}

export default function QRScan() {
  console.log('QRScan: Component rendering');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [speechCompleted, setSpeechCompleted] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [mascotsVisible, setMascotsVisible] = useState(false);
  const [cycleActive, setCycleActive] = useState(false);
  const [isAxisRotating, setIsAxisRotating] = useState(false);
  const [axisRotationSpeed, setAxisRotationSpeed] = useState(0);
  const [isDesktopRotating, setIsDesktopRotating] = useState(false);
  const [showInteractionMessage, setShowInteractionMessage] = useState(true);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [scanCount, setScanCount] = useState(0);
  const [hasLoggedScan, setHasLoggedScan] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false); // Track when all 3D models are loaded
  const [scanAnimationFrame, setScanAnimationFrame] = useState(0); // For scanning line animations
  const [scanCountHighlight, setScanCountHighlight] = useState(false); // For scan count update animation
  // Removed individual model loading states - using simple modelsLoaded state

  // Initialize store state, device detection, and API
  useEffect(() => {
    // Initialize store state if needed
    const store = useAppStore.getState();
    console.log('QRScan: Store initialized:', store);
    
    // Initialize device detection
    const device = detectDevice();
    console.log('QRScan: Device detected:', device);
    
    // Initialize API connection (test connectivity)
    const testAPI = async () => {
      try {
        const count = await api.getScanCount();
        console.log('QRScan: API connection successful, scan count:', count);
      } catch (error) {
        console.warn('QRScan: API connection failed:', error);
      }
    };
    testAPI();
    
    // Store is already initialized by Zustand, no additional setup needed
  }, []);

  // Fetch scan count and log scan only if this is a genuine QR code scan
  useEffect(() => {
    const fetchScanCountAndLog = async () => {
      try {
        // Fetch current scan count
        const count = await api.getScanCount();
        setScanCount(count);
        console.log('QRScan: Current scan count:', count);

        // Check if this is a genuine QR code scan (not a page reload or navigation)
        const isQRCodeAccess = checkIfQRCodeAccess();
        
        if (isQRCodeAccess && !hasLoggedScan) {
          // Set QR access time for future reference
          sessionStorage.setItem('qr_access_time', Date.now().toString());
          
          // Mark that user has accessed QRScan page (prevents reloads from counting as first access)
          sessionStorage.setItem('has_accessed_qrscan', 'true');
          
          // Play chime sound to signal successful scan detection
          playChime();
          console.log('QRScan: Chime played - scan detected successfully');
          
          // Trigger mascots and speech after chime
          setTimeout(() => {
            setMascotsVisible(true);
            
            // Start speech after mascots appear
            setTimeout(async () => {
              await playMultiVoiceSpeech();
              setSpeechCompleted(true);
              setIsActivated(true);
            }, 1000); // 1 second delay after mascots appear
          }, 500); // 0.5 second delay after chime
          
          await api.logScan(undefined, {
            type: 'qr',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            source: 'qrscan_page',
            page: 'QRScan',
            sessionId: getSessionId()
          });
          
          // Fetch updated scan count immediately after logging
          const updatedCount = await api.getScanCount();
          setScanCount(updatedCount);
          
          // Trigger highlight animation for scan count update
          setScanCountHighlight(true);
          setTimeout(() => setScanCountHighlight(false), 2000); // Highlight for 2 seconds
          
          console.log('QRScan: Scan logged, updated count:', updatedCount);
          
          setHasLoggedScan(true);
          console.log('QRScan: Valid scan event logged (QR or direct access)');
        } else if (!isQRCodeAccess) {
          // Still mark that user has accessed QRScan page (even if not logging scan)
          sessionStorage.setItem('has_accessed_qrscan', 'true');
          console.log('QRScan: Page accessed via navigation/reload, not logging scan');
        }
      } catch (error) {
        console.warn('QRScan: Failed to fetch scan count or log scan:', error);
      }
    };

    fetchScanCountAndLog();
  }, [hasLoggedScan]);

  // Helper function to check if this is a genuine QR code access or direct URL access
  const checkIfQRCodeAccess = () => {
    // Check URL parameters for QR code indicators
    const urlParams = new URLSearchParams(window.location.search);
    const isQRParam = urlParams.get('qr') === 'true';
    const isFromQR = urlParams.get('from') === 'qr';
    
    // Check if we have a session marker indicating QR access
    const qrAccessTime = sessionStorage.getItem('qr_access_time');
    const currentTime = Date.now();
    
    // Note: Removed 30-second grace period as it was causing refresh issues
    // const isRecentQRAccess = qrAccessTime && (currentTime - parseInt(qrAccessTime)) < 30000;
    
    // Check if this is a page reload vs direct access
    const navigationType = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const isPageReload = navigationType?.type === 'reload';
    const isDirectAccess = navigationType?.type === 'navigate';
    
    // Check if user came from external source (direct URL access)
    const referrer = document.referrer;
    const isExternalAccess = !referrer || 
      (!referrer.includes(window.location.hostname) && 
       !referrer.includes('localhost') && 
       !referrer.includes('127.0.0.1'));
    
    // Check if this is the first time accessing QRScan page in this session
    const hasAccessedQRScan = sessionStorage.getItem('has_accessed_qrscan');
    const isFirstAccess = !hasAccessedQRScan;
    
    // Count as valid scan ONLY if:
    // 1. URL has QR parameters (genuine QR scan)
    // 2. Direct navigation with NO referrer (typing URL directly, bookmark, external link)
    const isValidScan = isQRParam || 
                       isFromQR || 
                       (isDirectAccess && !referrer);
    
    console.log('QRScan: Detection check:', {
      isQRParam,
      isFromQR,
      isDirectAccess,
      isExternalAccess,
      isFirstAccess,
      isPageReload,
      referrer: referrer || 'none',
      navigationType: navigationType?.type,
      hasAccessedQRScan: !!hasAccessedQRScan,
      isValidScan,
      url: window.location.href,
      logic: {
        condition1: isQRParam,
        condition2: isFromQR,
        condition3: isDirectAccess && !referrer
      }
    });
    
    return isValidScan;
  };

  // Helper function to get or create session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('scan_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('scan_session_id', sessionId);
    }
    return sessionId;
  };

  // Mark that we've accessed QRScan page in this session
  useEffect(() => {
    sessionStorage.setItem('has_accessed_qrscan', 'true');
  }, []);

  // Animation frame for scanning effects
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Hide interaction message after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInteractionMessage(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Voice configurations for three voices
  const voiceConfigs = [
    { text: "Welcome to the Gates of Display", file: "/assets/voice1.mp3" },
    { text: "from Kardiverse", file: "/assets/voice2.mp3" },
    { text: "Experience the future", file: "/assets/voice3.mp3" }
  ];

  // Play multiple voices simultaneously using local MP3 files
  const playMultiVoiceSpeech = async () => {
    try {
      setIsSpeechPlaying(true);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for each voice with different volumes and panning
      const gainNodes = voiceConfigs.map((_, index) => {
        const gainNode = audioContext.createGain();
        const pannerNode = audioContext.createStereoPanner();
        
        // Different volumes for each voice (0.3, 0.4, 0.3)
        gainNode.gain.value = index === 1 ? 0.4 : 0.3;
        
        // Different panning for spatial effect (-0.3, 0, 0.3)
        pannerNode.pan.value = (index - 1) * 0.3;
        
        gainNode.connect(pannerNode);
        pannerNode.connect(audioContext.destination);
        
        return { gainNode, pannerNode };
      });

      // Load and play all voices simultaneously
      const playPromises = voiceConfigs.map(async (config, index) => {
        try {
          const response = await fetch(config.file);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gainNodes[index].gainNode);
          
          // Start all voices at the same time
          source.start(0);
          
          return new Promise<void>((resolve) => {
            source.onended = () => resolve();
          });
        } catch (error) {
          console.warn(`Failed to load voice ${index + 1}:`, error);
          return Promise.resolve();
        }
      });

      // Wait for all voices to complete
      await Promise.all(playPromises);
      setIsSpeechPlaying(false);
      
    } catch (error) {
      console.error('Error playing multi-voice speech:', error);
      setIsSpeechPlaying(false);
      // Fallback to single voice if multi-voice fails
      const speech = new SpeechSynthesisUtterance("Welcome to the Gates of Display, from Kardiverse.");
      speech.rate = 0.8;
      speech.pitch = 1.0;
      speech.volume = 0.8;
      speechSynthesis.speak(speech);
    }
  };

  // Play chime sound
  const playChime = () => {
    try {
      const audio = new Audio('/assets/chime.mp3');
      audio.volume = 0.7;
      audio.preload = 'auto';
      
      // Add event listeners for error handling
      audio.addEventListener('error', (e) => console.error('Chime: Error loading audio', e));
      
      audio.play().then(() => {
        // Chime played successfully
      }).catch((error) => {
        console.error('Chime: Failed to play audio', error);
        // Try to play again after a short delay (for autoplay policy issues)
        setTimeout(() => {
          audio.play().catch(() => {});
        }, 100);
      });
    } catch (error) {
      console.error('Chime: Error creating audio element', error);
    }
  };

  // Handle activation button click
  const handleActivate = () => {
    if (!cycleActive) {
      setCycleActive(true);
      setShowActivateButton(false);
      setIsActivated(true);
      setSpeechCompleted(false);
      setMascotsVisible(false);
      
      // Play chime sound first
      playChime();
      
      // Show mascots after chime
      setTimeout(() => {
        setMascotsVisible(true);
        
        // Then play multi-voice speech
        setTimeout(async () => {
          await playMultiVoiceSpeech();
          setSpeechCompleted(true);
        }, 1000); // 1 second delay after chime
      }, 500); // 0.5 second delay for chime
      
      // Show activate button again after 30 seconds
      setTimeout(() => {
        setShowActivateButton(true);
        setCycleActive(false);
        setIsActivated(false);
        setSpeechCompleted(false);
        setMascotsVisible(false);
        setIsAxisRotating(false); // Stop the mobile rotation
        setAxisRotationSpeed(0); // Reset mobile rotation speed
        setIsDesktopRotating(false); // Stop the desktop rotation
      }, 30000);
    }
  };

  // Check if device is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
      
      // Determine device type based on screen size
      const mobile = width < 768;
      setIsMobile(mobile);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Responsive sizing function
  const getResponsiveSizing = () => {
    const { width, height } = screenSize;
    
    if (width < 768) {
      return {
        // Mobile
        logoFontSize: '16px',
        logoTop: '10px',
        logoLeft: '10px',
        titleFontSize: '14px',
        titleTop: '50px',
        buttonPadding: '12px 20px',
        buttonFontSize: '16px',
        buttonIconSize: '20px',
        homeButtonPadding: '6px 10px',
        homeButtonFontSize: '10px',
        subtitlePadding: '8px 12px',
        subtitleFontSize: '12px',
        subtitleBottom: '10px',
        subtitleMaxWidth: '90%',
        interactionPadding: '6px 10px',
        interactionFontSize: '10px',
        interactionBottom: '60px',
        interactionMaxWidth: '300px',
        cameraPosition: [0, 2, 8],
        cameraFov: 60
      };
    } else if (width < 1024) {
      return {
        // Tablet
        logoFontSize: '20px',
        logoTop: '15px',
        logoLeft: '15px',
        titleFontSize: '16px',
        titleTop: '60px',
        buttonPadding: '15px 25px',
        buttonFontSize: '18px',
        buttonIconSize: '24px',
        homeButtonPadding: '8px 12px',
        homeButtonFontSize: '12px',
        subtitlePadding: '10px 15px',
        subtitleFontSize: '14px',
        subtitleBottom: '15px',
        subtitleMaxWidth: '80%',
        interactionPadding: '8px 12px',
        interactionFontSize: '12px',
        interactionBottom: '70px',
        interactionMaxWidth: '350px',
        cameraPosition: [0, 1.5, 9],
        cameraFov: 55
      };
    } else {
      return {
        // Desktop
        logoFontSize: '24px',
        logoTop: '20px',
        logoLeft: '20px',
        titleFontSize: '18px',
        titleTop: '70px',
        buttonPadding: '20px 35px',
        buttonFontSize: '24px',
        buttonIconSize: '32px',
        homeButtonPadding: '10px 15px',
        homeButtonFontSize: '14px',
        subtitlePadding: '15px 20px',
        subtitleFontSize: '16px',
        subtitleBottom: '20px',
        subtitleMaxWidth: '70%',
        interactionPadding: '10px 16px',
        interactionFontSize: '14px',
        interactionBottom: '90px',
        interactionMaxWidth: '400px',
        cameraPosition: [0, 1, 10],
        cameraFov: 50
      };
    }
  };

  const responsiveSizing = getResponsiveSizing();

  // Show activate button immediately on page load
  useEffect(() => {
    setShowActivateButton(true);
  }, []);

  // Initial cycle for QR code users - show mascots and speech after scan detection
  useEffect(() => {
    // Only show mascots and start speech if this is a valid scan
    const isQRCodeAccess = checkIfQRCodeAccess();
    
    if (isQRCodeAccess) {
      // Show mascots after a short delay (chime will play when scan is detected)
      setTimeout(() => {
        setMascotsVisible(true);
        
        // Play multi-voice speech after mascots appear
        setTimeout(async () => {
          await playMultiVoiceSpeech();
          setSpeechCompleted(true);
          setIsActivated(true); // Also set activated for initial cycle
        }, 1000); // 1 second delay after mascots appear
      }, 1000); // 1 second delay after chime (chime plays when scan is detected)
      
      // Stop rotation after 30 seconds (button is already visible)
      const timer = setTimeout(() => {
        setIsAxisRotating(false); // Stop the mobile rotation
        setAxisRotationSpeed(0); // Reset mobile rotation speed
        setIsDesktopRotating(false); // Stop the desktop rotation
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Debug: Visible test element */}
      {/* HUD Background - Animation removed */}
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

      {/* 3D Canvas - Full Display Container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100vw',
          height: '100vh',
          zIndex: 2,
        }}
      >
        {/* Loading Avatar Overlays - Show 2D fallbacks only when 3D models are not loaded */}
        {!modelsLoaded && isMobile && (
          /* Single centered avatar for mobile/tablet - shows while loading or if 3D models fail */
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
            <Avatar2DFallback isActive={isActivated} scale={1.2} />
          </div>
        )}
        
        {!modelsLoaded && !isMobile && (
          /* Individual 2D fallback avatars for desktop - positioned to match exact 3D GLB positions */
          <>
            {/* Left Avatar 2D Fallback - Position matches 3D GLB at [-8, 0, 0] */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar2DFallback isActive={isActivated} scale={0.8} />
            </div>
            
            {/* Center Avatar 2D Fallback - Position matches 3D GLB at [0, 0, 0] */}
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
              <Avatar2DFallback isActive={isActivated} scale={1.0} />
            </div>
            
            {/* Right Avatar 2D Fallback - Position matches 3D GLB at [8, 0, 0] */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '90%',
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Avatar2DFallback isActive={isActivated} scale={0.8} />
            </div>
          </>
        )}

        {/* Scanning Line Animations for Avatar Containers */}
        {isMobile && (
          /* Mobile: Scanning lines for the avatar container */
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            zIndex: 50,
            pointerEvents: 'none',
            overflow: 'hidden',
            borderRadius: '50%'
          }}>
            {/* Scanning lines */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent 0px,
                  transparent 8px,
                  rgba(57, 230, 255, 0.1) 8px,
                  rgba(57, 230, 255, 0.1) 10px
                )
              `,
              transform: `translateY(${scanAnimationFrame * 2}px)`,
              animation: 'scanlineMove 2s linear infinite',
            }} />
          </div>
        )}

        {!isMobile && (
          /* Desktop: Scanning lines positioned to match exact 3D GLB avatar positions */
          <>
            {/* Left Avatar Scanning Lines - Position matches 3D GLB at [-8, 0, 0] */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '8%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '250px',
              zIndex: 50,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    transparent 8px,
                    rgba(57, 230, 255, 0.1) 8px,
                    rgba(57, 230, 255, 0.1) 10px
                  )
                `,
                transform: `translateY(${scanAnimationFrame * 2}px)`,
                animation: 'scanlineMove 2s linear infinite',
              }} />
            </div>

            {/* Center Avatar Scanning Lines - Position matches 3D GLB at [0, 0, 0] */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              height: '500px',
              zIndex: 50,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    transparent 8px,
                    rgba(57, 230, 255, 0.1) 8px,
                    rgba(57, 230, 255, 0.1) 10px
                  )
                `,
                transform: `translateY(${scanAnimationFrame * 2}px)`,
                animation: 'scanlineMove 2s linear infinite',
              }} />
            </div>

            {/* Right Avatar Scanning Lines - Position matches 3D GLB at [8, 0, 0] */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '92%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '250px',
              zIndex: 50,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    transparent 8px,
                    rgba(57, 230, 255, 0.1) 8px,
                    rgba(57, 230, 255, 0.1) 10px
                  )
                `,
                transform: `translateY(${scanAnimationFrame * 2}px)`,
                animation: 'scanlineMove 2s linear infinite',
              }} />
            </div>
          </>
        )}
        
        <Canvas
          camera={{ 
            position: responsiveSizing.cameraPosition as [number, number, number], 
            fov: responsiveSizing.cameraFov 
          }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: "high-performance",
            precision: "highp",
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: false
          }}
          dpr={[1, 2]}
          onCreated={({ gl }) => {
            // Handle WebGL context lost
            gl.domElement.addEventListener('webglcontextlost', (event) => {
              console.log('WebGL context lost, preventing default');
              event.preventDefault();
            });
            
            // Handle WebGL context restored
            gl.domElement.addEventListener('webglcontextrestored', () => {
              console.log('WebGL context restored');
              gl.domElement.dispatchEvent(new Event('resize'));
            });
          }}
        >
          <Suspense fallback={
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
              <div>Loading 3D Models...</div>
            </div>
          }>
            <AvatarScene 
              isMobile={isMobile} 
              speechCompleted={speechCompleted} 
              setSpeechCompleted={setSpeechCompleted} 
              isActivated={isActivated} 
              mascotsVisible={mascotsVisible} 
              isAxisRotating={isAxisRotating} 
              axisRotationSpeed={axisRotationSpeed} 
              isDesktopRotating={isDesktopRotating} 
              setIsAxisRotating={setIsAxisRotating} 
              setAxisRotationSpeed={setAxisRotationSpeed} 
              setIsDesktopRotating={setIsDesktopRotating} 
              isSpeechPlaying={isSpeechPlaying}
              onModelsLoaded={() => setModelsLoaded(true)}
            />
          </Suspense>
        </Canvas>
      </div>

       {/* Gates of Display Logo */}
       <div
         style={{
           position: 'absolute',
           top: responsiveSizing.logoTop,
           left: responsiveSizing.logoLeft,
           fontSize: responsiveSizing.logoFontSize,
           fontWeight: 'bold',
           color: '#39e6ff',
           textShadow: '0 0 10px rgba(57, 230, 255, 0.8)',
           zIndex: 10,
           fontFamily: 'Arial, sans-serif',
           letterSpacing: '2px',
           transition: 'all 0.3s ease'
         }}
       >
         Gates of Display
       </div>

       {/* Kardiverse Mobile View Title */}
       {isMobile && (
         <div
           style={{
             position: 'absolute',
             top: responsiveSizing.titleTop,
             left: '50%',
             transform: 'translateX(-50%)',
             fontSize: responsiveSizing.titleFontSize,
             fontWeight: 'bold',
             color: '#39e6ff',
             textShadow: '0 0 15px rgba(57, 230, 255, 1), 0 0 30px rgba(57, 230, 255, 0.5)',
             zIndex: 10,
             fontFamily: 'Arial, sans-serif',
             letterSpacing: '1px',
             textAlign: 'center',
             animation: 'pulse 2s infinite ease-in-out',
             transition: 'all 0.3s ease'
           }}
         >
           Kardiverse Mobile View - {speechCompleted ? 'Speech Complete' : 'Waiting for Speech'}
         </div>
       )}

       {/* Centered Activate Button */}
       {showActivateButton && (
         <button
           onClick={handleActivate}
           style={{
             position: 'absolute',
             top: '50%',
             left: '50%',
             transform: 'translate(-50%, -50%)',
             background: 'rgba(57, 230, 255, 0.3)',
             border: '3px solid #39e6ff',
             borderRadius: '15px',
             color: '#39e6ff',
             padding: responsiveSizing.buttonPadding,
             cursor: 'pointer',
             fontSize: responsiveSizing.buttonFontSize,
             fontWeight: 'bold',
             display: 'flex',
             alignItems: 'center',
             gap: '12px',
             zIndex: 15,
             transition: 'all 0.3s ease',
             backdropFilter: 'blur(15px)',
             boxShadow: '0 0 30px rgba(57, 230, 255, 0.8), 0 0 60px rgba(57, 230, 255, 0.4)',
             textShadow: '0 0 10px rgba(57, 230, 255, 0.8)',
             animation: 'pulse 2s infinite ease-in-out',
           }}
           onMouseEnter={(e) => {
             e.currentTarget.style.background = 'rgba(57, 230, 255, 0.4)';
             e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
             e.currentTarget.style.boxShadow = '0 0 40px rgba(57, 230, 255, 1), 0 0 80px rgba(57, 230, 255, 0.6)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.background = 'rgba(57, 230, 255, 0.3)';
             e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
             e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 230, 255, 0.8), 0 0 60px rgba(57, 230, 255, 0.4)';
           }}
         >
           <span style={{ fontSize: responsiveSizing.buttonIconSize }}>🎤</span>
           Activate Hologram
         </button>
       )}

       {/* Home Button */}
       <button
         onClick={() => navigate('/')}
         style={{
           position: 'absolute',
           top: responsiveSizing.logoTop,
           right: responsiveSizing.logoLeft,
           background: 'rgba(57, 230, 255, 0.2)',
           border: '2px solid #39e6ff',
           borderRadius: '8px',
           color: '#39e6ff',
           padding: responsiveSizing.homeButtonPadding,
           cursor: 'pointer',
           fontSize: responsiveSizing.homeButtonFontSize,
           fontWeight: 'bold',
           display: 'flex',
           alignItems: 'center',
           gap: '8px',
           zIndex: 10,
           transition: 'all 0.3s ease',
           backdropFilter: 'blur(10px)',
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
         <span>🏠</span>
         Home
       </button>

      {/* Interaction Message */}
      {showInteractionMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: responsiveSizing.interactionBottom,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #39e6ff',
            borderRadius: '10px',
            padding: responsiveSizing.interactionPadding,
            color: '#39e6ff',
            fontSize: responsiveSizing.interactionFontSize,
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(57, 230, 255, 0.5)',
            animation: 'pulse 3s infinite ease-in-out',
            maxWidth: responsiveSizing.interactionMaxWidth,
            lineHeight: '1.3',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: screenSize.width < 768 ? '14px' : screenSize.width < 1024 ? '16px' : '18px' }}>👆</span>
            <span>
              {isMobile 
                ? 'Drag to rotate avatars • Tap center avatar to interact' 
                : 'Click and drag the center avatar to view from different angles'
              }
            </span>
          </div>
        </div>
      )}

      {/* Subtitle Section - Reduced Size */}
      <div
        style={{
          position: 'absolute',
          bottom: responsiveSizing.subtitleBottom,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #39e6ff',
          borderRadius: '8px',
          padding: responsiveSizing.subtitlePadding,
          color: '#39e6ff',
          fontSize: responsiveSizing.subtitleFontSize,
          fontWeight: 'bold',
          textAlign: 'center',
          maxWidth: responsiveSizing.subtitleMaxWidth,
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
          minHeight: screenSize.width < 768 ? '35px' : screenSize.width < 1024 ? '45px' : '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        <div id="subtitle-text">
          Welcome to the Gates of Display, from Kardiverse.
        </div>
      </div>

      {/* Scan Count Display */}
      <div
        style={{
          position: 'absolute',
          top: responsiveSizing.logoTop,
          left: responsiveSizing.logoLeft,
          background: 'rgba(0, 0, 0, 0.8)',
          border: '2px solid #39e6ff',
          borderRadius: '8px',
          padding: responsiveSizing.homeButtonPadding,
          color: '#39e6ff',
          fontSize: responsiveSizing.homeButtonFontSize,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: screenSize.width < 768 ? '14px' : screenSize.width < 1024 ? '16px' : '18px' }}>📱</span>
        <span style={{
          color: scanCountHighlight ? '#39e6ff' : 'inherit',
          textShadow: scanCountHighlight ? '0 0 10px #39e6ff, 0 0 20px #39e6ff' : 'none',
          transition: 'all 0.3s ease-in-out',
          fontWeight: scanCountHighlight ? 'bold' : 'normal'
        }}>
          Scans: {scanCount}
        </span>
      </div>
    </div>
  );
}