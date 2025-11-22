import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
  s3: {
    getObject: (bucket: string, key: string) => {
      return ipcRenderer.invoke('get-s3-object', { bucket, key });
    },
    listObjects: (bucket: string, prefix?: string) => {
      return ipcRenderer.invoke('list-s3-objects', { bucket, prefix });
    },
    searchObjects: (bucket: string, searchTerm: string, currentPrefix?: string) => {
      return ipcRenderer.invoke('search-s3-objects', { bucket, searchTerm, currentPrefix });
    }
  }
}); 