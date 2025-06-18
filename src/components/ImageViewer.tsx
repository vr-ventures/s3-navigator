import React, { useState } from 'react';

interface ImageViewerProps {
  base64Data: string;
  contentType: string;
  fileName?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ base64Data, contentType, fileName }) => {
  const [zoom, setZoom] = useState(1);
  const [showFullSize, setShowFullSize] = useState(false);

  const imageUrl = `data:${contentType};base64,${base64Data}`;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-viewer">
      <div className="image-controls">
        <button onClick={handleZoomOut} disabled={zoom <= 0.25}>
          🔍-
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button onClick={handleZoomIn} disabled={zoom >= 3}>
          🔍+
        </button>
        <button onClick={handleReset}>
          Reset
        </button>
        <button onClick={() => setShowFullSize(!showFullSize)}>
          {showFullSize ? 'Fit to Screen' : 'Full Size'}
        </button>
        <button onClick={handleDownload}>
          💾 Download
        </button>
      </div>
      <div className="image-container" style={{ overflow: showFullSize ? 'auto' : 'hidden' }}>
        <img
          src={imageUrl}
          alt={fileName || 'S3 Image'}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            maxWidth: showFullSize ? 'none' : '100%',
            maxHeight: showFullSize ? 'none' : '80vh',
            transition: 'transform 0.2s ease'
          }}
        />
      </div>
    </div>
  );
}; 