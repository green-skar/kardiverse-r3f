import React, { useState, useRef, useEffect } from 'react';
import { api } from '../config/api';
import { localVideoProcessor, VideoProcessingOptions, ProcessingProgress } from '../utils/localVideoProcessor';

interface LocalVideoExporterProps {
  onExportComplete?: (blob: Blob) => void;
  onProgress?: (progress: number) => void;
}

// Video data - same as in Mobile.tsx
const videos = [
  {
    id: 1,
    title: "Welcome to Kardiverse",
    src: `${window.location.origin}/assets/kardiverse-demo.mp4`,
    poster: `${window.location.origin}/assets/poster.jpg`
  },
  {
    id: 2,
    title: "Kardiverse Experience",
    src: `${window.location.origin}/assets/kardiverse-experience.mp4`,
    poster: `${window.location.origin}/assets/poster.jpg`
  }
];

export default function LocalVideoExporter({ onExportComplete, onProgress }: LocalVideoExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'beamer' | 'mobile' | 'both'>('both');
  const [selectedVideo, setSelectedVideo] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exportedVideos, setExportedVideos] = useState<{beamer?: Blob, mobile?: Blob}>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local video processing function
  const processVideoLocally = async (videoSrc: string, type: 'beamer' | 'mobile'): Promise<Blob> => {
    try {
      setCurrentStep(`Processing video locally for ${type} format...`);
      
      // Define processing options based on type
      const options: VideoProcessingOptions = {
        width: type === 'beamer' ? 1920 : 1280,
        height: type === 'beamer' ? 1080 : 720,
        frameRate: type === 'beamer' ? 30 : 24,
        bitrate: type === 'beamer' ? 8000000 : 4000000, // 8 Mbps for beamer, 4 Mbps for mobile
        format: type
      };

      // Process video using local processor
      const blob = await localVideoProcessor.processVideo(
        videoSrc, 
        options,
        (progress: ProcessingProgress) => {
          setCurrentStep(progress.message);
          setExportProgress(progress.progress);
        }
      );

      console.log(`Local video processing successful for ${type} format`);
      return blob;

    } catch (error) {
      console.error('Local video processing failed:', error);
      throw error;
    }
  };

  // Fallback: Simple image-based processing
  const processVideoAsImage = async (video: any, type: 'beamer' | 'mobile'): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    if (type === 'beamer') {
      canvas.width = 1920;
      canvas.height = 1080;
    } else {
      canvas.width = 1280;
      canvas.height = 720;
    }

    // Create a simple poster-based video
    const videoElement = document.createElement('video');
    videoElement.src = video.src;
    videoElement.crossOrigin = 'anonymous';
    videoElement.muted = true;
    videoElement.playsInline = true;

    return new Promise((resolve, reject) => {
      videoElement.onloadeddata = () => {
        // Draw video frame
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Add visual effects
        const videoY = canvas.height * 0.1;
        const videoHeight = canvas.height * 0.6;
        
        // Add background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add video frame
        ctx.drawImage(videoElement, 0, videoY, canvas.width, videoHeight);
        
        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = `${canvas.width * 0.02}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${type.toUpperCase()} EXPORT - LOCAL PROCESSING`, canvas.width / 2, videoY + videoHeight + 50);

        // Add visual effects
        ctx.fillStyle = 'rgba(57, 230, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, 'image/jpeg', type === 'beamer' ? 0.9 : 0.8);
      };

      videoElement.onerror = (error) => {
        reject(error);
      };

      videoElement.load();
    });
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setError(null);
    setExportProgress(0);
    setExportedVideos({});

    try {
      const selectedVideoData = videos[selectedVideo];
      const typesToProcess: ('beamer' | 'mobile')[] = exportType === 'both' ? ['beamer', 'mobile'] : [exportType];

      for (const currentType of typesToProcess) {
        setCurrentStep(`Processing ${selectedVideoData.title} (${currentType})...`);
        
        let blob: Blob;
        
        try {
          // Try local video processing first
          console.log(`Using local video processing for ${selectedVideoData.title} (${currentType})`);
          blob = await processVideoLocally(selectedVideoData.src, currentType);
        } catch (localError) {
          console.warn('Local video processing failed, using image fallback:', localError);
          setCurrentStep(`Local processing failed, using image fallback for ${selectedVideoData.title}...`);
          blob = await processVideoAsImage(selectedVideoData, currentType);
        }
        
        // Store the processed video
        setExportedVideos(prev => ({ ...prev, [currentType]: blob }));
      
        // Log the export
        await api.triggerAvatarAction('video_exported', 'video_exporter', {
          type: currentType,
          duration: 30,
          resolution: currentType === 'beamer' ? '1920x1080' : '1280x720',
          method: 'local_processing',
          video_title: selectedVideoData.title
        });
      }

      setCurrentStep('Export completed successfully!');
      setExportProgress(100);

      // Notify parent component
      if (onExportComplete && exportedVideos.beamer) {
        onExportComplete(exportedVideos.beamer);
      }

    } catch (error) {
      console.error('Export failed:', error);
      setError(error instanceof Error ? error.message : 'Export failed');
      setCurrentStep('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const downloadVideo = (blob: Blob, type: 'beamer' | 'mobile') => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kardiverse-${type}-export-${Date.now()}.${blob.type.includes('video') ? 'mp4' : 'jpg'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadBothVideos = () => {
    if (exportedVideos.beamer) {
      downloadVideo(exportedVideos.beamer, 'beamer');
    }
    if (exportedVideos.mobile) {
      downloadVideo(exportedVideos.mobile, 'mobile');
    }
  };

  const previewVideo = async () => {
    if (!exportedVideos.beamer) return;

    try {
      const url = URL.createObjectURL(exportedVideos.beamer);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.document.title = 'Kardiverse Video Preview';
      }
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  return (
    <div className="video-exporter">
      <div className="exporter-header">
        <h2>🎬 Local Video Export</h2>
        <p>Export videos using local processing - no internet required!</p>
      </div>

      <div className="video-selection">
        <h3>Select Video</h3>
        <div className="video-options">
          {videos.map((video, index) => (
            <button
              key={video.id}
              className={`video-option ${selectedVideo === index ? 'selected' : ''}`}
              onClick={() => setSelectedVideo(index)}
              disabled={isExporting}
            >
              <div className="video-preview">
                <img src={video.poster} alt={video.title} />
              </div>
              <div className="video-info">
                <h4>{video.title}</h4>
                <p>Duration: ~30 seconds</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="export-options">
        <h3>Export Format</h3>
        <div className="format-options">
          <button
            className={`format-button ${exportType === 'beamer' ? 'active' : ''}`}
            onClick={() => setExportType('beamer')}
            disabled={isExporting}
          >
            📺 Beamer (1920x1080)
          </button>
          <button
            className={`format-button ${exportType === 'mobile' ? 'active' : ''}`}
            onClick={() => setExportType('mobile')}
            disabled={isExporting}
          >
            📱 Mobile (1280x720)
          </button>
          <button
            className={`format-button ${exportType === 'both' ? 'active' : ''}`}
            onClick={() => setExportType('both')}
            disabled={isExporting}
          >
            📦 Both Formats
          </button>
        </div>
      </div>

      <div className="processing-info">
        <h3>Processing Method</h3>
        <div className="method-info">
          <div className="method-status">
            ✅ Local Video Processing (Offline)
          </div>
          <p>Using browser-native MediaRecorder and Canvas APIs for video processing</p>
        </div>
      </div>

      <div className="export-specs">
        <h3>Export Specifications</h3>
        <ul>
          <li>Format: MP4 (WebM fallback)</li>
          <li>Duration: ~30 seconds</li>
          <li>Beamer: 1920x1080 @ 30fps, 8 Mbps</li>
          <li>Mobile: 1280x720 @ 24fps, 4 Mbps</li>
          <li>Processing: Local browser APIs</li>
          <li>No internet required</li>
        </ul>
      </div>

      <div className="export-actions">
        <button
          className="export-button"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? 'Processing...' : '🚀 Start Local Export'}
        </button>

        {exportedVideos.beamer && (
          <div className="download-actions">
            <button onClick={() => downloadVideo(exportedVideos.beamer!, 'beamer')}>
              📥 Download Beamer
            </button>
            {exportedVideos.mobile && (
              <button onClick={() => downloadVideo(exportedVideos.mobile!, 'mobile')}>
                📥 Download Mobile
              </button>
            )}
            {exportType === 'both' && (
              <button onClick={downloadBothVideos}>
                📦 Download Both
              </button>
            )}
            <button onClick={previewVideo}>
              👁️ Preview
            </button>
          </div>
        )}
      </div>

      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <p className="progress-text">{currentStep}</p>
          <p className="progress-percentage">{Math.round(exportProgress)}%</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>❌ Export Error</h4>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <style jsx>{`
        .video-exporter {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .exporter-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .exporter-header h2 {
          color: #39e6ff;
          margin-bottom: 10px;
        }

        .video-selection, .export-options, .processing-info, .export-specs {
          margin-bottom: 25px;
          padding: 20px;
          background: rgba(57, 230, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(57, 230, 255, 0.3);
        }

        .video-options {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .video-option {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .video-option:hover {
          background: rgba(57, 230, 255, 0.2);
        }

        .video-option.selected {
          border-color: #39e6ff;
          background: rgba(57, 230, 255, 0.2);
        }

        .video-preview img {
          width: 80px;
          height: 45px;
          object-fit: cover;
          border-radius: 4px;
        }

        .format-options {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .format-button {
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .format-button:hover {
          background: rgba(57, 230, 255, 0.2);
        }

        .format-button.active {
          border-color: #39e6ff;
          background: rgba(57, 230, 255, 0.2);
        }

        .method-status {
          color: #39e6ff;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .export-actions {
          text-align: center;
          margin-bottom: 20px;
        }

        .export-button {
          padding: 15px 30px;
          font-size: 18px;
          background: linear-gradient(45deg, #39e6ff, #00bcd4);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .export-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(57, 230, 255, 0.4);
        }

        .export-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .download-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .download-actions button {
          padding: 10px 20px;
          background: rgba(57, 230, 255, 0.2);
          border: 1px solid #39e6ff;
          border-radius: 6px;
          color: #39e6ff;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .download-actions button:hover {
          background: rgba(57, 230, 255, 0.3);
        }

        .export-progress {
          margin: 20px 0;
          padding: 20px;
          background: rgba(57, 230, 255, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(57, 230, 255, 0.3);
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #39e6ff, #00bcd4);
          transition: width 0.3s ease;
        }

        .progress-text {
          margin: 5px 0;
          color: #39e6ff;
        }

        .progress-percentage {
          text-align: center;
          font-weight: bold;
          color: #39e6ff;
        }

        .error-message {
          margin: 20px 0;
          padding: 20px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 8px;
          color: #ff6b6b;
        }

        .error-message h4 {
          margin-top: 0;
        }

        .error-message button {
          margin-top: 10px;
          padding: 8px 16px;
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid #ff6b6b;
          border-radius: 4px;
          color: #ff6b6b;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

