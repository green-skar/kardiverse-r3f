import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface AISpeechIntegrationProps {
  audioElementId?: string;
  speechText?: string;
  duration?: number;
  enableTTS?: boolean;
  enableLipSync?: boolean;
  voiceSettings?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  };
}

export default function AISpeechIntegration({
  audioElementId = 'kardi-voice',
  speechText = "Welcome to the Gates of Display, from Kardiverse.",
  duration = 15,
  enableTTS = true,
  enableLipSync = true,
  voiceSettings = {
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    voice: 'default'
  }
}: AISpeechIntegrationProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const morphsRef = useRef<any[]>([]);
  const mouthRef = useRef<any>(null);

  // Initialize audio analysis
  useEffect(() => {
    if (!enableLipSync) return;

    const audio = document.getElementById(audioElementId) as HTMLAudioElement;
    if (!audio) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      
      // Optimized settings for speech analysis
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      
      src.connect(analyser);
      analyser.connect(ctx.destination);
      
      analyserRef.current = analyser;
      audioContextRef.current = ctx;

      // Find morph targets for lip sync
      const findMorphs = () => {
        try {
          const scene = (window as any).__THREE_SCENE;
          if (!scene) return;
          
          scene.traverse((c: any) => {
            if (c.isMesh && c.morphTargetInfluences) {
              if (!morphsRef.current.includes(c)) {
                morphsRef.current.push(c);
              }
            }
          });

          // Find mouth mesh for fallback
          if (!mouthRef.current) {
            scene.traverse((c: any) => {
              if (c.name && (
                c.name.toLowerCase().includes('mouth') ||
                c.name.toLowerCase().includes('lip') ||
                c.name === '_kardi_fallback_mouth'
              )) {
                mouthRef.current = c;
              }
            });
          }
        } catch (e) {
          console.error('Error finding morphs:', e);
        }
      };

      findMorphs();
      const interval = setInterval(findMorphs, 1000);

      return () => {
        clearInterval(interval);
        try {
          analyser.disconnect();
          ctx.close();
        } catch (e) {}
      };
    } catch (e) {
      console.error('Audio context initialization failed:', e);
    }
  }, [audioElementId, enableLipSync]);

  // Enhanced lip sync with speech analysis using requestAnimationFrame
  useEffect(() => {
    if (!enableLipSync || !isSpeaking) return;

    let animationId: number;
    
    const updateLipSync = () => {
      if (!analyserRef.current) {
        animationId = requestAnimationFrame(updateLipSync);
        return;
      }

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // Speech-specific frequency analysis
    let speechSum = 0;
    let speechWeightedSum = 0;
    
    // Focus on speech frequencies (roughly 85Hz to 8kHz)
    const speechStart = Math.floor(85 / (44100 / 2) * data.length);
    const speechEnd = Math.floor(8000 / (44100 / 2) * data.length);
    
    for (let i = speechStart; i < Math.min(speechEnd, data.length); i++) {
      const value = data[i] / 255;
      speechSum += value;
      
      // Weight frequencies more heavily in the 200-2000Hz range (vowel formants)
      const freq = (i / data.length) * 22050;
      const weight = freq >= 200 && freq <= 2000 ? 1.5 : 1.0;
      speechWeightedSum += value * weight;
    }

    const speechLevel = speechWeightedSum / (speechEnd - speechStart);
    const targetLevel = Math.min(1, speechLevel * 2); // Amplify for better visibility
    
    setAudioLevel(targetLevel);

    // Apply to morph targets with speech-specific mapping
    if (morphsRef.current.length > 0) {
      morphsRef.current.forEach((m: any) => {
        const count = Math.min(8, m.morphTargetInfluences.length);
        
        // Map different speech sounds to different morph targets
        for (let i = 0; i < count; i++) {
          let morphIntensity = targetLevel;
          
          // Vary intensity based on morph target (simulate different mouth shapes)
          switch (i) {
            case 0: // A/E sounds (open mouth)
              morphIntensity = targetLevel * 1.2;
              break;
            case 1: // O/U sounds (rounded mouth)
              morphIntensity = targetLevel * 0.8;
              break;
            case 2: // I sounds (narrow mouth)
              morphIntensity = targetLevel * 0.6;
              break;
            case 3: // M/B/P sounds (closed mouth)
              morphIntensity = targetLevel * 0.4;
              break;
            default:
              morphIntensity = targetLevel * (0.5 + i * 0.1);
          }
          
          m.morphTargetInfluences[i] = THREE.MathUtils.lerp(
            m.morphTargetInfluences[i],
            Math.min(0.95, morphIntensity),
            0.4 // Faster response for speech
          );
        }
      });
      return;
    }

    // Enhanced fallback for mouth mesh
    if (mouthRef.current) {
      const targetScale = 0.3 + targetLevel * 1.4;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(
        mouthRef.current.scale.y,
        targetScale,
        0.3
      );
      
      // Add X scaling for more natural speech movement
      const targetScaleX = 0.7 + targetLevel * 0.6;
      mouthRef.current.scale.x = THREE.MathUtils.lerp(
        mouthRef.current.scale.x,
        targetScaleX,
        0.2
      );
    }

      animationId = requestAnimationFrame(updateLipSync);
    };

    animationId = requestAnimationFrame(updateLipSync);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [enableLipSync, isSpeaking]);

  // Text-to-Speech functionality
  const speakText = (text: string) => {
    if (!enableTTS || !('speechSynthesis' in window)) {
      // Fallback to audio file
      const audio = document.getElementById(audioElementId) as HTMLAudioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), duration * 1000);
      }
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.rate = voiceSettings.rate || 0.9;
    utterance.pitch = voiceSettings.pitch || 1.0;
    utterance.volume = voiceSettings.volume || 1.0;
    
    // Try to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Female') || voice.name.includes('Microsoft'))
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Speech events
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentText(text);
      setSpeechProgress(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText('');
      setSpeechProgress(0);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    // Progress tracking
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const progress = (event.charIndex / text.length) * 100;
        setSpeechProgress(progress);
      }
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Auto-speak on mount or when text changes
  useEffect(() => {
    if (speechText) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        speakText(speechText);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [speechText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0, 0, 0, 0.7)',
      color: '#39e6ff',
      padding: '10px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>
        AI Speech Integration
      </div>
      <div>Status: {isSpeaking ? 'Speaking' : 'Idle'}</div>
      <div>Audio Level: {(audioLevel * 100).toFixed(1)}%</div>
      {isSpeaking && (
        <div>
          <div>Progress: {speechProgress.toFixed(1)}%</div>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(57, 230, 255, 0.3)',
            borderRadius: '2px',
            marginTop: '5px'
          }}>
            <div style={{
              width: `${speechProgress}%`,
              height: '100%',
              background: '#39e6ff',
              borderRadius: '2px',
              transition: 'width 0.1s ease'
            }} />
          </div>
        </div>
      )}
      {currentText && (
        <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.8 }}>
          "{currentText.substring(0, 50)}{currentText.length > 50 ? '...' : ''}"
        </div>
      )}
    </div>
  );
}
