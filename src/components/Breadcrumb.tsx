import React from 'react';

interface BreadcrumbProps {
  bucket: string;
  currentPrefix: string;
  onNavigate: (prefix: string) => void;
  onBackToSelector: () => void;
  onBookmarkBucket?: (bucket: string) => void;
  isBookmarked?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  bucket,
  currentPrefix,
  onNavigate,
  onBackToSelector,
  onBookmarkBucket,
  isBookmarked = false
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

  return (
    <div className="breadcrumb-container">
      <div className="breadcrumb-path">
        <button
          className="breadcrumb-button home-button"
          onClick={onBackToSelector}
          title="Back to S3 Navigator"
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
            className={`breadcrumb-button bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={() => onBookmarkBucket(bucket)}
            title={isBookmarked ? `Remove ${bucket} from bookmarks` : `Bookmark ${bucket}`}
          >
            {isBookmarked ? '⭐' : '☆'}
          </button>
        )}

        {pathSegments.map((segment, index) => (
          <React.Fragment key={segment.path}>
            <span className="breadcrumb-separator">/</span>
            <button
              className={`breadcrumb-button folder-button ${index === pathSegments.length - 1 ? 'current' : ''
                }`}
              onClick={() => onNavigate(segment.path)}
              title={`Navigate to: ${segment.path}`}
            >
              📁 {segment.name}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 