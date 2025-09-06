import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import HologramScene from "../scene/HologramScene";
import QRCode from "react-qr-code";
import axios from "axios";

const QR_URL = "https://kardiverse-r3f.onrender.com/";

export default function Entry() {
  const [scanCount, setScanCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [autoActivateAllowed, setAutoActivateAllowed] = useState(false);
  const prevScanCount = useRef(0);
  const isFirstLoad = useRef(true);

  // Fetch scan count from server
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/log?type=scan");
        const data = await res.json();
        setScanCount(data.count || 0);
      } catch {}
    }
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Log scan event on page load
  useEffect(() => {
    axios.post("/api/log", { type: "scan", ts: Date.now() }).catch(() => {});
  }, []);

  // Activate hologram (avatar animation + voice)
  const activate = () => {
    setIsActive(true);
    setHasInteracted(true);
    setAutoActivateAllowed(true); // Allow auto-activation after first interaction
    const audio = document.getElementById("kardi-voice") as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
    setTimeout(() => setIsActive(false), 30000); // 30 seconds
  };

  // Detect QR scan (scanCount increases), but skip on first load
  useEffect(() => {
    if (isFirstLoad.current) {
      prevScanCount.current = scanCount;
      isFirstLoad.current = false;
      return;
    }
    if (
      scanCount > prevScanCount.current && // scanCount increased
      !hasInteracted // only if user hasn't interacted yet
    ) {
      activate();
    }
    prevScanCount.current = scanCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanCount]);

  return (
    <div className="app-stage" style={{ position: "relative" }}>
      <div className="main-row">
        {/* Left: Logo, QR code, buttons */}
        <div className="left-col">
          <div className="logo-glow">Gates of display</div>
          <div className="qr-controls-section">
            <div className="qr-section">
              <div className="qr-label">Scan to enter the gates</div>
              <QRCode
                value={QR_URL}
                size={128}
                fgColor="#39e6ff"
                bgColor="transparent"
                style={{ boxShadow: "0 0 16px #39e6ff88", borderRadius: 8 }}
              />
              <div className="qr-count">Devices scanned: {scanCount}</div>
            </div>
            <div className="controls">
              <button className="button" onClick={activate}>
                Activate Hologram
              </button>
              <Link to="/projector">
                <button className="button">Open Projector</button>
              </Link>
              <Link to="/remote">
                <button className="button">Remote</button>
              </Link>
            </div>
          </div>
        </div>
        {/* Right: Title and avatar */}
        <div className="right-col">
          <div className="kardiverse-title">Kardiverse</div>
          <div className="avatar-area">
            <div className="avatar-glow"></div>
            <div className="canvas-wrapper">
              <HologramScene entryMode avatarScale={1.8} isActive={isActive} />
            </div>
          </div>
        </div>
      </div>
      <audio
        id="kardi-voice"
        src="/assets/welcome.mp3"
        style={{ display: "none" }}
      />
    </div>
  );
}
