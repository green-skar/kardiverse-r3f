// Custom build script to ensure proper SPA routing
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building with SPA routing support...');

// Run the normal build
execSync('npm run build', { stdio: 'inherit' });

// Create multiple redirect formats for maximum compatibility
const redirectsContent = `# SPA routing for all paths
/* /index.html 200

# Specific routes for better compatibility
/projector /index.html 200
/qr-scan /index.html 200
/video-export /index.html 200
/mobile /index.html 200`;

// Netlify/Render format
const distRedirectsPath = path.join(__dirname, 'dist', '_redirects');
fs.writeFileSync(distRedirectsPath, redirectsContent);

// Apache .htaccess format (backup)
const htaccessContent = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`;

const distHtaccessPath = path.join(__dirname, 'dist', '.htaccess');
fs.writeFileSync(distHtaccessPath, htaccessContent);

// Nginx format (backup)
const nginxContent = `try_files $uri $uri/ /index.html;`;
const distNginxPath = path.join(__dirname, 'dist', 'nginx.conf');
fs.writeFileSync(distNginxPath, nginxContent);

// Ensure 404.html exists in dist
const dist404Path = path.join(__dirname, 'dist', '404.html');
const public404Path = path.join(__dirname, 'public', '404.html');
if (fs.existsSync(public404Path)) {
    fs.copyFileSync(public404Path, dist404Path);
}

// Create a simple index.html copy for each route (backup method)
const routes = ['projector', 'qr-scan', 'video-export', 'mobile'];
const indexHtmlPath = path.join(__dirname, 'dist', 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

routes.forEach(route => {
    const routeDir = path.join(__dirname, 'dist', route);
    if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
    }
    const routeIndexPath = path.join(routeDir, 'index.html');
    fs.writeFileSync(routeIndexPath, indexHtmlContent);
});

console.log('✅ Build complete with comprehensive SPA routing support!');
console.log('📁 Files created:');
console.log('   - dist/_redirects (Netlify/Render format)');
console.log('   - dist/.htaccess (Apache format)');
console.log('   - dist/nginx.conf (Nginx format)');
console.log('   - dist/404.html (Fallback)');
console.log('   - dist/projector/index.html (Route backup)');
console.log('   - dist/qr-scan/index.html (Route backup)');
console.log('   - dist/video-export/index.html (Route backup)');
console.log('   - dist/mobile/index.html (Route backup)');
