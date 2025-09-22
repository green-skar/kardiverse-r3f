import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HologramScene from "../scene/HologramScene";
import AISpeechIntegration from "../components/AISpeechIntegration";
import EnhancedAudio from "../components/EnhancedAudio";
import { useAppStore } from "../store";
import { detectDevice } from "../utils/deviceDetection";
import api from "../config/api";
import ENV from "../config/env";

export default function Projector() {
  const [isActive, setIsActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  const navigate = useNavigate();

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

  // Activate hologram for 30 seconds with enhanced AI speech
  const activate = () => {
    console.log('Projector: Activating hologram');
    setIsActive(true);
    
    // Use enhanced audio if available, fallback to standard
    const audio = document.getElementById("kardi-voice") as any;
    if (audio?.enhancedAudio) {
      audio.enhancedAudio.play().catch(() => {});
    } else if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    
    setTimeout(() => setIsActive(false), 30000);
  };

  // Initialize projector mode for 3D projection
  const initializeProjector = () => {
    setIsProjectorMode(true);
    setIsActive(true);
    
    // Use enhanced audio if available, fallback to standard
    const audio = document.getElementById("kardi-voice") as any;
    if (audio?.enhancedAudio) {
      audio.enhancedAudio.play().catch(() => {});
    } else if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    
    // Projector mode runs indefinitely until manually stopped
    console.log('3D Projector mode initialized');
  };

  useEffect(() => {
    console.log('Projector: Component mounted, auto-activating');
    activate();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        activate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      {/* LAYER 3: Large Hologram Container */}
      <div
        className="layer-3-hologram-container"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "600px",
          height: "600px",
          zIndex: 5,
          marginTop: "100px",
        }}
      >
        {/* Large Avatar Canvas */}
        <div
          className="canvas-wrapper"
          style={{
            position: "relative",
            width: "500px",
            height: "500px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "25px",
            backdropFilter: "blur(15px)",
            background: "rgba(0, 0, 0, 0.3)",
            border: "2px solid rgba(57, 230, 255, 0.5)",
            boxShadow: "0 0 60px rgba(57, 230, 255, 0.4), inset 0 0 30px rgba(57, 230, 255, 0.1)",
            overflow: "hidden",
          }}
        >
          <HologramScene 
            projectorMode={isProjectorMode}
            avatarScale={1.4} 
            isActive={isActive}
            onModelLoaded={() => setModelLoaded(true)}
            onPreloadComplete={() => {/* Optional: track preload completion */}}
            on2DFallback={() => {/* Optional: handle 2D fallback */}}
          />
        </div>
      </div>

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


      {/* Controls - Right bottom, vertical arrangement */}
      <div
        className="controls"
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
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
          onClick={initializeProjector}
        >
          🎯 Initialize 3D Projector
        </button>
        
        <div
          className="projector-controls-glow"
          style={{
            background: "rgba(8,27,58,0.7)",
            borderRadius: "8px",
            padding: "8px 16px",
            color: "#39e6ff",
            fontSize: "0.85em",
            boxShadow: "0 0 12px 2px #39e6ff88",
            textShadow: "0 0 4px #39e6ff88",
            textAlign: "center",
            border: "none",
            minWidth: "140px",
          }}
        >
          Press <span style={{ fontWeight: "bold" }}>Space</span> to trigger
          hologram
        </div>
      </div>

      {/* Enhanced AI Speech Integration */}
      {isActive && (
        <AISpeechIntegration
          audioElementId="kardi-voice"
          speechText="Welcome to the Gates of Display, from Kardiverse."
          duration={15}
          enableTTS={true}
          enableLipSync={true}
          voiceSettings={{
            rate: 0.9,
            pitch: 1.0,
            volume: 1.0,
            voice: 'default'
          }}
        />
      )}
      
      {/* Enhanced audio element for lipsync */}
      <EnhancedAudio
        id="kardi-voice"
        src="/assets/welcome.mp3"
        volume={1.0}
        preload="auto"
        crossOrigin="anonymous"
        onPlay={() => console.log('AI Speech started')}
        onEnded={() => console.log('AI Speech ended')}
        onError={(error) => console.error('AI Speech error:', error)}
      />
    </div>
  );
}