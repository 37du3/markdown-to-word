import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClipboardUtils } from '../../src/utils/clipboard/ClipboardUtils';
import type { ClipboardData } from '../../src/types';

describe('ClipboardUtils', () => {
  beforeEach(() => {
    (global as any).ClipboardItem = function () {
      return {};
    };
  });

  describe('writeToClipboard', () => {
    it('should write HTML and plain text to clipboard', async () => {
      const data: ClipboardData = {
        html: '<p>Hello</p>',
        plainText: 'Hello',
      };

      const mockWrite = vi.fn().mockResolvedValue(undefined);
      Object.assign(global.navigator, {
        clipboard: {
          write: mockWrite,
        },
      });

      const result = await ClipboardUtils.writeToClipboard(data);

      expect(result.success).toBe(true);
      expect(mockWrite).toHaveBeenCalled();
    });

    it('should fallback to writeText on error', async () => {
      const data: ClipboardData = {
        html: '<p>Hello</p>',
        plainText: 'Hello',
      };

      const mockWrite = vi.fn().mockRejectedValue(new Error('Not allowed'));
      const mockWriteText = vi.fn().mockResolvedValue(undefined);

      Object.assign(global.navigator, {
        clipboard: {
          write: mockWrite,
          writeText: mockWriteText,
        },
      });

      const result = await ClipboardUtils.writeToClipboard(data);

      expect(result.success).toBe(true);
      expect(mockWriteText).toHaveBeenCalledWith(data.plainText);
    });
  });
});
