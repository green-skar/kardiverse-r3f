// QRScanTriangle.tsx
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import Avatar2DFallback from "../components/Avatar2DFallback";

// --- Sounds --- (use same path used elsewhere in app)
const chimeAudio = new Audio("/assets/chime.mp3");

// Play chime sound function
const playChime = () => {
  try {
    chimeAudio.currentTime = 0;
    chimeAudio.volume = 0.7;
    chimeAudio.play().catch((error) => {
      console.error("Chime: Failed to play audio", error);
    });
  } catch (error) {
    console.error("Chime: Error creating audio element", error);
  }
};


// Voice configurations for three voices (same as QRScan)
const voiceConfigs = [
  { text: "Welcome to the Gates of Display", file: "/assets/voice1.mp3" },
  { text: "from Kardiverse", file: "/assets/voice2.mp3" },
  { text: "Experience the future", file: "/assets/voice3.mp3" },
];

// Preload models to avoid loading indicator
useGLTF.preload("/mascots/mascot2.glb");
useGLTF.preload("/avatar.glb");
useGLTF.preload("/mascots/mascot3.glb");

// --- Triangle Avatar Scene ---
function TriangleAvatarScene({
  isActivated,
  mascotsVisible,
  isAxisRotating,
  axisRotationSpeed,
  setIsAxisRotating,
  setAxisRotationSpeed,
  onModelsLoaded,
  scanAnimationFrame,
  showScanLines,
  isSpeechPlaying,
  showTriangleFormation,
  rotationAxis,
  setRotationAxis,
}: any) {
  // Load mascots
  let gltf1, gltf2, gltf3;
  try {
    gltf1 = useGLTF("/mascots/mascot2.glb") as any;
  } catch {
    gltf1 = null;
  }
  try {
    gltf2 = useGLTF("/avatar.glb") as any;
  } catch {
    gltf2 = null;
  }
  try {
    gltf3 = useGLTF("/mascots/mascot3.glb") as any;
  } catch {
    gltf3 = null;
  }

  const [isUserDragging, setIsUserDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragDirection, setDragDirection] = useState(0);
  const [triangleAnimationProgress, setTriangleAnimationProgress] = useState(0);

  useEffect(() => {
    if ((gltf1 || gltf2 || gltf3) && onModelsLoaded) onModelsLoaded();
  }, [gltf1, gltf2, gltf3, onModelsLoaded]);

  // After triangle formation starts → run triangle animation
  useEffect(() => {
    if (showTriangleFormation) {
      setTriangleAnimationProgress(0);

      const triangleAnimation = setInterval(() => {
        setTriangleAnimationProgress((prev) => {
          if (prev >= 1) {
            clearInterval(triangleAnimation);
            // Only start axis rotation after triangle formation is complete
            // and voices have finished playing
            if (!isSpeechPlaying) {
            setIsAxisRotating(true);
            setAxisRotationSpeed(-0.02);
            }
            return 1;
          }
          return prev + 0.02;
        });
      }, 40);

      return () => clearInterval(triangleAnimation);
    }
  }, [showTriangleFormation, isSpeechPlaying]);

  // Start axis rotation when speech finishes and triangle formation is complete
  useEffect(() => {
    if (!isSpeechPlaying && showTriangleFormation && triangleAnimationProgress >= 1) {
      setIsAxisRotating(true);
      setAxisRotationSpeed(-0.02);
    }
  }, [isSpeechPlaying, showTriangleFormation, triangleAnimationProgress]);

  // Rotation frame
  useFrame(() => {
    if (isAxisRotating && !isUserDragging && showTriangleFormation) {
      setRotationAxis((prev: number) => prev + axisRotationSpeed);
    }
  });

  // Drag handlers
  const handlePointerDown = (event: any) => {
    setIsUserDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handlePointerMove = (event: any) => {
    if (isUserDragging) {
      const deltaX = event.clientX - dragStart.x;
      setRotationAxis((prev: number) => prev + deltaX * 0.01);
      setDragDirection(deltaX > 0 ? 1 : -1);
      setDragStart({ x: event.clientX, y: event.clientY });
    }
  };

  const handlePointerUp = () => {
    if (isUserDragging) {
      setAxisRotationSpeed(dragDirection * 0.02);
      setIsUserDragging(false);
    }
  };

  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isUserDragging, dragStart]);

  if (!mascotsVisible) return null;

  const scenes = [
    gltf1?.scene?.clone() || null,
    gltf2?.scene?.clone() || null,
    gltf3?.scene?.clone() || null,
  ];

  return (
    <group>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 3, 3]} intensity={1.0} color="#39e6ff" />

      <group rotation={[0, rotationAxis, 0]} onPointerDown={handlePointerDown}>
        {scenes
          .filter((s) => s !== null)
          .map((scene, index) => {
            const trianglePositions = [
              [0, 0, 1.5],
              [-1.3, 0, -0.75],
              [1.3, 0, -0.75],
            ];
            const straightPositions = [
              [-1.5, 0, 0],
              [0, 0, 0],
              [1.5, 0, 0],
            ];

            const startPos = straightPositions[index];
            const endPos = trianglePositions[index];
            
            // Only transition to triangle formation when showTriangleFormation is true
            const animationProgress = showTriangleFormation ? triangleAnimationProgress : 0;
            
            const currentPos = [
              startPos[0] +
                (endPos[0] - startPos[0]) * animationProgress,
              startPos[1] +
                (endPos[1] - startPos[1]) * animationProgress,
              startPos[2] +
                (endPos[2] - startPos[2]) * animationProgress,
            ];

            // Face the user when in straight line, face outward when in triangle
            let faceRotation: [number, number, number] = [0, 0, 0];
            
            if (showTriangleFormation && animationProgress > 0) {
            // Face outward from triangle center like QRScan mobile
            const angle = Math.atan2(
              (currentPos as number[])[0] - 0,
              (currentPos as number[])[2] - 0
            );
            // Rotate 180° from previous orientation (direct opposite)
              faceRotation = [0, angle, 0];
            } else {
              // Face the user when in straight line formation
              faceRotation = [0, 0, 0];
            }

            const glowingScene = scene.clone();
            glowingScene.traverse((child: any) => {
              if (child.isMesh && child.material?.emissive) {
                child.material.emissive.setHex(0x39e6ff);
                
                // Dynamic glow intensity based on speech state (same as QRScan)
                if (isSpeechPlaying) {
                  // Enhanced glow during speech
                  child.material.emissiveIntensity = 0.3;
                  child.material.transparent = true;
                  child.material.opacity = 0.9;
                } else {
                  // Normal glow
                  child.material.emissiveIntensity = 0.1;
                  child.material.transparent = false;
                  child.material.opacity = 1.0;
                }
                
                if ('metalness' in child.material) child.material.metalness = 0.1;
                if ('roughness' in child.material) child.material.roughness = 0.4;
                child.material.needsUpdate = true;
              }
            });

            return (
              <group
                key={index}
                position={currentPos as [number, number, number]}
                rotation={faceRotation}
              >
                <primitive object={glowingScene} scale={[1.8, 1.8, 1.8]} />
                
                {/* Scan lines around each avatar */}
                {showScanLines && showTriangleFormation && triangleAnimationProgress > 0 && (
                  <>
                    {/* Circular scan ring */}
                    <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                      <ringGeometry args={[0.8, 1.0, 32]} />
                      <meshStandardMaterial
                        color="#00ffff"
                        transparent
                        opacity={0.6 + Math.sin(scanAnimationFrame * 0.08) * 0.3}
                        emissive="#00ffff"
                        emissiveIntensity={0.8}
                        side={2} // DoubleSide
                      />
                    </mesh>
                    
                    {/* Rotating scan beams */}
                    {Array.from({ length: 4 }, (_, beamIndex) => {
                      const angle = (beamIndex * Math.PI * 2) / 4 + scanAnimationFrame * 0.05;
                      const radius = 1.2;
                      const x = Math.cos(angle) * radius;
                      const z = Math.sin(angle) * radius;
                      
                      return (
                        <mesh key={beamIndex} position={[x, 0.05, z]} rotation={[0, angle, 0]}>
                          <planeGeometry args={[0.6, 0.01]} />
                          <meshStandardMaterial
                            color={beamIndex % 2 === 0 ? "#39e6ff" : "#00ffff"}
                            transparent
                            opacity={0.7 + Math.sin(scanAnimationFrame * 0.1 + beamIndex) * 0.2}
                            emissive={beamIndex % 2 === 0 ? "#39e6ff" : "#00ffff"}
                            emissiveIntensity={0.9}
                          />
                        </mesh>
                      );
                    })}
                  </>
                )}
              </group>
            );
          })}
      </group>
    </group>
  );
}

