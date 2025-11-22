import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from './Icon';
import { BookmarkedItem } from '../hooks/useBookmarkedBuckets';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    bookmarkedItems: BookmarkedItem[];
    currentBucket: string;
    currentPrefix: string;
    onBucketSelect: (bucket: string, prefix: string) => Promise<void>;
    onRemoveBookmark: (bucket: string, prefix?: string) => void;
    width?: number;
    onWidthChange?: (width: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onToggle,
    bookmarkedItems,
    currentBucket,
    currentPrefix,
    onBucketSelect,
    onRemoveBookmark,
    width = 250,
    onWidthChange
}) => {
    const [expandedBuckets, setExpandedBuckets] = useState<Record<string, boolean>>({});
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Group bookmarks by bucket
    const groupedBookmarks = React.useMemo(() => {
        const groups: Record<string, BookmarkedItem[]> = {};

        bookmarkedItems.forEach(item => {
            if (!groups[item.bucket]) {
                groups[item.bucket] = [];
            }
            if (item.prefix) {
                groups[item.bucket].push(item);
            }
        });

        return groups;
    }, [bookmarkedItems]);

    // Initialize expanded state for buckets with current selection or bookmarks
    useEffect(() => {
        const newExpanded = { ...expandedBuckets };
        let hasChanges = false;

        // Expand current bucket
        if (currentBucket && !expandedBuckets[currentBucket]) {
            newExpanded[currentBucket] = true;
            hasChanges = true;
        }

        if (hasChanges) {
            setExpandedBuckets(newExpanded);
        }
    }, [currentBucket]);

    const toggleBucketExpand = (bucket: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedBuckets(prev => ({
            ...prev,
            [bucket]: !prev[bucket]
        }));
    };

    // Resizing logic
    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing && onWidthChange) {
                const newWidth = mouseMoveEvent.clientX;
                if (newWidth > 150 && newWidth < 600) { // Min and max width constraints
                    onWidthChange(newWidth);
                }
            }
        },
        [isResizing, onWidthChange]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);


    return (
        <>
            {/* Overlay for mobile - only show when open and screen is small */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onToggle}
            />

            <div
                ref={sidebarRef}
                className={`sidebar ${isOpen ? 'expanded' : 'compact'} ${isResizing ? 'resizing' : ''}`}
                style={isOpen ? { width: `${width}px` } : {}}
            >
                <div className="sidebar-header">
                    <button className="sidebar-toggle" onClick={onToggle}>
                        <span className="toggle-icon"><Icon name="list" /></span>
                        <span className="toggle-text">S3 Navigator</span>
                    </button>
                </div>

                <div className="sidebar-content">
                    {/* Bookmarked Buckets Section */}
                    <div className="menu-section">
                        <div className="section-header">
                            <span className="section-icon"><Icon name="bookmark" /></span>
                            <span className="section-title">Bookmarked Buckets</span>
                            <span className="expand-icon expanded"><Icon name="chevron-right" /></span>
                        </div>

                        <div className="section-items">
                            {Object.keys(groupedBookmarks).length === 0 ? (
                                <div className="empty-section">
                                    <small>No bookmarks yet</small>
                                </div>
                            ) : (
                                Object.entries(groupedBookmarks).map(([bucket, folderBookmarks]) => {
                                    const isExpanded = expandedBuckets[bucket];
                                    const isActive = currentBucket === bucket && !currentPrefix;

                                    return (
                                        <div key={bucket} className="bucket-group">
                                            <div className={`section-item ${isActive ? 'active' : ''}`}>
                                                {folderBookmarks.length > 0 && (
                                                    <button
                                                        className={`expand-bucket ${isExpanded ? 'expanded' : ''}`}
                                                        onClick={(e) => toggleBucketExpand(bucket, e)}
                                                    >
                                                        <Icon name="chevron-right" />
                                                    </button>
                                                )}
                                                <button
                                                    className="item-button"
                                                    onClick={() => onBucketSelect(bucket, '')}
                                                    title={bucket}
                                                    style={{ paddingLeft: folderBookmarks.length > 0 ? '0' : '0.5rem' }}
                                                >
                                                    <span className="item-icon"><Icon name="hdd-stack" /></span>
                                                    <span className="item-name">{bucket}</span>
                                                </button>
                                                <button
                                                    className="remove-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemoveBookmark(bucket, '');
                                                    }}
                                                    title={`Remove ${bucket} from bookmarks`}
                                                >
                                                    <Icon name="x" />
                                                </button>
                                            </div>

                                            {/* Folder Bookmarks */}
                                            {isExpanded && folderBookmarks.length > 0 && (
                                                <div className="folder-bookmarks">
                                                    {folderBookmarks.map(item => (
                                                        <div
                                                            key={`${item.bucket}-${item.prefix}`}
                                                            className={`section-item folder-item ${currentBucket === item.bucket && currentPrefix === item.prefix ? 'active' : ''}`}
                                                        >
                                                            <button
                                                                className="item-button"
                                                                onClick={() => onBucketSelect(item.bucket, item.prefix)}
                                                                title={item.prefix}
                                                            >
                                                                <span className="item-icon"><Icon name="folder" /></span>
                                                                <span className="item-name">{item.prefix}</span>
                                                            </button>
                                                            <button
                                                                className="remove-item"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onRemoveBookmark(item.bucket, item.prefix);
                                                                }}
                                                                title={`Remove ${item.prefix} from bookmarks`}
                                                            >
                                                                <Icon name="x" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="menu-section">
                        <div className="section-header clickable">
                            <span className="section-icon"><Icon name="gear" /></span>
                            <span className="section-title">
                                Settings
                                <span className="disabled-badge">Coming Soon</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Resize Handle */}
                {isOpen && (
                    <div
                        className="resize-handle"
                        onMouseDown={startResizing}
                    />
                )}
            </div>
        </>
    );
};