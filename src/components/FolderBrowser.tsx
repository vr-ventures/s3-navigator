import React, { useState, useEffect, useRef } from 'react';
import { S3Item } from '../types/electron';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import Icon from './Icon';

interface FolderBrowserProps {
  folders: S3Item[];
  files: S3Item[];
  currentPrefix: string;
  currentBucket: string;
  onNavigate: (key: string) => void;
  onFileSelect: (key: string) => void;
  onBookmarkFolder?: (bucket: string, prefix: string) => void;
  isBookmarked?: (bucket: string, prefix?: string) => boolean;
  onOpenInNewWindow?: (key: string) => void;
  onOpenInNewTab?: (key: string) => void;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({
  folders,
  files,
  currentPrefix,
  currentBucket,
  onNavigate,
  onFileSelect,
  onBookmarkFolder,
  isBookmarked,
  onOpenInNewWindow,
  onOpenInNewTab
}) => {
  const [jumpPath, setJumpPath] = useState('');
  const [isJumping, setIsJumping] = useState(false);
  const [jumpError, setJumpError] = useState('');
  const [showLocalSearch, setShowLocalSearch] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const jumpInputRef = useRef<HTMLInputElement>(null);

  // Handle search/navigation
  useEffect(() => {
    const handleSearchOrNavigate = async () => {
      if (!localSearchTerm.trim()) {
        setSearchMessage('');
        return;
      }

      // First, filter current view (local search)
      const localFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        folder.key.toLowerCase().includes(localSearchTerm.toLowerCase())
      );
      const localFiles = files.filter(file =>
        file.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        file.key.toLowerCase().includes(localSearchTerm.toLowerCase())
      );

      // If we have local results, just show them (no message needed)
      if (localFolders.length > 0 || localFiles.length > 0) {
        setSearchMessage('');
        return;
      }

      // If no local results and search looks like a path, suggest navigation
      if (localSearchTerm.includes('/') || localSearchTerm.includes('_')) {
        // Check if it looks like a file (has extension)
        const lastPart = localSearchTerm.split('/').filter(Boolean).pop() || '';
        const hasExtension = lastPart.includes('.');

        if (hasExtension) {
          setSearchMessage(`💡 Press Enter to open file: ${lastPart}`);
        } else {
          setSearchMessage('💡 Press Enter to navigate to this path');
        }
      } else {
        setSearchMessage('No matching files or folders found in current view.');
      }
    };

    const timeoutId = setTimeout(handleSearchOrNavigate, 300); // Debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, currentBucket, currentPrefix, folders, files]);

  // Handle Enter key in search input to navigate to path or open file
  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && localSearchTerm.trim()) {
      // Check if there are any filtered results
      const hasLocalResults = filteredFolders.length > 0 || filteredFiles.length > 0;

      if (!hasLocalResults && (localSearchTerm.includes('/') || localSearchTerm.includes('_'))) {
        // Treat as navigation/file path
        let targetPath = localSearchTerm.trim();

        // Construct full path (handle absolute vs relative)
        const fullPath = targetPath.startsWith('/')
          ? targetPath.substring(1)
          : currentPrefix + targetPath;

        // Check if it looks like a file (has an extension)
        const lastPart = fullPath.split('/').filter(Boolean).pop() || '';
        const hasExtension = lastPart.includes('.');

        if (hasExtension) {
          // It's a file - open it directly
          onFileSelect(fullPath);
        } else {
          // It's a folder - navigate to it
          const folderPath = fullPath.endsWith('/') ? fullPath : fullPath + '/';
          onNavigate(folderPath);
        }

        setLocalSearchTerm(''); // Clear search after navigation/opening
      }
    }
  };

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

  // Local search for current page - always active
  const filteredFolders = localSearchTerm
    ? folders.filter(folder =>
      folder.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      folder.key.toLowerCase().includes(localSearchTerm.toLowerCase())
    )
    : folders;

  const filteredFiles = localSearchTerm
    ? files.filter(file =>
        file.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        file.key.toLowerCase().includes(localSearchTerm.toLowerCase())
      )
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

