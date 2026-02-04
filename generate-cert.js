const { execSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

console.log('🔐 Generating SSL certificates for HTTPS...\n');

const platform = os.platform();

function checkOpenSSL() {
  try {
    execSync('openssl version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

try {
  if (platform === 'win32') {
    // Check if OpenSSL is available (common on Windows 10+)
    if (checkOpenSSL()) {
      console.log('Using OpenSSL to generate certificate...\n');
      if (!fs.existsSync('cert.pem') || !fs.existsSync('key.pem')) {
        execSync('openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"', { stdio: 'inherit' });
        console.log('\n✅ Certificate generated successfully!');
      } else {
        console.log('⚠️  Certificates already exist. Delete cert.pem and key.pem to regenerate.');
        return;
      }
    } else {
      console.log('⚠️  OpenSSL not found. Please use one of these methods:\n');
      console.log('Option 1: Install OpenSSL');
      console.log('  - Download from: https://slproweb.com/products/Win32OpenSSL.html');
      console.log('  - Or use: choco install openssl\n');
      console.log('Option 2: Use mkcert (Recommended)');
      console.log('  - Install: choco install mkcert');
      console.log('  - Run: mkcert -install');
      console.log('  - Run: mkcert localhost');
      console.log('  - Rename: move localhost.pem cert.pem && move localhost-key.pem key.pem\n');
      console.log('Option 3: Manual PowerShell (Advanced)');
      console.log('  Open PowerShell as Administrator and run:');
      console.log('  $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\CurrentUser\\My"');
      console.log('  Then export manually using Certificate Manager\n');
      return;
    }
  } else {
    // Linux/Mac using OpenSSL
    if (!checkOpenSSL()) {
      console.log('❌ OpenSSL not found. Please install it first:');
      console.log('  Mac: brew install openssl');
      console.log('  Ubuntu/Debian: sudo apt-get install openssl');
      console.log('  Fedora: sudo dnf install openssl\n');
      return;
    }
    
    console.log('Using OpenSSL to generate certificate...\n');
    
    if (!fs.existsSync('cert.pem') || !fs.existsSync('key.pem')) {
      execSync('openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"', { stdio: 'inherit' });
      console.log('\n✅ Certificate generated successfully!');
    } else {
      console.log('⚠️  Certificates already exist. Delete cert.pem and key.pem to regenerate.');
      return;
    }
  }
  
  console.log('\n📝 Next steps:');
  console.log('  1. Run: npm install');
  console.log('  2. Run: npm start');
  console.log('  3. Open: https://localhost:8443');
  console.log('  4. Accept the self-signed certificate warning in your browser\n');
} catch (error) {
  console.error('❌ Error generating certificate:', error.message);
  console.log('\n📋 Manual instructions:');
  
  if (platform === 'win32') {
    console.log('Windows:');
    console.log('  1. Install OpenSSL or mkcert');
    console.log('  2. Or use PowerShell Certificate Manager');
  } else {
    console.log('Linux/Mac:');
    console.log('  Run: openssl req -x509 -newkey rsa:4096 -nodes -keyout key.pem -out cert.pem -days 365 -subj "/CN=localhost"');
  }
}
