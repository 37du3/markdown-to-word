import type { ClipboardData, ClipboardResult, ClipboardWriteOptions } from '../../types';

export class ClipboardUtils {
  static async writeToClipboard(
    data: ClipboardData,
    options: ClipboardWriteOptions = {}
  ): Promise<ClipboardResult> {
    const { preferHTML = true, fallbackToPlain = true } = options;

    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      const clipboardItems: Record<string, Blob> = {};

      if (preferHTML && data.html) {
        clipboardItems['text/html'] = new Blob([data.html], { type: 'text/html' });
      }

      if (data.plainText) {
        clipboardItems['text/plain'] = new Blob([data.plainText], { type: 'text/plain' });
      }

      if (data.richText) {
        clipboardItems['text/rtf'] = new Blob([data.richText], { type: 'text/rtf' });
      }

      const clipboardItem = new ClipboardItem(clipboardItems);
      await navigator.clipboard.write([clipboardItem]);

      return {
        success: true,
        format: preferHTML ? 'html' : 'plain',
      };
    } catch (error) {
      if (fallbackToPlain && data.plainText) {
        try {
          await navigator.clipboard.writeText(data.plainText);
          return {
            success: true,
            format: 'plain',
          };
        } catch (fallbackError) {
          return {
            success: false,
            error: fallbackError instanceof Error ? fallbackError : new Error('Copy failed'),
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Copy failed'),
      };
    }
  }

  static async requestPermission(): Promise<PermissionState> {
    try {
      if (!navigator.permissions || !navigator.permissions.query) {
        return 'granted';
      }

      const result = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
      return result.state;
    } catch (error) {
      console.error('Failed to query clipboard permission:', error);
      return 'prompt';
    }
  }

  static isClipboardSupported(): boolean {
    return !!navigator.clipboard && !!window.ClipboardItem;
  }
}
