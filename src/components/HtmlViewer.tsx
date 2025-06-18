import React, { useState, useRef, useEffect } from 'react';

interface HtmlViewerProps {
    content: string;
    fileName?: string;
}

export const HtmlViewer: React.FC<HtmlViewerProps> = ({ content, fileName }) => {
    const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Update iframe content when content changes or view mode changes
    useEffect(() => {
        if (viewMode === 'rendered' && iframeRef.current) {
            const iframe = iframeRef.current;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

            if (iframeDoc) {
                iframeDoc.open();
                iframeDoc.write(content);
                iframeDoc.close();
            }
        }
    }, [content, viewMode]);

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'document.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };



    const toggleFullscreen = () => {
        setIsFullscreen(prev => !prev);
    };

    return (
        <div className={`html-viewer ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="html-controls">
                <div className="view-mode-selector">
                    <button
                        onClick={() => setViewMode('rendered')}
                        className={`view-mode-button ${viewMode === 'rendered' ? 'active' : ''}`}
                        title="View rendered HTML"
                    >
                        🌐 Rendered
                    </button>
                    <button
                        onClick={() => setViewMode('source')}
                        className={`view-mode-button ${viewMode === 'source' ? 'active' : ''}`}
                        title="View HTML source code"
                    >
                        📝 Source
                    </button>
                </div>

                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                    {isFullscreen ? '⤫ Exit Fullscreen' : '⛶ Fullscreen'}
                </button>

                <button onClick={handleDownload} title="Download HTML file">
                    💾 Download
                </button>
            </div>

            {viewMode === 'rendered' ? (
                <div className="html-iframe-container">
                    <iframe
                        ref={iframeRef}
                        className="html-iframe"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                        title={`Rendered HTML: ${fileName || 'HTML Document'}`}
                    />
                    <div className="html-security-notice">
                        <small>
                            🔒 Content is sandboxed for security. Some features may be limited.
                        </small>
                    </div>
                </div>
            ) : (
                <div className="html-source-container">
                    <pre className="html-source-code">
                        <code className="language-html">{content}</code>
                    </pre>
                </div>
            )}
        </div>
    );
}; 