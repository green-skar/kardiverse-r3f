import React, { useEffect, useState } from "react";

interface Avatar2DFallbackProps {
  isActive?: boolean;
  scale?: number;
  color?: string;
  brandText?: string;
}

export default function Avatar2DFallback({ 
  isActive = false, 
  scale = 1.0,
  color = "#39e6ff",
  brandText = "KARDI"
}: Avatar2DFallbackProps) {
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 60);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const glowIntensity = isActive ? 1.5 : 1.0;
  const scanlineOffset = animationFrame * 2;

  return (
    <div
      style={{
        position: "relative",
        width: `${340 * scale}px`,
        height: `${340 * scale}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "50%",
        background: `
          radial-gradient(circle at center, 
            ${color}20 0%, 
            ${color}10 50%, 
            transparent 100%
          )
        `,
        boxShadow: `
          0 0 ${20 * glowIntensity}px ${color}50,
          inset 0 0 ${30 * glowIntensity}px ${color}20
        `,
      }}
    >
      {/* Scan Lines Effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 8px,
              rgba(57, 230, 255, 0.1) 8px,
              rgba(57, 230, 255, 0.1) 10px
            )
          `,
          transform: `translateY(${scanlineOffset}px)`,
          animation: "scanlineMove 2s linear infinite",
        }}
      />

      {/* Enhanced Avatar Silhouette - More Human-like */}
      <div
        style={{
          position: "relative",
          width: "80%",
          height: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          animation: isActive ? "avatarPulse 2s ease-in-out infinite" : "avatarFloat 4s ease-in-out infinite",
        }}
      >
        {/* Avatar Head - More rounded and human-like */}
        <div
          style={{
            width: "35%",
            height: "30%",
            background: `
              radial-gradient(ellipse at center, 
                rgba(57, 230, 255, 0.4) 0%, 
                rgba(102, 223, 255, 0.3) 30%,
                rgba(57, 230, 255, 0.2) 70%,
                rgba(57, 230, 255, 0.1) 100%
              )
            `,
            borderRadius: "60% 60% 50% 50%",
            position: "relative",
            marginBottom: "3%",
            boxShadow: `
              0 0 ${20 * glowIntensity}px rgba(57, 230, 255, 0.5),
              inset 0 0 ${25 * glowIntensity}px rgba(57, 230, 255, 0.3),
              0 -5px 15px rgba(57, 230, 255, 0.2)
            `,
          }}
        >
          {/* Face Features */}
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70%",
              height: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Eyes - More expressive */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: color,
                  borderRadius: "50%",
                  boxShadow: `0 0 12px ${color}, inset 0 0 4px rgba(255,255,255,0.3)`,
                }}
              />
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: color,
                  borderRadius: "50%",
                  boxShadow: `0 0 12px ${color}, inset 0 0 4px rgba(255,255,255,0.3)`,
                }}
              />
            </div>
            
            {/* Nose */}
            <div
              style={{
                width: "3px",
                height: "4px",
                background: `linear-gradient(to bottom, ${color}, transparent)`,
                borderRadius: "50%",
                marginBottom: "2px",
                opacity: 0.7,
              }}
            />
            
            {/* Mouth - More natural */}
            <div
              style={{
                width: "16px",
                height: "6px",
                background: `linear-gradient(45deg, transparent, ${color}, transparent)`,
                borderRadius: "0 0 16px 16px",
                boxShadow: `0 0 8px ${color}`,
              }}
            />
          </div>
        </div>

        {/* Avatar Body - More human-like proportions */}
        <div
          style={{
            width: "45%",
            height: "50%",
            background: `
              linear-gradient(135deg, 
                rgba(57, 230, 255, 0.4) 0%, 
                rgba(102, 223, 255, 0.3) 25%,
                rgba(57, 230, 255, 0.2) 50%,
                rgba(102, 223, 255, 0.3) 75%,
                rgba(57, 230, 255, 0.4) 100%
              )
            `,
            borderRadius: "15px 15px 8px 8px",
            position: "relative",
            boxShadow: `
              0 0 ${18 * glowIntensity}px rgba(57, 230, 255, 0.5),
              inset 0 0 ${22 * glowIntensity}px rgba(57, 230, 255, 0.3),
              0 5px 15px rgba(57, 230, 255, 0.2)
            `,
          }}
        >
          {/* Chest Details */}
          <div
            style={{
              position: "absolute",
              top: "15%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              height: "25%",
              background: `
                radial-gradient(ellipse at center,
                  rgba(0, 0, 0, 0.1) 0%,
                  rgba(57, 230, 255, 0.2) 50%,
                  rgba(0, 0, 0, 0.1) 100%
                )
              `,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              color: "#ffffff",
              fontFamily: "monospace",
              textShadow: `0 0 6px ${color}`,
              fontWeight: "bold",
            }}
          >
            {brandText}
          </div>
          
          {/* Body Lines */}
          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              borderRadius: "1px",
              opacity: 0.6,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "65%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50%",
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              borderRadius: "1px",
              opacity: 0.4,
            }}
          />
        </div>

        {/* Arms */}
        <div
          style={{
            position: "absolute",
            top: "25%",
            left: "10%",
            width: "12%",
            height: "35%",
            background: `
              linear-gradient(45deg, 
                rgba(57, 230, 255, 0.3) 0%, 
                rgba(102, 223, 255, 0.2) 50%, 
                rgba(57, 230, 255, 0.3) 100%
              )
            `,
            borderRadius: "8px",
            boxShadow: `0 0 ${12 * glowIntensity}px rgba(57, 230, 255, 0.4)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "25%",
            right: "10%",
            width: "12%",
            height: "35%",
            background: `
              linear-gradient(45deg, 
                rgba(57, 230, 255, 0.3) 0%, 
                rgba(102, 223, 255, 0.2) 50%, 
                rgba(57, 230, 255, 0.3) 100%
              )
            `,
            borderRadius: "8px",
            boxShadow: `0 0 ${12 * glowIntensity}px rgba(57, 230, 255, 0.4)`,
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 120 * scale;
        const x = Math.cos(angle + animationFrame * 0.1) * radius;
        const y = Math.sin(angle + animationFrame * 0.1) * radius;
        
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(${x}px, ${y}px)`,
              width: "4px",
              height: "4px",
              background: color,
              borderRadius: "50%",
              boxShadow: `0 0 8px ${color}`,
              opacity: 0.6 + Math.sin(animationFrame * 0.2 + i) * 0.4,
            }}
          />
        );
      })}

      {/* Status Indicator */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "12px",
          height: "12px",
          background: isActive ? "#00ff00" : color,
          borderRadius: "50%",
          boxShadow: `0 0 ${8 * glowIntensity}px ${isActive ? "#00ff00" : color}`,
          animation: isActive ? "statusBlink 1s ease-in-out infinite" : "none",
        }}
      />

      {/* Data Stream Lines */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "2px",
          height: "60px",
          background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
          opacity: 0.6,
          animation: "dataStream 2s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "30px",
          width: "2px",
          height: "40px",
          background: `linear-gradient(to bottom, transparent, ${color}, transparent)`,
          opacity: 0.4,
          animation: "dataStream 2s linear infinite 0.5s",
        }}
      />

    </div>
  );
}
