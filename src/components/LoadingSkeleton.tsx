import React from 'react';

interface LoadingSkeletonProps {
    type?: 'folder' | 'file' | 'viewer';
    rows?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type = 'folder', rows = 5 }) => {
    if (type === 'viewer') {
        return (
            <div className="loading-skeleton viewer-skeleton">
                <div className="skeleton-header">
                    <div className="skeleton-line" style={{ width: '30%', height: '2rem' }}></div>
                    <div className="skeleton-line" style={{ width: '20%', height: '2.5rem' }}></div>
                </div>
                <div className="skeleton-content">
                    <div className="skeleton-line" style={{ width: '100%', height: '1.5rem' }}></div>
                    <div className="skeleton-line" style={{ width: '90%', height: '1.5rem' }}></div>
                    <div className="skeleton-line" style={{ width: '95%', height: '1.5rem' }}></div>
                    <div className="skeleton-line" style={{ width: '85%', height: '1.5rem' }}></div>
                    <div className="skeleton-line" style={{ width: '100%', height: '1.5rem' }}></div>
                    <div className="skeleton-line" style={{ width: '80%', height: '1.5rem' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="loading-skeleton folder-skeleton">
            <div className="skeleton-navigation">
                <div className="skeleton-line" style={{ width: '100%', height: '3rem' }}></div>
            </div>
            <div className="skeleton-table">
                <div className="skeleton-table-header">
                    <div className="skeleton-line" style={{ width: '40%', height: '2rem' }}></div>
                    <div className="skeleton-line" style={{ width: '15%', height: '2rem' }}></div>
                    <div className="skeleton-line" style={{ width: '15%', height: '2rem' }}></div>
                    <div className="skeleton-line" style={{ width: '20%', height: '2rem' }}></div>
                    <div className="skeleton-line" style={{ width: '10%', height: '2rem' }}></div>
                </div>
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="skeleton-table-row">
                        <div className="skeleton-line" style={{ width: '45%', height: '1.5rem' }}></div>
                        <div className="skeleton-line" style={{ width: '12%', height: '1.5rem' }}></div>
                        <div className="skeleton-line" style={{ width: '10%', height: '1.5rem' }}></div>
                        <div className="skeleton-line" style={{ width: '18%', height: '1.5rem' }}></div>
                        <div className="skeleton-line" style={{ width: '8%', height: '1.5rem' }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 