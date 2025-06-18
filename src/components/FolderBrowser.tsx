import React, { useState, useEffect, useRef } from 'react';
import { S3Item } from '../types/electron';

interface FolderBrowserProps {
  folders: S3Item[];
  files: S3Item[];
  currentPrefix: string;
  currentBucket: string;
  onNavigate: (key: string) => void;
  onFileSelect: (key: string) => void;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({
  folders,
  files,
  currentPrefix,
  currentBucket,
  onNavigate,
  onFileSelect
}) => {
  const [jumpPath, setJumpPath] = useState('');
  const [isJumping, setIsJumping] = useState(false);
  const [jumpError, setJumpError] = useState('');
  const [showLocalSearch, setShowLocalSearch] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const jumpInputRef = useRef<HTMLInputElement>(null);

  // Handle direct navigation to a folder path
  const handleJumpToFolder = async () => {
    if (!jumpPath.trim()) return;

    setIsJumping(true);
    setJumpError('');

    try {
      // Normalize the path - ensure it ends with / for folders
      let targetPath = jumpPath.trim();
      if (!targetPath.endsWith('/')) {
        targetPath += '/';
      }

      // If it's a relative path, combine with current prefix
      let fullPath;
      if (targetPath.startsWith('/')) {
        // Absolute path from bucket root
        fullPath = targetPath.substring(1);
      } else {
        // Relative path from current location
        fullPath = currentPrefix + targetPath;
      }

      // Try to navigate to the path
      onNavigate(fullPath);
      setJumpPath('');
    } catch (error) {
      setJumpError('Could not access this folder path');
    } finally {
      setIsJumping(false);
    }
  };

  // Handle Enter key in jump input
  const handleJumpKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleJumpToFolder();
    }
  };

  // Auto-complete suggestions based on visible folders
  const getSuggestions = () => {
    if (!jumpPath) return [];
    return folders
      .filter(folder => folder.name.toLowerCase().startsWith(jumpPath.toLowerCase()))
      .slice(0, 5)
      .map(folder => folder.name);
  };

  // Local search for current page (when enabled)
  const filteredFolders = showLocalSearch
    ? folders.filter(folder => folder.name.toLowerCase().includes(localSearchTerm.toLowerCase()))
    : folders;

  const filteredFiles = showLocalSearch
    ? files.filter(file => file.name.toLowerCase().includes(localSearchTerm.toLowerCase()))
    : files;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault();
        jumpInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getFileIcon = (type: string, fileName?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();

    switch (type) {
      case 'folder': return '📁';
      case 'json': return '🔗';
      case 'markdown': return '📝';
      case 'html': return '🌐';
      case 'image':
        switch (extension) {
          case 'jpg':
          case 'jpeg': return '🖼️';
          case 'png': return '🖼️';
          case 'gif': return '🎞️';
          case 'svg': return '🎨';
          default: return '🖼️';
        }
      case 'text':
        switch (extension) {
          case 'csv': return '📊';
          case 'xml': return '📋';
          case 'yaml':
          case 'yml': return '⚙️';
          case 'log': return '📜';
          default: return '📄';
        }
      default:
        switch (extension) {
          case 'pdf': return '📕';
          case 'zip':
          case 'tar':
          case 'gz': return '📦';
          case 'mp4':
          case 'avi':
          case 'mov': return '🎬';
          case 'mp3':
          case 'wav': return '🎵';
          default: return '📄';
        }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const handleDownload = async (fileKey: string, fileName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    try {
      // Request file data from main process
      const fileData = await window.electron.s3.getObject(currentBucket, fileKey);

      // Create download link
      let data = fileData.data;
      let mimeType = fileData.contentType || 'application/octet-stream';

      // Handle different data types
      if (typeof data === 'object' && fileData.type === 'json') {
        data = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
      } else if (fileData.type === 'image' && data.startsWith('data:')) {
        // For base64 images, convert back to blob
        const response = await fetch(data);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Could add toast notification here
    }
  };

  const handleCopyS3Url = async (fileKey: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent row click
    const s3Url = `s3://${currentBucket}/${fileKey}`;
    try {
      await navigator.clipboard.writeText(s3Url);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const totalItems = folders.length + files.length;
  const suggestions = getSuggestions();

  return (
    <div className="folder-browser">
      {/* Jump to Folder Header */}
      <div className="folder-navigation-header">
        <div className="jump-container">
          <div className="jump-input-wrapper">
            <span className="jump-icon">🚀</span>
            <input
              ref={jumpInputRef}
              type="text"
              value={jumpPath}
              onChange={(e) => setJumpPath(e.target.value)}
              onKeyDown={handleJumpKeyDown}
              placeholder="Jump to folder path... (Ctrl+G or type: folder-name/ or /absolute/path/)"
              className="jump-input"
              disabled={isJumping}
            />
            <button
              onClick={handleJumpToFolder}
              className="jump-button"
              disabled={!jumpPath.trim() || isJumping}
            >
              {isJumping ? '🔄' : '→'}
            </button>
          </div>

          {/* Auto-complete suggestions */}
          {suggestions.length > 0 && jumpPath && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setJumpPath(suggestion);
                    jumpInputRef.current?.focus();
                  }}
                >
                  📁 {suggestion}
                </button>
              ))}
            </div>
          )}

          {jumpError && (
            <div className="jump-error">
              ⚠️ {jumpError}
            </div>
          )}
        </div>

        {/* Local search toggle for current page */}
        <div className="local-search-controls">
          <button
            onClick={() => setShowLocalSearch(!showLocalSearch)}
            className={`local-search-toggle ${showLocalSearch ? 'active' : ''}`}
          >
            🔍 Search Current Page ({totalItems} items)
          </button>

          {showLocalSearch && (
            <div className="local-search-input-wrapper">
              <input
                type="text"
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                placeholder="Filter current page..."
                className="local-search-input"
              />
              {localSearchTerm && (
                <button
                  onClick={() => setLocalSearchTerm('')}
                  className="local-search-clear"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="folder-content">
        <table className="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Modified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFolders.map((folder) => (
              <tr key={folder.key} className="folder-row" onClick={() => onNavigate(folder.key)}>
                <td>
                  <span className="file-icon">{getFileIcon(folder.type, folder.name)}</span>
                  <span className="file-name">{folder.name}</span>
                </td>
                <td>Folder</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            ))}
            {filteredFiles.map((file) => (
              <tr key={file.key} className="file-row" onClick={() => onFileSelect(file.key)}>
                <td>
                  <span className="file-icon">{getFileIcon(file.type, file.name)}</span>
                  <span className="file-name">{file.name}</span>
                </td>
                <td>{file.type.charAt(0).toUpperCase() + file.type.slice(1)}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{formatDate(file.lastModified)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="download-button"
                      onClick={(e) => handleDownload(file.key, file.name, e)}
                      title={`Download ${file.name}`}
                    >
                      💾
                    </button>
                    <button
                      className="copy-url-button"
                      onClick={(e) => handleCopyS3Url(file.key, e)}
                      title={`Copy S3 URL for ${file.name}`}
                    >
                      📋
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* No results for local search */}
        {showLocalSearch && localSearchTerm && filteredFolders.length === 0 && filteredFiles.length === 0 && (
          <div className="no-search-results">
            <p>🔍 No items found for "{localSearchTerm}" on this page</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Try using "Jump to Folder" above to navigate directly to a specific path
            </p>
          </div>
        )}

        {/* Empty folder message */}
        {!showLocalSearch && folders.length === 0 && files.length === 0 && (
          <div className="empty-folder">
            <p>📂 This folder is empty</p>
          </div>
        )}

        {/* Large folder notice */}
        {totalItems >= 1000 && (
          <div className="large-folder-notice">
            <p>📊 Showing first {totalItems} items. Use "Jump to Folder" above to navigate directly to specific paths.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 