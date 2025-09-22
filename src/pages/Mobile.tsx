import React, { useState, useEffect, useRef } from 'react';
import { api } from '../config/api';
import { useAppStore } from '../store';
import { detectDevice } from '../utils/deviceDetection';
import ENV from '../config/env';

// Video data - you can add more videos here
const videos = [
  {
    id: 1,
    title: "Welcome to Kardiverse",
    src: "/assets/kardiverse-demo.mp4",
    poster: "/poster.jpg"
  },
  {
    id: 2,
    title: "Kardiverse Experience",
    src: "/assets/kardiverse-experience.mp4", // Add your second video here
    poster: "/poster.jpg" // Using single poster for all videos
  }
];

export default function Mobile() {
  console.log('Mobile: Component rendering');
  const [scanCount, setScanCount] = useState(0);
  const [isActivated, setIsActivated] = useState(false);
  const [activationTime, setActivationTime] = useState<Date | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize store state, device detection, and API
  useEffect(() => {
    // Initialize store state if needed
    const store = useAppStore.getState();
    console.log('Mobile: Store initialized:', store);
    
    // Initialize device detection (additional to existing device detection)
    const device = detectDevice();
    console.log('Mobile: Device detected via utility:', device);
    
    // Initialize API connection (test connectivity)
    const testAPI = async () => {
      try {
        const count = await api.getScanCount();
        console.log('Mobile: API connection successful, scan count:', count);
      } catch (error) {
        console.warn('Mobile: API connection failed:', error);
      }
    };
    testAPI();
    
    // Store is already initialized by Zustand, no additional setup needed
  }, []);

  // Detect device type and screen size
  useEffect(() => {
    const detectDeviceAndSize = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTabletDevice = /ipad|android(?!.*mobile)/i.test(userAgent);
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
      
      // Determine device type based on both user agent and screen size
      if (isTabletDevice || (width >= 768 && width < 1024)) {
        setDeviceType('tablet');
        setIsMobile(true);
      } else if (isMobileDevice || width < 768) {
        setDeviceType('mobile');
        setIsMobile(true);
      } else {
        setDeviceType('desktop');
        setIsMobile(false);
      }
    };

    // Initial detection
    detectDeviceAndSize();

    // Listen for resize events
    const handleResize = () => {
      detectDeviceAndSize();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Fetch initial scan count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await api.getScanCount();
        setScanCount(count);
      } catch (error) {
        // Silently handle API errors - backend might not be running
      }
    };

    fetchCount();
  }, []);

  // Handle activation
  const handleActivation = async () => {
    try {
      // Note: Scan count is now only incremented when someone actually scans the QR code
      // This activation is just for local mobile display, not a scan event

      // Update local state
      setIsActivated(true);
      setActivationTime(new Date());

      // Trigger avatar action
      await api.triggerAvatarAction('mobile_activation', deviceType, {
        timestamp: new Date().toISOString(),
        deviceType: deviceType,
          fallbackMode: true
      });

    } catch (error) {
      // Silently handle API errors - backend might not be running
    }
  };

  // Handle video navigation
  const handlePreviousVideo = () => {
    setCurrentVideoIndex(prev => prev === 0 ? videos.length - 1 : prev - 1);
  };

  const handleNextVideo = () => {
    setCurrentVideoIndex(prev => prev === videos.length - 1 ? 0 : prev + 1);
  };

  // Get current video
  const currentVideo = videos[currentVideoIndex];

  // Responsive sizing functions
  const getResponsiveSizing = () => {
    const { width, height } = screenSize;
    
    // Mobile (portrait or landscape)
    if (width < 768) {
      return {
        containerWidth: '95vw',
        containerHeight: '70vh',
        headerHeight: '50px',
        headerPadding: '10px 15px',
        headerFontSize: '14px',
        buttonPadding: '8px 12px',
        buttonFontSize: '10px',
        navGap: '8px',
        videoNavPadding: '8px 15px',
        videoNavFontSize: '11px'
      };
    }
    
    // Tablet
    if (width >= 768 && width < 1024) {
      return {
        containerWidth: '90vw',
        containerHeight: '65vh',
        headerHeight: '60px',
        headerPadding: '12px 20px',
        headerFontSize: '16px',
        buttonPadding: '10px 15px',
        buttonFontSize: '12px',
        navGap: '10px',
        videoNavPadding: '10px 18px',
        videoNavFontSize: '12px'
      };
    }
    
    // Desktop
    return {
      containerWidth: '80vw',
      containerHeight: '60vh',
      headerHeight: '70px',
      headerPadding: '15px 25px',
      headerFontSize: '20px',
      buttonPadding: '12px 18px',
      buttonFontSize: '14px',
      navGap: '15px',
      videoNavPadding: '12px 25px',
      videoNavFontSize: '14px'
    };
  };

  const responsiveSizing = getResponsiveSizing();

  // Handle menu toggle
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when screen size changes or when clicking outside
  useEffect(() => {
    setIsMenuOpen(false);
  }, [screenSize]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen) {
        const target = event.target as HTMLElement;
        if (!target.closest('.mobile-menu')) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {/* Debug: Visible test element */}
      {/* Device-specific header */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#39e6ff',
        fontSize: responsiveSizing.headerFontSize,
        fontWeight: 'bold',
        textShadow: '0 0 15px #39e6ff',
        textAlign: 'center',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.5)',
        padding: responsiveSizing.headerPadding,
        borderRadius: '20px',
        border: '1px solid rgba(57, 230, 255, 0.3)',
        transition: 'all 0.3s ease'
      }}>
        {isMobile ? '📱' : '💻'} Kardiverse {deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'Desktop'}
      </div>

      {/* Scan counter */}
      <div style={{
        position: 'absolute',
        top: screenSize.width < 768 ? '60px' : '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#39e6ff',
        fontSize: screenSize.width < 768 ? '12px' : screenSize.width < 1024 ? '13px' : '14px',
        textAlign: 'center',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.5)',
        padding: screenSize.width < 768 ? '6px 12px' : '8px 16px',
        borderRadius: '15px',
        border: '1px solid rgba(57, 230, 255, 0.3)',
        transition: 'all 0.3s ease'
      }}>
        Scans: {scanCount}
      </div>

      {/* Activation status */}
      {isActivated && (
        <div style={{
          position: 'absolute',
          top: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#00ff88',
          fontSize: isMobile ? '10px' : '12px',
          textAlign: 'center',
          zIndex: 100,
          background: 'rgba(0, 255, 136, 0.2)',
          padding: '6px 12px',
          borderRadius: '15px',
          border: '1px solid rgba(0, 255, 136, 0.5)',
          animation: 'pulse 2s infinite'
        }}>
          ✅ Activated {activationTime?.toLocaleTimeString()}
        </div>
      )}

      {/* Main Video Container */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: responsiveSizing.containerWidth,
        height: responsiveSizing.containerHeight,
        maxWidth: screenSize.width < 768 ? '95vw' : screenSize.width < 1024 ? '90vw' : '1200px',
        maxHeight: screenSize.width < 768 ? '70vh' : screenSize.width < 1024 ? '65vh' : '800px',
        background: 'transparent',
        borderRadius: screenSize.width < 768 ? '20px' : '25px',
        border: `3px solid rgba(57, 230, 255, ${screenSize.width < 768 ? '0.4' : '0.5'})`,
        boxShadow: screenSize.width < 768 
          ? '0 0 40px rgba(57, 230, 255, 0.3), inset 0 0 20px rgba(57, 230, 255, 0.1)'
          : '0 0 60px rgba(57, 230, 255, 0.4), inset 0 0 30px rgba(57, 230, 255, 0.15)',
        zIndex: 150,
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}>
        {/* Enhanced Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: responsiveSizing.headerPadding,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(57, 230, 255, 0.1) 100%)',
          borderBottom: `2px solid rgba(57, 230, 255, ${screenSize.width < 768 ? '0.3' : '0.4'})`,
          height: responsiveSizing.headerHeight,
          minHeight: responsiveSizing.headerHeight,
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: screenSize.width < 768 ? '12px' : '15px'
          }}>
            <div style={{
              width: screenSize.width < 768 ? '10px' : '12px',
              height: screenSize.width < 768 ? '10px' : '12px',
              background: '#39e6ff',
              borderRadius: '50%',
              boxShadow: `0 0 ${screenSize.width < 768 ? '15px' : '20px'} #39e6ff`,
              animation: 'pulse 2s infinite'
            }} />
            <h3 style={{
              color: '#39e6ff',
              fontSize: responsiveSizing.headerFontSize,
              fontWeight: 'bold',
              margin: 0,
              textShadow: `0 0 ${screenSize.width < 768 ? '15px' : '20px'} rgba(57, 230, 255, 0.6)`,
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}>
              {deviceType === 'mobile' ? '📱 Mobile' : deviceType === 'tablet' ? '📱 Tablet' : '💻 Desktop'} Experience
            </h3>
          </div>
          
          <div style={{
            color: '#39e6ff',
            fontSize: screenSize.width < 768 ? '12px' : screenSize.width < 1024 ? '13px' : '14px',
            opacity: 0.8,
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}>
            {currentVideo.title}
          </div>
        </div>

        {/* Enhanced Video Player */}
        <div style={{
          width: '100%',
          height: `calc(100% - ${responsiveSizing.headerHeight})`,
          position: 'relative'
        }}>
          <video
            ref={videoRef}
            src={currentVideo.src}
            poster={currentVideo.poster}
        style={{
          width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '0 0 20px 20px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
            onPlay={handleActivation}
            controls
            autoPlay
            muted
      />

          {/* Enhanced Video Navigation */}
      <div style={{
        position: 'absolute',
            bottom: screenSize.width < 768 ? '15px' : '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
            gap: responsiveSizing.navGap,
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(57, 230, 255, 0.1) 100%)',
            padding: responsiveSizing.videoNavPadding,
            borderRadius: screenSize.width < 768 ? '25px' : '30px',
            border: `2px solid rgba(57, 230, 255, ${screenSize.width < 768 ? '0.4' : '0.5'})`,
            backdropFilter: 'blur(15px)',
            boxShadow: `0 0 ${screenSize.width < 768 ? '25px' : '35px'} rgba(57, 230, 255, 0.3)`,
            transition: 'all 0.3s ease'
          }}>
            <button
              onClick={handlePreviousVideo}
              style={{
                background: 'linear-gradient(135deg, rgba(57, 230, 255, 0.2) 0%, rgba(57, 230, 255, 0.1) 100%)',
                border: '2px solid #39e6ff',
                color: '#39e6ff',
                padding: responsiveSizing.buttonPadding,
                borderRadius: screenSize.width < 768 ? '20px' : '25px',
                cursor: 'pointer',
                fontSize: responsiveSizing.videoNavFontSize,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(57, 230, 255, 0.3) 0%, rgba(57, 230, 255, 0.2) 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(57, 230, 255, 0.2) 0%, rgba(57, 230, 255, 0.1) 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ⏮️ {screenSize.width < 768 ? 'Prev' : 'Previous'}
            </button>
            
            <div style={{
              color: '#39e6ff',
              fontSize: screenSize.width < 768 ? '14px' : screenSize.width < 1024 ? '15px' : '16px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 15px',
              fontWeight: 'bold',
              textShadow: '0 0 10px rgba(57, 230, 255, 0.5)',
              transition: 'all 0.3s ease'
            }}>
              {currentVideoIndex + 1} / {videos.length}
            </div>
            
            <button
              onClick={handleNextVideo}
              style={{
                background: 'linear-gradient(135deg, rgba(57, 230, 255, 0.2) 0%, rgba(57, 230, 255, 0.1) 100%)',
                border: '2px solid #39e6ff',
                color: '#39e6ff',
                padding: responsiveSizing.buttonPadding,
                borderRadius: screenSize.width < 768 ? '20px' : '25px',
                cursor: 'pointer',
                fontSize: responsiveSizing.videoNavFontSize,
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(57, 230, 255, 0.3) 0%, rgba(57, 230, 255, 0.2) 100%)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(57, 230, 255, 0.2) 0%, rgba(57, 230, 255, 0.1) 100%)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {screenSize.width < 768 ? 'Next' : 'Next'} ⏭️
            </button>
          </div>
        </div>
      </div>

      {/* Navigation - Collapsible for small screens */}
      {screenSize.width < 768 ? (
        /* Mobile Menu - Hamburger Icon */
        <div className="mobile-menu" style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 200
        }}>
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            style={{
              background: 'rgba(57, 230, 255, 0.2)',
              border: '2px solid #39e6ff',
              color: '#39e6ff',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
              transition: 'all 0.3s ease',
              width: '48px',
              height: '48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
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
            <div style={{
              width: '20px',
              height: '2px',
              background: '#39e6ff',
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              transform: isMenuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none'
            }} />
            <div style={{
              width: '20px',
              height: '2px',
              background: '#39e6ff',
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              opacity: isMenuOpen ? 0 : 1
            }} />
            <div style={{
              width: '20px',
              height: '2px',
              background: '#39e6ff',
              borderRadius: '1px',
              transition: 'all 0.3s ease',
              transform: isMenuOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'none'
            }} />
          </button>

          {/* Collapsible Menu Items */}
          {isMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '0',
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid rgba(57, 230, 255, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              minWidth: '200px',
              boxShadow: '0 0 30px rgba(57, 230, 255, 0.3)',
              backdropFilter: 'blur(15px)',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <a
                  href="/"
                  style={{
                    color: '#39e6ff',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(57, 230, 255, 0.1)',
                    border: '1px solid rgba(57, 230, 255, 0.2)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 230, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  🏠 Home
                </a>
                <a
                  href="/qr-scan"
                  style={{
                    color: '#39e6ff',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(57, 230, 255, 0.1)',
                    border: '1px solid rgba(57, 230, 255, 0.2)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 230, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  🎬 Projector
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.reload();
                  }}
                  style={{
                    color: '#ffa500',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 165, 0, 0.1)',
                    border: '1px solid rgba(255, 165, 0, 0.2)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 165, 0, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  🔄 Reload
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (videoRef.current) {
                      const a = document.createElement('a');
                      a.href = currentVideo.src;
                      a.download = `${currentVideo.title}.mp4`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                  }}
                  style={{
                    color: '#39e6ff',
                    textDecoration: 'none',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(57, 230, 255, 0.1)',
                    border: '1px solid rgba(57, 230, 255, 0.2)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 230, 255, 0.2)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 230, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  📥 Download
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop/Tablet - Regular Button Layout */
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: responsiveSizing.navGap,
        zIndex: 100
      }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: 'rgba(57, 230, 255, 0.2)',
              border: '2px solid #39e6ff',
            color: '#39e6ff',
              padding: responsiveSizing.buttonPadding,
              borderRadius: '25px',
            cursor: 'pointer',
              fontSize: responsiveSizing.buttonFontSize,
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
              transition: 'all 0.3s ease',
              minWidth: '100px'
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
          🏠 Home
        </button>
        <button
            onClick={() => window.location.href = '/qr-scan'}
          style={{
            background: 'rgba(57, 230, 255, 0.2)',
              border: '2px solid #39e6ff',
            color: '#39e6ff',
              padding: responsiveSizing.buttonPadding,
              borderRadius: '25px',
            cursor: 'pointer',
              fontSize: responsiveSizing.buttonFontSize,
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
              transition: 'all 0.3s ease',
              minWidth: '100px'
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
          🎬 Projector
        </button>
      </div>
      )}

      {/* Right side navigation - Only for desktop/tablet */}
      {screenSize.width >= 768 && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: responsiveSizing.navGap,
          zIndex: 100
        }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'rgba(255, 165, 0, 0.2)',
              border: '2px solid #ffa500',
              color: '#ffa500',
              padding: responsiveSizing.buttonPadding,
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: responsiveSizing.buttonFontSize,
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(255, 165, 0, 0.3)',
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 165, 0, 0.3)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 165, 0, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Reload
          </button>
          <button
            onClick={() => {
              // Download current video
              if (videoRef.current) {
                const a = document.createElement('a');
                a.href = currentVideo.src;
                a.download = `${currentVideo.title}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            }}
            style={{
              background: 'rgba(57, 230, 255, 0.2)',
              border: '2px solid #39e6ff',
              color: '#39e6ff',
              padding: responsiveSizing.buttonPadding,
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: responsiveSizing.buttonFontSize,
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(57, 230, 255, 0.3)',
              transition: 'all 0.3s ease',
              minWidth: '100px'
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
            📥 Download
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
