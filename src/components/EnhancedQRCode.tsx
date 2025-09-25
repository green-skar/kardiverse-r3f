import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { ENV } from '../config/env';

interface EnhancedQRCodeProps {
  value?: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  marginSize?: number;
  fgColor?: string;
  bgColor?: string;
  showCount?: boolean;
  scanCount?: number;
  deviceCount?: number;
  onScan?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function EnhancedQRCode({
  value,
  size = 128,
  level = 'M',
  includeMargin = true,
  marginSize = 4,
  fgColor = '#39e6ff',
  bgColor = '#000000',
  showCount = true,
  scanCount = 0,
  deviceCount = 0,
  onScan,
  style,
  className
}: EnhancedQRCodeProps) {
  // Generate QR code URL with parameters to identify genuine scans
  const generateQRURL = () => {
    if (value) return value;
    
    const baseURL = ENV.QR_URL;
    const timestamp = Date.now();
    const params = new URLSearchParams({
      qr: 'true',
      from: 'qr',
      t: timestamp.toString()
    });
    
    return `${baseURL}?${params.toString()}`;
  };

  const qrValue = generateQRURL();
  const [isVisible, setIsVisible] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  // Animate QR code appearance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Pulse animation for scan count updates
  useEffect(() => {
    if (scanCount > 0) {
      setPulseIntensity(1.5);
      const timer = setTimeout(() => setPulseIntensity(1), 1000);
      return () => clearTimeout(timer);
    }
  }, [scanCount]);

  const qrStyle = {
    transition: 'all 0.3s ease-in-out',
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    opacity: isVisible ? 1 : 0,
    filter: `drop-shadow(0 0 ${8 * pulseIntensity}px ${fgColor}88)`,
    ...style
  };

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '15px',
        border: `2px solid ${fgColor}33`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at center, ${fgColor}11 0%, transparent 70%)`,
          animation: 'qrGlow 3s ease-in-out infinite',
          pointerEvents: 'none'
        }}
      />

      {/* QR Code Label */}
      <div
        style={{
          color: fgColor,
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: `0 0 10px ${fgColor}88`,
          letterSpacing: '1px'
        }}
      >
        Scan to enter the gates
      </div>

      {/* QR Code Container */}
      <div
        style={{
          position: 'relative',
          padding: '10px',
          background: bgColor,
          borderRadius: '10px',
          border: `2px solid ${fgColor}66`,
          boxShadow: `0 0 20px ${fgColor}44`
        }}
      >
        {/* Scan lines effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                ${fgColor}22 2px,
                ${fgColor}22 4px
              )
            `,
            animation: 'scanLines 2s linear infinite',
            pointerEvents: 'none',
            borderRadius: '8px'
          }}
        />

        {/* QR Code */}
        <QRCode
          value={qrValue}
          size={size}
          level={level}
          fgColor={fgColor}
          bgColor={bgColor}
          style={qrStyle}
        />

        {/* Corner markers */}
        <div
          style={{
            position: 'absolute',
            top: '5px',
            left: '5px',
            width: '15px',
            height: '15px',
            border: `2px solid ${fgColor}`,
            borderRight: 'none',
            borderBottom: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            width: '15px',
            height: '15px',
            border: `2px solid ${fgColor}`,
            borderLeft: 'none',
            borderBottom: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            left: '5px',
            width: '15px',
            height: '15px',
            border: `2px solid ${fgColor}`,
            borderRight: 'none',
            borderTop: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '15px',
            height: '15px',
            border: `2px solid ${fgColor}`,
            borderLeft: 'none',
            borderTop: 'none'
          }}
        />
      </div>

      {/* Count Displays */}
      {showCount && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {/* Scan Count Display */}
          <div
            style={{
              color: fgColor,
              fontSize: '12px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '8px 12px',
              borderRadius: '15px',
              border: `2px solid ${fgColor}66`,
              transition: 'all 0.3s ease',
              transform: pulseIntensity > 1 ? 'scale(1.1)' : 'scale(1)',
              boxShadow: pulseIntensity > 1 ? `0 0 15px ${fgColor}88` : `0 0 5px ${fgColor}44`,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            Scan count: {scanCount}
          </div>
          
          {/* Device Count Display */}
          <div
            style={{
              color: fgColor,
              fontSize: '12px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              padding: '8px 12px',
              borderRadius: '15px',
              border: `2px solid ${fgColor}66`,
              transition: 'all 0.3s ease',
              boxShadow: `0 0 5px ${fgColor}44`,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            Devices scanned: {deviceCount}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          color: `${fgColor}aa`,
          fontSize: '10px',
          textAlign: 'center',
          maxWidth: '200px',
          lineHeight: '1.4'
        }}
      >
        Point your camera at the QR code or use NFC on supported devices
      </div>

      <style >{`
        @keyframes qrGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        
        @keyframes scanLines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
