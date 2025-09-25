import React, { useEffect, useState, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useAppStore } from "../store";
import { detectDevice } from "../utils/deviceDetection";
import api from "../config/api";
import ENV from "../config/env";

// Play chime sound function
const playChime = () => {
  try {
    const chimeAudio = new Audio("/assets/chime.mp3");
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

// Projector Scene Component
function ProjectorScene({
  isActivated,
  mascotsVisible,
  isAxisRotating,
  axisRotationSpeed,
  setAxisRotationSpeed,
  scanAnimationFrame,
  showScanLines,
  isSpeechPlaying,
  showTriangleFormation,
  triangleAnimationProgress,
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
      // Continue rotation in the direction user was dragging
      setAxisRotationSpeed(dragDirection * 0.01);
      setIsUserDragging(false);
    }
  };

  const scenes = [gltf1?.scene, gltf2?.scene, gltf3?.scene];

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
              startPos[0] + (endPos[0] - startPos[0]) * animationProgress,
              startPos[1] + (endPos[1] - startPos[1]) * animationProgress,
              startPos[2] + (endPos[2] - startPos[2]) * animationProgress,
            ];

            // Face the user when in straight line, face outward when in triangle
            let faceRotation: [number, number, number] = [0, 0, 0];
            
            if (showTriangleFormation && animationProgress > 0) {
              // Face outward from triangle center
              const angle = Math.atan2(
                (currentPos as number[])[0] - 0,
                (currentPos as number[])[2] - 0
              );
              faceRotation = [0, angle, 0];
            } else {
              // Face the user when in straight line formation
              faceRotation = [0, 0, 0];
            }

            const glowingScene = scene.clone();
            glowingScene.traverse((child: any) => {
              if (child.isMesh && child.material?.emissive) {
                child.material.emissive.setHex(0x39e6ff);
                
                // Dynamic glow intensity based on speech state
                if (isSpeechPlaying) {
                  child.material.emissiveIntensity = 0.3;
                  child.material.transparent = true;
                  child.material.opacity = 0.9;
                } else {
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
                
              </group>
            );
          })}
      </group>

      {/* Single center scan ring between all avatars */}
      {showScanLines && showTriangleFormation && triangleAnimationProgress > 0 && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.2, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            transparent
            opacity={0.6 + Math.sin(scanAnimationFrame * 0.08) * 0.3}
            emissive="#00ffff"
            emissiveIntensity={0.8}
            side={2} // DoubleSide
          />
        </mesh>
      )}
    </group>
  );
}

