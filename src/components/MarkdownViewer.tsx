import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownViewerProps {
  content: string;
  fileName?: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content, fileName }) => {
  return (
    <div className="markdown-viewer">
      {fileName && (
        <div className="markdown-header">
          <h2>📄 {fileName}</h2>
        </div>
      )}
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Custom styling for code blocks
            code(props) {
              const { children, className, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              return match ? (
                <pre className={className}>
                  <code {...rest}>{children}</code>
                </pre>
              ) : (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            },
            // Custom styling for tables
            table(props) {
              return (
                <div className="table-wrapper">
                  <table {...props} />
                </div>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}; 