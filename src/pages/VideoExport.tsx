import React, { useEffect } from 'react';
import LocalVideoExporter from '../components/LocalVideoExporter';
import { useAppStore } from '../store';
import { detectDevice } from '../utils/deviceDetection';
import api from '../config/api';
import ENV from '../config/env';

export default function VideoExport() {
  console.log('VideoExport: Component rendering');
  // Initialize store state, device detection, and API
  useEffect(() => {
    // Initialize store state if needed
    const store = useAppStore.getState();
    console.log('VideoExport: Store initialized:', store);
    
    // Initialize device detection
    const device = detectDevice();
    console.log('VideoExport: Device detected:', device);
    
    // Initialize API connection (test connectivity)
    const testAPI = async () => {
      try {
        const count = await api.getScanCount();
        console.log('VideoExport: API connection successful, scan count:', count);
      } catch (error) {
        console.warn('VideoExport: API connection failed:', error);
      }
    };
    testAPI();
    
    // Store is already initialized by Zustand, no additional setup needed
  }, []);

  const handleExportComplete = (blob: Blob) => {
    // The VideoExporter component handles its own downloads
    // This callback is kept for potential future use
    console.log('Export completed:', blob);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      padding: '20px',
      overflow: 'auto',
      position: 'relative'
    }}>
      {/* Debug: Visible test element */}
      {/* Home Button - Always visible at top */}
      <button 
        className="button home-button" 
        onClick={() => window.location.href = '/'}
        style={{
          position: 'fixed',
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

      <div className="video-export-page">
        <div className="page-header">
          <h1>🎬 Kardiverse Video Export</h1>
          <p>Create processed Kardiverse videos using local processing for beamer projection and mobile devices - no internet required!</p>
        </div>

        <LocalVideoExporter 
          onExportComplete={handleExportComplete}
        />

        <div className="technical-specs">
          <h3>🔧 Technical Specifications</h3>
          <div className="specs-grid">
            <div className="spec-card">
              <h4>🎯 Beamer Output</h4>
              <ul>
                <li>Resolution: 1920x1080 (Full HD)</li>
                <li>Quality: High (80% compression)</li>
                <li>Source: Existing Kardiverse videos</li>
                <li>Format: HLS/MP4 (Adaptive)</li>
                <li>Optimized for projection</li>
                <li>Single poster image</li>
              </ul>
            </div>
            
            <div className="spec-card">
              <h4>📱 Mobile Output</h4>
              <ul>
                <li>Resolution: 1280x720 (HD)</li>
                <li>Quality: Medium (60% compression)</li>
                <li>Source: Existing Kardiverse videos</li>
                <li>Format: HLS/MP4 (Adaptive)</li>
                <li>Mobile-optimized</li>
                <li>Single poster image</li>
              </ul>
            </div>
            
            <div className="spec-card">
              <h4>📁 Source Files</h4>
              <ul>
                <li>kardiverse-demo.mp4</li>
                <li>kardiverse-experience.mp4</li>
                <li>poster.jpg (from src/assets/)</li>
                <li>Image processing</li>
                <li>Quality optimization</li>
                <li>JPEG format output</li>
              </ul>
            </div>
            
            <div className="spec-card">
              <h4>⚡ Export Features</h4>
              <ul>
                <li>Dual format export</li>
                <li>One-click download</li>
                <li>Progress tracking</li>
                <li>Error handling</li>
                <li>Preview functionality</li>
                <li>Cross-platform compatibility</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="compatibility-info">
          <h3>🌐 Compatibility</h3>
          <div className="compatibility-grid">
            <div className="compat-item">
              <span className="compat-icon">🎯</span>
              <span>Beamer Projection Systems</span>
            </div>
            <div className="compat-item">
              <span className="compat-icon">🤖</span>
              <span>Android Browsers</span>
            </div>
            <div className="compat-item">
              <span className="compat-icon">🍎</span>
              <span>iOS Browsers</span>
            </div>
            <div className="compat-item">
              <span className="compat-icon">💻</span>
              <span>Desktop Browsers</span>
            </div>
            <div className="compat-item">
              <span className="compat-icon">📺</span>
              <span>Video Players</span>
            </div>
            <div className="compat-item">
              <span className="compat-icon">📱</span>
              <span>Mobile Apps</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .video-export-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          color: #39e6ff;
          font-size: 2.5em;
          margin-bottom: 10px;
        }

        .page-header p {
          color: #ccc;
          font-size: 1.2em;
        }


        .technical-specs {
          margin: 40px 0;
        }

        .technical-specs h3 {
          color: #39e6ff;
          text-align: center;
          margin-bottom: 30px;
          font-size: 1.8em;
        }

        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .spec-card {
          background: rgba(57, 230, 255, 0.1);
          border: 1px solid #39e6ff;
          border-radius: 10px;
          padding: 20px;
        }

        .spec-card h4 {
          color: #39e6ff;
          margin-bottom: 15px;
          font-size: 1.2em;
        }

        .spec-card ul {
          list-style: none;
          padding: 0;
        }

        .spec-card li {
          padding: 5px 0;
          border-bottom: 1px solid rgba(57, 230, 255, 0.2);
          color: #ccc;
        }

        .spec-card li:last-child {
          border-bottom: none;
        }

        .compatibility-info {
          margin: 40px 0;
        }

        .compatibility-info h3 {
          color: #39e6ff;
          text-align: center;
          margin-bottom: 30px;
          font-size: 1.8em;
        }

        .compatibility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .compat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: rgba(57, 230, 255, 0.1);
          border: 1px solid #39e6ff;
          border-radius: 8px;
          color: #ccc;
        }

        .compat-icon {
          font-size: 1.5em;
        }

        .button {
          padding: 12px 24px;
          border: none;
          border-radius: 5px;
          background: linear-gradient(45deg, #39e6ff, #ff39e6);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(57, 230, 255, 0.4);
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .video-export-page {
            padding: 15px;
          }

          .page-header h1 {
            font-size: 2em;
            margin-bottom: 8px;
          }

          .page-header p {
            font-size: 1em;
            line-height: 1.4;
          }


          .technical-specs {
            margin: 30px 0;
          }

          .technical-specs h3 {
            font-size: 1.5em;
            margin-bottom: 25px;
          }

          .specs-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .spec-card {
            padding: 20px 15px;
            border-radius: 12px;
          }

          .spec-card h4 {
            font-size: 1.1em;
            margin-bottom: 12px;
          }

          .spec-card li {
            padding: 6px 0;
            font-size: 0.9em;
            line-height: 1.3;
          }

          .compatibility-info {
            margin: 30px 0;
          }

          .compatibility-info h3 {
            font-size: 1.5em;
            margin-bottom: 25px;
          }

          .compatibility-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .compat-item {
            padding: 12px;
            border-radius: 10px;
            font-size: 0.9em;
          }

          .compat-icon {
            font-size: 1.3em;
          }

          .button {
            padding: 15px 20px;
            font-size: 1em;
            border-radius: 12px;
          }
        }

        /* Small Mobile Devices */
        @media (max-width: 480px) {
          .video-export-page {
            padding: 10px;
          }

          .page-header h1 {
            font-size: 1.7em;
          }

          .page-header p {
            font-size: 0.9em;
          }


          .technical-specs h3 {
            font-size: 1.3em;
          }

          .spec-card {
            padding: 15px 12px;
          }

          .spec-card h4 {
            font-size: 1em;
          }

          .spec-card li {
            font-size: 0.85em;
          }

          .compatibility-info h3 {
            font-size: 1.3em;
          }

          .compatibility-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .compat-item {
            padding: 10px;
            font-size: 0.85em;
          }

          .button {
            padding: 12px 15px;
            font-size: 0.95em;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .button {
            padding: 18px 24px;
            font-size: 1.05em;
          }

        }
      `}</style>
    </div>
  );
}
