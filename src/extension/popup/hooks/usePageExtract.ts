import { useState, useCallback } from 'react';

export function usePageExtract() {
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const extractFromCurrentPage = useCallback(async (): Promise<string> => {
        setIsExtracting(true);
        setError(null);

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.id) {
                throw new Error('无法找到当前标签页');
            }

            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extract' });

            if (response && response.content) {
                return response.content;
            } else {
                throw new Error('无法提取页面内容');
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : '提取失败';
            setError(message);
            throw new Error(message);
        } finally {
            setIsExtracting(false);
        }
    }, []);

    return { extractFromCurrentPage, isExtracting, error };
}
