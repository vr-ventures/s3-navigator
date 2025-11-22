import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';

const s3Client = new S3Client({
  credentials: fromNodeProviderChain()
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from localhost
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

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

// Helper function to determine file type
function getFileType(key: string, contentType?: string): 'json' | 'markdown' | 'html' | 'image' | 'folder' | 'other' {
  // If key ends with /, it's a folder
  if (key.endsWith('/')) {
    return 'folder';
  }

  const extension = path.extname(key).toLowerCase();

  // Check by extension first
  if (['.json'].includes(extension)) {
    return 'json';
  }

  if (['.md', '.markdown'].includes(extension)) {
    return 'markdown';
  }

  if (['.html', '.htm'].includes(extension)) {
    return 'html';
  }

  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'].includes(extension)) {
    return 'image';
  }

  // Check by content type if available
  if (contentType) {
    if (contentType.includes('application/json')) {
      return 'json';
    }
    if (contentType.includes('text/markdown')) {
      return 'markdown';
    }
    if (contentType.includes('text/html')) {
      return 'html';
    }
    if (contentType.startsWith('image/')) {
      return 'image';
    }
  }

  return 'other';
}

// Handle IPC events for S3 operations
ipcMain.handle('get-s3-object', async (event, { bucket, key }) => {
  console.log('Main: get-s3-object called', { bucket, key });
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });

    const response = await s3Client.send(command);
    const fileType = getFileType(key, response.ContentType);

    if (fileType === 'image') {
      // For images, return the binary data as base64
      const bodyContents = await response.Body?.transformToByteArray();
      if (bodyContents) {
        const base64 = Buffer.from(bodyContents).toString('base64');
        return {
          type: 'image',
          data: base64,
          contentType: response.ContentType,
          key: key
        };
      }
    } else {
      // For text-based files (JSON, markdown, etc.)
      const bodyContents = await response.Body?.transformToString();
      if (bodyContents) {
        if (fileType === 'json') {
          try {
            const jsonData = JSON.parse(bodyContents);
            return {
              type: 'json',
              data: jsonData,
              key: key
            };
          } catch (parseError) {
            // If JSON parsing fails, treat as text
            return {
              type: 'other',
              data: bodyContents,
              key: key,
              error: 'Invalid JSON format'
            };
          }
        } else if (fileType === 'markdown') {
          return {
            type: 'markdown',
            data: bodyContents,
            key: key
          };
        } else if (fileType === 'html') {
          return {
            type: 'html',
            data: bodyContents,
            key: key
          };
        } else {
          return {
            type: 'other',
            data: bodyContents,
            key: key
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching S3 object:', error);
    throw error;
  }
});

// Handle listing S3 objects (for folder browsing)
ipcMain.handle('list-s3-objects', async (event, { bucket, prefix = '' }) => {
  console.log('Main: list-s3-objects called', { bucket, prefix });
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/' // This groups objects by "folders"
    });

    const response = await s3Client.send(command);

    const folders = (response.CommonPrefixes || []).map(prefix => ({
      type: 'folder' as const,
      key: prefix.Prefix!,
      name: prefix.Prefix!.replace(prefix.Prefix!.substring(0, prefix.Prefix!.lastIndexOf('/', prefix.Prefix!.length - 2) + 1), ''),
      size: 0,
      lastModified: null
    }));

    const files = (response.Contents || [])
      .filter(obj => obj.Key !== prefix) // Filter out the folder itself
      .map(obj => ({
        type: getFileType(obj.Key!, obj.Key?.includes('.') ? undefined : 'application/octet-stream'),
        key: obj.Key!,
        name: path.basename(obj.Key!),
        size: obj.Size || 0,
        lastModified: obj.LastModified || null
      }))
      .sort((a, b) => {
        // Sort by most recent first (descending order)
        if (!a.lastModified) return 1;
        if (!b.lastModified) return -1;
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
      });

    return {
      folders,
      files,
      prefix: prefix
    };
  } catch (error) {
    console.error('Error listing S3 objects:', error);
    throw error;
  }
});

// Handle searching S3 objects across the entire bucket
ipcMain.handle('search-s3-objects', async (event, { bucket, searchTerm, currentPrefix = '' }) => {
  console.log('Main: search-s3-objects called', { bucket, searchTerm, currentPrefix });
  try {
    const allResults: any[] = [];
    let continuationToken: string | undefined;

    // Search with pagination
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: currentPrefix, // Search within current folder and subfolders
        ContinuationToken: continuationToken,
        MaxKeys: 1000
      });

      const response = await s3Client.send(command);

      if (response.Contents) {
        // Filter results that match the search term (support full path, partial path, and filename)
        const matchingFiles = response.Contents
          .filter(obj => {
            const key = obj.Key || '';
            const fileName = path.basename(key);
            const lowerKey = key.toLowerCase();
            const lowerSearch = searchTerm.toLowerCase();

            // Match full path, partial path, or filename
            return lowerKey.includes(lowerSearch) || fileName.toLowerCase().includes(lowerSearch);
          })
          .map(obj => ({
            type: getFileType(obj.Key!, obj.Key?.includes('.') ? undefined : 'application/octet-stream'),
            key: obj.Key!,
            name: path.basename(obj.Key!),
            size: obj.Size || 0,
            lastModified: obj.LastModified || null,
            fullPath: obj.Key! // Include full path for display
          }));

        allResults.push(...matchingFiles);
      }

      continuationToken = response.NextContinuationToken;

      // Limit to prevent excessive searching (max 5000 items checked)
      if (allResults.length >= 100 || !continuationToken) {
        break;
      }
    } while (continuationToken);

    // Sort by most recent first
    allResults.sort((a, b) => {
      if (!a.lastModified) return 1;
      if (!b.lastModified) return -1;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });

    return {
      results: allResults.slice(0, 100), // Return max 100 results
      totalFound: allResults.length
    };
  } catch (error) {
    console.error('Error searching S3 objects:', error);
    throw error;
  }
}); 