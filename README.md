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

## 🌐 Multi-Platform Deployment

### 🚀 Phase 2: Auto-Detection Deployment

The Kardiverse project now features **automatic platform detection** that works seamlessly across multiple deployment platforms without manual configuration!

#### ✨ **Auto-Detection Features**
- **🤖 Automatic Platform Detection** - Detects Render, Vercel, Netlify, Heroku, and custom domains
- **🔗 Smart URL Construction** - Automatically builds correct API and frontend URLs
- **🌐 Dynamic CORS Configuration** - Backend automatically allows frontend origins
- **⚡ Zero Configuration** - Deploy to any supported platform without manual setup
- **🔄 Fallback Support** - Graceful degradation for unknown platforms

#### 🎯 **Supported Platforms**

| Platform | Frontend Auto-Detection | Backend Auto-Detection | CORS Auto-Allow |
|----------|------------------------|------------------------|-----------------|
| **Render.com** | ✅ Full Support | ✅ Full Support | ✅ Full Support |
| **Vercel** | ✅ Full Support | ✅ Full Support | ✅ Full Support |
| **Netlify** | ✅ Full Support | ✅ Full Support | ✅ Full Support |
| **Heroku** | ✅ Full Support | ✅ Full Support | ✅ Full Support |
| **Custom Domains** | ✅ Full Support | ✅ Full Support | ✅ Full Support |
| **Localhost** | ✅ Full Support | ✅ Full Support | ✅ Full Support |

---

### 🚀 **Quick Deploy Guides**

#### **1. Render.com Deployment (Recommended)**

**Frontend:**
```bash
# 1. Connect your GitHub repository to Render
# 2. Create a new Web Service
# 3. Use these settings:
Build Command: npm install && npm run build
Publish Directory: dist
Environment: Node
```

**Backend:**
```bash
# 1. Create a new Web Service for Django
# 2. Use these settings:
Build Command: pip install -r requirements.txt && python manage.py migrate
Start Command: gunicorn kardiverse_backend.wsgi:application
Environment: Python
```

**✅ No environment variables needed!** The app will auto-detect Render URLs.

---

#### **2. Vercel Deployment**

**Frontend:**
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy from project root
vercel

# 3. Follow prompts (no special config needed)
```

**Backend:**
```bash
# 1. Create vercel.json in django_backend/
{
  "version": 2,
  "builds": [
    {
      "src": "kardiverse_backend/wsgi.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "kardiverse_backend/wsgi.py"
    }
  ]
}

# 2. Deploy backend
cd django_backend && vercel
```

**✅ Auto-detects Vercel URLs automatically!**

---

#### **3. Netlify Deployment**

**Frontend:**
```bash
# 1. Connect GitHub repository to Netlify
# 2. Set build settings:
Build Command: npm run build
Publish Directory: dist
```

**Backend:**
```bash
# 1. Use Netlify Functions for Django
# 2. Create netlify.toml in django_backend/
[build]
  command = "pip install -r requirements.txt"
  functions = "netlify/functions"

[build.environment]
  PYTHON_VERSION = "3.9"
```

**✅ Auto-detects Netlify URLs automatically!**

---

#### **4. Heroku Deployment**

**Frontend:**
```bash
# 1. Create Procfile in root
web: npm run build && npx serve -s dist

# 2. Deploy
git push heroku main
```

**Backend:**
```bash
# 1. Create Procfile in django_backend/
web: gunicorn kardiverse_backend.wsgi:application

# 2. Deploy
cd django_backend && git push heroku main
```

**✅ Auto-detects Heroku URLs automatically!**

---

#### **5. Custom Domain Deployment**

**For custom domains (e.g., kardiverse.com):**

1. **Frontend:** Deploy to your preferred platform
2. **Backend:** Deploy to your preferred platform  
3. **DNS:** Point your domain to the deployment URLs
4. **✅ Auto-detection works!** The app will detect custom domains and construct appropriate URLs.

---

### 🔧 **Manual Configuration (Optional)**

If you need to override auto-detection, you can still use environment variables:

```env
# Frontend (Vite) - Optional overrides
VITE_API_URL=https://your-custom-backend-url.com
VITE_MUX_TOKEN_ID=your_mux_token_id
VITE_MUX_TOKEN_SECRET=your_mux_token_secret

