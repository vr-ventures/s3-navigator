export interface IElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
  };
  s3: {
    getObject(bucket: string, key: string): Promise<S3ObjectResult>;
    listObjects(bucket: string, prefix?: string): Promise<S3ListResult>;
  };
}

export interface S3ObjectResult {
  type: 'json' | 'markdown' | 'html' | 'image' | 'other';
  data: any;
  key: string;
  contentType?: string;
  error?: string;
}

export interface S3ListResult {
  folders: S3Item[];
  files: S3Item[];
  prefix: string;
}

export interface S3Item {
  type: 'folder' | 'json' | 'markdown' | 'html' | 'image' | 'other';
  key: string;
  name: string;
  size: number;
  lastModified: Date | null;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export { }; 