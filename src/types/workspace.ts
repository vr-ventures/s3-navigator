import { S3ObjectResult, S3ListResult } from './electron';

export type PaneType = 'selector' | 'browser' | 'viewer';

export interface PaneState {
    id: string;
    type: PaneType;
    bucket: string;
    prefix: string;
    folderData: S3ListResult | null;
    fileData: S3ObjectResult | null;
    error: string | null;
    loading: boolean;
}

export interface WorkspaceState {
    layout: 'single' | 'split-vertical';
    panes: PaneState[];
    activePaneId: string;
}
