import { useState, useCallback } from 'react';

export function useClipboard() {
    const [isReading, setIsReading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const readClipboard = useCallback(async (): Promise<string> => {
        setIsReading(true);
        setError(null);

        try {
            const text = await navigator.clipboard.readText();
            return text;
        } catch (err) {
            const message = err instanceof Error ? err.message : '无法读取剪贴板';
            setError(message);
            throw new Error(message);
        } finally {
            setIsReading(false);
        }
    }, []);

    return { readClipboard, isReading, error };
}
