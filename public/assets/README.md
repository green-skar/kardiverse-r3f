# Assets Directory

This directory contains media assets for the Kardiverse Avatar Demo.

## Required Files

### Video Files
- `kardiverse-demo.mp4` - Main demo video for mobile fallback (15-30 seconds)
  - Should show the avatar appearing and speaking
  - Include the line: "Welcome to the Gates of Display, from Kardiverse"
  - Add glow effects and animations
  - Resolution: 1080p or 720p for mobile optimization

### Audio Files
- `kardiverse-voice.mp3` - AI voice greeting (15 seconds)
  - Clear English pronunciation
  - Optimized for lip synchronization
  - High quality audio (44.1kHz, 16-bit minimum)

### 3D Models
- `avatar.glb` - Main avatar 3D model
  - Optimized for web (low poly count)
  - Include morph targets for lip sync
  - Holographic material support

## Fallback System

The mobile fallback system will automatically:
1. Detect device capabilities (WebGL, WebXR, video support)
2. Choose the best available experience:
   - 3D hologram (desktop with WebGL)
   - WebAR (mobile with WebXR)
   - Video playback (any device with video support)
   - Static fallback (limited devices)

## File Formats

- **Video**: MP4 (H.264 codec for maximum compatibility)
- **Audio**: MP3 or WAV
- **3D Models**: GLB (glTF binary format)
- **Images**: PNG or JPG

## Optimization

All assets should be optimized for web delivery:
- Compressed file sizes
- Progressive loading
- Multiple quality levels for different devices
