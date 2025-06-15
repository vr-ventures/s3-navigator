const { execSync } = require('child_process');
const path = require('path');

// Build React app
console.log('Building React app...');
execSync('npm run build', { stdio: 'inherit' });

// Compile TypeScript
console.log('Compiling TypeScript...');
execSync('tsc', { stdio: 'inherit' });

// Start Electron
console.log('Starting Electron...');
execSync('electron .', { stdio: 'inherit' }); 