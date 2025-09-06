import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HologramScene from "../scene/HologramScene";

export default function Projector() {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  // Activate hologram for 30 seconds
  const activate = () => {
    setIsActive(true);
    const audio = document.getElementById("kardi-voice") as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
    setTimeout(() => setIsActive(false), 30000);
  };

  useEffect(() => {
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
      {/* Logo above avatar */}
      <div
        className="logo-glow"
        style={{
          fontSize: "2em",
          color: "#39e6ff",
          fontWeight: "bold",
          textShadow: "0 0 16px #39e6ff, 0 0 2px #fff",
          letterSpacing: "1.5px",
          marginBottom: "18px",
          textAlign: "center",
        }}
      >
        Gates of display
      </div>
      {/* Avatar area with glow */}
      <div
        className="avatar-area"
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "420px",
          height: "420px",
          marginBottom: "0px",
        }}
      >
        {/* Glowing circle under avatar */}
        <div
          className="avatar-glow"
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "220px",
            height: "60px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, #39e6ff88 60%, transparent 100%)",
            filter: "blur(8px)",
            zIndex: 1,
          }}
        />
        {/* Avatar */}
        <div
          className="canvas-wrapper"
          style={{
            position: "relative",
            width: "340px",
            height: "340px",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HologramScene projectorMode avatarScale={2.2} isActive={isActive} />
        </div>
      </div>
      {/* Title below avatar */}
      <div
        className="projector-label"
        style={{
          fontSize: "1.4em",
          color: "#39e6ff",
          fontWeight: "bold",
          textShadow: "0 0 16px #39e6ff, 0 0 2px #fff",
          letterSpacing: "1.5px",
          marginTop: "10px",
          textAlign: "center",
        }}
      >
        Projector Mode
      </div>
      {/* Controls */}
      <div
        className="controls small"
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "10px",
          gap: "18px",
        }}
      >
        <button
          className="button"
          style={{
            background: "rgba(8,27,58,0.7)",
            borderRadius: "12px",
            padding: "10px 24px",
            color: "#39e6ff",
            fontSize: "1em",
            boxShadow: "0 0 16px 2px #39e6ff88",
            textShadow: "0 0 6px #39e6ff88",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <div
          className="projector-controls-glow"
          style={{
            background: "rgba(8,27,58,0.7)",
            borderRadius: "12px",
            padding: "10px 24px",
            color: "#39e6ff",
            fontSize: "1em",
            boxShadow: "0 0 16px 2px #39e6ff88",
            textShadow: "0 0 6px #39e6ff88",
            textAlign: "center",
            border: "none",
          }}
        >
          Press <span style={{ fontWeight: "bold" }}>Space</span> to trigger
          hologram
        </div>
      </div>
      {/* Hidden audio element for lipsync */}
      <audio
        id="kardi-voice"
        src="/assets/welcome.mp3"
        style={{ display: "none" }}
      />
    </div>
  );
}
