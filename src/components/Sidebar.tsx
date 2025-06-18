import React, { useState } from 'react';
import Icon from './Icon';

interface BookmarkedBucket {
    name: string;
    addedAt: string;
}

interface MenuSection {
    id: string;
    title: string;
    icon: string;
    items?: MenuItem[];
    action?: () => void;
}

interface MenuItem {
    id: string;
    name: string;
    icon?: string;
    action: () => void;
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
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['bookmarks']));

    // Helper function to get bucket initial or icon
    const getBucketInitial = (bucketName: string) => {
        return bucketName.charAt(0).toUpperCase();
    };

    const toggleSection = (sectionId: string) => {
        // If in compact mode, expand sidebar and show this section
        if (!isOpen) {
            onToggle(); // Expand the sidebar
            // Set this section as expanded
            const newExpanded = new Set(expandedSections);
            newExpanded.add(sectionId);
            setExpandedSections(newExpanded);
            return;
        }

        // Normal toggle behavior when sidebar is already expanded
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(sectionId)) {
            newExpanded.delete(sectionId);
        } else {
            newExpanded.add(sectionId);
        }
        setExpandedSections(newExpanded);
    };

    // Define menu sections - simplified to only bookmarks and settings
    const menuSections: MenuSection[] = [
        {
            id: 'bookmarks',
            title: 'Bookmarked Buckets',
            icon: 'bookmarks',
            items: bookmarkedBuckets.map(bucket => ({
                id: bucket.name,
                name: bucket.name,
                icon: getBucketInitial(bucket.name),
                action: () => onBucketSelect(bucket.name)
            }))
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: 'gear',
            action: () => {
                // Disabled for now
                console.log('Settings - Coming soon');
            }
        }
    ];

    const renderSectionHeader = (section: MenuSection) => {
        const isExpanded = expandedSections.has(section.id);
        const hasItems = section.items && section.items.length > 0;

        return (
            <div
                className={`section-header ${hasItems ? 'expandable' : 'clickable'}`}
                onClick={() => {
                    if (hasItems) {
                        toggleSection(section.id);
                    } else if (section.action) {
                        // For action items in compact mode, expand sidebar first then execute action
                        if (!isOpen) {
                            onToggle();
                            // Delay action execution to allow sidebar to expand
                            setTimeout(() => {
                                if (section.id === 'settings') {
                                    // Settings is disabled for now
                                    return;
                                }
                                section.action!();
                            }, 100);
                        } else {
                            if (section.id === 'settings') {
                                // Settings is disabled for now
                                return;
                            }
                            section.action();
                        }
                    }
                }}
            >
                <div className="section-icon">
                    <Icon name={section.icon} />
                </div>
                {isOpen && (
                    <>
                        <span className="section-title">
                            {section.title}
                            {section.id === 'settings' && <span className="disabled-badge">Coming Soon</span>}
                        </span>
                        {hasItems && (
                            <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                                <Icon name="chevron-right" />
                            </span>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderSectionItems = (section: MenuSection) => {
        if (!section.items || !isOpen || !expandedSections.has(section.id)) {
            return null;
        }

        if (section.id === 'bookmarks') {
            // Special rendering for bookmarks with remove functionality
            return (
                <div className="section-items">
                    {section.items.length === 0 ? (
                        <div className="empty-section">
                            <small>No bookmarked buckets yet</small>
                        </div>
                    ) : (
                        section.items.map((item) => (
                            <div
                                key={item.id}
                                className={`section-item ${currentBucket === item.id ? 'active' : ''}`}
                            >
                                <button
                                    className="item-button"
                                    onClick={item.action}
                                    title={item.name}
                                >
                                    <span className="item-icon">{item.icon}</span>
                                    <span className="item-name">{item.name}</span>
                                </button>
                                <button
                                    className="remove-item"
                                    onClick={() => onRemoveBookmark(item.id)}
                                    title={`Remove ${item.name} from bookmarks`}
                                >
                                    <Icon name="x" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            );
        }

        // Default rendering for other sections
        return (
            <div className="section-items">
                {section.items.length === 0 ? (
                    <div className="empty-section">
                        <small>No items yet</small>
                    </div>
                ) : (
                    section.items.map((item) => (
                        <div key={item.id} className="section-item">
                            <button
                                className="item-button"
                                onClick={item.action}
                                title={item.name}
                            >
                                {item.icon && <span className="item-icon">{item.icon}</span>}
                                <span className="item-name">{item.name}</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        );
    };

    return (
        <div className={`sidebar ${isOpen ? 'expanded' : 'compact'}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <button
                    className="sidebar-toggle"
                    onClick={onToggle}
                    title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isOpen ? (
                        <span className="toggle-icon">
                            <Icon name="chevron-left" />
                        </span>
                    ) : (
                        <span className="toggle-icon">
                            <Icon name="layout-sidebar" />
                        </span>
                    )}
                </button>
            </div>

            {/* Menu Sections */}
            <div className="sidebar-content">
                {menuSections.map((section) => (
                    <div key={section.id} className="menu-section">
                        {renderSectionHeader(section)}
                        {renderSectionItems(section)}
                    </div>
                ))}
            </div>
        </div>
    );
}; 