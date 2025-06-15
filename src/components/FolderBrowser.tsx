import React from 'react';
import { S3Item } from '../types/electron';

interface FolderBrowserProps {
  folders: S3Item[];
  files: S3Item[];
  currentPrefix: string;
  onNavigate: (key: string) => void;
  onFileSelect: (key: string) => void;
}

export const FolderBrowser: React.FC<FolderBrowserProps> = ({
  folders,
  files,
  currentPrefix,
  onNavigate,
  onFileSelect
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return '📁';
      case 'json': return '📄';
      case 'markdown': return '📝';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  return (
    <div className="folder-browser">
      <div className="folder-content">
        <table className="file-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Modified</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder) => (
              <tr key={folder.key} className="folder-row" onClick={() => onNavigate(folder.key)}>
                <td>
                  <span className="file-icon">{getFileIcon(folder.type)}</span>
                  <span className="file-name">{folder.name}</span>
                </td>
                <td>Folder</td>
                <td>-</td>
                <td>-</td>
              </tr>
            ))}
            {files.map((file) => (
              <tr key={file.key} className="file-row" onClick={() => onFileSelect(file.key)}>
                <td>
                  <span className="file-icon">{getFileIcon(file.type)}</span>
                  <span className="file-name">{file.name}</span>
                </td>
                <td>{file.type.charAt(0).toUpperCase() + file.type.slice(1)}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{formatDate(file.lastModified)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {folders.length === 0 && files.length === 0 && (
          <div className="empty-folder">
            <p>📂 This folder is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}; 