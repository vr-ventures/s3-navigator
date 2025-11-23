import React from 'react';
import Icon from './Icon';

interface FileSelectionToolbarProps {
    selectedCount: number;
    onOpenInSplit: () => void;
    onClearSelection: () => void;
}

export const FileSelectionToolbar: React.FC<FileSelectionToolbarProps> = ({
    selectedCount,
    onOpenInSplit,
    onClearSelection
}) => {
    const canSplit = selectedCount >= 2 && selectedCount <= 3;

    return (
        <div className="file-selection-toolbar">
            <div className="selection-info">
                <Icon name="check-circle" />
                <span className="selection-count">
                    {selectedCount} file{selectedCount !== 1 ? 's' : ''} selected
                </span>
            </div>
            <div className="selection-actions">
                {canSplit ? (
                    <button
                        className="split-action-button"
                        onClick={onOpenInSplit}
                        title="Open selected files in split view"
                    >
                        <Icon name="layout-split" />
                        Open in Split View ({selectedCount} panes)
                    </button>
                ) : (
                    <span className="selection-hint">
                        Select 2-3 files to enable split view
                    </span>
                )}
                <button
                    className="clear-selection-button"
                    onClick={onClearSelection}
                    title="Clear selection"
                >
                    <Icon name="x-circle" />
                    Clear
                </button>
            </div>
        </div>
    );
};
