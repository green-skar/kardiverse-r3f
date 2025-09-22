# 🎬 Kardiverse Holographic Display System

A cutting-edge full-stack holographic avatar experience built with React, TypeScript, React Three Fiber (R3F), and Django. This project delivers an immersive 3D holographic display system with advanced features including multi-voice speech synthesis, cloud video processing, and responsive design for various display scenarios.

---

## ✨ Key Features

### 🎭 **Interactive 3D Hologram Avatar**
- **Real-time 3D rendering** with Three.js and React Three Fiber
- **Dynamic avatar interactions** with continuous rotation and drag controls
- **Holographic effects** with glow, particles, and lighting
- **Responsive design** adapting to different screen sizes
- **Multi-device support** for mobile, tablet, and desktop

### 🎤 **Advanced Multi-Voice Speech System**
- **Simultaneous voice playback** using Web Audio API
- **Pre-generated audio files** for perfect synchronization
- **Spatial audio effects** with dynamic volume control
- **Avatar glow effects** synchronized with speech
- **Cross-platform compatibility** for all modern browsers

### 📱 **QR Code & NFC Activation**
- **QR code scanning** for seamless mobile interaction
- **NFC support** for contactless activation
- **Scan tracking** with real-time counter updates
- **Session management** with automatic timeout extensions
- **Analytics integration** for engagement tracking

### 🎯 **Multiple Display Modes**
- **Entry Dashboard** - Main control center with activation options
- **Projector Mode** - Optimized for large displays and presentations
- **Mobile Mode** - Responsive design for smartphones and tablets
- **QR Scan Mode** - Interactive avatar display with triangle formation
- **Video Export** - Professional video generation with Mux API integration

### 🎬 **Professional Video Export System**
- **Cloud API integration** with Mux for real video processing
- **Dual format export** - Beamer (1920x1080) and Mobile (1280x720)
- **Local fallback processing** for development and testing
- **High-quality output** with proper compression and optimization
- **One-click download** with progress tracking

### 🌐 **Responsive Design & Device Detection**
- **Automatic device detection** with appropriate redirections
- **Collapsible navigation** for small screens
- **Touch-friendly interfaces** for mobile devices
- **Screen size adaptation** with dynamic scaling
- **Cross-platform compatibility** across all devices

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Git** for version control

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd kardivers-r3f_final

# Install frontend dependencies
npm install --legacy-peer-deps
```

### 2. Environment Setup

Create a `.env` file in the root directory:
```env
# Mux API Configuration (for video export)
VITE_MUX_TOKEN_ID=your_mux_token_id_here
VITE_MUX_TOKEN_SECRET=your_mux_token_secret_here

# API Configuration
VITE_API_URL=http://127.0.0.1:8000

# AI TTS API Key (optional)
AI_TTS_API_KEY=your_ai_tts_api_key_here
```

### 3. Django Backend Setup

```bash
# Navigate to Django backend
cd django_backend

# Run setup script
# Windows
.\setup.bat

# Linux/Mac
python setup.py

# Start Django server
# Windows
.\run.bat

# Linux/Mac
python run.py
```

The Django API will be available at `http://localhost:8000/api/`

### 4. Frontend Development

```bash
# Start Vite development server
npm run dev
```

Visit: `http://localhost:5174` (or the port shown in terminal)

### 5. Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Quick Start Guide

### For Development:
1. **Start Django backend**: `cd django_backend && python run.py`
2. **Start frontend**: `npm run dev`
3. **Visit**: `http://localhost:5174`

### For Production:
1. **Build frontend**: `npm run build`
2. **Deploy to Render**: Follow `DEPLOYMENT_GUIDE.md`
3. **Set environment variables** in Render dashboard

## 📁 Project Structure

