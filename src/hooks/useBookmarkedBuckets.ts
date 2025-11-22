import { useState, useEffect } from 'react';

export interface BookmarkedItem {
    bucket: string;
    prefix: string; // Empty string for bucket root, otherwise folder path ending with /
    addedAt: string;
}

const STORAGE_KEY = 's3-navigator-bookmarked-buckets';

export const useBookmarkedBuckets = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);

    // Load bookmarks from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const items = JSON.parse(stored);
                // Migrate old format if needed
                const migratedItems = items.map((item: any) => {
                    if (item.name) {
                        return {
                            bucket: item.name,
                            prefix: '',
                            addedAt: item.addedAt
                        };
                    }
                    return item;
                });
                setBookmarks(migratedItems);
            }
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        }
    }, []);

    // Save bookmarks to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
        } catch (error) {
            console.error('Failed to save bookmarks:', error);
        }
    }, [bookmarks]);

    const addBookmark = (bucket: string, prefix: string = '') => {
        if (!bucket.trim()) return;

        // Check if already bookmarked
        if (isBookmarked(bucket, prefix)) {
            return; // Already bookmarked
        }

        const newBookmark: BookmarkedItem = {
            bucket,
            prefix,
            addedAt: new Date().toISOString(),
        };

        setBookmarks(prev => [newBookmark, ...prev]);
    };

    const removeBookmark = (bucket: string, prefix: string = '') => {
        setBookmarks(prev => prev.filter(item => 
            !(item.bucket === bucket && item.prefix === prefix)
        ));
    };

    const isBookmarked = (bucket: string, prefix: string = '') => {
        return bookmarks.some(item => 
            item.bucket === bucket && item.prefix === prefix
        );
    };

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
    };
}; 