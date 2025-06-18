import React, { useState, useEffect } from 'react';
import Icon from './components/Icon';
import { JsonViewer } from './components/JsonViewer';
import { MarkdownViewer } from './components/MarkdownViewer';
import { HtmlViewer } from './components/HtmlViewer';
import { ImageViewer } from './components/ImageViewer';
import { FolderBrowser } from './components/FolderBrowser';
import { S3FileSelector } from './components/S3FileSelector';
import { Breadcrumb } from './components/Breadcrumb';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { useBookmarkedBuckets } from './hooks/useBookmarkedBuckets';
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const { bookmarkedBuckets, addBookmark, removeBookmark, isBookmarked } = useBookmarkedBuckets();

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
      // Set the current prefix to the parent folder of the file
      const parentPrefix = key.substring(0, key.lastIndexOf('/') + 1);
      setCurrentPrefix(parentPrefix);
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

  const handleBackToFolder = async () => {
    if (currentBucket && currentPrefix !== undefined) {
      await loadFolder(currentBucket, currentPrefix);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBookmarkToggle = (bucket: string) => {
    if (isBookmarked(bucket)) {
      removeBookmark(bucket);
    } else {
      addBookmark(bucket);
    }
  };

  const handleSidebarBucketSelect = async (bucket: string) => {
    await handleBucketKeySubmit(bucket, '');
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton type={viewMode === 'viewer' ? 'viewer' : 'folder'} />;
    }

    if (error) {
      return (
        <div className="error-message">
          <h3>Navigation Error</h3>
          <p>{error}</p>
          <button onClick={handleBackToSelector}>
            <Icon name="house" /> Back to Navigator
          </button>
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
            currentBucket={currentBucket}
            onNavigate={handleFolderNavigate}
            onFileSelect={handleFileSelect}
          />
        );

      case 'viewer':
        if (!fileData) return null;

        const fileName = fileData.key.split('/').pop();

        switch (fileData.type) {
          case 'json':
            return (
              <div className="viewer-container">
                <div className="viewer-header">
                  <h2><Icon name="filetype-json" /> {fileName}</h2>
                  <button onClick={handleBackToFolder} className="folder-nav-button">
                    <Icon name="folder" /> Browse Folder
                  </button>
                </div>
                <JsonViewer data={fileData.data} />
              </div>
            );

          case 'markdown':
            return (
              <div className="viewer-container">
                <div className="viewer-header">
                  <h2><Icon name="markdown" /> {fileName}</h2>
                  <button onClick={handleBackToFolder} className="folder-nav-button">
                    <Icon name="folder" /> Browse Folder
                  </button>
                </div>
                <MarkdownViewer
                  content={fileData.data}
                  fileName={fileName}
                />
              </div>
            );

          case 'html':
            return (
              <div className="viewer-container">
                <div className="viewer-header">
                  <h2><Icon name="filetype-html" /> {fileName}</h2>
                  <button onClick={handleBackToFolder} className="folder-nav-button">
                    <Icon name="folder" /> Browse Folder
                  </button>
                </div>
                <HtmlViewer
                  content={fileData.data}
                  fileName={fileName}
                />
              </div>
            );

          case 'image':
            return (
              <div className="viewer-container">
                <div className="viewer-header">
                  <h2><Icon name="file-image" /> {fileName}</h2>
                  <button onClick={handleBackToFolder} className="folder-nav-button">
                    <Icon name="folder" /> Browse Folder
                  </button>
                </div>
                <ImageViewer
                  base64Data={fileData.data}
                  contentType={fileData.contentType || 'image/png'}
                  fileName={fileName}
                />
              </div>
            );

          case 'html':
            return (
              <div className="viewer-container">
                <div className="viewer-header">
                  <h2><Icon name="filetype-html" /> {fileName}</h2>
                  <button onClick={handleBackToFolder} className="folder-nav-button">
                    <Icon name="folder" /> Browse Folder
                  </button>
                </div>
                <HtmlViewer
                  content={fileData.data}
                  fileName={fileName}
                />
              </div>
            );

          default:
            return (
              <div className="viewer-container">
                <div className="viewer-header">
                  <h2><Icon name="file-text" /> {fileName}</h2>
                  <button onClick={handleBackToFolder} className="folder-nav-button">
                    <Icon name="folder" /> Browse Folder
                  </button>
                </div>
                <div className="text-viewer">
                  <pre className="text-content">{fileData.data}</pre>
                  {fileData.error && (
                    <div className="file-error">
                      <p><strong>Note:</strong> {fileData.error}</p>
                    </div>
                  )}
                </div>
              </div>
            );
        }

      default:
        return null;
    }
  };

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-expanded' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        bookmarkedBuckets={bookmarkedBuckets}
        currentBucket={currentBucket}
        onBucketSelect={handleSidebarBucketSelect}
        onRemoveBookmark={removeBookmark}
      />

      <div className="app-content">
        {/* Breadcrumb navigation - shown when not in selector mode */}
        {viewMode !== 'selector' && currentBucket && (
          <div className="breadcrumb-section">
            <Breadcrumb
              bucket={currentBucket}
              currentPrefix={currentPrefix}
              onNavigate={handleFolderNavigate}
              onBackToSelector={handleBackToSelector}
              onBookmarkBucket={handleBookmarkToggle}
              isBookmarked={isBookmarked(currentBucket)}
            />
          </div>
        )}

        <main className="app-main">
          {renderContent()}
        </main>

        <footer className="app-footer">
          <p>Made with <Icon name="heart-fill" /> by <strong>VR Enterprises</strong></p>
        </footer>
      </div>
    </div>
  );
};

export default App; 