# Backend (Django) - Optional overrides
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=your-backend-url.com
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
```

**Note:** Environment variables take priority over auto-detection, so you can always override if needed.

---

### 🎯 **Deployment Best Practices**

1. **✅ Use Auto-Detection** - Let the app handle URL detection automatically
2. **🔒 Set Secret Keys** - Always set `SECRET_KEY` for production
3. **📊 Monitor Logs** - Check console logs for auto-detection info
4. **🔄 Test Endpoints** - Verify API connectivity after deployment
5. **📱 Test QR Codes** - Ensure QR codes work with new URLs

---

### 🐛 **Troubleshooting**

**If auto-detection fails:**
1. Check browser console for detection logs
2. Verify platform hostname patterns
3. Use environment variables as fallback
4. Check CORS settings in Django logs

**Common issues:**
- **CORS errors:** Backend auto-detection should handle this
- **API not found:** Check if backend URL is correctly detected
- **QR codes not working:** Verify frontend URL detection

## 🏗️ Unified Integration Guide

### Overview
This project supports both **standalone deployment** and **unified integration** with larger applications. The auto-detection system automatically configures URLs and settings based on the deployment context.

### Integration Approaches

#### 1. **Subdirectory Integration** (Recommended)
```
yourdomain.com/                    # Your main application
yourdomain.com/hologram/           # Kardiverse layer
yourdomain.com/api/kardiverse/     # Kardiverse API endpoints
```

#### 2. **Subdomain Integration**
```
app.yourdomain.com/                # Your main application
hologram.yourdomain.com/           # Kardiverse layer
api.yourdomain.com/kardiverse/     # Kardiverse API endpoints
```

#### 3. **Same-Domain Integration**
```
yourdomain.com/                    # Your main application
yourdomain.com/hologram/           # Kardiverse layer
yourdomain.com/api/                # Unified API (includes Kardiverse)
```

### Quick Integration Steps

#### Step 1: Copy Project
```bash
# Copy this project into your main project
cp -r kardiverse-r3f-main your-main-project/kardiverse-layer/
```

#### Step 2: Update Main App Routing
```javascript
// In your main frontend (React/Vue/Angular)
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Your main app routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Kardiverse layer routes */}
      <Route path="/hologram/*" element={<KardiverseWrapper />} />
    </Routes>
  </BrowserRouter>
);

// Wrapper component
const KardiverseWrapper = () => (
  <iframe 
    src="/hologram" 
    width="100%" 
    height="100vh"
    style={{ border: 'none' }}
  />
);
```

#### Step 3: Update Main Backend
```python
# In your main backend (Django/Flask/FastAPI)
from django.urls import path, include

urlpatterns = [
    # Your main app URLs
    path('api/', include('your_main_app.urls')),
    
    # Kardiverse layer URLs
    path('api/kardiverse/', include('kardiverse_layer.urls')),
    
    # Serve Kardiverse frontend
    path('hologram/', include('kardiverse_layer.frontend_urls')),
]
```

#### Step 4: Environment Configuration
```env
# .env for unified deployment
VITE_API_URL=/api/kardiverse
VITE_QR_URL=/hologram/qr-scan
VITE_IS_UNIFIED=true
```

#### Step 5: Docker Compose (Optional)
```yaml
# docker-compose.yml
version: '3.8'
services:
  main-frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:8000
      - REACT_APP_KARDIVERSE_URL=http://localhost:3000/hologram
  
  main-backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/unified_db
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=unified_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
```

### Auto-Detection Features

The system automatically detects:

✅ **Integration Type**: Unified vs Standalone  
✅ **Platform**: localhost, Render, Vercel, Netlify, Heroku, Custom  
✅ **Environment**: Development, Staging, Production  
✅ **API URLs**: Correctly constructs API endpoints  
✅ **QR URLs**: Handles routing for unified structure  
✅ **CORS Settings**: Automatically allows same-origin requests  

### Integration Examples

#### React Integration
```jsx
// In your main React app
import React from 'react';

const HologramButton = () => {
  const openHologram = () => {
    window.location.href = '/hologram';
  };

  return (
    <button onClick={openHologram}>
      Activate Hologram
    </button>
  );
};
```

#### Vue Integration
```vue
<!-- In your main Vue app -->
<template>
  <div>
    <button @click="openHologram">Activate Hologram</button>
  </div>
</template>

<script>
export default {
  methods: {
    openHologram() {
      window.location.href = '/hologram';
    }
  }
};
</script>
```

#### Angular Integration
```typescript
// In your main Angular app
import { Component } from '@angular/core';

@Component({
  selector: 'app-hologram-button',
  template: `
    <button (click)="openHologram()">Activate Hologram</button>
  `
})
export class HologramButtonComponent {
  openHologram() {
    window.location.href = '/hologram';
  }
}
```

### Shared State Management

#### Redux Integration
```javascript
// In your main app's Redux store
const store = {
  state: {
    mainApp: { /* your main app state */ },
    kardiverse: {
      scanCount: 0,
      isActive: false
    }
  },
  
  actions: {
    async fetchKardiverseData({ commit }) {
      const response = await fetch('/api/kardiverse/scan-count/');
      const data = await response.json();
      commit('UPDATE_KARDIVERSE_SCAN_COUNT', data.count);
    }
  }
};
```

#### Vuex Integration
```javascript
// In your main app's Vuex store
const store = new Vuex.Store({
  state: {
    kardiverse: {
      scanCount: 0,
      isActive: false
    }
  },
  
  actions: {
    async fetchKardiverseData({ commit }) {
      const response = await fetch('/api/kardiverse/scan-count/');
      const data = await response.json();
      commit('UPDATE_KARDIVERSE_SCAN_COUNT', data.count);
    }
  }
});
```

### Deployment Scenarios

#### Development
```
localhost:3000/                    # Main app
localhost:3000/hologram/           # Kardiverse layer
localhost:8000/api/kardiverse/     # Backend API
```

#### Production (Custom Domain)
```
yourdomain.com/                    # Main app
yourdomain.com/hologram/           # Kardiverse layer
yourdomain.com/api/kardiverse/     # Backend API
```

#### Production (Platform)
```
yourapp.onrender.com/              # Main app
yourapp.onrender.com/hologram/     # Kardiverse layer
yourapp.onrender.com/api/kardiverse/ # Backend API
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