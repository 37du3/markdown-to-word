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

    const writeClipboard = useCallback(async (html: string, plainText: string): Promise<void> => {
        try {
            // Create a ClipboardItem with both HTML and plain text
            const htmlBlob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([plainText], { type: 'text/plain' });

            const clipboardItem = new ClipboardItem({
                'text/html': htmlBlob,
                'text/plain': textBlob,
            });

            await navigator.clipboard.write([clipboardItem]);
        } catch (err) {
            // Fallback to plain text if HTML writing fails
            try {
                await navigator.clipboard.writeText(plainText);
            } catch (fallbackErr) {
                const message = err instanceof Error ? err.message : '无法写入剪贴板';
                throw new Error(message);
            }
        }
    }, []);

    return {
        readClipboard,
        writeClipboard,
        paste: readClipboard,
        copy: writeClipboard,
        isReading,
        error
    };
}
