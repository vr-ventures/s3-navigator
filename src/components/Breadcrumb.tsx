import React from 'react';
import Icon from './Icon';

interface BreadcrumbProps {
  bucket: string;
  currentPrefix: string;
  onNavigate: (prefix: string) => void;
  onBackToSelector: () => void;
  onBookmarkBucket?: (bucket: string) => void;
  onBookmarkFolder?: (bucket: string, prefix: string) => void;
  isBookmarked?: (bucket: string, prefix?: string) => boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  bucket,
  currentPrefix,
  onNavigate,
  onBackToSelector,
  onBookmarkBucket,
  onBookmarkFolder,
  isBookmarked
}) => {
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

        <button
          className="breadcrumb-button bucket-button"
          onClick={() => onNavigate('')}
          title={`Navigate to bucket root: ${bucket}`}
        >
          🪣 {bucket}
        </button>

        {onBookmarkBucket && (
          <button
            className={`breadcrumb-button bookmark-button ${isBucketBookmarked ? 'bookmarked' : ''}`}
            onClick={() => onBookmarkBucket(bucket)}
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
                onClick={() => onNavigate(segment.path)}
                title={`Navigate to: ${segment.path}`}
              >
                <Icon name="folder" /> {segment.name}
              </button>

              {isLast && onBookmarkFolder && (
                <button
                  className={`breadcrumb-button bookmark-button ${isFolderBookmarked ? 'bookmarked' : ''}`}
                  onClick={() => onBookmarkFolder(bucket, segment.path)}
                  title={isFolderBookmarked ? `Remove ${segment.name} from bookmarks` : `Bookmark ${segment.name}`}
                >
                  {isFolderBookmarked ? <Icon name="star-fill" /> : <Icon name="star" />}
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}; 