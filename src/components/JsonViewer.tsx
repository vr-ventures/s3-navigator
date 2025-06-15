import React, { useState, useMemo } from 'react';
import JsonView from '@uiw/react-json-view';
import { JSONPath } from 'jsonpath-plus';

interface JsonViewerProps {
  data: any;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'text' | 'jsonpath'>('jsonpath');
  const [jsonPathError, setJsonPathError] = useState<string | null>(null);

  // Function to detect if search term looks like JSONPath
  const isJsonPathQuery = (query: string): boolean => {
    return query.startsWith('$') || query.includes('[') || query.includes('*') || query.includes('..') || query.includes('?');
  };

  // Function to execute JSONPath query
  const executeJsonPath = (obj: any, path: string): any => {
    try {
      setJsonPathError(null);
      
      // Handle null/undefined data
      if (obj === null || obj === undefined) {
        return {};
      }
      
      const results = JSONPath({ path, json: obj, wrap: true });
      
      if (Array.isArray(results) && results.length === 0) {
        return {};
      }
      
      // If single result, return it directly (but handle strings properly)
      if (Array.isArray(results) && results.length === 1) {
        const singleResult = results[0];
        // If it's a primitive value (string, number, boolean), wrap it in an object for display
        if (typeof singleResult === 'string' || typeof singleResult === 'number' || typeof singleResult === 'boolean' || singleResult === null) {
          return { result: singleResult };
        }
        return singleResult ?? {};
      }
      
      // If multiple results, return as array (preserving the original structure)
      if (Array.isArray(results)) {
        return results;
      }
      
      // Single non-array result
      if (typeof results === 'string' || typeof results === 'number' || typeof results === 'boolean' || results === null) {
        return { result: results };
      }
      
      return results ?? {};
    } catch (error) {
      setJsonPathError(error instanceof Error ? error.message : 'Invalid JSONPath expression');
      return obj ?? {};
    }
  };

  // Function to recursively search and filter JSON data (text search)
  const filterJsonData = (obj: any, searchTerm: string): any => {
    if (!searchTerm) return obj ?? {};
    
    // Handle null/undefined data
    if (obj === null || obj === undefined) {
      return {};
    }

    const search = searchTerm.toLowerCase();

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      const filteredArray = obj.map(item => filterJsonData(item, searchTerm)).filter(item => {
        if (item === null || item === undefined) return false;
        if (typeof item === 'object' && Object.keys(item).length === 0) return false;
        return true;
      });
      return filteredArray.length > 0 ? filteredArray : [];
    }

    const filtered: any = {};
    let hasMatch = false;

    for (const [key, value] of Object.entries(obj)) {
      const keyMatches = key.toLowerCase().includes(search);
      const filteredValue = filterJsonData(value, searchTerm);
      
      // Include if key matches or if nested content has matches
      if (keyMatches || (typeof filteredValue === 'object' && filteredValue !== null && Object.keys(filteredValue).length > 0)) {
        filtered[key] = filteredValue;
        hasMatch = true;
      } else if (typeof value === 'string' && value.toLowerCase().includes(search)) {
        filtered[key] = value;
        hasMatch = true;
      } else if (typeof value === 'number' && value.toString().includes(search)) {
        filtered[key] = value;
        hasMatch = true;
      }
    }

