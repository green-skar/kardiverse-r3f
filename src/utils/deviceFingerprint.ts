/**
 * Comprehensive Device Fingerprinting Utility
 * Generates unique device identifiers for tracking unique devices
 */

export interface DeviceFingerprint {
  id: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    availWidth: number;
    availHeight: number;
  };
  browser: {
    userAgent: string;
    language: string;
    languages: string[];
    platform: string;
    cookieEnabled: boolean;
    doNotTrack: string | null;
    vendor: string;
    vendorSub: string;
    productSub: string;
  };
  timezone: {
    timezone: string;
    timezoneOffset: number;
    locale: string;
  };
  hardware: {
    cores: number;
    memory: number | null;
    maxTouchPoints: number;
  };
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  plugins: string[];
  mimeTypes: string[];
  timestamp: number;
}

export class DeviceFingerprintGenerator {
  private static instance: DeviceFingerprintGenerator;
  private cachedFingerprint: string | null = null;

  static getInstance(): DeviceFingerprintGenerator {
    if (!DeviceFingerprintGenerator.instance) {
      DeviceFingerprintGenerator.instance = new DeviceFingerprintGenerator();
    }
    return DeviceFingerprintGenerator.instance;
  }

  /**
   * Generate comprehensive device fingerprint
   */
  async generateFingerprint(): Promise<DeviceFingerprint> {
    try {
      const fingerprint: DeviceFingerprint = {
        id: '',
        screen: this.getScreenInfo(),
        browser: this.getBrowserInfo(),
        timezone: this.getTimezoneInfo(),
        hardware: this.getHardwareInfo(),
        canvas: await this.generateCanvasFingerprint(),
        webgl: await this.generateWebGLFingerprint(),
        audio: await this.generateAudioFingerprint(),
        fonts: await this.detectFonts(),
        plugins: this.getPlugins(),
        mimeTypes: this.getMimeTypes(),
        timestamp: Date.now()
      };

      // Generate unique ID from all components
      fingerprint.id = this.generateFingerprintId(fingerprint);
      
      return fingerprint;
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      // Return minimal fingerprint as fallback
      return this.getMinimalFingerprint();
    }
  }

  /**
   * Get cached fingerprint or generate new one
   */
  async getFingerprint(): Promise<string> {
    if (this.cachedFingerprint) {
      return this.cachedFingerprint;
    }

    const fingerprint = await this.generateFingerprint();
    this.cachedFingerprint = fingerprint.id;
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('device_fingerprint', fingerprint.id);
      localStorage.setItem('device_fingerprint_data', JSON.stringify(fingerprint));
    } catch (error) {
      console.warn('Could not store fingerprint in localStorage:', error);
    }

