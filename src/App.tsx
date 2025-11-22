import React, { useState, useEffect } from 'react';
import Icon from './components/Icon';
import { Breadcrumb } from './components/Breadcrumb';
import { Sidebar } from './components/Sidebar';
import { WorkspaceLayout } from './components/WorkspaceLayout';
import { useBookmarkedBuckets } from './hooks/useBookmarkedBuckets';
import { WorkspaceState, PaneState, Tab, FileTab, FolderTab } from './types/workspace';
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
      tabs: [],
      activeTabId: null,
      error: null,
      loading: false
    }],
    activePaneId: 'pane-1'
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(250);
  const [maxTabsPerPane, setMaxTabsPerPane] = useState<number>(10);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarkedBuckets();

  // Load sidebar width and max tabs from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('s3-navigator-sidebar-width');
    if (savedWidth) {
      setSidebarWidth(parseInt(savedWidth, 10));
    }

    const savedMaxTabs = localStorage.getItem('s3-navigator-max-tabs');
    if (savedMaxTabs) {
      setMaxTabsPerPane(parseInt(savedMaxTabs, 10));
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

  // Tab Management Handlers
  const handleOpenFileInTab = async (paneId: string, bucket: string, key: string, createNewTab: boolean = false) => {
    const pane = getPane(paneId);
    if (!pane) return;

    updatePane(paneId, { loading: true, error: null });

    try {
      const data = await window.electron.s3.getObject(bucket, key);
      const fileName = key.split('/').pop() || key;
      const parentPrefix = key.substring(0, key.lastIndexOf('/') + 1);

      const newTab: FileTab = {
        id: `tab-${Date.now()}-${Math.random()}`,
        type: 'file',
        bucket,
        key,
        fileName,
        fileData: data
      };

      setWorkspace(prev => ({
        ...prev,
        panes: prev.panes.map(p => {
          if (p.id !== paneId) return p;

          let updatedTabs = [...p.tabs];

          if (createNewTab) {
            // Check tab limit
            if (updatedTabs.length >= maxTabsPerPane) {
              // Remove oldest non-pinned tab
              const nonPinnedIndex = updatedTabs.findIndex(t => !t.isPinned);
              if (nonPinnedIndex !== -1) {
                updatedTabs.splice(nonPinnedIndex, 1);
              } else {
                // All tabs are pinned, don't add new tab
                return p;
              }
            }
            updatedTabs.push(newTab);
          } else {
            // Replace active tab or add new if no tabs
            if (p.activeTabId) {
              const activeIndex = updatedTabs.findIndex(t => t.id === p.activeTabId);
              if (activeIndex !== -1) {
                updatedTabs[activeIndex] = newTab;
              } else {
                updatedTabs.push(newTab);
              }
            } else {
              updatedTabs = [newTab];
            }
          }

          return {
            ...p,
            type: 'viewer' as const,
            bucket,
            prefix: parentPrefix,
            tabs: updatedTabs,
            activeTabId: newTab.id,
            fileData: data,
            loading: false
          };
        })
      }));
    } catch (err) {
      updatePane(paneId, {
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load file'
      });
    }
  };

  const handleOpenFolderInTab = async (paneId: string, bucket: string, prefix: string, createNewTab: boolean = false) => {
    const pane = getPane(paneId);
    if (!pane) return;

    updatePane(paneId, { loading: true, error: null });

    try {
      const data = await window.electron.s3.listObjects(bucket, prefix);
      const folderName = prefix ? prefix.split('/').filter(Boolean).pop() || prefix : bucket;

      const newTab: FolderTab = {
        id: `tab-${Date.now()}-${Math.random()}`,
        type: 'folder',
        bucket,
        prefix,
        folderName,
        folderData: data
      };

      setWorkspace(prev => ({
        ...prev,
        panes: prev.panes.map(p => {
          if (p.id !== paneId) return p;

          let updatedTabs = [...p.tabs];

          if (createNewTab) {
            // Check tab limit
            if (updatedTabs.length >= maxTabsPerPane) {
              // Remove oldest non-pinned tab
              const nonPinnedIndex = updatedTabs.findIndex(t => !t.isPinned);
              if (nonPinnedIndex !== -1) {
                updatedTabs.splice(nonPinnedIndex, 1);
              } else {
                return p;
              }
            }
            updatedTabs.push(newTab);
          } else {
            // Replace active tab or add new if no tabs
            if (p.activeTabId) {
              const activeIndex = updatedTabs.findIndex(t => t.id === p.activeTabId);
              if (activeIndex !== -1) {
                updatedTabs[activeIndex] = newTab;
              } else {
                updatedTabs.push(newTab);
              }
            } else {
              updatedTabs = [newTab];
            }
          }

          return {
            ...p,
            type: 'browser' as const,
            bucket,
            prefix,
            tabs: updatedTabs,
            activeTabId: newTab.id,
            folderData: data,
            loading: false
          };
        })
      }));
    } catch (err) {
      updatePane(paneId, {
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load folder'
      });
    }
  };

  const handleSwitchTab = (paneId: string, tabId: string) => {
    setWorkspace(prev => ({
      ...prev,
      panes: prev.panes.map(p => {
        if (p.id !== paneId) return p;

        const tab = p.tabs.find(t => t.id === tabId);
        if (!tab) return p;

        if (tab.type === 'file') {
          return {
            ...p,
            type: 'viewer' as const,
            activeTabId: tabId,
            bucket: tab.bucket,
            prefix: tab.key.substring(0, tab.key.lastIndexOf('/') + 1),
            fileData: tab.fileData,
            folderData: null
          };
        } else {
          return {
            ...p,
            type: 'browser' as const,
            activeTabId: tabId,
            bucket: tab.bucket,
            prefix: tab.prefix,
            folderData: tab.folderData,
            fileData: null
          };
        }
      })
    }));
  };

  const handleCloseTab = (paneId: string, tabId: string) => {
    setWorkspace(prev => ({
      ...prev,
      panes: prev.panes.map(p => {
        if (p.id !== paneId) return p;

        const updatedTabs = p.tabs.filter(t => t.id !== tabId);

        // If no tabs left, return to selector
        if (updatedTabs.length === 0) {
          return {
            ...p,
            type: 'selector' as const,
            tabs: [],
            activeTabId: null,
            fileData: null,
            folderData: null
          };
        }

        // If closing active tab, switch to next or previous
        let newActiveTabId = p.activeTabId;
        if (tabId === p.activeTabId) {
          const closedIndex = p.tabs.findIndex(t => t.id === tabId);
          // Try next tab first, then previous
          const nextTab = updatedTabs[closedIndex] || updatedTabs[closedIndex - 1];
          newActiveTabId = nextTab.id;

          // Update pane state based on new active tab
          if (nextTab.type === 'file') {
            return {
              ...p,
              type: 'viewer' as const,
              tabs: updatedTabs,
              activeTabId: newActiveTabId,
              bucket: nextTab.bucket,
              prefix: nextTab.key.substring(0, nextTab.key.lastIndexOf('/') + 1),
              fileData: nextTab.fileData,
              folderData: null
            };
          } else {
            return {
              ...p,
              type: 'browser' as const,
              tabs: updatedTabs,
              activeTabId: newActiveTabId,
              bucket: nextTab.bucket,
              prefix: nextTab.prefix,
              folderData: nextTab.folderData,
              fileData: null
            };
          }
        }

        return {
          ...p,
          tabs: updatedTabs,
          activeTabId: newActiveTabId
        };
      })
    }));
  };

  const handleCloseAllTabs = (paneId: string) => {
    updatePane(paneId, {
      type: 'selector',
      tabs: [],
      activeTabId: null,
      fileData: null,
      folderData: null,
      bucket: '',
      prefix: ''
    });
  };

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
      // Use tab handler instead of loadFolder
      await handleOpenFolderInTab(paneId, pane.bucket, key, false);
    }
  };

  const handleFileSelect = async (paneId: string, key: string, openInNewTab: boolean = false) => {
    const pane = getPane(paneId);
    if (pane) {
      // Use tab handler instead of loadFile
      await handleOpenFileInTab(paneId, pane.bucket, key, openInNewTab);
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
      id: newPaneId,
      tabs: [], // New pane starts with empty tabs
      activeTabId: null
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
      await handleOpenFolderInTab(paneId, bucket, key || '', false);
    } else {
      await handleOpenFileInTab(paneId, bucket, key, false);
    }
  };

  // Sidebar handlers
  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width);
    localStorage.setItem('s3-navigator-sidebar-width', width.toString());
  };

  const handleMaxTabsChange = (maxTabs: number) => {
    setMaxTabsPerPane(maxTabs);
    localStorage.setItem('s3-navigator-max-tabs', maxTabs.toString());
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
        maxTabsPerPane={maxTabsPerPane}
        onMaxTabsChange={handleMaxTabsChange}
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
              onFileSelect={(key) => handleFileSelect(workspace.activePaneId, key)}
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
            onTabSwitch={handleSwitchTab}
            onTabClose={handleCloseTab}
            onCloseAllTabs={handleCloseAllTabs}
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