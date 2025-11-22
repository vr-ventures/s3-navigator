const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building S3 Navigator for unsigned distribution...');

// Build the app
execSync('npm run build', { stdio: 'inherit' });

// Build DMG without signing
execSync('electron-builder --mac --publish=never', { stdio: 'inherit' });

// Create instructions file
const instructions = `
# S3 Navigator Installation Instructions

## macOS Security Notice
When you first try to open S3 Navigator, macOS may show a security warning saying the app is "damaged". This is normal for unsigned applications.

## How to Install:
1. Download and mount the DMG file
2. Drag S3 Navigator to your Applications folder
3. If you see a "damaged" error when opening:

### Option 1 (Recommended): Using Terminal
Open Terminal and run:
\`\`\`
sudo xattr -rd com.apple.quarantine "/Applications/S3 Navigator.app"
\`\`\`

### Option 2: System Preferences
1. Go to System Preferences → Security & Privacy → General
2. Try to open S3 Navigator
3. Click "Open Anyway" when the option appears

## About S3 Navigator
A universal S3 file browser and viewer with support for JSON, Markdown, Images, and folder navigation.

Developed by VR Enterprises
`;

fs.writeFileSync(path.join(__dirname, 'release', 'INSTALLATION_INSTRUCTIONS.txt'), instructions);

console.log('Build complete! Check the release folder for your DMG and installation instructions.'); 