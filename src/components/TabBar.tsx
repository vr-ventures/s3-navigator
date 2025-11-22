import React from 'react';
import { Tab as TabComponent } from './Tab';
import { Tab as TabType } from '../types/workspace';
import Icon from './Icon';

interface TabBarProps {
    tabs: TabType[];
    activeTabId: string | null;
    onTabClick: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onCloseAll?: () => void;
    onCloseOthers?: (tabId: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onCloseAll,
    onCloseOthers
}) => {
    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className="tab-bar">
            <div className="tab-list">
                {tabs.map((tab) => (
                    <TabComponent
                        key={tab.id}
                        tab={tab}
                        isActive={tab.id === activeTabId}
                        onClick={() => onTabClick(tab.id)}
                        onClose={(e) => {
                            e.stopPropagation();
                            onTabClose(tab.id);
                        }}
                    />
                ))}
            </div>
            <div className="tab-actions">
                {tabs.length > 1 && onCloseAll && (
                    <button
                        className="tab-action-button"
                        onClick={onCloseAll}
                        title="Close all tabs"
                    >
                        <Icon name="x-circle" />
                    </button>
                )}
            </div>
        </div>
    );
};
