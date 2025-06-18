import React from 'react';

interface BookmarkedBucket {
    name: string;
    addedAt: string;
}

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    bookmarkedBuckets: BookmarkedBucket[];
    currentBucket: string;
    onBucketSelect: (bucket: string) => void;
    onRemoveBookmark: (bucket: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onToggle,
    bookmarkedBuckets,
    currentBucket,
    onBucketSelect,
    onRemoveBookmark,
}) => {
    return (
        <>
            {/* Sidebar Toggle Button */}
            <button
                className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
                onClick={onToggle}
                title={isOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <span className="toggle-icon">
                    {isOpen ? '◀' : '▶'}
                </span>
            </button>

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h3>📁 Bookmarked Buckets</h3>
                </div>

                <div className="sidebar-content">
                    {bookmarkedBuckets.length === 0 ? (
                        <div className="empty-bookmarks">
                            <p>No bookmarked buckets yet</p>
                            <small>Use the bookmark button to save buckets for quick access</small>
                        </div>
                    ) : (
                        <div className="bucket-list">
                            {bookmarkedBuckets.map((bucket) => (
                                <div
                                    key={bucket.name}
                                    className={`bucket-item ${currentBucket === bucket.name ? 'active' : ''}`}
                                >
                                    <button
                                        className="bucket-button"
                                        onClick={() => onBucketSelect(bucket.name)}
                                        title={`Open ${bucket.name}`}
                                    >
                                        <span className="bucket-icon">🪣</span>
                                        <span className="bucket-name">{bucket.name}</span>
                                    </button>
                                    <button
                                        className="remove-bookmark"
                                        onClick={() => onRemoveBookmark(bucket.name)}
                                        title={`Remove ${bucket.name} from bookmarks`}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Overlay for mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
        </>
    );
}; 