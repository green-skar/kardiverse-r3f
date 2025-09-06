# Kardiverse Hologram Demo

A full-stack demo for a holographic avatar experience using React, TypeScript, React Three Fiber (R3F), and Express. This project demonstrates interactive 3D avatars, QR code activation, scan tracking, and remote control features for immersive installations or digital kiosks.

---

## Features

- **3D Hologram Avatar**  
  Real-time animated avatar rendered with Three.js and React Three Fiber, including lipsync and gesture support.

- **QR Code Activation**  
  Users can activate the hologram experience by scanning a QR code, enabling seamless mobile interaction.

- **Scan Counter with PostgreSQL**  
  Tracks the number of QR code scans and logs them to a PostgreSQL database for analytics and engagement tracking.

- **Remote Control Page**  
  A web interface to trigger avatar actions or switch scenes remotely, ideal for operators or event staff.

- **Projector Mode**  
  Special display mode for large screens or projectors, optimized for public installations.

- **TypeScript Everywhere**  
  Both client and server codebases are written in TypeScript for type safety and maintainability.

- **Docker Support**  
  Easily build and deploy the app in a containerized environment.

---

## Getting Started

### 1. Install Dependencies

npm install

### 2 Development
Start the Vite development server:
Visit: http://localhost:5173

3. Production Build
Build the frontend and server:

npm run build

4. Start Server
Launch the production server:

npm start

This runs: node dist/server.js
Visit: http://localhost:8080

### API Server (Scan Counter, Optional)
If you want to use the scan counter API with PostgreSQL:

1. Set up a PostgreSQL database and note the connection 
string.
2. Set the DATABASE_URL environment variable.
3. Start the API server:

cd server
npm install
npm start

### Environment Variables
DATABASE_URL – PostgreSQL connection string (for scan counter API)
AI_TTS_API_KEY – (Optional) API key for TTS forwarding, if implemented

### Scripts
npm run dev – Start Vite dev server for development
npm run build – Build frontend and server for production
npm start – Run production server (node dist/server.js)
npm run preview – Preview production build locally

/src        – React frontend (R3F, components, pages)
/public     – Static assets (3D models, textures, audio)
/server     – Optional API server (scan counter, PostgreSQL)
/dist       – Production build output
tools/      – Utility scripts (QR code generator, puppeteer recorder)
Dockerfile  – For containerized deployment

### Tools
QR Code Generator:
Generate QR codes for NFC/mobile activation (tools/generate-qr.js).

Puppeteer Recorder:
Record projector output to PNG frames for demos or video (tools/puppeteer-record.js).

### Credits
Built with React Three Fiber, Three.js, Express, and Vite.

### Kardiverse Hologram Demo
For more information, see the main repository or contact the author. ```