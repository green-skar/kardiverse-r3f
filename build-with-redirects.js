// Custom build script to ensure proper SPA routing
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building with SPA routing support...');

// Run the normal build
execSync('npm run build', { stdio: 'inherit' });

// Ensure _redirects file exists in dist
const redirectsContent = `# SPA routing for all paths
/* /index.html 200

# Fallback for common routes
/projector /index.html 200
/qr-scan /index.html 200
/video-export /index.html 200
/mobile /index.html 200`;

const distRedirectsPath = path.join(__dirname, 'dist', '_redirects');
fs.writeFileSync(distRedirectsPath, redirectsContent);

// Ensure 404.html exists in dist
const dist404Path = path.join(__dirname, 'dist', '404.html');
const public404Path = path.join(__dirname, 'public', '404.html');
if (fs.existsSync(public404Path)) {
    fs.copyFileSync(public404Path, dist404Path);
}

console.log('✅ Build complete with SPA routing support!');
console.log('📁 Files created:');
console.log('   - dist/_redirects');
console.log('   - dist/404.html');