    return fingerprint.id;
  }

  /**
   * Get stored fingerprint from localStorage
   */
  getStoredFingerprint(): string | null {
    try {
      return localStorage.getItem('device_fingerprint');
    } catch (error) {
      console.warn('Could not retrieve fingerprint from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear cached fingerprint (for testing)
   */
  clearFingerprint(): void {
    this.cachedFingerprint = null;
    try {
      localStorage.removeItem('device_fingerprint');
      localStorage.removeItem('device_fingerprint_data');
    } catch (error) {
      console.warn('Could not clear fingerprint from localStorage:', error);
    }
  }

  private getScreenInfo() {
    return {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight
    };
  }

  private getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub,
      productSub: navigator.productSub
    };
  }

  private getTimezoneInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      locale: navigator.language
    };
  }

  private getHardwareInfo() {
    return {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || null,
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }

  private async generateCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = 200;
      canvas.height = 50;
      
      // Draw text with various fonts and effects
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.font = '11px Arial';
      ctx.fillText('Device Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '11px Arial';
      ctx.fillText('Device Fingerprint', 4, 17);
      
      // Add some geometric shapes
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(0,255,255)';
      ctx.beginPath();
      ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(255,255,0)';
      ctx.beginPath();
      ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      
      return canvas.toDataURL();
    } catch (error) {
      console.warn('Canvas fingerprinting failed:', error);
      return 'canvas_error';
    }
  }

  private async generateWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return 'webgl_not_supported';
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
      
      return `${vendor}|${renderer}`;
    } catch (error) {
      console.warn('WebGL fingerprinting failed:', error);
      return 'webgl_error';
    }
  }

  private async generateAudioFingerprint(): Promise<string> {
    // Disabled to avoid deprecation warnings and reduce CPU usage.
    // Keep a stable placeholder so overall fingerprint remains consistent.
    return 'audio_disabled';
  }

  private async detectFonts(): Promise<string[]> {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Helvetica',
      'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma', 'Calibri'
    ];
    
    const detectedFonts: string[] = [];
    
    for (const font of testFonts) {
      if (this.isFontAvailable(font, baseFonts)) {
        detectedFonts.push(font);
      }
    }
    
    return detectedFonts;
  }

  private isFontAvailable(font: string, baseFonts: string[]): boolean {
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const h = document.getElementsByTagName('body')[0];
    
    const baseWidths: { [key: string]: number } = {};
    const baseHeights: { [key: string]: number } = {};
    
    // Calculate base widths and heights
    for (const baseFont of baseFonts) {
      const span = document.createElement('span');
      span.style.fontSize = testSize;
      span.style.fontFamily = baseFont;
      span.innerHTML = testString;
      h.appendChild(span);
      baseWidths[baseFont] = span.offsetWidth;
      baseHeights[baseFont] = span.offsetHeight;
      h.removeChild(span);
    }
    
    // Test the font
    for (const baseFont of baseFonts) {
      const span = document.createElement('span');
      span.style.fontSize = testSize;
      span.style.fontFamily = `${font}, ${baseFont}`;
      span.innerHTML = testString;
      h.appendChild(span);
      const width = span.offsetWidth;
      const height = span.offsetHeight;
      h.removeChild(span);
      
      if (width !== baseWidths[baseFont] || height !== baseHeights[baseFont]) {
        return true;
      }
    }
    
    return false;
  }

  private getPlugins(): string[] {
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }

  private getMimeTypes(): string[] {
    const mimeTypes: string[] = [];
    for (let i = 0; i < navigator.mimeTypes.length; i++) {
      mimeTypes.push(navigator.mimeTypes[i].type);
    }
    return mimeTypes;
  }

  private generateFingerprintId(fingerprint: DeviceFingerprint): string {
    const components = [
      fingerprint.screen.width.toString(),
      fingerprint.screen.height.toString(),
      fingerprint.screen.colorDepth.toString(),
      fingerprint.screen.pixelRatio.toString(),
      fingerprint.browser.userAgent,
      fingerprint.browser.language,
      fingerprint.browser.platform,
      fingerprint.timezone.timezone,
      fingerprint.hardware.cores.toString(),
      fingerprint.canvas,
      fingerprint.webgl,
      fingerprint.audio,
      fingerprint.fonts.join(','),
      fingerprint.plugins.join(','),
      fingerprint.mimeTypes.join(',')
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < components.length; i++) {
      const char = components.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  private getMinimalFingerprint(): DeviceFingerprint {
    return {
      id: 'minimal_' + Date.now(),
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        vendor: navigator.vendor,
        vendorSub: navigator.vendorSub,
        productSub: navigator.productSub
      },
      timezone: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        locale: navigator.language
      },
      hardware: {
        cores: navigator.hardwareConcurrency || 0,
        memory: (navigator as any).deviceMemory || null,
        maxTouchPoints: navigator.maxTouchPoints || 0
      },
      canvas: 'minimal',
      webgl: 'minimal',
      audio: 'minimal',
      fonts: [],
      plugins: [],
      mimeTypes: [],
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const deviceFingerprint = DeviceFingerprintGenerator.getInstance();
