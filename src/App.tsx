import React, { useState, useEffect } from 'react';
import Icon from './components/Icon';
import { Breadcrumb } from './components/Breadcrumb';
import { Sidebar } from './components/Sidebar';
import { WorkspaceLayout } from './components/WorkspaceLayout';
import { useBookmarkedBuckets } from './hooks/useBookmarkedBuckets';
import { WorkspaceState, PaneState } from './types/workspace';
import { S3ObjectResult, S3ListResult } from './types/electron';

const App: React.FC = () => {
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    layout: 'single',
    panes: [{
      id: 'pane-1',
      type: 'selector',
      bucket: '',
      prefix: '',
      folderData: null,
      fileData: null,
      error: null,
      loading: false
    }],
    activePaneId: 'pane-1'
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(250);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarkedBuckets();

  // Load sidebar width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('s3-navigator-sidebar-width');
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth, 10));
    }

    // Check for URL parameters (New Window mode)
    const params = new URLSearchParams(window.location.search);
    const bucket = params.get('bucket');
    const key = params.get('key');

    if (bucket && key) {
      // Initialize in viewer mode for this file
      loadFile('pane-1', bucket, key);
    }
  }, []);

  const updatePane = (paneId: string, updates: Partial<PaneState>) => {
    setWorkspace(prev => ({
      ...prev,
      panes: prev.panes.map(p => p.id === paneId ? { ...p, ...updates } : p)
    }));
  };

  const getPane = (paneId: string) => workspace.panes.find(p => p.id === paneId);

  const loadFolder = async (paneId: string, bucket: string, prefix: string) => {
    updatePane(paneId, { loading: true, error: null });
    try {
      const data = await window.electron.s3.listObjects(bucket, prefix);
      updatePane(paneId, {
        loading: false,
        type: 'browser',
        bucket,
        prefix,
        folderData: data,
        fileData: null
      });
    } catch (err) {
      updatePane(paneId, {
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load folder'
      });
    }
  };

  const loadFile = async (paneId: string, bucket: string, key: string) => {
    updatePane(paneId, { loading: true, error: null });
    try {
      const data = await window.electron.s3.getObject(bucket, key);
      // Set the current prefix to the parent folder of the file
      const parentPrefix = key.substring(0, key.lastIndexOf('/') + 1);

      updatePane(paneId, {
        loading: false,
        type: 'viewer',
        bucket,
        prefix: parentPrefix,
        fileData: data,
        folderData: null
      });
    } catch (err) {
      // If file loading fails, try as folder
      if (err instanceof Error && err.message.includes('NoSuchKey')) {
        await loadFolder(paneId, bucket, key.endsWith('/') ? key : key + '/');
      } else {
        updatePane(paneId, {
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to load file'
        });
      }
    }
  };

  const handleNavigate = async (paneId: string, key: string) => {
    const pane = getPane(paneId);
    if (pane) {
      await loadFolder(paneId, pane.bucket, key);
    }
  };

  const handleFileSelect = async (paneId: string, key: string) => {
    const pane = getPane(paneId);
    if (pane) {
      await loadFile(paneId, pane.bucket, key);
    }
  };

  const handleBackToSelector = (paneId: string) => {
    updatePane(paneId, {
      type: 'selector',
      bucket: '',
      prefix: '',
      folderData: null,
      fileData: null,
      error: null
    });
  };

  const handleBackToFolder = async (paneId: string) => {
    const pane = getPane(paneId);
    if (pane && pane.bucket) {
      await loadFolder(paneId, pane.bucket, pane.prefix);
    }
  };

  const handleSplitPane = (paneId: string) => {
    const sourcePane = getPane(paneId);
    if (!sourcePane) return;

    const newPaneId = `pane-${Date.now()}`;
    const newPane: PaneState = {
      ...sourcePane,
      id: newPaneId
    };

    setWorkspace(prev => ({
      ...prev,
      layout: 'split-vertical', // Currently only supporting vertical split for 2 panes
      panes: [...prev.panes, newPane],
      activePaneId: newPaneId
    }));
  };

  const handleClosePane = (paneId: string) => {
    setWorkspace(prev => {
      const remainingPanes = prev.panes.filter(p => p.id !== paneId);
      if (remainingPanes.length === 0) return prev; // Cannot close last pane

      return {
        ...prev,
        layout: remainingPanes.length === 1 ? 'single' : prev.layout,
        panes: remainingPanes,
        activePaneId: remainingPanes[remainingPanes.length - 1].id
      };
    });
  };

  const handleSetActivePane = (paneId: string) => {
    setWorkspace(prev => ({ ...prev, activePaneId: paneId }));
  };

  const handleOpenInNewWindow = (paneId: string) => {
    const pane = getPane(paneId);
    if (!pane || !pane.bucket || !pane.fileData) return;

    const key = pane.fileData.key;
    const url = `${window.location.origin}${window.location.pathname}?bucket=${encodeURIComponent(pane.bucket)}&key=${encodeURIComponent(key)}`;
    window.open(url, '_blank', 'width=1000,height=800');
  };

  const handleBucketSelect = async (paneId: string, bucket: string, key: string) => {
    console.log('handleBucketSelect called', { paneId, bucket, key });

    if (!window.electron) {
      console.error('Electron API not available');
      updatePane(paneId, {
        loading: false,
        error: 'Electron API not available. Please run this app in Electron, not a standard browser.'
      });
      return;
    }

    if (!key || key.endsWith('/')) {
      await loadFolder(paneId, bucket, key || '');
    } else {
      await loadFile(paneId, bucket, key);
    }
  };

  // Sidebar handlers
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
    localStorage.setItem('s3-navigator-sidebar-width', width.toString());
  };

  const handleSidebarBucketSelect = async (bucket: string, prefix: string) => {
    console.log('handleSidebarBucketSelect', { bucket, prefix });
    await handleBucketSelect(workspace.activePaneId, bucket, prefix);
    setSidebarOpen(false);
  };

  const handleBookmarkToggle = (bucket: string, prefix: string = '') => {
    if (isBookmarked(bucket, prefix)) {
      removeBookmark(bucket, prefix);
    } else {
      addBookmark(bucket, prefix);
    }
  };

  // Get active pane for breadcrumb and sidebar context
  const activePane = getPane(workspace.activePaneId) || workspace.panes[0];

  return (
    <div
      className={`app ${sidebarOpen ? 'sidebar-expanded' : ''}`}
      style={sidebarOpen ? { marginLeft: `${sidebarWidth}px` } : {}}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={handleSidebarToggle}
        bookmarkedItems={bookmarks}
        currentBucket={activePane.bucket}
        currentPrefix={activePane.prefix}
        onBucketSelect={handleSidebarBucketSelect}
        onRemoveBookmark={removeBookmark}
        width={sidebarWidth}
        onWidthChange={handleSidebarWidthChange}
      />

      <div className="app-content">
        {/* Breadcrumb navigation - shown for active pane */}
        {activePane.type !== 'selector' && activePane.bucket && (
          <div className="breadcrumb-section">
            <Breadcrumb
              bucket={activePane.bucket}
              currentPrefix={activePane.prefix}
              onNavigate={(key) => handleNavigate(workspace.activePaneId, key)}
              onBackToSelector={() => handleBackToSelector(workspace.activePaneId)}
              onBookmarkBucket={(bucket) => handleBookmarkToggle(bucket, '')}
              onBookmarkFolder={(bucket, prefix) => handleBookmarkToggle(bucket, prefix)}
              isBookmarked={(bucket, prefix) => isBookmarked(bucket, prefix || '')}
            />
          </div>
        )}

        <main className="app-main">
          <WorkspaceLayout
            workspace={workspace}
            onPaneAction={() => { }}
            onSplitPane={handleSplitPane}
            onClosePane={handleClosePane}
            onSetActivePane={handleSetActivePane}
            onOpenInNewWindow={handleOpenInNewWindow}
            onNavigate={handleNavigate}
            onFileSelect={handleFileSelect}
            onBackToSelector={handleBackToSelector}
            onBackToFolder={handleBackToFolder}
            onBookmarkFolder={handleBookmarkToggle}
            isBookmarked={isBookmarked}
            onBucketSelect={handleBucketSelect}
          />
        </main>

        <footer className="app-footer">
          <p>Made with <Icon name="heart-fill" /> by <strong>VR Enterprises</strong></p>
        </footer>
      </div>
    </div>
  );
};

export default App; 