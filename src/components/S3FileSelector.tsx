import React, { useState } from 'react';

interface S3FileSelectorProps {
  onFileSelect: (bucket: string, key: string) => void;
}

export const S3FileSelector: React.FC<S3FileSelectorProps> = ({ onFileSelect }) => {
  const [bucket, setBucket] = useState('');
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bucket) {
      onFileSelect(bucket, key); // key can be empty for root folder browsing
    }
  };

  return (
    <div className="s3-file-selector">
      <div className="selector-header">
        <h2>🧭 Welcome to S3 Navigator</h2>
        <p>Navigate and explore your S3 buckets with ease. Browse folders, view files, and search through your cloud storage.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="selector-form">
        <div className="form-group">
          <label htmlFor="bucket">S3 Bucket *</label>
          <input
            type="text"
            id="bucket"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            placeholder="my-bucket-name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="key">Path/Key (optional)</label>
          <input
            type="text"
            id="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="folder/ or file.json (leave empty for root)"
          />
          <small className="form-help">
            • Leave empty to browse the root of the bucket<br/>
            • End with "/" to browse a specific folder<br/>
            • Enter a full file path to view a specific file
          </small>
        </div>
        
        <button type="submit" className="submit-button">
          🧭 Start Navigation
        </button>
      </form>
      
      <div className="supported-formats">
        <h3>🎯 What You Can Explore</h3>
        <div className="format-list">
          <div className="format-item">
            <span className="format-icon">📄</span>
            <span>JSON files with advanced search & JSONPath queries</span>
          </div>
          <div className="format-item">
            <span className="format-icon">📝</span>
            <span>Markdown files with beautiful rendering & syntax highlighting</span>
          </div>
          <div className="format-item">
            <span className="format-icon">🖼️</span>
            <span>Images with zoom controls & download functionality</span>
          </div>
          <div className="format-item">
            <span className="format-icon">📁</span>
            <span>Folder navigation with file type detection & breadcrumbs</span>
          </div>
          <div className="format-item">
            <span className="format-icon">📋</span>
            <span>Text files with syntax highlighting & formatting</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 