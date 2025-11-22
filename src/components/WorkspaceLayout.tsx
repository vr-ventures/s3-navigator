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
    onFileSelect: (paneId: string, key: string) => void;
    onBackToSelector: (paneId: string) => void;
    onBackToFolder: (paneId: string) => void;
    onBookmarkFolder: (bucket: string, prefix: string) => void;
    isBookmarked: (bucket: string, prefix?: string) => boolean;
    onBucketSelect: (paneId: string, bucket: string, key: string) => void;
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
    onBucketSelect
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
                onFileSelect={(key) => onFileSelect(pane.id, key)}
                onBackToSelector={() => onBackToSelector(pane.id)}
                onBackToFolder={() => onBackToFolder(pane.id)}
                onBookmarkFolder={onBookmarkFolder}
                isBookmarked={isBookmarked}
                onSplitPane={() => onSplitPane(pane.id)}
                onOpenInNewWindow={() => onOpenInNewWindow(pane.id)}
                onBucketSelect={(bucket, key) => onBucketSelect(pane.id, bucket, key)}
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
