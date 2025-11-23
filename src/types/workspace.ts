import { S3ObjectResult, S3ListResult } from './electron';

export type PaneType = 'selector' | 'browser' | 'viewer';

export type TabType = 'file' | 'folder';

export interface FileTab {
    id: string;
    type: 'file';
    bucket: string;
    key: string;
    fileName: string;
    fileData: S3ObjectResult;
    isPinned?: boolean;
}

export interface FolderTab {
    id: string;
    type: 'folder';
    bucket: string;
    prefix: string;
    folderName: string;
    folderData: S3ListResult;
    isPinned?: boolean;
}

export type Tab = FileTab | FolderTab;

export interface PaneState {
    id: string;
    type: PaneType;
    bucket: string;
    prefix: string;
    folderData: S3ListResult | null;
    fileData: S3ObjectResult | null;
    // Tab management
    tabs: Tab[];
    activeTabId: string | null;
    error: string | null;
    loading: boolean;
}

export interface WorkspaceState {
    layout: 'single' | 'split-vertical-2' | 'split-vertical-3';
    panes: PaneState[];
    activePaneId: string;
}
