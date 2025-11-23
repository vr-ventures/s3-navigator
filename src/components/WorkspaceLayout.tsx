import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { PaneContent } from './PaneContent';
import { WorkspaceState, PaneState } from '../types/workspace';

interface WorkspaceLayoutProps {
    workspace: WorkspaceState;
    onPaneAction: (paneId: string, action: string, payload?: any) => void;
    onSplitPane: (paneId: string) => void;
    onClosePane: (paneId: string) => void;
    onSetActivePane: (paneId: string) => void;
    onOpenInNewWindow: (paneId: string) => void;
    // Pass-through props for PaneContent
    onNavigate: (paneId: string, key: string) => void;
    onFileSelect: (paneId: string, key: string, openInNewTab?: boolean) => void;
    onBackToSelector: (paneId: string) => void;
    onBackToFolder: (paneId: string) => void;
    onBookmarkFolder: (bucket: string, prefix: string) => void;
    isBookmarked: (bucket: string, prefix?: string) => boolean;
    onBucketSelect: (paneId: string, bucket: string, key: string) => void;
    // Tab management
    onTabSwitch: (paneId: string, tabId: string) => void;
    onTabClose: (paneId: string, tabId: string) => void;
    onCloseAllTabs: (paneId: string) => void;
    // Split view
    onOpenFilesInSplit: (paneId: string, fileKeys: string[]) => void;
}

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
    workspace,
    onSplitPane,
    onClosePane,
    onSetActivePane,
    onOpenInNewWindow,
    onNavigate,
    onFileSelect,
    onBackToSelector,
    onBackToFolder,
    onBookmarkFolder,
    isBookmarked,
    onBucketSelect,
    onTabSwitch,
    onTabClose,
    onCloseAllTabs,
    onOpenFilesInSplit
}) => {
    const renderPane = (pane: PaneState) => (
        <div
            className={`pane-container ${workspace.activePaneId === pane.id ? 'active-pane' : ''}`}
            onClick={() => onSetActivePane(pane.id)}
            style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
            {workspace.panes.length > 1 && (
                <button
                    className="close-pane-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClosePane(pane.id);
                    }}
                    title="Close Pane"
                >
                    ×
                </button>
            )}
            <PaneContent
                pane={pane}
                onNavigate={(key) => onNavigate(pane.id, key)}
                onFileSelect={(key, openInNewTab) => onFileSelect(pane.id, key, openInNewTab)}
                onBackToSelector={() => onBackToSelector(pane.id)}
                onBackToFolder={() => onBackToFolder(pane.id)}
                onBookmarkFolder={onBookmarkFolder}
                isBookmarked={isBookmarked}
                onSplitPane={() => onSplitPane(pane.id)}
                onOpenInNewWindow={() => onOpenInNewWindow(pane.id)}
                onBucketSelect={(bucket, key) => onBucketSelect(pane.id, bucket, key)}
                onTabSwitch={(tabId) => onTabSwitch(pane.id, tabId)}
                onTabClose={(tabId) => onTabClose(pane.id, tabId)}
                onCloseAllTabs={() => onCloseAllTabs(pane.id)}
                onOpenFilesInSplit={(fileKeys) => onOpenFilesInSplit(pane.id, fileKeys)}
            />
        </div>
    );

    if (workspace.layout === 'single' || workspace.panes.length === 1) {
        return (
            <div className="workspace-single">
                {renderPane(workspace.panes[0])}
            </div>
        );
    }

    if (workspace.layout === 'split-vertical-2' && workspace.panes.length === 2) {
        return (
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50} minSize={20}>
                    {renderPane(workspace.panes[0])}
                </Panel>
                <PanelResizeHandle className="resize-handle-vertical" />
                <Panel defaultSize={50} minSize={20}>
                    {renderPane(workspace.panes[1])}
                </Panel>
            </PanelGroup>
        );
    }

    if (workspace.layout === 'split-vertical-3' && workspace.panes.length === 3) {
        return (
            <PanelGroup direction="horizontal">
                <Panel defaultSize={33} minSize={20}>
                    {renderPane(workspace.panes[0])}
                </Panel>
                <PanelResizeHandle className="resize-handle-vertical" />
                <Panel defaultSize={33} minSize={20}>
                    {renderPane(workspace.panes[1])}
                </Panel>
                <PanelResizeHandle className="resize-handle-vertical" />
                <Panel defaultSize={33} minSize={20}>
                    {renderPane(workspace.panes[2])}
                </Panel>
            </PanelGroup>
        );
    }

    // Fallback for 2 panes (backwards compatibility)
    return (
        <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={20}>
                {renderPane(workspace.panes[0])}
            </Panel>
            <PanelResizeHandle className="resize-handle-vertical" />
            <Panel defaultSize={50} minSize={20}>
                {renderPane(workspace.panes[1])}
            </Panel>
        </PanelGroup>
    );
};