```
kardivers-r3f_final/
├── src/                          # React frontend source code
│   ├── components/               # Reusable React components
│   │   ├── InteractiveAvatar.tsx # Main 3D avatar component
│   │   ├── VideoExporter.tsx     # Video export system
│   │   ├── EnhancedQRCode.tsx    # QR code display
│   │   └── ...                   # Other components
│   ├── pages/                    # Application pages
│   │   ├── Entry.tsx             # Main dashboard
│   │   ├── Projector.tsx         # Projector display mode
│   │   ├── QRScan.tsx            # QR scan interaction
│   │   ├── Mobile.tsx            # Mobile fallback
│   │   └── VideoExport.tsx       # Video export page
│   ├── config/                   # Configuration files
│   │   └── api.ts                # API endpoints
│   └── utils/                    # Utility functions
├── django_backend/               # Django REST API backend
│   ├── api/                      # API app
│   ├── kardiverse_backend/       # Django project settings
│   └── requirements.txt          # Python dependencies
├── public/                       # Static assets
│   ├── assets/                   # Video files and images
│   │   ├── kardiverse-demo.mp4   # Demo video
│   │   ├── kardiverse-experience.mp4
│   │   ├── poster.jpg            # Poster image
│   │   └── voice*.mp3            # Voice audio files
│   └── avatar.glb                # 3D avatar model
├── render.yaml                   # Render deployment config
├── DEPLOYMENT_GUIDE.md           # Deployment instructions
├── VIDEO_GENERATION_SYSTEM.md    # Video system documentation
└── test-deployment.*             # Deployment testing scripts
```

## 🛠️ Available Scripts

### Development
- `npm run dev` – Start Vite development server
- `npm run build` – Build for production
- `npm run preview` – Preview production build locally

### Testing & Deployment
- `test-deployment.bat` (Windows) – Test deployment readiness
- `test-deployment.sh` (Linux/Mac) – Test deployment readiness

### Django Backend
- `cd django_backend && python run.py` – Start Django server
- `cd django_backend && python setup.py` – Setup Django environment

## 🎬 Video Export System

The project includes a professional video export system with:

### Features
- **Mux API Integration** - Cloud-based video processing
- **Dual Format Export** - Beamer (1920x1080) and Mobile (1280x720)
- **Local Fallback** - Image-based processing for development
- **Progress Tracking** - Real-time export progress
- **One-Click Download** - Direct MP4 download

### Usage
1. Navigate to `/video-export` page
2. Select processing method (Mux API or Local)
3. Choose export type (Beamer, Mobile, or Both)
4. Click "Export Videos" and wait for completion
5. Download the generated files

## 🌐 Deployment

### Render Deployment (Recommended)
The project is configured for easy deployment to Render:

1. **Follow** `DEPLOYMENT_GUIDE.md` for detailed instructions
2. **Use** `render.yaml` for automatic service configuration
3. **Set** environment variables in Render dashboard
4. **Deploy** both frontend and backend services

### Environment Variables
```env
# Frontend (Vite)
VITE_MUX_TOKEN_ID=your_mux_token_id
VITE_MUX_TOKEN_SECRET=your_mux_token_secret
VITE_API_URL=https://your-backend-url.onrender.com

# Backend (Django)
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=your-backend-url.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
```

## 🎯 Use Cases

### Interactive Installations
- **Museum displays** with QR code activation
- **Trade show booths** with holographic presentations
- **Retail experiences** with interactive avatars
- **Educational kiosks** with engaging content

### Content Creation
- **Marketing videos** for social media
- **Presentation materials** for conferences
- **Demo videos** for client presentations
- **Training content** with interactive elements

### Development & Testing
- **Prototype validation** with real-time feedback
- **Cross-platform testing** across devices
- **Performance optimization** with various configurations
- **User experience research** with analytics

## 🔧 Technical Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Three Fiber** - 3D rendering with Three.js
- **React Router** - Client-side routing

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **SQLite/PostgreSQL** - Database support
- **Gunicorn** - WSGI server for production

### 3D & Graphics
- **Three.js** - 3D graphics library
- **React Three Fiber** - React integration for Three.js
- **React Three Drei** - Useful helpers and abstractions
- **WebGL** - Hardware-accelerated graphics

### Audio & Video
- **Web Audio API** - Audio processing and synthesis
- **Web Speech API** - Text-to-speech functionality
- **Mux API** - Cloud video processing
- **MediaRecorder API** - Video recording capabilities

## 📚 Documentation

- **`README.md`** - This file (project overview and setup)
- **`DEPLOYMENT_GUIDE.md`** - Complete deployment instructions
- **`VIDEO_GENERATION_SYSTEM.md`** - Video export system documentation
- **`django_backend/README.md`** - Django backend documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Credits

Built with:
- **React Three Fiber** - 3D rendering
- **Three.js** - 3D graphics
- **Django REST Framework** - Backend API
- **Vite** - Build tooling
- **Mux** - Video processing
- **Render** - Deployment platform

---

**🎬 Kardiverse Holographic Display System**  
*Creating immersive 3D experiences for the modern world*