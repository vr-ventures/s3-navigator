import React from 'react';
import Icon from './Icon';
import { JsonViewer } from './JsonViewer';
import { MarkdownViewer } from './MarkdownViewer';
import { HtmlViewer } from './HtmlViewer';
import { ImageViewer } from './ImageViewer';
import { FolderBrowser } from './FolderBrowser';
import { S3FileSelector } from './S3FileSelector';
import { LoadingSkeleton } from './LoadingSkeleton';
import { TabBar } from './TabBar';
import { PaneState } from '../types/workspace';

interface PaneContentProps {
    pane: PaneState;
    onNavigate: (key: string) => void;
    onFileSelect: (key: string, openInNewTab?: boolean) => void;
    onBackToSelector: () => void;
    onBackToFolder: () => void;
    onBookmarkFolder: (bucket: string, prefix: string) => void;
    isBookmarked: (bucket: string, prefix?: string) => boolean;
    onSplitPane?: () => void;
    onOpenInNewWindow?: () => void;
    onBucketSelect?: (bucket: string, key: string) => void;
    onTabSwitch?: (tabId: string) => void;
    onTabClose?: (tabId: string) => void;
    onCloseAllTabs?: () => void;
}

export const PaneContent: React.FC<PaneContentProps> = ({
    pane,
    onNavigate,
    onFileSelect,
    onBackToSelector,
    onBackToFolder,
    onBookmarkFolder,
    isBookmarked,
    onSplitPane,
    onOpenInNewWindow,
    onBucketSelect,
    onTabSwitch,
    onTabClose,
    onCloseAllTabs
}) => {
    const { type, loading, error, folderData, fileData, bucket, prefix, tabs, activeTabId } = pane;

    if (loading) {
        return <LoadingSkeleton type={type === 'viewer' ? 'viewer' : 'folder'} />;
    }

    if (error) {
        return (
            <div className="error-message">
                <h3>Navigation Error</h3>
                <p>{error}</p>
                <button onClick={onBackToSelector}>
                    <Icon name="house" /> Back to Navigator
                </button>
            </div>
        );
    }

    switch (type) {
        case 'selector':
            return <S3FileSelector onFileSelect={(b, k) => {
                if (onBucketSelect) {
                    onBucketSelect(b, k);
                }
            }} />;
        // Wait, S3FileSelector expects (bucket, key) -> void. 
        // We should probably pass a wrapper that calls the appropriate parent handler.
        // Let's fix this in the usage or adjust the prop.
        // Actually, let's just pass a specific handler for selector.

        case 'browser':
            if (!folderData) return null;
            return (
                <div className="pane-content browser-pane">
                    {tabs.length > 0 && onTabSwitch && onTabClose && onCloseAllTabs && (
                        <TabBar
                            tabs={tabs}
                            activeTabId={activeTabId}
                            onTabClick={onTabSwitch}
                            onTabClose={onTabClose}
                            onCloseAll={onCloseAllTabs}
                        />
                    )}
                    <FolderBrowser
                        folders={folderData.folders}
                        files={folderData.files}
                        currentPrefix={prefix}
                        currentBucket={bucket}
                        onNavigate={onNavigate}
                        onFileSelect={(key) => onFileSelect(key, false)}
                        onOpenInNewTab={(key) => onFileSelect(key, true)}
                        onBookmarkFolder={onBookmarkFolder}
                        isBookmarked={isBookmarked}
                        onOpenInNewWindow={onOpenInNewWindow ? (key: string) => {
                            // Open the file in a new window
                            // We need to trigger file selection first
                            onFileSelect(key, false);
                            // Then open in new window after a brief delay
                            setTimeout(() => {
                                if (onOpenInNewWindow) onOpenInNewWindow();
                            }, 100);
                        } : undefined}
                    />
                </div>
            );

        case 'viewer':
            if (!fileData) return null;

            const fileName = fileData.key.split('/').pop();

            const renderViewer = () => {
                switch (fileData.type) {
                    case 'json':
                        return <JsonViewer data={fileData.data} />;
                    case 'markdown':
                        return <MarkdownViewer content={fileData.data} fileName={fileName} />;
                    case 'html':
                        return <HtmlViewer content={fileData.data} fileName={fileName} />;
                    case 'image':
                        return <ImageViewer base64Data={fileData.data} contentType={fileData.contentType || 'image/png'} fileName={fileName} />;
                    default:
                        return (
                            <div className="text-viewer">
                                <pre className="text-content">{fileData.data}</pre>
                                {fileData.error && (
                                    <div className="file-error">
                                        <p><strong>Note:</strong> {fileData.error}</p>
                                    </div>
                                )}
                            </div>
                        );
                }
            };

            return (
                <div className="viewer-container pane-content viewer-pane">
                    {tabs.length > 0 && onTabSwitch && onTabClose && onCloseAllTabs && (
                        <TabBar
                            tabs={tabs}
                            activeTabId={activeTabId}
                            onTabClick={onTabSwitch}
                            onTabClose={onTabClose}
                            onCloseAll={onCloseAllTabs}
                        />
                    )}
                    <div className="viewer-header">
                        <div className="header-left">
                            <h2><Icon name={`filetype-${fileData.type}`} /> {fileName}</h2>
                        </div>
                    </div>
                    {renderViewer()}
                </div>
            );

        default:
            return null;
    }
};