export default function Projector() {
  const [isActive, setIsActive] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [projectorActivated, setProjectorActivated] = useState(false);
  const [isProjectorSceneActive, setIsProjectorSceneActive] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [speechCompleted, setSpeechCompleted] = useState(false);
  const [mascotsVisible, setMascotsVisible] = useState(false);
  const [isAxisRotating, setIsAxisRotating] = useState(false);
  const [axisRotationSpeed, setAxisRotationSpeed] = useState(0);
  const [showTriangleFormation, setShowTriangleFormation] = useState(false);
  const [triangleAnimationProgress, setTriangleAnimationProgress] = useState(0);
  const [rotationAxis, setRotationAxis] = useState(0);
  const [scanAnimationFrame, setScanAnimationFrame] = useState(0);
  const [showScanLines, setShowScanLines] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showActivateButton, setShowActivateButton] = useState(false);
  const [speechBlocked, setSpeechBlocked] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  const navigate = useNavigate();

  // Play multiple voices simultaneously using local MP3 files (same as QRScan)
  const playMultiVoiceSpeech = async () => {
    try {
      console.log("Projector: Starting multi-voice speech playback");
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
          console.log(`Projector: Loading voice ${index + 1}: ${config.file}`);
          const response = await fetch(config.file);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(gainNodes[index].gainNode);
          
          // Start all voices at the same time
          source.start(0);
          console.log(`Projector: Started voice ${index + 1}`);
          
          // Simulate audio level and progress updates
          const duration = audioBuffer.duration;
          const startTime = audioContext.currentTime;
          
          const updateProgress = () => {
            const elapsed = audioContext.currentTime - startTime;
            const progress = Math.min((elapsed / duration) * 100, 100);
            setSpeechProgress(progress);
            
            // Simulate audio level (random for demo)
            const level = Math.random() * 100;
            setAudioLevel(level);
            
            if (progress < 100) {
              requestAnimationFrame(updateProgress);
            }
          };
          updateProgress();
          
          return new Promise<void>((resolve) => {
            source.onended = () => {
              console.log(`Projector: Voice ${index + 1} ended`);
              resolve();
            };
          });
        } catch (error) {
          console.warn(`Projector: Failed to load voice ${index + 1}:`, error);
          return Promise.resolve();
        }
      });

      // Wait for all voices to complete
      await Promise.all(playPromises);
      console.log("Projector: All voices completed");
      setIsSpeechPlaying(false);
      setSpeechCompleted(true);
      
      // Start triangle formation immediately after voices complete
      console.log("Projector: Starting triangle formation");
      setShowTriangleFormation(true);
      
    } catch (error) {
      console.error("Projector: Error playing multi-voice speech:", error);
      setIsSpeechPlaying(false);
      
      // If autoplay is blocked, show activate button and notification
      if ((error as any).name === 'NotAllowedError' || 
          (error as any).message?.includes('autoplay') ||
          (error as any).message?.includes('user gesture')) {
        console.log("Projector: Autoplay blocked, showing activate button and notification");
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
      console.log("Projector: Falling back to SpeechSynthesis");
      const speech = new SpeechSynthesisUtterance(
        "Welcome to the Gates of Display, from Kardiverse."
      );
      speech.rate = 0.8;
      speech.pitch = 1.0;
      speech.volume = 0.8;
      
      // Start triangle formation when fallback speech ends
      speech.onend = () => {
        console.log("Projector: Fallback speech completed, starting triangle formation");
        setShowTriangleFormation(true);
      };
      
      speechSynthesis.speak(speech);
    }
  };

  // Initialize store state, device detection, and API
  useEffect(() => {
    // Initialize store state if needed
    const store = useAppStore.getState();
    console.log('Projector: Store initialized:', store);
    
    // Initialize device detection
    const device = detectDevice();
    console.log('Projector: Device detected:', device);
    
    // Initialize API connection (test connectivity)
    const testAPI = async () => {
      try {
        const count = await api.getScanCount();
        console.log('Projector: API connection successful, scan count:', count);
      } catch (error) {
        console.warn('Projector: API connection failed:', error);
      }
    };
    testAPI();
    
    // Store is already initialized by Zustand, no additional setup needed
  }, []);

  // Mirror QRScan mobile layout counts panel
  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      try {
        const [scans, devices] = await Promise.all([
          api.getScanCount(),
          api.getDeviceCount()
        ]);
        if (!mounted) return;
        setScanCount(scans);
        setDeviceCount(devices);
      } catch (e) {
        // api.ts already logs
      }
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 5000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Activate hologram for 30 seconds
  const activate = () => {
    console.log('Projector: Activating hologram');
    setIsActive(true);
    setTimeout(() => setIsActive(false), 30000);
  };



  // Direct activation function (same as QRScan approach)
  const handleProjectorActivation = () => {
    console.log('Projector: Direct activation triggered');
    setIsProjectorMode(true);
    setIsActivated(true);
    setSpeechCompleted(false);
    setMascotsVisible(false);
    setShowTriangleFormation(false);
    setTriangleAnimationProgress(0);
    setRotationAxis(0);
    setShowScanLines(true);
    setTimerActive(true);
    setTimeRemaining(60);
    setShowActivateButton(false);
    setSpeechBlocked(false);
    setShowNotification(false);
    
    // Play chime sound first
    playChime();
    
    // Show mascots after chime
    setTimeout(() => {
      setMascotsVisible(true);
      
      // Then play multi-voice speech
      setTimeout(async () => {
        await playMultiVoiceSpeech();
      }, 1000); // 1 second delay after chime
    }, 500); // 0.5 second delay for chime
  };

  useEffect(() => {
    console.log('Projector: Component mounted');
    
    // Check if projector scene should be activated from entry page
    const shouldActivateScene = sessionStorage.getItem('activateProjectorScene');
    console.log('Projector: Checking activation flag:', shouldActivateScene);
    if (shouldActivateScene === 'true') {
      console.log('Projector: Activation flag found, starting direct activation');
      sessionStorage.removeItem('activateProjectorScene');
      
      // Direct activation - everything happens synchronously
      handleProjectorActivation();
    } else {
      console.log('Projector: No activation flag found, showing regular projector page');
      activate(); // Regular hologram activation
    }
  }, []);

  // Triangle formation animation
  useEffect(() => {
    if (showTriangleFormation) {
      setTriangleAnimationProgress(0);

      const triangleAnimation = setInterval(() => {
        setTriangleAnimationProgress((prev) => {
          if (prev >= 1) {
            clearInterval(triangleAnimation);
            // Start axis rotation after triangle formation is complete
            setIsAxisRotating(true);
            setAxisRotationSpeed(-0.01); // Reduced speed
            return 1;
          }
          return prev + 0.02;
        });
      }, 40);

      return () => clearInterval(triangleAnimation);
    }
  }, [showTriangleFormation]);

  // Timer effect for 60-second countdown
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    
    if (timerActive && !isPaused) {
      timerInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // Return to entry page when timer completes
            navigate('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerActive, isPaused, navigate]);

  // Animation frame for scanning effects
  useEffect(() => {
    const interval = setInterval(() => {
      setScanAnimationFrame((prev) => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (isProjectorMode && isActivated) {
          // Handle pause/resume in projector mode
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
            setIsAxisRotating(false);
          }
          setIsPaused(!isPaused);
        } else {
        activate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProjectorMode, isActivated, isPaused]);

  return (
    <div
      className="app-stage projector-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
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
      {/* Debug: Visible test element */}
      {/* LAYER 1: Logo with 3D Poster at Top-Left */}
      <div
        className="layer-1-logo"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* Logo Text - Left side, vertically arranged */}
        <div
          className="logo-text"
          style={{
            fontSize: "1.8em",
            color: "#39e6ff",
            fontWeight: "bold",
            textShadow: "0 0 15px #39e6ff, 0 0 30px #39e6ff",
            letterSpacing: "2px",
            textAlign: "left",
            animation: isActive ? "logoPulse 2s ease-in-out infinite" : "none",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          Gates of Display
        </div>
        
        {/* 3D Poster Image - Right side */}
        <div
          style={{
            width: "80px",
            height: "120px",
            backgroundImage: "url('/poster.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "8px",
            border: "2px solid #39e6ff",
            boxShadow: "0 0 20px rgba(57, 230, 255, 0.5), inset 0 0 10px rgba(57, 230, 255, 0.2)",
            transform: "perspective(1000px) rotateY(-15deg) rotateX(5deg)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "perspective(1000px) rotateY(-10deg) rotateX(2deg) scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(57, 230, 255, 0.7), inset 0 0 15px rgba(57, 230, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "perspective(1000px) rotateY(-15deg) rotateX(5deg) scale(1)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(57, 230, 255, 0.5), inset 0 0 10px rgba(57, 230, 255, 0.2)";
          }}
        />
      </div>

      {/* LAYER 2: Centered Kardiverse Title */}
      <div
        className="layer-2-kardiverse-title"
        style={{
          position: "absolute",
          top: "50px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 8,
        }}
      >
        <div
          className="kardiverse-title"
          style={{
            fontSize: "3em",
            color: "#39e6ff",
            fontWeight: "bold",
            textShadow: "0 0 25px #39e6ff, 0 0 50px #39e6ff, 0 0 75px #39e6ff",
            letterSpacing: "3px",
            textAlign: "center",
            animation: isActive ? "logoPulse 2s ease-in-out infinite" : "none",
          }}
        >
          Kardiverse
        </div>
      </div>

      {/* Mobile-style counts panel (top right corner) */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(0, 0, 0, 0.8)",
          border: "2px solid #39e6ff",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#39e6ff",
          fontWeight: "bold",
          fontSize: "0.95em",
          lineHeight: 1.4,
          zIndex: 12,
          boxShadow: "0 0 15px rgba(57,230,255,0.3)",
          backdropFilter: "blur(10px)",
          minWidth: 150
        }}
      >
        <div>Scan Count: {scanCount}</div>
        <div>Devices scanned: {deviceCount}</div>
      </div>

      {/* LAYER 3: Projector Scene Container */}
      {isProjectorMode && (
        <div
          className="layer-3-projector-container"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100vw",
            height: "100vh",
            zIndex: 5,
            pointerEvents: "none",
            backgroundImage: "url('/bg/stone-texture.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* HUD background */}
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

          {/* 3D Canvas */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
            <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
              <Suspense fallback={null}>
                <ProjectorScene
                  isActivated={isActivated}
                  mascotsVisible={mascotsVisible}
                  isAxisRotating={isAxisRotating}
                  axisRotationSpeed={axisRotationSpeed}
                  setAxisRotationSpeed={setAxisRotationSpeed}
                  scanAnimationFrame={scanAnimationFrame}
                  showScanLines={showScanLines}
                  isSpeechPlaying={isSpeechPlaying}
                  showTriangleFormation={showTriangleFormation}
                  triangleAnimationProgress={triangleAnimationProgress}
                  rotationAxis={rotationAxis}
                  setRotationAxis={setRotationAxis}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Vertical animated scanlines in center circle */}
          {isActivated && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                zIndex: 3,
                pointerEvents: 'none',
                overflow: 'hidden',
                borderRadius: '50%',
                background: 'radial-gradient(circle, transparent 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
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
                      rgba(57, 230, 255, 0.3) 8px,
                      rgba(57, 230, 255, 0.3) 10px
                    )
                  `,
                  transform: `translateY(${scanAnimationFrame * 2}px)`,
                  animation: 'scanlineMove 2s linear infinite',
                }}
              />
            </div>
          )}

          {/* Scanlines overlay */}
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
              onClick={() => {
                setShowActivateButton(false);
                setShowNotification(false);
                playChime();
                setTimeout(async () => {
                  await playMultiVoiceSpeech();
                }, 1000);
              }}
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
        </div>
      )}

      {/* LAYER 4: Fade in/out + Light Effect upon Activation */}
      <div
        className="layer-4-activation-effects"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {/* Activation Light Effect */}
        <div
          className="activation-light"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isActive ? "800px" : "0px",
            height: isActive ? "800px" : "0px",
            background: "radial-gradient(circle, rgba(57, 230, 255, 0.3) 0%, transparent 70%)",
            borderRadius: "50%",
            transition: "all 1s ease-in-out",
            filter: "blur(20px)",
          }}
        />
        
        {/* Fade Overlay */}
        <div
          className="fade-overlay"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: isActive 
              ? "linear-gradient(45deg, rgba(57, 230, 255, 0.1) 0%, transparent 50%, rgba(57, 230, 255, 0.1) 100%)"
              : "transparent",
            transition: "all 0.8s ease-in-out",
          }}
        />

        {/* Activation Particles */}
        {isActive && (
          <div
            className="activation-particles"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100px",
              height: "100px",
              animation: "particleFloat 3s ease-in-out infinite",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "4px",
                  height: "4px",
                  background: "#39e6ff",
                  borderRadius: "50%",
                  boxShadow: "0 0 10px #39e6ff",
                  top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 30}%`,
                  left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 30}%`,
                  animation: `particlePulse ${1 + i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>


      {/* Controls - Left bottom, vertical arrangement */}
      <div
        className="controls"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 6,
        }}
      >
        <button
          className="button"
          style={{
            background: "rgba(8,27,58,0.7)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#39e6ff",
            fontSize: "0.85em",
            boxShadow: "0 0 12px 2px #39e6ff88",
            textShadow: "0 0 4px #39e6ff88",
            border: "none",
            cursor: "pointer",
            minWidth: "140px",
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        
        <button
          className="button projector-button"
          style={{
            background: "rgba(8,27,58,0.7)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#39e6ff",
            fontSize: "0.85em",
            boxShadow: "0 0 12px 2px #39e6ff88",
            textShadow: "0 0 4px #39e6ff88",
            border: "none",
            cursor: "pointer",
            minWidth: "140px",
          }}
                 onClick={handleProjectorActivation}
        >
          🎯 Initialize 3D Projector
        </button>
        
      </div>

      {/* AI Speech Integration Panel - Bottom Right */}
      {isActivated && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            background: "rgba(8,27,58,0.8)",
            border: "2px solid #39e6ff",
            borderRadius: "8px",
            padding: "15px",
            color: "#39e6ff",
            fontSize: "0.9em",
            zIndex: 10,
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 15px rgba(57, 230, 255, 0.3)",
            minWidth: "200px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1em" }}>
            AI Speech Integration
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <span style={{ opacity: 0.8 }}>Status: </span>
            <span style={{ color: isSpeechPlaying ? "#00ff00" : "#ff6b6b" }}>
              {isSpeechPlaying ? "Speaking" : "Idle"}
            </span>
          </div>
          
          <div style={{ marginBottom: "8px" }}>
            <span style={{ opacity: 0.8 }}>Audio Level: </span>
            <span>{audioLevel.toFixed(1)}%</span>
        </div>
          
          <div style={{ marginBottom: "10px" }}>
            <span style={{ opacity: 0.8 }}>Progress: </span>
            <span>{speechProgress.toFixed(1)}%</span>
      </div>

          <div style={{ 
            fontSize: "0.8em", 
            opacity: 0.7, 
            fontStyle: "italic",
            borderTop: "1px solid rgba(57, 230, 255, 0.3)",
            paddingTop: "8px"
          }}>
            "Welcome to the Gates of Display, from Kardiverse."
          </div>
        </div>
      )}

    </div>
  );
}