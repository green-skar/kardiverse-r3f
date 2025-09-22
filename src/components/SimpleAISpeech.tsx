import React, { useRef, useEffect, useState } from 'react';

interface SimpleAISpeechProps {
  audioElementId?: string;
  speechText?: string;
  duration?: number;
  enableTTS?: boolean;
  voiceSettings?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    voice?: string;
  };
}

export default function SimpleAISpeech({
  audioElementId = 'kardi-voice',
  speechText = "Welcome to the Gates of Display, from Kardiverse.",
  duration = 15,
  enableTTS = true,
  voiceSettings = {
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    voice: 'default'
  }
}: SimpleAISpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [speechProgress, setSpeechProgress] = useState(0);
  
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    if (voices.length > 0) {
      // Prefer English voices
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      } else {
        utterance.voice = voices[0];
      }
    }

    // Speech event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentText(text);
      setSpeechProgress(0);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText('');
      setSpeechProgress(100);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setCurrentText('');
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

  // Don't auto-speak when component mounts - only when explicitly triggered
  // useEffect(() => {
  //   if (speechText) {
  //     speakText(speechText);
  //   }
  // }, [speechText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Expose speak function for external use
  const speak = (text?: string) => {
    const textToSpeak = text || speechText;
    if (textToSpeak) {
      speakText(textToSpeak);
    }
  };

  // Return null since this is a utility component
  return null;
}

// Export the speak function for external use
export const useAISpeech = (props: SimpleAISpeechProps) => {
  const componentRef = useRef<SimpleAISpeech>(null);
  
  const speak = (text?: string) => {
    if (componentRef.current) {
      componentRef.current.speak(text);
    }
  };

  return { speak };
};

