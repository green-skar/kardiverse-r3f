import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import HologramScene from "../scene/HologramScene";
import SimpleAISpeech from "../components/SimpleAISpeech";
import ScanTrigger from "../components/ScanTrigger";
import EnhancedQRCode from "../components/EnhancedQRCode";
import api from "../config/api";
import ENV from "../config/env";
import { detectDevice, shouldRedirectToMobile, shouldRedirectToProjector } from "../utils/deviceDetection";
import { enhancedModelCache } from "../utils/modelCache";

export default function Entry() {
  const [scanCount, setScanCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [autoActivateAllowed, setAutoActivateAllowed] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [preloadComplete, setPreloadComplete] = useState(false);
  const [speechTriggered, setSpeechTriggered] = useState(false);
  const [lastActivationTime, setLastActivationTime] = useState(0);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const prevScanCount = useRef(0);
  const isFirstLoad = useRef(true);
  const navigate = useNavigate();

  // Fetch scan count and device count from server
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [scanCountData, deviceCountData] = await Promise.all([
          api.getScanCount(),
          api.getDeviceCount()
        ]);
        setScanCount(scanCountData);
        setDeviceCount(deviceCountData);
        console.log('Counts updated - Scan:', scanCountData, 'Devices:', deviceCountData);
      } catch (error) {
        console.warn('Failed to fetch counts:', error);
        // Keep the current counts if API fails
      }
    };

    // Fetch immediately
    fetchCounts();
    
    // Set up interval to fetch every 5 seconds
    const interval = setInterval(fetchCounts, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Detect device capabilities on mount
  useEffect(() => {
    const device = detectDevice();
    setDeviceInfo(device);
    console.log('Device detected:', device);
  }, []);

  // Enhanced activation handler with device-based redirection
  // AI Speech function - can be called when 3D scene renders or 2D fallback appears
  const triggerAISpeech = () => {
    if (speechTriggered) {
      console.log('AI Speech already triggered, skipping');
      return;
    }

    // Clear any existing speech timeout
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    setSpeechTriggered(true);
    console.log('Entry: Triggering AI Speech - Scene rendered successfully');
    
    // Add a delay before speaking to ensure scene is fully rendered
    speechTimeoutRef.current = setTimeout(() => {
      // Use Web Speech API for AI-generated voice
      if ('speechSynthesis' in window) {
        // Stop any existing speech first
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance("Welcome to the Gates of Display, from Kardiverse.");
        utterance.rate = 0.8; // Slightly slower for better clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to find a suitable English voice
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
          if (englishVoices.length > 0) {
            utterance.voice = englishVoices[0];
          } else {
            utterance.voice = voices[0];
          }
        }
        
        utterance.onstart = () => {
          console.log('AI Speech started');
        };
        
        utterance.onend = () => {
          console.log('AI Speech ended');
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback - no audio file, just log
        console.log('Speech synthesis not available');
      }
    }, 1000); // 1 second delay to ensure scene is fully rendered
  };

  const handleActivation = () => {
    // Check if device should be redirected to mobile video
    if (deviceInfo && shouldRedirectToMobile(deviceInfo)) {
      console.log('Mobile/tablet device detected, redirecting to mobile page');
      navigate('/mobile');
      return;
    }

    // Check cooldown period - prevent rapid clicking
    const now = Date.now();
    const timeSinceLastActivation = now - lastActivationTime;
    if (timeSinceLastActivation < 10000) { // 10 second cooldown
      console.log(`Entry: Activation on cooldown, please wait ${Math.ceil((10000 - timeSinceLastActivation) / 1000)} more seconds`);
      return;
    }

    // Note: Scan count is now only incremented when someone actually scans the QR code
    // This activation is just for local hologram display, not a scan event
    
    console.log('Entry: Activate button clicked');
    setLastActivationTime(now);
    setIsActive(true);
    setHasInteracted(true);
    setSpeechTriggered(false); // Reset speech trigger for new activation
    
    // Set up fallback timeout - if neither 3D scene nor 2D fallback triggers speech within 5 seconds, trigger it anyway
    const fallbackTimeout = setTimeout(() => {
      if (!speechTriggered) {
        console.log('Entry: Fallback timeout - triggering AI speech after 5 seconds');
        triggerAISpeech();
      }
    }, 5000);
    
    // Store timeout reference to clear it if speech is triggered earlier
    (window as any).speechFallbackTimeout = fallbackTimeout;
    
    setTimeout(() => setIsActive(false), 30000); // 30 seconds
  };

  // Cleanup function to clear timeouts
  const cleanupTimeouts = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    if ((window as any).speechFallbackTimeout) {
      clearTimeout((window as any).speechFallbackTimeout);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupTimeouts();
    };
  }, []);


  // Legacy activate function for backward compatibility
  const activate = () => {
    handleActivation();
  };

  // Handle projector button click
  const handleProjectorClick = () => {
    // Redirect mobile/tablet devices to QR scan page
    if (deviceInfo && shouldRedirectToMobile(deviceInfo)) {
      console.log('Mobile/tablet device detected, redirecting to QR scan page');
      navigate('/qr-scan');
    } else {
      console.log('Desktop/laptop device detected, redirecting to projector page');
      // Store activation flag for projector scene
      sessionStorage.setItem('activateProjectorScene', 'true');
      console.log('Entry: Set activation flag in sessionStorage');
      navigate('/projector');
    }
  };

  return (
    <div className="app-stage" style={{ position: "relative" }}>
      {/* Enhanced Scan Trigger System */}
      <ScanTrigger
        onActivation={handleActivation}
        enableNFC={false}
        enableQR={true}
        enableAutoDetection={false}
        scanTimeout={30000}
        debugMode={false}
      />
      
      {/* Home Button - Always visible at top */}
      <button 
        className="button home-button" 
        onClick={() => window.location.href = '/'}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          background: 'rgba(8,27,58,0.8)',
          borderRadius: '12px',
          padding: '12px 20px',
          color: '#39e6ff',
          fontSize: '1em',
          boxShadow: '0 0 16px 2px #39e6ff88',
          textShadow: '0 0 6px #39e6ff88',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(8,27,58,0.9)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 0 20px 2px #39e6ffaa';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(8,27,58,0.8)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 0 16px 2px #39e6ff88';
        }}
      >
        <span style={{ fontSize: '1.2em' }}>🏠</span>
        <span>Home</span>
      </button>
      
      {/* Main Content */}
      {!isActive ? (
        /* Dashboard View - QR Code and Buttons */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '40px'
        }}>
          {/* QR Code Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <EnhancedQRCode
              value={ENV.QR_URL}
              size={200}
              scanCount={scanCount}
              deviceCount={deviceCount}
              onScan={handleActivation}
            />
          </div>
          
          {/* Bottom Buttons */}
          <div className="controls" style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <button className="button" onClick={activate}>
              Activate Hologram
            </button>
            <button className="button" onClick={handleProjectorClick}>
              Open Projector
            </button>
            <Link to="/video-export">
              <button className="button">🎬 Video Export</button>
            </Link>
          </div>
        </div>
      ) : (
        /* Hologram View - Avatar Display */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          position: 'relative'
        }}>
          {/* Title */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#39e6ff',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '0 0 20px #39e6ff',
            zIndex: 10
          }}>
            Kardiverse Avatar
          </div>
          
          {/* Avatar Area */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HologramScene 
              entryMode={false} 
              avatarScale={1.3} 
              isActive={isActive}
              onModelLoaded={() => {
                setModelLoaded(true);
                // Clear fallback timeout and trigger AI speech when 3D scene renders
                if ((window as any).speechFallbackTimeout) {
                  clearTimeout((window as any).speechFallbackTimeout);
                }
                triggerAISpeech();
              }}
              onPreloadComplete={() => setPreloadComplete(true)}
              on2DFallback={() => {
                // Clear fallback timeout and trigger AI speech when 2D fallback appears
                if ((window as any).speechFallbackTimeout) {
                  clearTimeout((window as any).speechFallbackTimeout);
                }
                triggerAISpeech();
              }}
            />
          </div>
          
          {/* Back Button */}
          <button 
            className="button" 
            onClick={() => {
              cleanupTimeouts();
              setIsActive(false);
            }}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10
            }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
      
      {/* Simple AI Speech Integration */}
      <SimpleAISpeech
        audioElementId="kardi-voice"
        speechText="Welcome to the Gates of Display, from Kardiverse."
        duration={15}
        enableTTS={true}
        voiceSettings={{
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0,
          voice: 'default'
        }}
      />
      
      {/* Enhanced audio element for lipsync - removed welcome.mp3 to use AI speech only */}
    </div>
  );
}
