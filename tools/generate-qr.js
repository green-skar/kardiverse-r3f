/*
generate-qr.js
Usage: node generate-qr.js https://yourdomain.com/kardiverse out.png
*/
const QRCode = require('qrcode'); const fs=require('fs'); const url=process.argv[2]||'https://example.com/kardiverse'; const out=process.argv[3]||'kardiverse-qr.png'; QRCode.toFile(out, url, {width:1024}, function(err){ if(err)console.error(err); else console.log('QR saved to', out)});
