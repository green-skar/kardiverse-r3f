// Local Video Processing System
// Replaces Mux API with browser-native video processing capabilities
// Optimized for multiple deployment platforms

export interface VideoProcessingOptions {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  format: 'beamer' | 'mobile';
  platform?: 'render' | 'vercel' | 'netlify' | 'heroku' | 'custom' | 'localhost';
}

export interface PlatformOptimization {
  maxWidth: number;
  maxHeight: number;
  maxBitrate: number;
  maxFrameRate: number;
  supportedFormats: string[];
}

export interface ProcessingProgress {
  stage: string;
  progress: number;
  message: string;
}

export class LocalVideoProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private platformOptimizations: Map<string, PlatformOptimization> = new Map();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.initializePlatformOptimizations();
  }

  /**
   * Initialize platform-specific optimizations
   */
  private initializePlatformOptimizations(): void {
    // Render.com optimizations (free tier limitations)
    this.platformOptimizations.set('render', {
      maxWidth: 1920,
      maxHeight: 1080,
      maxBitrate: 2000000, // 2 Mbps
      maxFrameRate: 30,
      supportedFormats: ['video/webm', 'video/mp4']
    });

    // Vercel optimizations (serverless)
    this.platformOptimizations.set('vercel', {
      maxWidth: 1920,
      maxHeight: 1080,
      maxBitrate: 3000000, // 3 Mbps
      maxFrameRate: 30,
      supportedFormats: ['video/webm', 'video/mp4']
    });

    // Netlify optimizations (static hosting)
    this.platformOptimizations.set('netlify', {
      maxWidth: 1920,
      maxHeight: 1080,
      maxBitrate: 2500000, // 2.5 Mbps
      maxFrameRate: 30,
      supportedFormats: ['video/webm', 'video/mp4']
    });

    // Heroku optimizations (dyno limitations)
    this.platformOptimizations.set('heroku', {
      maxWidth: 1920,
      maxHeight: 1080,
      maxBitrate: 2000000, // 2 Mbps
      maxFrameRate: 30,
      supportedFormats: ['video/webm', 'video/mp4']
    });

    // Localhost optimizations (full capabilities)
    this.platformOptimizations.set('localhost', {
      maxWidth: 3840,
      maxHeight: 2160,
      maxBitrate: 10000000, // 10 Mbps
      maxFrameRate: 60,
      supportedFormats: ['video/webm', 'video/mp4', 'video/ogg']
    });

    // Custom domain optimizations (assume good hosting)
    this.platformOptimizations.set('custom', {
      maxWidth: 2560,
      maxHeight: 1440,
      maxBitrate: 5000000, // 5 Mbps
      maxFrameRate: 30,
      supportedFormats: ['video/webm', 'video/mp4']
    });
  }

  /**
   * Detect current platform and get optimizations
   */
  private getPlatformOptimizations(): PlatformOptimization {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return this.platformOptimizations.get('localhost')!;
    } else if (hostname.includes('render.com')) {
      return this.platformOptimizations.get('render')!;
    } else if (hostname.includes('vercel.app')) {
      return this.platformOptimizations.get('vercel')!;
    } else if (hostname.includes('netlify.app')) {
      return this.platformOptimizations.get('netlify')!;
    } else if (hostname.includes('herokuapp.com')) {
      return this.platformOptimizations.get('heroku')!;
    } else {
      return this.platformOptimizations.get('custom')!;
    }
  }

  /**
   * Optimize video options based on platform capabilities
   */
  private optimizeVideoOptions(options: VideoProcessingOptions): VideoProcessingOptions {
    const platformOpts = this.getPlatformOptimizations();
    
    return {
      ...options,
      width: Math.min(options.width, platformOpts.maxWidth),
      height: Math.min(options.height, platformOpts.maxHeight),
      bitrate: Math.min(options.bitrate, platformOpts.maxBitrate),
      frameRate: Math.min(options.frameRate, platformOpts.maxFrameRate),
      platform: this.detectPlatform()
    };
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): VideoProcessingOptions['platform'] {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'localhost';
    } else if (hostname.includes('render.com')) {
      return 'render';
    } else if (hostname.includes('vercel.app')) {
      return 'vercel';
    } else if (hostname.includes('netlify.app')) {
      return 'netlify';
    } else if (hostname.includes('herokuapp.com')) {
      return 'heroku';
    } else {
      return 'custom';
    }
  }

  /**
   * Process video locally using browser APIs
   */
  async processVideo(
    videoSrc: string, 
    options: VideoProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    try {
      // Optimize options based on platform capabilities
      const optimizedOptions = this.optimizeVideoOptions(options);
      
      onProgress?.({
        stage: 'loading',
        progress: 10,
        message: `Loading video source... (Platform: ${optimizedOptions.platform})`
      });

      // Load video element
      const video = await this.loadVideo(videoSrc);
      
      onProgress?.({
        stage: 'setup',
        progress: 20,
        message: `Setting up canvas and recording... (${optimizedOptions.width}x${optimizedOptions.height})`
      });

      // Setup canvas with optimized dimensions
      this.setupCanvas(optimizedOptions.width, optimizedOptions.height);

      onProgress?.({
        stage: 'processing',
        progress: 30,
        message: `Processing video frames... (${optimizedOptions.frameRate}fps, ${optimizedOptions.bitrate/1000}kbps)`
      });

      // Process video using MediaRecorder with optimized settings
      const processedBlob = await this.recordVideo(video, optimizedOptions, onProgress);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Video processing complete!'
      });

      return processedBlob;

    } catch (error) {
      console.error('Local video processing failed:', error);
      throw new Error(`Local video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create video from static frames (fallback method)
   */
  async createVideoFromFrames(
    frames: ImageData[], 
    options: VideoProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    try {
      onProgress?.({
        stage: 'setup',
        progress: 10,
        message: 'Setting up frame-based video...'
      });

      this.setupCanvas(options.width, options.height);

      onProgress?.({
        stage: 'processing',
        progress: 30,
        message: 'Processing frames...'
      });

      // Create a simple video from frames
      const canvas = document.createElement('canvas');
      canvas.width = options.width;
      canvas.height = options.height;
      const ctx = canvas.getContext('2d')!;

      // Draw frames with timing
      const frameDuration = 1000 / options.frameRate; // ms per frame
      const totalDuration = frames.length * frameDuration;

      // Use MediaRecorder to create video from canvas
      const stream = canvas.captureStream(options.frameRate);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      this.recordedChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          resolve(blob);
        };

        mediaRecorder.onerror = (error) => {
          reject(error);
        };

        mediaRecorder.start();

        // Animate frames
        let frameIndex = 0;
        const animate = () => {
          if (frameIndex < frames.length) {
            ctx.putImageData(frames[frameIndex], 0, 0);
            frameIndex++;
            
            onProgress?.({
              stage: 'processing',
              progress: 30 + (frameIndex / frames.length) * 60,
              message: `Processing frame ${frameIndex}/${frames.length}...`
            });

            setTimeout(animate, frameDuration);
          } else {
            mediaRecorder.stop();
          }
        };

        animate();
      });

    } catch (error) {
      console.error('Frame-based video creation failed:', error);
      throw new Error(`Frame-based video creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load video element from source
   */
  private async loadVideo(src: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      
      video.onloadeddata = () => resolve(video);
      video.onerror = (error) => reject(error);
      
      video.src = src;
      video.load();
    });
  }

  /**
   * Setup canvas with target dimensions
   */
  private setupCanvas(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Set canvas style for better quality
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
  }

  /**
   * Record video using MediaRecorder
   */
  private async recordVideo(
    video: HTMLVideoElement, 
    options: VideoProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Create canvas stream
      const stream = this.canvas.captureStream(options.frameRate);
      
      // Setup MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: options.bitrate
      });

      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (error) => {
        reject(error);
      };

      // Start recording
      this.mediaRecorder.start();

      // Play video and draw frames
      video.currentTime = 0;
      video.play();

      const drawFrame = () => {
        if (!video.paused && !video.ended) {
          // Draw video frame to canvas
          this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
          
          // Add visual effects based on format
          this.addVisualEffects(options.format);
          
          // Update progress
          const progress = 30 + (video.currentTime / video.duration) * 60;
          onProgress?.({
            stage: 'processing',
            progress: Math.min(progress, 90),
            message: `Processing video... ${Math.round((video.currentTime / video.duration) * 100)}%`
          });

          requestAnimationFrame(drawFrame);
        } else if (video.ended) {
          // Video finished, stop recording
          this.mediaRecorder?.stop();
        }
      };

      video.onplay = () => {
        drawFrame();
      };

      video.onended = () => {
        this.mediaRecorder?.stop();
      };
    });
  }

  /**
   * Add visual effects based on format
   */
  private addVisualEffects(format: 'beamer' | 'mobile'): void {
    const { width, height } = this.canvas;
    
    if (format === 'beamer') {
      // Beamer-specific effects
      this.ctx.fillStyle = 'rgba(57, 230, 255, 0.1)';
      this.ctx.fillRect(0, 0, width, height);
      
      // Add title
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${width * 0.02}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('BEAMER EXPORT - LOCAL PROCESSING', width / 2, height - 50);
    } else {
      // Mobile-specific effects
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.fillRect(0, 0, width, height);
      
      // Add title
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = `${width * 0.015}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText('MOBILE EXPORT - LOCAL PROCESSING', width / 2, height - 30);
    }
  }

  /**
   * Get supported MIME type for MediaRecorder
   */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // Fallback
  }

  /**
   * Convert WebM to MP4 (if needed)
   */
  async convertToMP4(webmBlob: Blob): Promise<Blob> {
    // For now, return the original blob
    // In a real implementation, you might use FFmpeg.js or similar
    return webmBlob;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.recordedChunks = [];
  }
}

// Export singleton instance
export const localVideoProcessor = new LocalVideoProcessor();