  // Helper function to get file type icon
  const getFileIcon = (type: string, fileName?: string): string => {
    const extension = fileName?.split('.').pop()?.toLowerCase();

    switch (type) {
      case 'folder': return 'folder';
      case 'json': return 'filetype-json';
      case 'markdown': return 'markdown';
      case 'html': return 'filetype-html';
      case 'image':
        switch (extension) {
          case 'jpg':
          case 'jpeg': return 'file-image';
          case 'png': return 'file-image';
          case 'gif': return 'file-image';
          case 'svg': return 'file-image';
          default: return 'file-image';
        }
      case 'text':
        switch (extension) {
          case 'csv': return 'filetype-csv';
          case 'xml': return 'filetype-xml';
          case 'yaml':
          case 'yml': return 'filetype-yml';
          case 'log': return 'file-text';
          default: return 'file-text';
        }
      default:
        switch (extension) {
          case 'pdf': return 'filetype-pdf';
          case 'zip':
          case 'tar':
          case 'gz': return 'file-zip';
          case 'mp4':
          case 'avi':
          case 'mov': return 'play-circle';
          case 'mp3':
          case 'wav': return 'music-note';
          default: return 'file-text';
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

  const handleBookmarkClick = (folderKey: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onBookmarkFolder) {
      onBookmarkFolder(currentBucket, folderKey);
    }
  };

  const totalItems = folders.length + files.length;
  const suggestions = getSuggestions();

  return (
    <div className="folder-browser">
      {/* Item count header with search */}
      <div className="folder-count-header">
        <span className="item-count">
          <Icon name="folder" /> {filteredFolders.length} folders, <Icon name="file-text" /> {filteredFiles.length} files
        </span>

        {/* Search box */}
        <div className="folder-search-box">
          <Icon name="search" />
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search files and folders..."
            className="folder-search-input"
          />
          {localSearchTerm && (
            <button
              onClick={() => setLocalSearchTerm('')}
              className="clear-search-button"
              title="Clear search"
            >
              <Icon name="x" />
            </button>
          )}
        </div>
      </div>

      {/* Search message */}
      {searchMessage && (
        <div className="search-message">
          <Icon name="info-circle" /> {searchMessage}
        </div>
      )}

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
            {filteredFolders.map((folder) => {
              const isFolderBookmarked = isBookmarked ? isBookmarked(currentBucket, folder.key) : false;

              return (
                <tr key={folder.key} className="folder-row" onClick={() => onNavigate(folder.key)}>
                  <td>
                    <span className="file-icon">
                      <Icon name={getFileIcon(folder.type, folder.name)} />
                    </span>
                    <span className="file-name">{folder.name}</span>
                  </td>
                  <td>Folder</td>
                  <td>-</td>
                  <td>-</td>
                  <td>
                    <div className="action-buttons">
                      {onBookmarkFolder && (
                        <button
                          className={`bookmark-action-button ${isFolderBookmarked ? 'bookmarked' : ''}`}
                          onClick={(e) => handleBookmarkClick(folder.key, e)}
                          title={isFolderBookmarked ? `Remove ${folder.name} from bookmarks` : `Bookmark ${folder.name}`}
                        >
                          {isFolderBookmarked ? <Icon name="star-fill" /> : <Icon name="star" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredFiles.map((file) => (
              <tr key={file.key} className="file-row" onClick={() => onFileSelect(file.key)}>
                <td>
                  <span className="file-icon">
                    <Icon name={getFileIcon(file.type, file.name)} />
                  </span>
                  <span className="file-name">{file.name}</span>
                </td>
                <td>{file.type.charAt(0).toUpperCase() + file.type.slice(1)}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{formatDate(file.lastModified)}</td>
                <td>
                  <div className="action-buttons">
                    {onOpenInNewTab && (
                      <button
                        className="open-new-tab-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenInNewTab(file.key);
                        }}
                        title={`Open ${file.name} in new tab`}
                      >
                        <Icon name="plus-square" />
                      </button>
                    )}
                    <button
                      className="download-button"
                      onClick={(e) => handleDownload(file.key, file.name, e)}
                      title={`Download ${file.name}`}
                    >
                      <Icon name="download" />
                    </button>
                    <button
                      className="copy-url-button"
                      onClick={(e) => handleCopyS3Url(file.key, e)}
                      title={`Copy S3 URL for ${file.name}`}
                    >
                      <Icon name="clipboard" />
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
            <p><Icon name="search" /> No items found for "{localSearchTerm}" on this page</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Try using "Jump to Folder" above to navigate directly to a specific path
            </p>
          </div>
        )}

        {/* Empty folder message */}
        {!showLocalSearch && folders.length === 0 && files.length === 0 && (
          <div className="empty-folder">
            <p><Icon name="folder" /> This folder is empty</p>
          </div>
        )}

        {/* Large folder notice */}
        {totalItems >= 1000 && (
          <div className="large-folder-notice">
            <p><Icon name="bar-chart" /> Showing first {totalItems} items. Use "Jump to Folder" above to navigate directly to specific paths.</p>
          </div>
        )}
      </div>
    </div>
  );
}; 