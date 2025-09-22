// Environment Configuration
export const ENV = {
  // API URL - defaults to Django backend running on Render
  API_URL: (import.meta as any).env?.VITE_API_URL || 'https://kardiverse-backend.onrender.com',
  
  // QR Code URL - update this to your deployed frontend URL
  QR_URL: (import.meta as any).env?.VITE_QR_URL || 'https://kardiverse-frontend.onrender.com/qr-scan',
  
  // Development mode
  IS_DEV: (import.meta as any).env?.DEV,
  
  // Production mode
  IS_PROD: (import.meta as any).env?.PROD,
};

export default ENV;