// --- Page wrapper ---
export default function QRScanTriangle({
  isActivated: externalIsActivated = false,
  onActivated,
  onTimerComplete,
  isPaused = false,
  onPauseToggle,
}: {
  isActivated?: boolean;
  onActivated?: () => void;
  onTimerComplete?: () => void;
  isPaused?: boolean;
  onPauseToggle?: () => void;
} = {}) {
  const [isActivated, setIsActivated] = useState(externalIsActivated);
  const [mascotsVisible, setMascotsVisible] = useState(true);
  const [isAxisRotating, setIsAxisRotating] = useState(false);
  const [axisRotationSpeed, setAxisRotationSpeed] = useState(0);
  const [scanAnimationFrame, setScanAnimationFrame] = useState(0);
  const [showScanLines, setShowScanLines] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showTriangleFormation, setShowTriangleFormation] = useState(false);
  const [rotationAxis, setRotationAxis] = useState(0);
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [speechBlocked, setSpeechBlocked] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  // Debug: Track component mounting
  useEffect(() => {
    console.log("QRScanTriangle: Component mounted/remounted");
    return () => {
      console.log("QRScanTriangle: Component unmounting");
    };
  }, []);

  // Play multiple voices simultaneously using local MP3 files (same as QRScan)
  const playMultiVoiceSpeech = async () => {
    try {
      console.log("Starting multi-voice speech playback");
      setIsSpeechPlaying(true);
      setSpeechBlocked(false);
      
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      
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
          console.log(`Loading voice ${index + 1}: ${config.file}`);
          const response = await fetch(config.file);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gainNodes[index].gainNode);
          
          // Start all voices at the same time
          source.start(0);
          console.log(`Started voice ${index + 1}`);
          
          return new Promise<void>((resolve) => {
            source.onended = () => {
              console.log(`Voice ${index + 1} ended`);
              resolve();
            };
          });
        } catch (error) {
          console.warn(`Failed to load voice ${index + 1}:`, error);
          return Promise.resolve();
        }
      });

      // Wait for all voices to complete
      await Promise.all(playPromises);
      console.log("All voices completed");
      setIsSpeechPlaying(false);
      
      // Start triangle formation immediately after voices complete
      console.log("Starting triangle formation");
      setShowTriangleFormation(true);
      
    } catch (error) {
      console.error("Error playing multi-voice speech:", error);
      setIsSpeechPlaying(false);
      
      // If autoplay is blocked, show activate button and notification
      if ((error as any).name === 'NotAllowedError' || 
          (error as any).message?.includes('autoplay') ||
          (error as any).message?.includes('user gesture')) {
        console.log("Autoplay blocked, showing activate button and notification");
        setSpeechBlocked(true);
        setShowActivateButton(true);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        return;
      }

      // Fallback to single voice if multi-voice fails
      console.log("Falling back to SpeechSynthesis");
      const speech = new SpeechSynthesisUtterance(
        "Welcome to the Gates of Display, from Kardiverse."
      );
      speech.rate = 0.8;
      speech.pitch = 1.0;
      speech.volume = 0.8;
      
      // Start triangle formation when fallback speech ends
      speech.onend = () => {
        console.log("Fallback speech completed, starting triangle formation");
        setShowTriangleFormation(true);
      };
      
      speechSynthesis.speak(speech);
    }
  };

  // Manual activation when autoplay is blocked
  const handleManualActivation = async () => {
    console.log("Projector scene: Manual activation triggered");
    setShowActivateButton(false);
    setShowNotification(false);
    playChime();
    
    // Play voices after chime
    setTimeout(async () => {
      console.log("Projector scene: Manual activation - attempting to play voices");
      await playMultiVoiceSpeech();
    }, 1000); // 1 second delay after chime
  };

  // Animation frame for scanning effects
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAnimationFrame((prev) => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Timer effect for 60-second countdown
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    
    if (timerActive && !isPaused) {
      timerInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            onTimerComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerActive, isPaused, onTimerComplete]);

  // Handle external activation
  useEffect(() => {
    if (externalIsActivated && !isActivated) {
      console.log("Projector scene: External activation triggered");
      setIsActivated(true);
      setShowScanLines(true);
      setTimerActive(true);
      setTimeRemaining(60);
      setShowTriangleFormation(false); // Start in straight line formation
      setShowActivateButton(false); // Reset button state
      setSpeechBlocked(false); // Reset speech blocked state
      
      // Force hide loading indicator after a short delay
      setTimeout(() => {
        setModelsLoaded(true);
        setSceneReady(true); // Scene is now ready for voice playback
      }, 500); // Hide loading indicator after 500ms
      
      // Fallback: Show activate button if voices don't start within 3 seconds
      setTimeout(() => {
        if (!isSpeechPlaying && !showActivateButton) {
          console.log("Projector scene: Voices timeout - showing activate button and notification");
          setSpeechBlocked(true);
          setShowActivateButton(true);
          setShowNotification(true);
          
          // Hide notification after 5 seconds
          setTimeout(() => {
            setShowNotification(false);
          }, 5000);
        }
      }, 3000);
      
      onActivated?.();
    }
  }, [externalIsActivated, isActivated, onActivated]);

  // Trigger voices when scene is ready and activated
  useEffect(() => {
    if (sceneReady && isActivated && !isSpeechPlaying) {
      console.log("Projector scene: Scene ready, playing voices");
      // Play voices immediately when scene is ready (chime already played by parent)
      setTimeout(async () => {
        console.log("Projector scene: Attempting to play voices");
        await playMultiVoiceSpeech();
      }, 500); // Small delay to ensure everything is ready
    }
  }, [sceneReady, isActivated, isSpeechPlaying]);

  // Handle pause state
  useEffect(() => {
    if (isPaused) {
      setIsAxisRotating(false);
      setShowTriangleFormation(false); // Reset to straight line when paused
      setRotationAxis(0); // Reset rotation to face user
    } else if (isActivated && !isPaused) {
      // Don't automatically start rotation on resume - let voices trigger it
      setIsAxisRotating(false);
      setAxisRotationSpeed(0);
    }
  }, [isPaused, isActivated]);

  // Space bar handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && isActivated) {
        e.preventDefault();
        
        // If speech is blocked and button is showing, activate manually
        if (speechBlocked && showActivateButton) {
          setShowNotification(false); // Hide notification immediately
          handleManualActivation();
          return;
        }
        
        if (isPaused) {
          // Resume - play chime, multi-voice speech, and reset timer
          playChime();
          setTimerActive(true);
          setTimeRemaining(60);
          
        // Play multi-voice speech after chime
        setTimeout(async () => {
          await playMultiVoiceSpeech();
        }, 1000); // 1 second delay after chime
        } else {
          // Pause - play chime and transition to straight line
          playChime();
          setShowTriangleFormation(false); // Smooth transition back to straight line
          setRotationAxis(0); // Reset rotation to face user
        }
        onPauseToggle?.();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActivated, isPaused, onPauseToggle, speechBlocked, showActivateButton]);


  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundImage: "url('/bg/stone-texture.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
             <style>
               {`
                 @keyframes scanlineMove {
                   0% { transform: translateY(-100px); }
                   100% { transform: translateY(100px); }
                 }
                 
                 @keyframes fadeInOut {
                   0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                   10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                   90% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                   100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                 }
               `}
             </style>
      {/* HUD background (matches QRScan usage of hud.png) */}
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
          pointerEvents: 'none'
        }}
      />

      {/* Cyan vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(60% 60% at 50% 45%, rgba(57,230,255,0.18) 0%, rgba(57,230,255,0.06) 40%, rgba(0,0,0,0.65) 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* 3D Canvas on top of HUD */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
          <Suspense fallback={isActivated ? null : <Avatar2DFallback isActive={false} />}>
            <TriangleAvatarScene
              isActivated={isActivated}
              mascotsVisible={mascotsVisible}
              isAxisRotating={isAxisRotating}
              axisRotationSpeed={axisRotationSpeed}
              setIsAxisRotating={setIsAxisRotating}
              setAxisRotationSpeed={setAxisRotationSpeed}
                  onModelsLoaded={() => {
                    console.log("Triangle models loaded");
                    setModelsLoaded(true);
                  }}
                  scanAnimationFrame={scanAnimationFrame}
                  showScanLines={showScanLines}
                  isSpeechPlaying={isSpeechPlaying}
                  showTriangleFormation={showTriangleFormation}
                  rotationAxis={rotationAxis}
                  setRotationAxis={setRotationAxis}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Scanlines overlay similar to QRScan mobile */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.2,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(57,230,255,0.15) 0px, rgba(57,230,255,0.15) 2px, transparent 2px, transparent 6px)'
        }}
      />

      {/* Avatar-specific scan line overlays */}
      {showScanLines && (
        <>
          {/* Left avatar scan lines */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '25%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              zIndex: 4,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            <div
              style={{
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
              }}
            />
          </div>

          {/* Center avatar scan lines */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              zIndex: 4,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            <div
              style={{
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
              }}
            />
          </div>

          {/* Right avatar scan lines */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '75%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              zIndex: 4,
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: '50%',
            }}
          >
            <div
              style={{
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
              }}
            />
          </div>
        </>
      )}


      {/* Timer display */}
      {isActivated && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #39e6ff',
            borderRadius: '8px',
            padding: '10px 15px',
            color: '#39e6ff',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
          }}
        >
          {isPaused ? 'PAUSED' : `Time: ${timeRemaining}s`}
        </div>
      )}

             {/* Notification when autoplay is blocked */}
             {isActivated && showNotification && (
               <div
                 style={{
                   position: 'absolute',
                   top: '50%',
                   left: '50%',
                   transform: 'translate(-50%, -50%)',
                   background: 'rgba(0, 0, 0, 0.9)',
                   border: '2px solid #ff6b6b',
                   borderRadius: '12px',
                   padding: '20px 30px',
                   color: '#ff6b6b',
                   fontSize: '18px',
                   fontWeight: 'bold',
                   zIndex: 15,
                   backdropFilter: 'blur(15px)',
                   boxShadow: '0 0 25px rgba(255, 107, 107, 0.5)',
                   textAlign: 'center',
                   maxWidth: '400px',
                   animation: 'fadeInOut 5s ease-in-out forwards',
                 }}
               >
                 <div style={{ marginBottom: '10px', fontSize: '24px' }}>⚠️</div>
                 <div>Audio autoplay is blocked</div>
                 <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
                   Press <span style={{ fontWeight: 'bold', color: '#39e6ff' }}>SPACE</span> to manually activate
                 </div>
               </div>
             )}

             {/* Activate button when speech is blocked */}
             {isActivated && showActivateButton && (
               <div
                 style={{
                   position: 'absolute',
                   bottom: '20px',
                   left: '50%',
                   transform: 'translateX(-50%)',
                   background: 'rgba(0, 0, 0, 0.8)',
                   border: '2px solid #39e6ff',
                   borderRadius: '8px',
                   padding: '12px 20px',
                   color: '#39e6ff',
                   fontSize: '16px',
                   fontWeight: 'bold',
                   zIndex: 10,
                   backdropFilter: 'blur(10px)',
                   boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
                   cursor: 'pointer',
                   textAlign: 'center',
                 }}
                 onClick={handleManualActivation}
               >
                 Press <span style={{ fontWeight: 'bold' }}>SPACE</span> to activate hologram
               </div>
             )}

             {/* Pause/Play instructions */}
             {isActivated && !showActivateButton && (
               <div
                 style={{
                   position: 'absolute',
                   bottom: '20px',
                   left: '50%',
                   transform: 'translateX(-50%)',
                   background: 'rgba(0, 0, 0, 0.8)',
                   border: '2px solid #39e6ff',
                   borderRadius: '8px',
                   padding: '8px 15px',
                   color: '#39e6ff',
                   fontSize: '14px',
                   fontWeight: 'bold',
                   zIndex: 10,
                   backdropFilter: 'blur(10px)',
                   boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
                 }}
               >
                 Press <span style={{ fontWeight: 'bold' }}>SPACE</span> to {isPaused ? 'resume' : 'pause'}
               </div>
             )}

      {/* Activation light bloom (subtle) */}
      {isActivated && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(57,230,255,0.25) 0%, rgba(57,230,255,0.05) 60%, transparent 70%)',
            filter: 'blur(20px)',
            zIndex: 1,
            pointerEvents: 'none',
            transition: 'all 0.8s ease-in-out'
          }}
        />
      )}
    </div>
  );
}
