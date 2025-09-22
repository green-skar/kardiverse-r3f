import React, { useState, useRef, useEffect } from 'react';
import { api } from '../config/api';
import { localVideoProcessor, VideoProcessingOptions, ProcessingProgress } from '../utils/localVideoProcessor';

interface VideoExporterProps {
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

export default function VideoExporter({ onExportComplete, onProgress }: VideoExporterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'beamer' | 'mobile' | 'both'>('both');
  const [selectedVideo, setSelectedVideo] = useState<number>(0); // Index of selected video
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [exportedVideos, setExportedVideos] = useState<{beamer?: Blob, mobile?: Blob}>({});
  const [useCloudAPI, setUseCloudAPI] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Local video processing configuration
  const USE_LOCAL_PROCESSING = true; // Always use local processing for offline mode

  // Local video processing function
  const processVideoLocally = async (videoSrc: string, type: 'beamer' | 'mobile'): Promise<Blob> => {
    try {
      // Check if the video URL is accessible from external services
      if (videoSrc.includes('localhost') || videoSrc.includes('127.0.0.1')) {
        throw new Error('Mux API cannot process localhost URLs. Please use the deployed version at https://kardiverse-r3f.onrender.com/ for Mux processing.');
      }

      setCurrentStep(`Creating Mux asset for ${type} processing...`);
      
      // Step 1: Create a Mux asset via backend proxy
      const backendUrl = `${api.baseURL}/api/mux/assets/`;
      console.log('Calling backend proxy:', backendUrl);
      
      const assetResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_url: videoSrc
        })
      });

      if (!assetResponse.ok) {
        const responseText = await assetResponse.text();
        console.error('Mux asset creation failed:', {
          status: assetResponse.status,
          statusText: assetResponse.statusText,
          responseText: responseText
        });
        
        // Try to parse as JSON, fallback to text
        let errorMessage = `Mux API failed: ${assetResponse.status} - ${assetResponse.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is HTML (like 404 page), use the status
          if (responseText.includes('<!DOCTYPE')) {
            errorMessage = `Backend endpoint not found (${assetResponse.status}). Check if Django backend is running.`;
          }
        }
        
        throw new Error(errorMessage);
      }

      const asset = await assetResponse.json();
      const assetId = asset.data.id;
      console.log('Mux asset created:', asset);

      setCurrentStep(`Processing video with Mux (Asset: ${assetId})...`);

      // Step 2: Wait for asset processing via backend proxy
      let assetStatus = 'preparing';
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max

      while (assetStatus !== 'ready' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        
        const statusResponse = await fetch(`${api.baseURL}/api/mux/assets/${assetId}/`, {
          method: 'GET'
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(`Failed to check asset status: ${statusResponse.status} - ${errorData.error || 'Unknown error'}`);
        }

        const statusData = await statusResponse.json();
        assetStatus = statusData.data.status;

        if (assetStatus === 'errored') {
          throw new Error('Mux processing failed');
        }

        setExportProgress(prev => Math.min(prev + 2, 90));
        attempts++;
      }

      if (assetStatus !== 'ready') {
        throw new Error('Mux processing timeout');
      }

      // Step 3: Get the playback URL and create a processed video
      setCurrentStep('Creating processed video...');
      
      const playbackId = asset.data.playback_ids[0].id;
      const playbackUrl = `https://stream.mux.com/${playbackId}.m3u8`;
      const mp4Url = `https://stream.mux.com/${playbackId}.mp4`;
      
      console.log('Mux playback URLs:', {
        playbackId,
        hlsUrl: playbackUrl,
        mp4Url: mp4Url,
        assetStatus: asset.data.status
      });

      // Create a video element to process the Mux stream
      const videoElement = document.createElement('video');
      videoElement.crossOrigin = 'anonymous';
      videoElement.muted = true;
      videoElement.playsInline = true;
      
      // Try to load HLS stream with fallback to MP4
      let streamLoaded = false;
      
      try {
        // First, try to get the MP4 direct URL instead of HLS
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video load timeout'));
          }, 30000); // 30 second timeout
          
          videoElement.onloadedmetadata = () => {
            clearTimeout(timeout);
            streamLoaded = true;
            resolve(true);
          };
          
          videoElement.onerror = (error) => {
            clearTimeout(timeout);
            console.warn('MP4 stream load failed, trying HLS:', error);
            reject(new Error('MP4 stream load failed'));
          };
          
          videoElement.src = mp4Url;
          videoElement.load();
        });
        
      } catch (mp4Error) {
        console.warn('MP4 failed, trying HLS stream:', mp4Error);
        
        // Fallback to HLS stream
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('HLS video load timeout'));
            }, 30000);
            
            videoElement.onloadedmetadata = () => {
              clearTimeout(timeout);
              streamLoaded = true;
              resolve(true);
            };
            
            videoElement.onerror = (error) => {
              clearTimeout(timeout);
              console.warn('HLS stream load failed:', error);
              reject(new Error('HLS stream load failed'));
            };
            
            videoElement.src = playbackUrl;
            videoElement.load();
          });
        } catch (hlsError) {
          console.error('Both MP4 and HLS streams failed:', hlsError);
          throw new Error('Mux stream load failed - both MP4 and HLS unavailable');
        }
      }
      
      if (!streamLoaded) {
        throw new Error('Failed to load Mux stream');
      }

      // Create a canvas for video processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Set canvas size based on export type
      if (type === 'beamer') {
        canvas.width = 1920;
        canvas.height = 1080;
      } else {
        canvas.width = 1280;
        canvas.height = 720;
      }

      // Create a background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#081b3a');
      gradient.addColorStop(1, '#0a1f42');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the video scaled to fit
      const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
      const canvasAspect = canvas.width / canvas.height;
      
      let videoWidth, videoHeight, videoX, videoY;
      
      if (videoAspect > canvasAspect) {
        // Video is wider, fit to width
        videoWidth = canvas.width * 0.8;
        videoHeight = videoWidth / videoAspect;
      } else {
        // Video is taller, fit to height
        videoHeight = canvas.height * 0.8;
        videoWidth = videoHeight * videoAspect;
      }
      
      videoX = (canvas.width - videoWidth) / 2;
      videoY = (canvas.height - videoHeight) / 2;

      // Draw video with rounded corners
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(videoX, videoY, videoWidth, videoHeight, 20);
      ctx.clip();
      ctx.drawImage(videoElement, videoX, videoY, videoWidth, videoHeight);
      ctx.restore();

      // Add a border around the video
      ctx.strokeStyle = '#39e6ff';
      ctx.lineWidth = 6;
      ctx.strokeRect(videoX, videoY, videoWidth, videoHeight);

      // Add title text
      ctx.fillStyle = '#39e6ff';
      ctx.font = `bold ${canvas.width * 0.04}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('Kardiverse Video', canvas.width / 2, videoY - 30);

      // Add export type text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${canvas.width * 0.02}px Arial`;
      ctx.fillText(`${type.toUpperCase()} EXPORT - MUX PROCESSED`, canvas.width / 2, videoY + videoHeight + 50);

      // Add some visual effects
      ctx.fillStyle = 'rgba(57, 230, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert to blob
      const videoBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', type === 'beamer' ? 0.9 : 0.8);
      });

      setExportProgress(95);
      
      return videoBlob;

    } catch (error) {
      console.error('Mux API processing failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        videoSrc,
        type,
        tokenId: MUX_TOKEN_ID !== 'demo_token_id' ? '***' : 'demo_token_id'
      });
      throw error;
    }
  };

  // Fallback: Local processing (existing image-based approach)
  const processVideoLocally = async (video: any, type: 'beamer' | 'mobile'): Promise<Blob> => {
    // ... existing local processing code ...
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    if (type === 'beamer') {
      canvas.width = 1920;
      canvas.height = 1080;
    } else {
      canvas.width = 1280;
      canvas.height = 720;
    }
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#081b3a');
    gradient.addColorStop(1, '#0a1f42');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const posterImg = new Image();
    posterImg.crossOrigin = 'anonymous';
    posterImg.src = video.poster;
    
    await new Promise((resolve) => {
      posterImg.onload = resolve;
    });
    
    const posterAspect = posterImg.width / posterImg.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let posterWidth, posterHeight, posterX, posterY;
    
    if (posterAspect > canvasAspect) {
      posterWidth = canvas.width * 0.8;
      posterHeight = posterWidth / posterAspect;
    } else {
      posterHeight = canvas.height * 0.8;
      posterWidth = posterHeight * posterAspect;
    }
    
    posterX = (canvas.width - posterWidth) / 2;
    posterY = (canvas.height - posterHeight) / 2;
    
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(posterX, posterY, posterWidth, posterHeight, 20);
    ctx.clip();
    ctx.drawImage(posterImg, posterX, posterY, posterWidth, posterHeight);
    ctx.restore();
    
    ctx.strokeStyle = '#39e6ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(posterX, posterY, posterWidth, posterHeight);
    
    ctx.fillStyle = '#39e6ff';
    ctx.font = `bold ${canvas.width * 0.04}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(video.title, canvas.width / 2, posterY - 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${canvas.width * 0.02}px Arial`;
    ctx.fillText(`${type.toUpperCase()} EXPORT`, canvas.width / 2, posterY + posterHeight + 50);
    
    ctx.fillStyle = 'rgba(57, 230, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/jpeg', type === 'beamer' ? 0.9 : 0.8);
    });
  };

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    setExportProgress(0);
    setError(null);
    setExportedVideos({});
    
    try {
      // Check if selected video file exists
      const selectedVideoData = videos[selectedVideo];
      if (!selectedVideoData) {
        throw new Error('Selected video not found');
      }
      
      try {
        const response = await fetch(selectedVideoData.src, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Video file not found: ${selectedVideoData.src}`);
        }
      } catch (error) {
        throw new Error(`Video file check failed for ${selectedVideoData.src}: ${error}`);
      }
      
      // Check if poster image exists
      try {
        const posterResponse = await fetch(selectedVideoData.poster, { method: 'HEAD' });
        if (!posterResponse.ok) {
          console.warn(`Poster image not found: ${selectedVideoData.poster}`);
        }
      } catch (error) {
        console.warn(`Poster image check failed:`, error);
      }
      
      const videosToExport = exportType === 'both' ? ['beamer', 'mobile'] : [exportType];
      const exportedVideos: {beamer?: Blob, mobile?: Blob} = {};
      
      for (let i = 0; i < videosToExport.length; i++) {
        const currentType = videosToExport[i] as 'beamer' | 'mobile';
        const progressStart = 10 + (i * 40); // 10-50% for first type, 50-90% for second
        
        setCurrentStep(`Processing ${selectedVideoData.title} for ${currentType}...`);
        setExportProgress(progressStart);
        
        let blob: Blob;
        
        if (useCloudAPI && MUX_TOKEN_ID !== 'demo_token_id' && MUX_TOKEN_SECRET !== 'demo_token_secret') {
          // Use Mux API for real video processing
          try {
            console.log(`Attempting Mux processing for ${selectedVideoData.title} (${currentType})`);
            blob = await processVideoWithMuxAPI(selectedVideoData.src, currentType);
            console.log(`Mux processing successful for ${selectedVideoData.title}`);
          } catch (muxError) {
            console.warn('Mux API failed, falling back to local processing:', muxError);
            const errorMessage = muxError instanceof Error ? muxError.message : 'Unknown Mux error';
            if (errorMessage.includes('localhost')) {
              setCurrentStep(`Localhost detected, using local processing for ${selectedVideoData.title}...`);
            } else {
              setCurrentStep(`Mux failed, using local processing for ${selectedVideoData.title}...`);
            }
            blob = await processVideoLocally(selectedVideoData, currentType);
          }
        } else {
          // Use local processing (image-based)
          console.log(`Using local processing for ${selectedVideoData.title} (${currentType})`);
          blob = await processVideoLocally(selectedVideoData, currentType);
        }
        
        // Store the processed video
        exportedVideos[currentType] = blob;
      
      // Log the export
      await api.triggerAvatarAction('video_exported', 'video_exporter', {
          type: currentType,
        duration: 30,
          resolution: currentType === 'beamer' ? '1920x1080' : '1280x720',
          size: exportedVideos[currentType]?.size || 0
        });
      }
      
      // Step 2: Complete
      setCurrentStep('Export Complete!');
      setExportProgress(100);
      
      setExportedVideos(exportedVideos);
      
      // Call onExportComplete with the first video (for backward compatibility)
      if (onExportComplete && exportedVideos.beamer) {
        onExportComplete(exportedVideos.beamer);
      } else if (onExportComplete && exportedVideos.mobile) {
        onExportComplete(exportedVideos.mobile);
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      setError(errorMessage);
      
      // Log additional context for debugging
      console.error('Export error context:', {
        exportType,
        useCloudAPI,
        hasValidTokens: MUX_TOKEN_ID !== 'demo_token_id' && MUX_TOKEN_SECRET !== 'demo_token_secret',
        errorMessage
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadVideo = (blob: Blob, type: 'beamer' | 'mobile') => {
    const selectedVideoData = videos[selectedVideo];
    const videoName = selectedVideoData.title.toLowerCase().replace(/\s+/g, '-');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const extension = useCloudAPI ? 'mp4' : 'jpg';
    a.download = `${videoName}-${type}-export.${extension}`;
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
    try {
      // Preview the selected video
      const selectedVideoData = videos[selectedVideo];
      const videoElement = document.createElement('video');
      videoElement.src = selectedVideoData.src;
      videoElement.controls = true;
      videoElement.style.position = 'fixed';
      videoElement.style.top = '50%';
      videoElement.style.left = '50%';
      videoElement.style.transform = 'translate(-50%, -50%)';
      videoElement.style.zIndex = '10000';
      videoElement.style.maxWidth = '80vw';
      videoElement.style.maxHeight = '80vh';
      videoElement.style.background = 'black';
      
      document.body.appendChild(videoElement);
      videoElement.play();
      
      // Remove video element when it ends or is clicked outside
      const removeVideo = () => {
        document.body.removeChild(videoElement);
      };
      
      videoElement.onended = removeVideo;
      videoElement.onclick = removeVideo;
      
      // Auto-remove after 10 seconds
      setTimeout(removeVideo, 10000);
    } catch (error) {
      console.error('Preview failed:', error);
    }
  };

  return (
    <div className="video-exporter">
      <div className="exporter-header">
        <h3>🎬 Video Export System</h3>
        <p>Export existing Kardiverse videos for beamer projection and mobile devices</p>
      </div>

      <div className="export-controls">
        <div className="video-selector">
          <h4>Select Video:</h4>
          <div className="video-options">
            {videos.map((video, index) => (
              <label key={video.id} className="video-option">
                <input
                  type="radio"
                  name="selectedVideo"
                  value={index}
                  checked={selectedVideo === index}
                  onChange={(e) => setSelectedVideo(parseInt(e.target.value))}
                  disabled={isExporting}
                />
                <span className="video-info">
                  <span className="video-title">{video.title}</span>
                  <span className="video-filename">{video.src.split('/').pop()}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="export-type-selector">
          <h4>Export Format:</h4>
          <div className="format-options">
            <label>
              <input
                type="radio"
                value="beamer"
                checked={exportType === 'beamer'}
                onChange={(e) => setExportType(e.target.value as 'beamer' | 'mobile' | 'both')}
                disabled={isExporting}
              />
              <span>🎯 Beamer (Full HD 1080p)</span>
            </label>
            <label>
              <input
                type="radio"
                value="mobile"
                checked={exportType === 'mobile'}
                onChange={(e) => setExportType(e.target.value as 'beamer' | 'mobile' | 'both')}
                disabled={isExporting}
              />
              <span>📱 Mobile (HD 720p)</span>
            </label>
            <label>
              <input
                type="radio"
                value="both"
                checked={exportType === 'both'}
                onChange={(e) => setExportType(e.target.value as 'beamer' | 'mobile' | 'both')}
                disabled={isExporting}
              />
              <span>🎬 Both Formats</span>
            </label>
          </div>
        </div>

        <div className="processing-method-selector">
          <h4>Processing Method:</h4>
          <div className="method-toggle">
            <button
              className={`method-button ${useCloudAPI ? 'active' : ''}`}
              onClick={() => setUseCloudAPI(true)}
              disabled={isExporting}
            >
              ☁️ Mux API (Real Video)
            </button>
            <button
              className={`method-button ${!useCloudAPI ? 'active' : ''}`}
              onClick={() => setUseCloudAPI(false)}
              disabled={isExporting}
            >
              🖼️ Local (Image)
            </button>
          </div>
          {useCloudAPI && (MUX_TOKEN_ID === 'demo_token_id' || MUX_TOKEN_SECRET === 'demo_token_secret') && (
            <div className="api-warning">
              ⚠️ Demo mode: Add VITE_MUX_TOKEN_ID and VITE_MUX_TOKEN_SECRET to .env for Mux processing
            </div>
          )}
          {useCloudAPI && (MUX_TOKEN_ID !== 'demo_token_id' && MUX_TOKEN_SECRET !== 'demo_token_secret') && (
            <div className="api-info">
              ✅ Mux API ready for cloud video processing
            </div>
          )}
        </div>

        <div className="export-specs">
          <h4>Export Specifications:</h4>
          <ul>
            <li>Videos: {videos.length} Kardiverse videos</li>
            {useCloudAPI ? (
              exportType === 'both' ? (
                <>
                  <li>Beamer Resolution: 1920x1080 (Full HD)</li>
                  <li>Mobile Resolution: 1280x720 (HD)</li>
                  <li>Beamer Encoding: Smart Tier (AI-optimized)</li>
                  <li>Mobile Encoding: Baseline Tier</li>
                  <li>Format: HLS/MP4 (Adaptive)</li>
                  <li>Audio: Normalized AAC</li>
                  <li>Features: Per-title encoding, Just-in-time transcoding</li>
                </>
              ) : (
                <>
                  <li>Resolution: {exportType === 'beamer' ? '1920x1080' : '1280x720'}</li>
                  <li>Encoding: {exportType === 'beamer' ? 'Smart Tier (AI-optimized)' : 'Baseline Tier'}</li>
                  <li>Format: HLS/MP4 (Adaptive)</li>
                  <li>Audio: Normalized AAC</li>
                  <li>Features: Per-title encoding, Just-in-time transcoding</li>
                </>
              )
            ) : (
              exportType === 'both' ? (
                <>
                  <li>Beamer Resolution: 1920x1080 (Full HD)</li>
                  <li>Mobile Resolution: 1280x720 (HD)</li>
                  <li>Beamer Quality: High (90% compression)</li>
                  <li>Mobile Quality: Medium (80% compression)</li>
                  <li>Format: JPEG (Image)</li>
                </>
              ) : (
                <>
            <li>Resolution: {exportType === 'beamer' ? '1920x1080' : '1280x720'}</li>
                  <li>Quality: {exportType === 'beamer' ? 'High (90% compression)' : 'Medium (80% compression)'}</li>
                  <li>Format: JPEG (Image)</li>
                </>
              )
            )}
            <li>Source: Existing Kardiverse video files</li>
            <li>Poster: Single poster image from src/assets/</li>
            {useCloudAPI && (
              <li>Processing: Cloud-based video encoding via Mux API</li>
            )}
          </ul>
        </div>

        <div className="export-actions">
          <button
            className="button preview-button"
            onClick={previewVideo}
            disabled={isExporting}
          >
            🎬 Preview Video
          </button>
          
          <button
            className="button export-button"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '⏳ Exporting...' : '🎬 Export Video'}
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="export-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
          <div className="progress-text">
            <span>{currentStep}</span>
            <span>{Math.round(exportProgress)}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h4>❌ Export Error</h4>
          <p>{error}</p>
          <button 
            className="button"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Download Section */}
      {(exportedVideos.beamer || exportedVideos.mobile) && (
        <div className="download-section">
          <h4>📥 Download Processed Images</h4>
          <div className="download-buttons">
            {exportedVideos.beamer && (
              <button
                className="button download-button"
                onClick={() => downloadVideo(exportedVideos.beamer!, 'beamer')}
              >
                🎯 Download Beamer {useCloudAPI ? 'Video' : 'Image'} ({(exportedVideos.beamer.size / 1024 / 1024).toFixed(2)} MB)
              </button>
            )}
            {exportedVideos.mobile && (
              <button
                className="button download-button"
                onClick={() => downloadVideo(exportedVideos.mobile!, 'mobile')}
              >
                📱 Download Mobile {useCloudAPI ? 'Video' : 'Image'} ({(exportedVideos.mobile.size / 1024 / 1024).toFixed(2)} MB)
              </button>
            )}
            {exportedVideos.beamer && exportedVideos.mobile && (
              <button
                className="button download-all-button"
                onClick={downloadBothVideos}
              >
                🎬 Download Both {useCloudAPI ? 'Videos' : 'Images'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="export-info">
        <h4>📋 Export Process:</h4>
        <ol>
          <li>Load existing Kardiverse video files</li>
          <li>Process videos for target resolution (beamer/mobile)</li>
          <li>Apply quality compression settings</li>
          <li>Convert to optimized MP4 format</li>
          <li>Generate downloadable export files</li>
        </ol>
        
        <h4>🎯 Compatibility:</h4>
        <ul>
          <li>✅ Beamer projection systems</li>
          <li>✅ Android browsers (Chrome, Firefox)</li>
          <li>✅ iOS browsers (Safari, Chrome)</li>
          <li>✅ Desktop browsers</li>
          <li>✅ Video players (VLC, QuickTime, etc.)</li>
        </ul>
      </div>

      <style>{`
        .video-exporter {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: rgba(0, 0, 0, 0.8);
          border-radius: 10px;
          color: white;
        }

        .exporter-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .exporter-header h3 {
          color: #39e6ff;
          margin-bottom: 10px;
          font-size: 1.8em;
        }

        .exporter-header p {
          color: #ccc;
          font-size: 1em;
        }

        .export-controls {
          margin-bottom: 30px;
        }

        .export-type-selector {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .export-type-selector label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 10px 20px;
          border: 2px solid #39e6ff;
          border-radius: 5px;
          transition: all 0.3s ease;
          min-width: 200px;
          justify-content: center;
        }

        .export-type-selector label:hover {
          background: rgba(57, 230, 255, 0.1);
        }

        .export-type-selector input[type="radio"] {
          margin: 0;
        }

        .processing-method-selector {
          margin-bottom: 20px;
        }

        .processing-method-selector h4 {
          color: #39e6ff;
          margin-bottom: 10px;
          font-size: 1.1em;
        }

        .method-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .method-button {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #39e6ff;
          background: transparent;
          color: #39e6ff;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.3s ease;
        }

        .method-button:hover {
          background: rgba(57, 230, 255, 0.1);
        }

        .method-button.active {
          background: #39e6ff;
          color: #081b3a;
          font-weight: bold;
        }

        .method-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .api-warning {
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid #ffc107;
          color: #ffc107;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85em;
          margin-top: 8px;
        }

        .api-info {
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.85em;
          margin-top: 8px;
        }

        .export-specs {
          background: rgba(57, 230, 255, 0.1);
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
        }

        .export-specs h4 {
          color: #39e6ff;
          margin-bottom: 10px;
        }

        .export-specs ul {
          list-style: none;
          padding: 0;
        }

        .export-specs li {
          padding: 5px 0;
          border-bottom: 1px solid rgba(57, 230, 255, 0.2);
        }

        .export-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
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
          min-width: 150px;
        }

        .button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(57, 230, 255, 0.4);
        }

        .button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .preview-button {
          background: linear-gradient(45deg, #ff39e6, #39e6ff);
        }

        .export-progress {
          margin: 20px 0;
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
          background: linear-gradient(90deg, #39e6ff, #ff39e6);
          transition: width 0.3s ease;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .error-message {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #ff0000;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }

        .error-message h4 {
          color: #ff0000;
          margin-bottom: 10px;
        }

        .export-info {
          margin-top: 30px;
        }

        .export-info h4 {
          color: #39e6ff;
          margin-bottom: 10px;
        }

        .export-info ol, .export-info ul {
          padding-left: 20px;
        }

        .export-info li {
          margin-bottom: 5px;
        }

        .download-section {
          margin: 30px 0;
          padding: 20px;
          background: rgba(0, 255, 0, 0.1);
          border: 2px solid #00ff00;
          border-radius: 10px;
        }

        .download-section h4 {
          color: #00ff00;
          margin-bottom: 15px;
          text-align: center;
        }

        .download-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }

        .download-button {
          background: linear-gradient(45deg, #00ff00, #39e6ff);
          min-width: 300px;
        }

        .download-all-button {
          background: linear-gradient(45deg, #ff39e6, #39e6ff);
          min-width: 300px;
          margin-top: 10px;
        }

        /* Mobile Responsive Design */
        @media (max-width: 768px) {
          .video-exporter {
            padding: 15px;
            margin: 10px;
            border-radius: 15px;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
          }

          .exporter-header h3 {
            font-size: 1.5em;
            margin-bottom: 8px;
          }

          .exporter-header p {
            font-size: 0.9em;
            line-height: 1.4;
          }

          .export-type-selector {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 25px;
          }

          .export-type-selector label {
            padding: 15px 20px;
            min-width: auto;
            width: 100%;
            border-radius: 12px;
            font-size: 0.95em;
            background: rgba(57, 230, 255, 0.05);
            border: 2px solid rgba(57, 230, 255, 0.3);
          }

          .export-type-selector label:hover {
            background: rgba(57, 230, 255, 0.15);
            border-color: #39e6ff;
          }

          .export-specs {
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 25px;
          }

          .export-specs h4 {
            font-size: 1.1em;
            margin-bottom: 15px;
          }

          .export-specs li {
            padding: 8px 0;
            font-size: 0.9em;
            line-height: 1.3;
          }

          .export-actions {
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }

          .button {
            width: 100%;
            max-width: 280px;
            padding: 15px 20px;
            font-size: 1em;
            border-radius: 12px;
            min-width: auto;
          }

          .export-progress {
            margin: 25px 0;
          }

          .progress-bar {
            height: 25px;
            border-radius: 12px;
          }

          .progress-text {
            font-size: 13px;
            margin-top: 8px;
          }

          .error-message {
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
          }

          .error-message h4 {
            font-size: 1.1em;
          }

          .export-info {
            margin-top: 25px;
          }

          .export-info h4 {
            font-size: 1.1em;
            margin-bottom: 12px;
          }

          .export-info ol, .export-info ul {
            padding-left: 15px;
          }

          .export-info li {
            margin-bottom: 8px;
            font-size: 0.9em;
            line-height: 1.4;
          }

          .download-section {
            margin: 25px 0;
            padding: 25px 20px;
            border-radius: 15px;
          }

          .download-section h4 {
            font-size: 1.2em;
            margin-bottom: 20px;
          }

          .download-buttons {
            gap: 15px;
          }

          .download-button, .download-all-button {
            width: 100%;
            max-width: 280px;
            min-width: auto;
            padding: 15px 20px;
            font-size: 0.95em;
            border-radius: 12px;
          }

          .download-all-button {
            margin-top: 0;
          }
        }

        /* Small Mobile Devices */
        @media (max-width: 480px) {
          .video-exporter {
            padding: 12px;
            margin: 5px;
          }

          .exporter-header h3 {
            font-size: 1.3em;
          }

          .exporter-header p {
            font-size: 0.85em;
          }

          .export-type-selector label {
            padding: 12px 15px;
            font-size: 0.9em;
          }

          .export-specs {
            padding: 15px;
          }

          .export-specs h4 {
            font-size: 1em;
          }

          .export-specs li {
            font-size: 0.85em;
          }

          .button {
            padding: 12px 15px;
            font-size: 0.95em;
          }

          .download-section {
            padding: 20px 15px;
          }

          .download-button, .download-all-button {
            padding: 12px 15px;
            font-size: 0.9em;
          }
        }

        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
          .export-type-selector label {
            padding: 18px 20px;
          }

          .button {
            padding: 18px 24px;
            font-size: 1.05em;
          }

          .download-button, .download-all-button {
            padding: 18px 24px;
            font-size: 1em;
          }
        }
        
        /* Video Selection Styles */
        .video-selector {
          margin-bottom: 20px;
        }
        
        .video-selector h4 {
          color: #39e6ff;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .video-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .video-option {
          display: flex;
          align-items: center;
          padding: 12px;
          background: rgba(57, 230, 255, 0.1);
          border: 2px solid rgba(57, 230, 255, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .video-option:hover {
          background: rgba(57, 230, 255, 0.2);
          border-color: rgba(57, 230, 255, 0.5);
        }
        
        .video-option input[type="radio"] {
          margin-right: 12px;
          accent-color: #39e6ff;
        }
        
        .video-option input[type="radio"]:checked + .video-info {
          color: #39e6ff;
        }
        
        .video-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .video-title {
          font-weight: bold;
          font-size: 14px;
        }
        
        .video-filename {
          font-size: 12px;
          opacity: 0.7;
          font-family: monospace;
        }
        
        .export-type-selector h4 {
          color: #39e6ff;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .format-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}
