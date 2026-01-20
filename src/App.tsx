import React, { useState, useCallback } from 'react';
import { Copy, Download, Settings, RefreshCw, FileText } from 'lucide-react';
import { MarkdownInput } from './components/Editor/MarkdownInput';
import { WordPreview } from './components/Preview/WordPreview';
import { Toolbar } from './components/Editor/Toolbar';
import { ControlPanel } from './components/Controls/ControlPanel';
import { Header } from './components/Layout/Header';
import { useDebounce } from './hooks/useDebounce';
import { useConversion } from './hooks/useConversion';
import type { ConversionStats, ConversionError } from './types';
import { stripMathDelimiters } from './utils/math/MathText';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900">应用出现错误</h1>
          <p className="text-sm text-gray-600 mt-2">{this.state.error?.message}</p>
          <button
            type="button"
            className="mt-4 btn-secondary"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<ConversionError | null>(null);
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [lastCopied, setLastCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const { convertToHtml, convertToDocx, calculateStats, copy } = useConversion();

  // 防抖输入，避免频繁转换
  const debouncedInput = useDebounce(input, 300);

  // 执行转换
  const convert = useCallback(async (markdown: string) => {
    if (!markdown.trim()) {
      setOutput('');
      setStats(null);
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      const result = await convertToHtml(markdown, { code: { showLineNumbers } });

      if (result.success && result.html) {
        setOutput(result.html);
        setStats(calculateStats(markdown));
      } else {
        throw result.error || new Error('转换失败');
      }
    } catch (err) {
      setError({
        type: 'convert',
        message: err instanceof Error ? err.message : '转换失败',
        recoverable: false,
      });
    } finally {
      setIsConverting(false);
    }
  }, [calculateStats, convertToHtml, showLineNumbers]);

  // 监听防抖后的输入变化
  React.useEffect(() => {
    convert(debouncedInput);
  }, [debouncedInput, convert]);

  // 处理复制
  const handleCopy = useCallback(async () => {
    if (!output) return false;

    try {
      const keepLatex = window.confirm('是否保留 LaTeX 格式？点击“确定”保留，点击“取消”转换为普通文本。');
      const mathOutput = keepLatex ? 'latex' : 'text';
      const htmlResult = await convertToHtml(input, {
        math: { output: mathOutput },
        code: { showLineNumbers: false },
      });
      const htmlToCopy = htmlResult.success && htmlResult.html ? htmlResult.html : output;
      const plainText = keepLatex ? input : stripMathDelimiters(input);
      const result = await copy(htmlToCopy, plainText);
      if (result.success) {
        setLastCopied(true);
        setTimeout(() => setLastCopied(false), 2000);
      }
      return result.success;
    } catch {
      return false;
    }
  }, [copy, convertToHtml, input, output]);

  // 处理下载
  const handleDownload = useCallback(async () => {
    if (!input) return;

    setIsConverting(true);

    try {
      const { saveAs } = await import('file-saver');
      const keepLatex = window.confirm('是否保留 LaTeX 格式？点击“确定”保留，点击“取消”转换为普通文本。');
      const mathOutput = keepLatex ? 'latex' : 'text';
      const result = await convertToDocx(input, { math: { output: mathOutput } });

      if (result.success && result.docx) {
        saveAs(result.docx, 'converted-document.docx');
      } else {
        throw result.error || new Error('文档生成失败');
      }
    } catch (err) {
      setError({
        type: 'convert',
        message: err instanceof Error ? err.message : '下载失败',
        recoverable: true,
      });
    } finally {
      setIsConverting(false);
    }
  }, [convertToDocx, input]);

  // 处理工具栏操作
  const handleInsert = useCallback((pattern: string) => {
    setInput((prev) => prev + pattern);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部 */}
      <Header />

      {/* 主要内容区域 */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 输入区域 */}
        <section className="flex-1 flex flex-col border-r border-gray-200 bg-white min-h-0">
          {/* 工具栏 */}
          <Toolbar
            onInsert={handleInsert}
            onClear={() => setInput('')}
          />

          {/* 输入框 */}
          <div className="flex-1 min-h-0 overflow-auto">
            <MarkdownInput
              value={input}
              onChange={setInput}
              placeholder="在此粘贴 Markdown 文本..."
              autoFocus
            />
          </div>

          {/* 状态栏 */}
          {stats && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex gap-4">
              <span>{stats.characters} 字符</span>
              <span>{stats.words} 词</span>
              <span>{stats.lines} 行</span>
              {stats.tables > 0 && <span>{stats.tables} 表格</span>}
              {stats.codeBlocks > 0 && <span>{stats.codeBlocks} 代码块</span>}
            </div>
          )}
        </section>

        {/* 预览区域 */}
        <section className="flex-1 flex flex-col bg-gray-50 min-h-0">
          {/* 预览头部 */}
          <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-medium text-gray-700">Word 预览</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className={`text-xs px-2 py-1 rounded border ${
                  showLineNumbers
                    ? 'bg-gray-100 text-gray-700 border-gray-200'
                    : 'bg-white text-gray-500 border-gray-200'
                }`}
                onClick={() => setShowLineNumbers((value) => !value)}
                aria-pressed={showLineNumbers}
              >
                行号
              </button>
              {isConverting && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  转换中...
                </div>
              )}
            </div>
          </div>

          {/* 预览内容 */}
          <div className="flex-1 min-h-0 overflow-auto p-4">
            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  转换出错
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                  {error.message}
                </p>
              </div>
            ) : output ? (
              <WordPreview html={output} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  等待输入
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                  在左侧粘贴 Markdown 文本，右侧将显示 Word 格式的预览效果
                </p>
              </div>
            )}
          </div>

          {/* 控制面板 */}
          <div className="px-4 py-3 bg-white border-t border-gray-200">
            <ControlPanel
              onCopy={handleCopy}
              onDownload={handleDownload}
              isConverting={isConverting}
              conversionStats={stats || undefined}
              lastCopied={lastCopied}
              disabled={!output}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
