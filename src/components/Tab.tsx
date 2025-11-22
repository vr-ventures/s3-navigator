import React from 'react';
import Icon from './Icon';
import { Tab as TabType } from '../types/workspace';

interface TabProps {
    tab: TabType;
    isActive: boolean;
    onClick: () => void;
    onClose: (e: React.MouseEvent) => void;
}

export const Tab: React.FC<TabProps> = ({ tab, isActive, onClick, onClose }) => {
    const getTabIcon = () => {
        if (tab.type === 'folder') {
            return 'folder';
        }
        // File tab
        const fileType = tab.fileData.type;
        switch (fileType) {
            case 'json':
                return 'filetype-json';
            case 'markdown':
                return 'markdown';
            case 'html':
                return 'filetype-html';
            case 'image':
                return 'file-image';
            default:
                return 'file-text';
        }
    };

    const getTabTitle = () => {
        if (tab.type === 'folder') {
            return tab.folderName || 'Folder';
        }
        return tab.fileName;
    };

    const getTabTooltip = () => {
        if (tab.type === 'folder') {
            return `Folder: ${tab.bucket}/${tab.prefix}`;
        }
        return `File: ${tab.bucket}/${tab.key}`;
    };

    return (
        <div
            className={`tab ${isActive ? 'tab-active' : ''} ${tab.isPinned ? 'tab-pinned' : ''}`}
            onClick={onClick}
            title={getTabTooltip()}
        >
            <span className="tab-icon">
                <Icon name={getTabIcon()} />
            </span>
            <span className="tab-title" title={getTabTitle()}>
                {getTabTitle()}
            </span>
            <button
                className="tab-close-button"
                onClick={onClose}
                title="Close tab"
            >
                <Icon name="x" />
            </button>
        </div>
    );
};
