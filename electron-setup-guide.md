# S3 File Viewer - Electron Setup Guide

## Overview

This guide will help you convert the web application into a full Electron.js desktop application with real S3 integration.

## Project Structure

```
s3-file-viewer/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.js     # Main Electron process
│   │   └── preload.js  # Preload script for secure IPC
│   ├── renderer/       # Electron renderer process (UI)
│   │   ├── index.html  # Main HTML file
│   │   ├── style.css   # Application styles
│   │   └── app.js      # Main application logic
│   └── shared/         # Shared utilities
├── package.json        # Node.js dependencies
└── electron-builder.json # Build configuration
```

## Step 1: Initialize Electron Project

```bash
# Create new directory
mkdir s3-file-viewer-electron
cd s3-file-viewer-electron

# Initialize npm project
npm init -y

# Install Electron and dependencies
npm install --save-dev electron electron-builder
npm install --save @aws-sdk/client-s3 @aws-sdk/credential-providers
```

## Step 2: Create Main Process (main.js)

```javascript
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { fromIni } = require('@aws-sdk/credential-providers');

let mainWindow;
let s3Client;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'), // Add your app icon
    titleBarStyle: 'default',
    show: false
  });

  mainWindow.loadFile('src/renderer/index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

// S3 Configuration
ipcMain.handle('configure-s3', async (event, config) => {
  try {
    s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// List S3 Objects
ipcMain.handle('list-s3-objects', async (event, { bucket, prefix = '' }) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/'
    });
    
    const response = await s3Client.send(command);
    return {
      success: true,
      objects: response.Contents || [],
      folders: response.CommonPrefixes || []
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get S3 Object Content
ipcMain.handle('get-s3-object', async (event, { bucket, key }) => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await s3Client.send(command);
    const content = await response.Body.transformToString();
    
    return {
      success: true,
      content: content,
      contentType: response.ContentType,
      lastModified: response.LastModified,
      size: response.ContentLength
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

## Step 3: Create Preload Script (preload.js)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  configureS3: (config) => ipcRenderer.invoke('configure-s3', config),
  listS3Objects: (params) => ipcRenderer.invoke('list-s3-objects', params),
  getS3Object: (params) => ipcRenderer.invoke('get-s3-object', params)
});
```

## Step 4: Update Package.json

```json
{
  "name": "s3-file-viewer",
  "version": "1.0.0",
  "description": "Desktop app for viewing S3 files",
  "main": "src/main/main.js",
  "scripts": {
    "start": "electron .",
    "dev": "NODE_ENV=development electron .",
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "com.yourcompany.s3-file-viewer",
    "productName": "S3 File Viewer",
    "directories": {
      "output": "dist"
    },
    "files": [
      "src/**/*",
      "node_modules/**/*"
    ],
    "mac": {
      "category": "public.app-category.developer-tools"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.450.0",
    "@aws-sdk/credential-providers": "^3.450.0"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.6.4"
  }
}
```

## Step 5: Update Renderer JavaScript

Replace the mock S3 functions in `app.js` with real Electron IPC calls:

```javascript
// Replace mock functions with real S3 integration
class S3Manager {
  async configure(credentials) {
    return await window.electronAPI.configureS3(credentials);
  }

  async listObjects(bucket, prefix) {
    return await window.electronAPI.listS3Objects({ bucket, prefix });
  }

  async getObject(bucket, key) {
    return await window.electronAPI.getS3Object({ bucket, key });
  }
}

const s3Manager = new S3Manager();
```

## Step 6: Security Considerations

1. **Never hardcode credentials** in your application
2. Use environment variables or AWS credential files
3. Implement proper error handling for network failures
4. Consider implementing credential encryption for stored configs

## Step 7: Additional Features to Implement

### File Download
```javascript
// In main.js
ipcMain.handle('download-file', async (event, { bucket, key, savePath }) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(command);
    const buffer = await response.Body.transformToByteArray();
    
    require('fs').writeFileSync(savePath, buffer);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Auto-updater
```javascript
// Add to package.json dependencies
"electron-updater": "^6.1.4"

// In main.js
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### Menu Bar
```javascript
const { Menu } = require('electron');

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Configure S3',
        accelerator: 'CmdOrCtrl+,',
        click: () => {
          mainWindow.webContents.send('open-settings');
        }
      },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' }
    ]
  }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));
```

## Step 8: Build and Distribute

```bash
# For current platform
npm run build

# For specific platforms
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

## Key Features Implemented

1. **Real S3 Integration** - Uses AWS SDK v3 for actual S3 operations
2. **Secure IPC Communication** - Proper separation between main and renderer processes
3. **Professional UI** - Modern, VS Code-inspired interface
4. **JSON Viewer** - Collapsible tree view with syntax highlighting
5. **Markdown Renderer** - Full markdown support with proper formatting
6. **Tabbed Interface** - Multiple files can be opened simultaneously
7. **Error Handling** - Comprehensive error handling and user feedback
8. **Cross-platform** - Works on Windows, macOS, and Linux

## Next Steps

1. Test the application with your actual S3 buckets
2. Add more file type support (CSV, XML, etc.)
3. Implement file caching for offline viewing
4. Add search functionality across multiple files
5. Create installer packages for distribution
6. Set up auto-updater for seamless updates

This setup provides a solid foundation for your S3 file viewer application that can be easily extended and customized for your specific needs.