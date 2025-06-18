import { useState, useEffect } from 'react';

interface BookmarkedBucket {
    name: string;
    addedAt: string;
}

const STORAGE_KEY = 's3-navigator-bookmarked-buckets';

export const useBookmarkedBuckets = () => {
    const [bookmarkedBuckets, setBookmarkedBuckets] = useState<BookmarkedBucket[]>([]);

    // Load bookmarks from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const buckets = JSON.parse(stored);
                setBookmarkedBuckets(buckets);
            }
        } catch (error) {
            console.error('Failed to load bookmarked buckets:', error);
        }
    }, []);

    // Save bookmarks to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkedBuckets));
        } catch (error) {
            console.error('Failed to save bookmarked buckets:', error);
        }
    }, [bookmarkedBuckets]);

    const addBookmark = (bucketName: string) => {
        if (!bucketName.trim()) return;

        // Check if bucket is already bookmarked
        if (bookmarkedBuckets.some(bucket => bucket.name === bucketName)) {
            return; // Already bookmarked
        }

        const newBookmark: BookmarkedBucket = {
            name: bucketName,
            addedAt: new Date().toISOString(),
        };

        setBookmarkedBuckets(prev => [newBookmark, ...prev]);
    };

    const removeBookmark = (bucketName: string) => {
        setBookmarkedBuckets(prev => prev.filter(bucket => bucket.name !== bucketName));
    };

    const isBookmarked = (bucketName: string) => {
        return bookmarkedBuckets.some(bucket => bucket.name === bucketName);
    };

    return {
        bookmarkedBuckets,
        addBookmark,
        removeBookmark,
        isBookmarked,
    };
}; 