    return hasMatch ? filtered : {};
  };

  // Memoize filtered data to avoid recalculating on every render
  const filteredData = useMemo(() => {
    // Always ensure we have a valid object for JsonView
    const safeData = data ?? {};
    
    if (!searchTerm) return safeData;

    // Default to JSONPath mode, but allow explicit text mode
    // If user explicitly selected text mode, use text search
    // Otherwise, try JSONPath first, fallback to text if it fails
    if (searchMode === 'text') {
      const result = filterJsonData(safeData, searchTerm);
      return result ?? {};
    } else {
      // Try JSONPath first (default behavior)
      try {
        const result = executeJsonPath(safeData, searchTerm);
        return result ?? {};
      } catch (error) {
        // If JSONPath fails and the query doesn't look like JSONPath, fallback to text search
        if (!isJsonPathQuery(searchTerm)) {
          const result = filterJsonData(safeData, searchTerm);
          return result ?? {};
        }
        // If it looks like JSONPath but failed, keep the error and return original data
        return safeData;
      }
    }
  }, [data, searchTerm, searchMode]);

  const clearSearch = () => {
    setSearchTerm('');
    setJsonPathError(null);
  };

  const toggleSearchMode = () => {
    setSearchMode(prev => prev === 'text' ? 'jsonpath' : 'text');
    setSearchTerm('');
    setJsonPathError(null);
  };

  const getPlaceholderText = () => {
    return searchMode === 'jsonpath' 
      ? "JSONPath query (e.g., $.users[*].name, $..email, or simple text)" 
      : "Search keys or values...";
  };

  const getSearchExamples = () => {
    if (searchMode === 'jsonpath') {
      return [
        "$.users[*].name - Get all user names",
        "$..email - Find all email fields",
        "$.data[?(@.status=='active')] - Filter by condition",
        "$.items[0:3] - Get first 3 items",
        "$.*[?(@.price > 100)] - Items with price > 100",
        "name - Simple text search (fallback)"
      ];
    }
    return [
      "name - Find keys containing 'name'",
      "email - Find email-related data",
      "active - Find 'active' in keys or values"
    ];
  };

  // Handle case where data is null or undefined
  if (data === null || data === undefined) {
    return (
      <div className="json-viewer">
        <div className="json-viewer-empty">
          <p>No JSON data to display</p>
        </div>
      </div>
    );
  }

  // Ensure we never pass null/undefined to JsonView
  const safeFilteredData = filteredData ?? {};

  return (
    <div className="json-viewer">
      <div className="json-search-container">
        <div className="json-search-header">
          <div className="json-search-input-wrapper">
            <input
              type="text"
              placeholder={getPlaceholderText()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`json-search-input ${jsonPathError ? 'error' : ''}`}
            />
            {searchTerm && (
              <button 
                onClick={clearSearch}
                className="json-search-clear"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="json-search-mode-toggle">
            <button
              onClick={toggleSearchMode}
              className={`mode-toggle ${searchMode === 'text' ? 'active' : ''}`}
              title="Text search mode"
            >
              Text
            </button>
            <button
              onClick={toggleSearchMode}
              className={`mode-toggle ${searchMode === 'jsonpath' ? 'active' : ''}`}
              title="JSONPath query mode"
            >
              JSONPath
            </button>
          </div>
        </div>

        {jsonPathError && (
          <div className="json-search-error">
            <strong>JSONPath Error:</strong> {jsonPathError}
          </div>
        )}

        {searchTerm && !jsonPathError && (
          <div className="json-search-info">
            {searchMode === 'jsonpath' ? (
              <>
                <strong>JSONPath Query:</strong> <code>{searchTerm}</code>
                {!isJsonPathQuery(searchTerm) && <span className="fallback-note"> (using text search fallback)</span>}
              </>
            ) : (
              <>
                <strong>Text Search:</strong> <code>{searchTerm}</code>
              </>
            )}
          </div>
        )}

        {!searchTerm && (
          <div className="json-search-examples">
            <strong>Examples:</strong>
            <ul>
              {getSearchExamples().map((example, index) => (
                <li key={index}>
                  <code onClick={() => setSearchTerm(example.split(' - ')[0])} className="clickable-example">
                    {example}
                  </code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <JsonView 
        value={safeFilteredData}
        collapsed={searchTerm ? false : 2}
        displayDataTypes={false}
        enableClipboard={true}
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
          fontSize: '14px',
          lineHeight: '1.5',
          maxHeight: '600px',
          overflow: 'auto'
        }}
      />
    </div>
  );
}; 