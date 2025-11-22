import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';

interface BreadcrumbProps {
  bucket: string;
  currentPrefix: string;
  onNavigate: (prefix: string) => void;
  onBackToSelector: () => void;
  onBookmarkBucket?: (bucket: string) => void;
  onBookmarkFolder?: (bucket: string, prefix: string) => void;
  isBookmarked?: (bucket: string, prefix?: string) => boolean;
  onFileSelect?: (key: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  bucket,
  currentPrefix,
  onNavigate,
  onBackToSelector,
  onBookmarkBucket,
  onBookmarkFolder,
  isBookmarked,
  onFileSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPath, setEditPath] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // Split the path into segments
  const getPathSegments = () => {
    if (!currentPrefix) return [];

    const segments = currentPrefix.split('/').filter(segment => segment.length > 0);
    const pathSegments = [];
    let cumulativePath = '';

    for (let i = 0; i < segments.length; i++) {
      cumulativePath += segments[i] + '/';
      pathSegments.push({
        name: segments[i],
        path: cumulativePath
      });
    }

    return pathSegments;
  };

  const pathSegments = getPathSegments();
  const isBucketBookmarked = isBookmarked ? isBookmarked(bucket, '') : false;

  // Enter edit mode
  const enterEditMode = () => {
    setEditPath(bucket + '/' + currentPrefix);
    setIsEditing(true);
  };

  // Exit edit mode
  const exitEditMode = () => {
    setIsEditing(false);
    setEditPath('');
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle Ctrl/Cmd+L keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
        event.preventDefault();
        enterEditMode();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bucket, currentPrefix]);

  // Handle path navigation from edit mode
  const handlePathSubmit = () => {
    if (!editPath.trim()) {
      exitEditMode();
      return;
    }

    let path = editPath.trim();

    // Remove bucket prefix if present
    if (path.startsWith(bucket + '/')) {
      path = path.substring(bucket.length + 1);
    } else if (path.startsWith(bucket)) {
      path = path.substring(bucket.length);
      if (path.startsWith('/')) {
        path = path.substring(1);
      }
    }

    // Check if it looks like a file (has extension in last segment)
    const lastPart = path.split('/').filter(Boolean).pop() || '';
    const hasExtension = lastPart.includes('.');

    if (hasExtension && onFileSelect) {
      // It's a file - open it directly
      onFileSelect(path);
    } else {
      // It's a folder - navigate to it
      if (!path.endsWith('/') && path.length > 0) {
        path += '/';
      }
      onNavigate(path);
    }

    exitEditMode();
  };

  // Handle keyboard events in edit mode
  const handleEditKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handlePathSubmit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      exitEditMode();
    }
  };

  return (
    <div className="breadcrumb-container">
      <div className="breadcrumb-path">
        <button
          className="breadcrumb-button home-button"
          onClick={onBackToSelector}
          title="Back to CloudBrowse"
        >
          🏠
        </button>

        <span className="breadcrumb-separator">/</span>

        {isEditing ? (
          // Edit mode - show editable input
          <div className="address-bar-edit-mode">
            <input
              ref={inputRef}
              type="text"
              className="address-bar-input"
              value={editPath}
              onChange={(e) => setEditPath(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={exitEditMode}
              placeholder="Enter path (e.g., bucket/folder/file.json)"
            />
            <button
              className="address-bar-submit"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur
              onClick={handlePathSubmit}
              title="Navigate to path"
            >
              <Icon name="arrow-right" />
            </button>
          </div>
        ) : (
          // Display mode - show clickable breadcrumb
          <div className="breadcrumb-clickable-area" onClick={enterEditMode} title="Click to edit path (or press Ctrl/Cmd+L)">
            <button
              className="breadcrumb-button bucket-button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('');
              }}
              title={`Navigate to bucket root: ${bucket}`}
            >
              🪣 {bucket}
            </button>

            {onBookmarkBucket && pathSegments.length === 0 && (
              <button
                className={`breadcrumb-button bookmark-button ${isBucketBookmarked ? 'bookmarked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkBucket(bucket);
                }}
                title={isBucketBookmarked ? `Remove ${bucket} from bookmarks` : `Bookmark ${bucket}`}
              >
                {isBucketBookmarked ? <Icon name="star-fill" /> : <Icon name="star" />}
              </button>
            )}

            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1;
              const isFolderBookmarked = isBookmarked ? isBookmarked(bucket, segment.path) : false;

              return (
                <React.Fragment key={segment.path}>
                  <span className="breadcrumb-separator">/</span>
                  <button
                    className={`breadcrumb-button folder-button ${isLast ? 'current' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(segment.path);
                    }}
                    title={`Navigate to: ${segment.path}`}
                  >
                    <Icon name="folder" /> {segment.name}
                  </button>

                  {isLast && onBookmarkFolder && (
                    <button
                      className={`breadcrumb-button bookmark-button ${isFolderBookmarked ? 'bookmarked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmarkFolder(bucket, segment.path);
                      }}
                      title={isFolderBookmarked ? `Remove from bookmarks` : `Bookmark current folder`}
                    >
                      {isFolderBookmarked ? <Icon name="star-fill" /> : <Icon name="star" />}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 