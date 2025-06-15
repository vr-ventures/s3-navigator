import React, { useState, useEffect } from 'react';
import { JsonViewer } from './components/JsonViewer';
import { MarkdownViewer } from './components/MarkdownViewer';
import { ImageViewer } from './components/ImageViewer';
import { FolderBrowser } from './components/FolderBrowser';
import { S3FileSelector } from './components/S3FileSelector';
import { Logo } from './components/Logo';
import { S3ObjectResult, S3ListResult } from './types/electron';

type ViewMode = 'selector' | 'browser' | 'viewer';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [currentBucket, setCurrentBucket] = useState<string>('');
  const [currentPrefix, setCurrentPrefix] = useState<string>('');
  const [folderData, setFolderData] = useState<S3ListResult | null>(null);
  const [fileData, setFileData] = useState<S3ObjectResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleBucketKeySubmit = async (bucket: string, key: string) => {
    setCurrentBucket(bucket);
    setError(null);
    
    // If key ends with / or is empty, treat as folder
    if (!key || key.endsWith('/')) {
      setCurrentPrefix(key || '');
      await loadFolder(bucket, key || '');
    } else {
      // Try to load as file first
      await loadFile(bucket, key);
    }
  };

  const loadFolder = async (bucket: string, prefix: string) => {
    setLoading(true);
    try {
      const data = await window.electron.s3.listObjects(bucket, prefix);
      setFolderData(data);
      setCurrentPrefix(prefix);
      setViewMode('browser');
      setFileData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folder');
    } finally {
      setLoading(false);
    }
  };

  const loadFile = async (bucket: string, key: string) => {
    setLoading(true);
    try {
      const data = await window.electron.s3.getObject(bucket, key);
      setFileData(data);
      setViewMode('viewer');
      setFolderData(null);
    } catch (err) {
      // If file loading fails, try as folder
      if (err instanceof Error && err.message.includes('NoSuchKey')) {
        await loadFolder(bucket, key.endsWith('/') ? key : key + '/');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load file');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFolderNavigate = async (key: string) => {
    await loadFolder(currentBucket, key);
  };

  const handleFileSelect = async (key: string) => {
    await loadFile(currentBucket, key);
  };

  const handleBackToSelector = () => {
    setViewMode('selector');
    setFolderData(null);
    setFileData(null);
    setError(null);
    setCurrentBucket('');
    setCurrentPrefix('');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <p>🧭 Navigating...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-message">
          <h3>Navigation Error</h3>
          <p>{error}</p>
          <button onClick={handleBackToSelector}>🏠 Back to Navigator</button>
        </div>
      );
    }

    switch (viewMode) {
      case 'selector':
        return <S3FileSelector onFileSelect={handleBucketKeySubmit} />;
      
      case 'browser':
        if (!folderData) return null;
        return (
          <FolderBrowser
            folders={folderData.folders}
            files={folderData.files}
            currentPrefix={currentPrefix}
            onNavigate={handleFolderNavigate}
            onFileSelect={handleFileSelect}
          />
        );
      
      case 'viewer':
        if (!fileData) return null;
        
        switch (fileData.type) {
          case 'json':
            return <JsonViewer data={fileData.data} />;
          
          case 'markdown':
            return (
              <MarkdownViewer 
                content={fileData.data} 
                fileName={fileData.key.split('/').pop()} 
              />
            );
          
          case 'image':
            return (
              <ImageViewer
                base64Data={fileData.data}
                contentType={fileData.contentType || 'image/png'}
                fileName={fileData.key.split('/').pop()}
              />
            );
          
          default:
            return (
              <div className="text-viewer">
                <h2>📄 {fileData.key.split('/').pop()}</h2>
                <pre className="text-content">{fileData.data}</pre>
                {fileData.error && (
                  <div className="file-error">
                    <p><strong>Note:</strong> {fileData.error}</p>
                  </div>
                )}
              </div>
            );
        }
      
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <Logo size={36} showText={true} />
        {viewMode !== 'selector' && (
          <div className="header-controls">
            <button onClick={handleBackToSelector} className="back-button">
              🏠 New Search
            </button>
            {viewMode === 'viewer' && folderData && (
              <button onClick={() => setViewMode('browser')} className="back-button">
                📁 Back to Folder
              </button>
            )}
          </div>
        )}
      </header>
      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
};

export default App; 