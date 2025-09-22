import React, { useEffect, useState, useRef } from 'react';
import { api } from '../config/api';
import { ENV } from '../config/env';

interface ScanTriggerProps {
  onActivation: () => void;
  enableNFC?: boolean;
  enableQR?: boolean;
  enableAutoDetection?: boolean;
  scanTimeout?: number;
  debugMode?: boolean;
}

export default function ScanTrigger({
  onActivation,
  enableNFC = true,
  enableQR = true,
  enableAutoDetection = true,
  scanTimeout = 30000,
  debugMode = false
}: ScanTriggerProps) {
  const [scanCount, setScanCount] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [scanType, setScanType] = useState<'qr' | 'nfc' | 'manual' | null>(null);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [qrSupported, setQrSupported] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  
  const prevScanCount = useRef(0);
  const isFirstLoad = useRef(true);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nfcReaderRef = useRef<any>(null);

  // Check browser capabilities
  useEffect(() => {
    // Check NFC support
    if (enableNFC && 'NDEFReader' in window) {
      setNfcSupported(true);
      if (debugMode) console.log('NFC Reader supported');
    }

    // Check QR code support (camera access)
    if (enableQR && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setQrSupported(true);
      if (debugMode) console.log('QR Code scanning supported');
    }
  }, [enableNFC, enableQR, debugMode]);

  // Fetch scan count from server
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await api.getScanCount();
        setScanCount(count);
        if (debugMode) console.log('Scan count updated:', count);
      } catch (error) {
        // Silently handle API errors - backend might not be running
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [debugMode]);

  // Log scan event
  const logScan = async (type: 'qr' | 'nfc' | 'manual', metadata?: any) => {
    try {
      await api.logScan(undefined, {
        type,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...metadata
      });
      if (debugMode) console.log('Scan logged:', type, metadata);
    } catch (error) {
      // Silently handle API errors - backend might not be running
    }
  };

  // Handle scan activation
  const handleScanActivation = (type: 'qr' | 'nfc' | 'manual', metadata?: any) => {
    if (isScanning) return; // Prevent multiple activations

    setIsScanning(true);
    setScanType(type);
    setLastScanTime(new Date());
    
    // Log the scan
    logScan(type, metadata);
    
    // Trigger activation
    onActivation();
    
    // Set timeout to reset scanning state
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    
    scanTimeoutRef.current = setTimeout(() => {
      setIsScanning(false);
      setScanType(null);
    }, scanTimeout);

    if (debugMode) console.log('Scan activation triggered:', type);
  };

  // QR Code scan detection (server-side count increase)
  useEffect(() => {
    if (isFirstLoad.current) {
      prevScanCount.current = scanCount;
      isFirstLoad.current = false;
      return;
    }

    if (enableQR && enableAutoDetection && scanCount > prevScanCount.current) {
      handleScanActivation('qr', { 
        countIncrease: scanCount - prevScanCount.current,
        previousCount: prevScanCount.current
      });
    }
    
    prevScanCount.current = scanCount;
  }, [scanCount, enableQR, enableAutoDetection]);

  // NFC Reader setup
  useEffect(() => {
    if (!enableNFC || !nfcSupported) return;

    const setupNFC = async () => {
      try {
        const reader = new (window as any).NDEFReader();
        nfcReaderRef.current = reader;

        reader.addEventListener('reading', (event: any) => {
          const message = event.message;
          const record = message.records[0];
          
          if (record && record.data) {
            const data = new TextDecoder().decode(record.data);
            if (debugMode) console.log('NFC data received:', data);
            
            // Check if this is our activation NFC tag
            if (data.includes('kardiverse') || data.includes('gates-of-display')) {
              handleScanActivation('nfc', { 
                nfcData: data,
                recordType: record.recordType
              });
            }
          }
        });

        reader.addEventListener('readingerror', (error: any) => {
          if (debugMode) console.error('NFC reading error:', error);
        });

        // Start NFC scanning
        await reader.scan();
        if (debugMode) console.log('NFC reader started');

      } catch (error) {
        console.error('NFC setup failed:', error);
        setNfcSupported(false);
      }
    };

    setupNFC();

    return () => {
      if (nfcReaderRef.current) {
        try {
          nfcReaderRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [enableNFC, nfcSupported, debugMode]);

  // Manual activation (for testing/fallback)
  const manualActivate = () => {
    handleScanActivation('manual', { 
      trigger: 'manual',
      timestamp: new Date().toISOString()
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Hide/Show Panel Button */}
      <button
        onClick={() => setIsPanelVisible(!isPanelVisible)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(57, 230, 255, 0.2)',
          border: '2px solid #39e6ff',
          color: '#39e6ff',
          padding: '8px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1001
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(57, 230, 255, 0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isPanelVisible ? '👁️ Hide' : '👁️‍🗨️ Show'} Panel
      </button>

      {/* Scan Trigger Panel */}
      {isPanelVisible && (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#39e6ff',
      padding: '15px',
      borderRadius: '10px',
      fontSize: '12px',
      maxWidth: '250px',
      zIndex: 1000,
      border: '1px solid rgba(57, 230, 255, 0.3)'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Scan Trigger System
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div>Status: {isScanning ? 'Active' : 'Ready'}</div>
        <div>Scan Count: {scanCount}</div>
        {lastScanTime && (
          <div>Last Scan: {lastScanTime.toLocaleTimeString()}</div>
        )}
        {scanType && (
          <div>Type: {scanType.toUpperCase()}</div>
        )}
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div>NFC: {nfcSupported ? '✅' : '❌'}</div>
        <div>QR: {qrSupported ? '✅' : '✅'}</div>
      </div>

      {debugMode && (
        <div style={{ marginBottom: '8px' }}>
          <div>Auto Detection: {enableAutoDetection ? 'ON' : 'OFF'}</div>
          <div>Timeout: {scanTimeout / 1000}s</div>
        </div>
      )}

      <button
        onClick={manualActivate}
        disabled={isScanning}
        style={{
          background: isScanning ? 'rgba(57, 230, 255, 0.3)' : 'rgba(57, 230, 255, 0.1)',
          border: '1px solid #39e6ff',
          color: '#39e6ff',
          padding: '5px 10px',
          borderRadius: '5px',
          cursor: isScanning ? 'not-allowed' : 'pointer',
          fontSize: '11px',
          width: '100%'
        }}
      >
        {isScanning ? 'Activating...' : 'Manual Activate'}
      </button>

      <div style={{ 
        marginTop: '8px', 
        fontSize: '10px', 
        opacity: 0.7,
        textAlign: 'center'
      }}>
        QR: {ENV.QR_URL}
      </div>
    </div>
      )}
    </>
  );
}

// Hook for using scan trigger
export function useScanTrigger(onActivation: () => void, options?: Partial<ScanTriggerProps>) {
  const [scanState, setScanState] = useState({
    isScanning: false,
    scanCount: 0,
    lastScanTime: null as Date | null,
    scanType: null as 'qr' | 'nfc' | 'manual' | null
  });

  const triggerManual = () => {
    setScanState(prev => ({
      ...prev,
      isScanning: true,
      scanType: 'manual',
      lastScanTime: new Date()
    }));
    onActivation();
  };

  return {
    ...scanState,
    triggerManual
  };
}
