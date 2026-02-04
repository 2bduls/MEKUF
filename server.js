const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;
const HTTP_PORT = process.env.PORT || 8080;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Check if SSL certificates exist
const certPath = path.join(__dirname, 'cert.pem');
const keyPath = path.join(__dirname, 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  // HTTPS server
  const options = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  };

  https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`🚀 HTTPS Server running at https://localhost:${HTTPS_PORT}`);
    console.log(`📝 Note: You may need to accept the self-signed certificate warning`);
  });

  // Redirect HTTP to HTTPS
  const http = require('http');
  http.createServer((req, res) => {
    const host = req.headers.host?.replace(`:${HTTP_PORT}`, `:${HTTPS_PORT}`) || `localhost:${HTTPS_PORT}`;
    res.writeHead(301, { "Location": `https://${host}${req.url}` });
    res.end();
  }).listen(HTTP_PORT, () => {
    console.log(`🔄 HTTP redirect server running at http://localhost:${HTTP_PORT}`);
    console.log(`   (redirects to https://localhost:${HTTPS_PORT})`);
  });
} else {
  console.log('⚠️  SSL certificates not found!');
  console.log('📋 Generating self-signed certificates...');
  console.log('');
  console.log('Please run one of the following commands to generate certificates:');
  console.log('');
  console.log('For Windows (PowerShell):');
  console.log('  $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\LocalMachine\\My"');
  console.log('  Export-Certificate -Cert $cert -FilePath cert.pem');
  console.log('  $key = [System.Convert]::ToBase64String($cert.GetRawCertData())');
  console.log('');
  console.log('For Linux/Mac (OpenSSL):');
  console.log('  openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"');
  console.log('');
  console.log('Or use the generate-cert script:');
  console.log('  npm run generate-cert');
  console.log('');
  console.log('Starting HTTP server instead...');
  
  // Fallback to HTTP if no certificates
  app.listen(HTTP_PORT, () => {
    console.log(`🌐 HTTP Server running at http://localhost:${HTTP_PORT}`);
  });
}
