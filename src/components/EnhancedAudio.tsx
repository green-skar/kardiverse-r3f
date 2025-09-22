import React, { useRef, useEffect, useState } from 'react';

interface EnhancedAudioProps {
  id: string;
  src: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: any) => void;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  preload?: 'none' | 'metadata' | 'auto';
  crossOrigin?: string;
  style?: React.CSSProperties;
}

export default function EnhancedAudio({
  id,
  src,
  onPlay,
  onPause,
  onEnded,
  onError,
  autoPlay = false,
  loop = false,
  volume = 1.0,
  preload = 'auto',
  crossOrigin = 'anonymous',
  style = { display: 'none' }
}: EnhancedAudioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Audio event listeners
    const handleLoadStart = () => {
      setIsLoaded(false);
      setError(null);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleCanPlay = () => {
      setIsLoaded(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleError = (e: any) => {
      const errorMessage = `Audio error: ${e.target?.error?.message || 'Unknown error'}`;
      setError(errorMessage);
      setIsPlaying(false);
      onError?.(e);
    };

    const handleVolumeChange = () => {
      // Volume change handling if needed
    };

    // Add event listeners
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);
    audio.addEventListener('volumechange', handleVolumeChange);

    // Set initial properties
    audio.volume = volume;
    audio.loop = loop;
    audio.preload = preload;
    audio.crossOrigin = crossOrigin;

    // Auto-play if requested
    if (autoPlay && isLoaded) {
      audio.play().catch((e) => {
        console.warn('Auto-play failed:', e);
      });
    }

    return () => {
      // Cleanup event listeners
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [src, volume, loop, preload, crossOrigin, autoPlay, isLoaded, onPlay, onPause, onEnded, onError]);

  // Public methods for external control
  const play = () => {
    const audio = audioRef.current;
    if (audio && isLoaded) {
      return audio.play();
    }
    return Promise.reject(new Error('Audio not loaded'));
  };

  const pause = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const setCurrentTimeValue = (time: number) => {
    const audio = audioRef.current;
    if (audio && isLoaded) {
      audio.currentTime = Math.max(0, Math.min(time, duration));
    }
  };

  const setVolumeValue = (vol: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.max(0, Math.min(vol, 1));
    }
  };

  // Expose methods via ref
  useEffect(() => {
    if (audioRef.current) {
      (audioRef.current as any).enhancedAudio = {
        play,
        pause,
        stop,
        setCurrentTime: setCurrentTimeValue,
        setVolume: setVolumeValue,
        isLoaded,
        isPlaying,
        currentTime,
        duration,
        error
      };
    }
  }, [isLoaded, isPlaying, currentTime, duration, error]);

  return (
    <audio
      ref={audioRef}
      id={id}
      src={src}
      style={style}
      preload={preload}
      crossOrigin={crossOrigin}
    />
  );
}

// Hook for using enhanced audio
export function useEnhancedAudio(id: string, src: string, options?: Partial<EnhancedAudioProps>) {
  const [audioState, setAudioState] = useState({
    isLoaded: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    error: null as string | null
  });

  const play = () => {
    const audio = document.getElementById(id) as any;
    if (audio?.enhancedAudio) {
      return audio.enhancedAudio.play();
    }
    return Promise.reject(new Error('Enhanced audio not found'));
  };

  const pause = () => {
    const audio = document.getElementById(id) as any;
    if (audio?.enhancedAudio) {
      audio.enhancedAudio.pause();
    }
  };

  const stop = () => {
    const audio = document.getElementById(id) as any;
    if (audio?.enhancedAudio) {
      audio.enhancedAudio.stop();
    }
  };

  const setCurrentTime = (time: number) => {
    const audio = document.getElementById(id) as any;
    if (audio?.enhancedAudio) {
      audio.enhancedAudio.setCurrentTime(time);
    }
  };

  const setVolume = (volume: number) => {
    const audio = document.getElementById(id) as any;
    if (audio?.enhancedAudio) {
      audio.enhancedAudio.setVolume(volume);
    }
  };

  return {
    ...audioState,
    play,
    pause,
    stop,
    setCurrentTime,
    setVolume
  };
}
