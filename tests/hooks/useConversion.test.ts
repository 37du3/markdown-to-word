import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConversion } from '../../src/hooks/useConversion';
import { HtmlConverter } from '../../src/utils/converter/HtmlConverter';

describe('useConversion', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  describe('convertToHtml', () => {
    it('应该返回初始状态', () => {
      const { result } = renderHook(() => useConversion());
      expect(result.current.isConverting).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('应该成功转换简单的 Markdown', async () => {
      const { result } = renderHook(() => useConversion());

      await act(async () => {
        const conversionResult = await result.current.convertToHtml('# Hello\n\nThis is a test.');
        expect(conversionResult.success).toBe(true);
        expect(conversionResult.html).toBeDefined();
        expect(conversionResult.plainText).toBe('# Hello\n\nThis is a test.');
      });
    });

    it('应该处理代码块', async () => {
      const { result } = renderHook(() => useConversion());

      await act(async () => {
        const conversionResult = await result.current.convertToHtml(
          '```javascript\nconsole.log("hello");\n```'
        );
        expect(conversionResult.success).toBe(true);
        expect(conversionResult.html).toContain('hljs');
      });
    });

    it('应该复用缓存结果并支持清除', async () => {
      const convertSpy = vi.spyOn(HtmlConverter.prototype, 'convert');
      const { result } = renderHook(() => useConversion());

      await act(async () => {
        await result.current.convertToHtml('# Hello\n\nWorld');
        await result.current.convertToHtml('# Hello\n\nWorld');
      });

      expect(convertSpy).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.clearCache();
      });

      await act(async () => {
        await result.current.convertToHtml('# Hello\n\nWorld');
      });

      expect(convertSpy).toHaveBeenCalledTimes(2);
      convertSpy.mockRestore();
    });

    it('应该处理粗体和斜体', async () => {
      const { result } = renderHook(() => useConversion());

      await act(async () => {
        const conversionResult = await result.current.convertToHtml(
          'This is **bold** and *italic* text.'
        );
        expect(conversionResult.success).toBe(true);
        expect(conversionResult.html).toContain('<strong>');
        expect(conversionResult.html).toContain('<em>');
      });
    });

    it('应该将列表包裹在ul中', async () => {
      const { result } = renderHook(() => useConversion());

      await act(async () => {
        const conversionResult = await result.current.convertToHtml(
          '- Item 1\n- Item 2'
        );
        expect(conversionResult.success).toBe(true);
        expect(conversionResult.html).toContain('<ul');
        expect(conversionResult.html).toContain('<li');
      });
    });
  });

  describe('convertToPlainText', () => {
    it('应该移除 Markdown 格式', async () => {
      const { result } = renderHook(() => useConversion());

      const plainText = await result.current.convertToPlainText(
        '# Title\n\nThis is **bold** text with `code`.'
      );

      expect(plainText).toContain('Title');
      expect(plainText).toContain('bold');
      expect(plainText).not.toContain('**');
      expect(plainText).not.toContain('`');
    });

    it('应该处理链接', async () => {
      const { result } = renderHook(() => useConversion());

      const plainText = await result.current.convertToPlainText(
        'Visit [Google](https://google.com)'
      );

      expect(plainText).toContain('Google');
      expect(plainText).toContain('https://google.com');
    });
  });

  describe('copy', () => {
    it('应该写入剪贴板', async () => {
      const { result } = renderHook(() => useConversion());

      const mockWrite = vi.spyOn(navigator.clipboard, 'write').mockResolvedValue(undefined);

      (global as any).ClipboardItem = function () {
        return {};
      };

      await act(async () => {
        const copyResult = await result.current.copy('<p>Hello</p>', 'Hello');
        expect(copyResult.success).toBe(true);
      });

      expect(mockWrite).toHaveBeenCalled();
    });
  });

  describe('calculateStats', () => {
    it('应该计算正确的统计信息', () => {
      const { result } = renderHook(() => useConversion());

      const stats = result.current.calculateStats('# Heading\n\nParagraph text.\n\n- Item 1\n- Item 2');

      expect(stats.characters).toBeGreaterThan(0);
      expect(stats.words).toBeGreaterThan(0);
      expect(stats.lines).toBe(4);
      expect(stats.headings).toBe(1);
      expect(stats.tables).toBe(0);
      expect(stats.codeBlocks).toBe(0);
    });

    it('应该统计表格', () => {
      const { result } = renderHook(() => useConversion());

      const stats = result.current.calculateStats(
        '| Col1 | Col2 |\n| --- | --- |\n| A | B |'
      );

      expect(stats.tables).toBe(1);
    });

    it('应该统计代码块', () => {
      const { result } = renderHook(() => useConversion());

      const stats = result.current.calculateStats(
        '```\ncode\n```\n\nMore text\n\n```\nmore code\n```'
      );

      expect(stats.codeBlocks).toBe(2);
    });
  });

  describe('abort', () => {
    it('应该中止正在进行的转换', async () => {
      const { result } = renderHook(() => useConversion());

      // 启动转换
      let conversionPromise: ReturnType<typeof result.current.convertToHtml>;
      act(() => {
        conversionPromise = result.current.convertToHtml('# Test\n\n'.repeat(100));
        result.current.abort();
      });

      // 等待转换完成（应该已经被中止）
      await act(async () => {
        const conversionResult = await conversionPromise;
        expect(conversionResult.error?.message).toBe('转换已取消');
      });
    });
  });
});
