import React, { useRef, useEffect, useState } from 'react';

interface CanvasVideoFallbackProps {
  duration?: number; // Duration in seconds (default: 30)
  onPlay?: () => void;
  onEnded?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function CanvasVideoFallback({
  duration = 30,
  onPlay,
  onEnded,
  style,
  className
}: CanvasVideoFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Animation variables
  const fps = 30;
  const totalFrames = duration * fps;
  let currentFrame = 0;
  let startTime = 0;

  const drawFrame = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, frame: number, time: number) => {
    const progress = frame / totalFrames;
    
    // Clear canvas
    ctx.fillStyle = '#0a2340';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0a2340');
    gradient.addColorStop(1, '#183a5a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated scan lines
    ctx.strokeStyle = `rgba(57, 230, 255, ${0.1 + Math.sin(time * 2) * 0.05})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.height; i += 20) {
      const offset = Math.sin(time * 3 + i * 0.01) * 10;
      ctx.beginPath();
      ctx.moveTo(0, i + offset);
      ctx.lineTo(canvas.width, i + offset);
      ctx.stroke();
    }

    // Draw robot avatar
    drawRobotAvatar(ctx, canvas.width, canvas.height, time, progress);

    // Draw text
    drawText(ctx, canvas.width, canvas.height, progress, time);

    // Draw particles
    drawParticles(ctx, canvas.width, canvas.height, time);
  };

  const drawRobotAvatar = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, progress: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 1 + Math.sin(time * 0.5) * 0.1;
    const rotation = time * 0.2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.rotate(rotation);

    // Robot head with glow effect
    ctx.shadowColor = '#39e6ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#39e6ff';
    ctx.beginPath();
    ctx.arc(0, -100, 80, 0, Math.PI * 2);
    ctx.fill();

    // Face screen
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#000000';
    ctx.fillRect(-30, -130, 60, 40);

    // Eyes with blinking animation
    const blink = Math.sin(time * 4) > 0.8 ? 0 : 6;
    ctx.fillStyle = '#39e6ff';
    ctx.beginPath();
    ctx.arc(-15, -120, blink, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, -120, blink, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#39e6ff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -110, 15, 0, Math.PI);
    ctx.stroke();

    // Robot body
    ctx.fillStyle = '#39e6ff';
    ctx.fillRect(-60, -20, 120, 160);

    // Chest screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(-40, 20, 80, 30);

    // KARDI text
    ctx.fillStyle = '#39e6ff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('KARDI', 0, 40);

    // Arms (animated)
    const armRotation = Math.sin(time * 3) * 0.3;
    ctx.save();
    ctx.translate(-65, 0);
    ctx.rotate(armRotation);
    ctx.fillRect(-8, -8, 16, 50);
    ctx.restore();

    ctx.save();
    ctx.translate(65, 0);
    ctx.rotate(-armRotation);
    ctx.fillRect(-8, -8, 16, 50);
    ctx.restore();

    // Legs
    ctx.fillRect(-25, 140, 25, 60);
    ctx.fillRect(0, 140, 25, 60);

    ctx.restore();
  };

  const drawText = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number, time: number) => {
    ctx.fillStyle = '#39e6ff';
    ctx.font = 'bold 96px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#39e6ff';
    ctx.shadowBlur = 20;

    // Main title with fade-in effect
    const titleOpacity = Math.min(1, progress * 3);
    ctx.globalAlpha = titleOpacity;
    ctx.fillText('KARDIVERSE', width / 2, 200);

    // Subtitle with delay
    if (progress > 0.2) {
      const subtitleOpacity = Math.min(1, (progress - 0.2) * 3);
      ctx.globalAlpha = subtitleOpacity;
      ctx.font = '48px Arial';
      ctx.fillText('Welcome to the Gates of Display', width / 2, 280);
    }

    // Progress indicator
    ctx.globalAlpha = 1;
    ctx.font = '36px Arial';
    ctx.fillText(`Demo Progress: ${Math.round(progress * 100)}%`, width / 2, height - 200);

    ctx.shadowBlur = 0;
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + time * 0.5;
      const radius = 300 + Math.sin(time * 2 + i) * 100;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;

      ctx.fillStyle = `rgba(57, 230, 255, ${0.3 + Math.sin(time * 3 + i) * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;
    
    if (elapsed >= duration) {
      // Animation complete
      setIsPlaying(false);
      setCurrentTime(duration);
      onEnded?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update current time
    setCurrentTime(elapsed);

    // Draw frame
    drawFrame(ctx, canvas, currentFrame, elapsed);
    currentFrame++;

    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  };

  const play = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setCurrentTime(0);
    currentFrame = 0;
    startTime = 0;
    onPlay?.();
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const pause = () => {
    if (!isPlaying) return;
    
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const stop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    currentFrame = 0;
    startTime = 0;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1920;
    canvas.height = 1080;

    // Draw initial frame
    drawFrame(ctx, canvas, 0, 0);
    setIsLoading(false);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a2340 0%, #183a5a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#39e6ff',
        fontSize: '20px',
        fontWeight: 'bold',
        textShadow: '0 0 20px #39e6ff',
        textAlign: 'center',
        zIndex: 10
      }}>
        Kardiverse Avatar Demo (30s)
      </div>

      {/* Canvas Container */}
      <div style={{
        position: 'relative',
        width: '90%',
        maxWidth: '800px',
        aspectRatio: '16/9',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(57, 230, 255, 0.3)',
        border: '2px solid rgba(57, 230, 255, 0.5)'
      }}>
        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#39e6ff',
            fontSize: '16px',
            zIndex: 5
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(57, 230, 255, 0.3)',
              borderTop: '3px solid #39e6ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            Loading demo...
          </div>
        )}

        {/* Canvas element */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: isLoading ? 'none' : 'block'
          }}
        />

        {/* Controls overlay */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          {/* Play/Pause button */}
          <button
            onClick={isPlaying ? pause : play}
            style={{
              background: 'rgba(57, 230, 255, 0.2)',
              border: '1px solid #39e6ff',
              color: '#39e6ff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          {/* Progress bar */}
          <div style={{
            flex: 1,
            height: '4px',
            background: 'rgba(57, 230, 255, 0.3)',
            borderRadius: '2px',
            position: 'relative'
          }}>
            <div style={{
              width: `${(currentTime / duration) * 100}%`,
              height: '100%',
              background: '#39e6ff',
              borderRadius: '2px',
              transition: 'width 0.1s ease'
            }} />
          </div>

          {/* Time display */}
          <div style={{
            color: '#39e6ff',
            fontSize: '12px',
            minWidth: '80px',
            textAlign: 'center'
          }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#39e6ff',
        fontSize: '14px',
        textAlign: 'center',
        opacity: 0.8,
        maxWidth: '80%'
      }}>
        Experience the Kardiverse Avatar in this 30-second demonstration
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
