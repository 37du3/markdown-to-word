/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await */
import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  ConversionOptions,
  ConversionResult,
  ConversionError,
  ConversionStats,
} from '../types';
import { ClipboardUtils } from '../utils/clipboard/ClipboardUtils';
import { MarkdownParser } from '../utils/parser/MarkdownParser';
import { HtmlConverter } from '../utils/converter/HtmlConverter';
import { ConversionCache } from '../utils/performance/ConversionCache';

/**
 * 转换 Hook
 * 管理 Markdown 到各种格式的转换逻辑
 */
export function useConversion(options?: Partial<ConversionOptions>) {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<ConversionError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const parser = useMemo(() => new MarkdownParser(), []);
  const converter = useMemo(() => new HtmlConverter(), []);
  const cache = useMemo(() => new ConversionCache(), []);

  // 默认配置
  const defaultOptions: ConversionOptions = useMemo(
    () => ({
      table: {
        enableMergedCells: true,
        defaultAlign: 'left',
        headerBackground: '#f0f0f0',
        borderColor: '#000000',
      },
      code: {
        showLineNumbers: false,
        theme: 'light',
        fontFamily: 'JetBrains Mono',
        fontSize: 10,
      },
      text: {
        fontFamily: 'Noto Serif SC',
        fontSize: 12,
        lineHeight: 1.5,
        linkColor: '#0563c1',
      },
      heading: {
        fontFamily: 'Noto Serif SC',
        h1Size: 16,
        h2Size: 14,
        h3Size: 13,
        h4Size: 12,
        h5Size: 11,
        h6Size: 10,
      },
      math: {
        output: 'katex',
      },
      ...options,
    }),
    [options]
  );

  const resolveOptions = useCallback(
    (overrides?: Partial<ConversionOptions>): ConversionOptions => ({
      table: { ...defaultOptions.table, ...overrides?.table },
      code: { ...defaultOptions.code, ...overrides?.code },
      text: { ...defaultOptions.text, ...overrides?.text },
      heading: { ...defaultOptions.heading, ...overrides?.heading },
      math: { ...defaultOptions.math, ...overrides?.math },
    }),
    [defaultOptions]
  );

  // 计算统计信息
  const calculateStats = useCallback((markdown: string): ConversionStats => {
    const lines = markdown.split('\n').filter((line) => line.trim());
    const words = markdown.split(/\s+/).filter((word) => word).length;
    const characters = markdown.length;

    // 统计各种元素数量
    const tableMatches = markdown.match(/\|[^\n]+\|/g) || [];
    const tables = tableMatches.length > 0 ? Math.ceil(tableMatches.length / 3) : 0;
    const codeBlocks = (markdown.match(/```/g) || []).length / 2;
    const images = (markdown.match(/!\[.*\]\(.*\)/g) || []).length;
    const headings = (markdown.match(/^#{1,6}\s/gm) || []).length;
    const links = (markdown.match(/\[.*\]\(.*\)/g) || []).length;

    return {
      characters,
      words,
      lines: lines.length,
      tables: Math.max(0, tables),
      codeBlocks: Math.max(0, Math.floor(codeBlocks)),
      images,
      headings,
      links,
    };
  }, []);

  // 中止当前转换
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConverting(false);
  }, []);

  // 转换为 HTML
  const convertToHtml = useCallback(
    async (
      markdown: string,
      options?: Partial<ConversionOptions>
    ): Promise<ConversionResult> => {
      setIsConverting(true);
      setError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await Promise.resolve();
        if (controller.signal.aborted) {
          throw new Error('转换已取消');
        }

        const mergedOptions = resolveOptions(options);
        const cacheKey = `${markdown}__${JSON.stringify(mergedOptions)}`;
        const cached = cache.get(cacheKey);
        if (cached) {
          setIsConverting(false);
          return {
            success: true,
            html: cached.html,
            plainText: markdown,
            stats: cached.stats,
          };
        }
        const ast = parser.parse(markdown);
        const html = converter.convert(ast, mergedOptions);
        const stats = calculateStats(markdown);

        if (controller.signal.aborted) {
          throw new Error('转换已取消');
        }

        cache.set(cacheKey, {
          html,
          stats,
        });

        setIsConverting(false);
        return {
          success: true,
          html,
          plainText: markdown,
          stats,
        };
      } catch (err) {
        const conversionError: ConversionError = {
          type: err instanceof Error && err.name === 'AbortError' ? 'system' : 'convert',
          message:
            err instanceof Error ? err.message : '转换失败，请重试',
          recoverable: false,
        };

        setError(conversionError);
        setIsConverting(false);

        return {
          success: false,
          error: conversionError,
        };
      }
    },
    [cache, calculateStats, converter, parser, resolveOptions]
  );

  // 转换为纯文本
  const convertToPlainText = useCallback(
    async (markdown: string): Promise<string> => {
      return markdown
        .replace(/```[\s\S]*?```/g, (match) => match.replace(/```\w*\n?/g, '').replace(/```/g, ''))
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
        .replace(/^#{1,6}\s/gm, '')
        .replace(/\|.+\|/g, (match) => match.replace(/\|/g, '  '))
        .replace(/^\s*[-*+]\s/gm, '• ')
        .replace(/^\s*\d+\.\s/gm, '')
        .trim();
    },
    []
  );

  // 转换为 .docx（后续实现）
  const convertToDocx = useCallback(
    async (
      markdown: string,
      options?: Partial<ConversionOptions>
    ): Promise<ConversionResult> => {
      setIsConverting(true);
      setError(null);

      try {
        const { DocxConverter } = await import('../utils/converter/DocxConverter');
        const mergedOptions = resolveOptions(options);
        const ast = parser.parse(markdown);
        const converter = new DocxConverter();
        const result = await converter.convert(ast, mergedOptions);

        if (result.success && result.docx) {
          setIsConverting(false);
          return {
            success: true,
            docx: result.docx,
          };
        }

        throw result.error || new Error('Docx conversion failed');
      } catch (err) {
        const conversionError: ConversionError = {
          type: 'convert',
          message: err instanceof Error ? err.message : '文档生成失败',
          recoverable: true,
        };

        setError(conversionError);
        setIsConverting(false);

        return {
          success: false,
          error: conversionError,
        };
      }
    },
    [parser, resolveOptions]
  );

  const clearCache = useCallback(() => {
    cache.clear();
  }, [cache]);


  return {
    isConverting,
    error,
    convertToHtml,
    convertToPlainText,
    convertToDocx,
    calculateStats,
    clearCache,
    copy: useCallback(async (html: string, plainText: string) => {
      return ClipboardUtils.writeToClipboard({ html, plainText });
    }, []),
    abort,
    options: defaultOptions,
  };
}
