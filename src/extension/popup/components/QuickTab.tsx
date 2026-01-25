import React, { useState } from 'react';
import { useClipboard } from '../hooks/useClipboard';
import { usePageExtract } from '../hooks/usePageExtract';
import { useConversion } from '../../../hooks/useConversion';
import { preprocessMarkdown } from '../../../lib/preprocessor';
import { ConversionSuccessDialog } from './ConversionSuccessDialog';

// Inline icon style to guarantee sizing
const iconStyle = { width: 20, height: 20, flexShrink: 0 };
const btnIconStyle = { width: 18, height: 18, flexShrink: 0 };

export function QuickTab() {
    const [content, setContent] = useState('');
    const [aiClean, setAiClean] = useState(true);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [isConverting, setIsConverting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [conversionResult, setConversionResult] = useState<{
        html?: string;
        text?: string;
        docx?: Blob;
    }>({});

    const { readClipboard, isReading } = useClipboard();
    const { extractFromCurrentPage, isExtracting } = usePageExtract();
    const { convertToDocx, convertToHtml, copy } = useConversion();

    const handlePasteFromClipboard = async () => {
        try {
            const text = await readClipboard();
            setContent(text);
        } catch (err) {
            console.error('Clipboard read failed:', err);
        }
    };

    const handleExtractFromPage = async () => {
        try {
            const text = await extractFromCurrentPage();
            setContent(text);
        } catch (err) {
            console.error('Page extraction failed:', err);
        }
    };

    const handleConvert = async () => {
        if (!content.trim()) return;

        setIsConverting(true);
        try {
            const processedContent = aiClean ? preprocessMarkdown(content) : content;
            const options = {
                code: { showLineNumbers, theme: 'light' as const, fontFamily: 'JetBrains Mono', fontSize: 14 }
            };

            console.log('[QuickTab] Starting conversion, content length:', processedContent.length);

            // Sequential conversion
            const htmlResult = await convertToHtml(processedContent, options);
            if (!htmlResult.success) {
                throw new Error(`HTML转换失败: ${htmlResult.error?.message || '未知错误'}`);
            }

            const docxResult = await convertToDocx(processedContent, options);
            if (!docxResult.success) {
                throw new Error(`Word转换失败: ${docxResult.error?.message || '未知错误'}`);
            }

            setConversionResult({
                html: htmlResult.html,
                text: htmlResult.plainText,
                docx: docxResult.docx
            });
            setShowDialog(true);
        } catch (err) {
            console.error('[QuickTab] Conversion failed:', err);
            const errorMessage = err instanceof Error ? err.message : '转换失败';
            alert(`转换失败\n\n${errorMessage}\n\n请检查浏览器控制台查看详细日志。`);
        } finally {
            setIsConverting(false);
        }
    };

    const handleCopy = async () => {
        if (conversionResult.html && conversionResult.text) {
            try {
                await copy(conversionResult.html, conversionResult.text);
                setShowDialog(false);
                alert('已复制到剪贴板');
            } catch (err) {
                console.error('Copy failed:', err);
                alert('复制失败');
            }
        }
    };

    const handleDownload = async () => {
        if (conversionResult.docx) {
            try {
                const { saveAs } = await import('file-saver');
                saveAs(conversionResult.docx, 'converted-document.docx');
                setShowDialog(false);
            } catch (err) {
                console.error('Download failed:', err);
                alert('下载失败');
            }
        }
    };

    return (
        <div className="quick-tab">
            <section className="quick-section">
                <h3 className="section-title">
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    导入内容
                </h3>
                <button
                    className="action-btn primary"
                    onClick={handlePasteFromClipboard}
                    disabled={isReading || isConverting}
                >
                    <svg style={btnIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="8" y="2" width="8" height="4" rx="1" />
                        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                    </svg>
                    <span>{isReading ? '读取中...' : '从剪贴板粘贴'}</span>
                </button>
                <button
                    className="action-btn primary"
                    onClick={handleExtractFromPage}
                    disabled={isExtracting || isConverting}
                >
                    <svg style={btnIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                    <span>{isExtracting ? '提取中...' : '从当前页面提取'}</span>
                </button>
            </section>

            {content && (
                <section className="quick-section">
                    <div className="status-card">
                        <div className="status-header">
                            <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24" fill="#10b981">
                                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                            <h4 className="status-title">内容已准备就绪</h4>
                        </div>
                        <div className="status-info">
                            <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <path d="M3 3v18h18" />
                                <path d="M18 17V9M13 17V5M8 17v-3" />
                            </svg>
                            <span>{content.length} 字符 | {content.split('\n').length} 行</span>
                        </div>
                    </div>
                </section>
            )}

            <section className="quick-section">
                <h3 className="section-title">
                    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                    选项
                </h3>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={aiClean}
                        onChange={(e) => setAiClean(e.target.checked)}
                    />
                    <span>AI 内容清洗</span>
                </label>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={showLineNumbers}
                        onChange={(e) => setShowLineNumbers(e.target.checked)}
                    />
                    <span>保留代码高亮</span>
                </label>
            </section>

            <div className="quick-actions">
                <button
                    className="action-btn convert"
                    onClick={handleConvert}
                    disabled={!content || isConverting}
                >
                    {isConverting ? (
                        <span>转换中...</span>
                    ) : (
                        <>
                            <svg style={btnIconStyle} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                            <span>转换</span>
                        </>
                    )}
                </button>
            </div>

            {showDialog && (
                <ConversionSuccessDialog
                    onCopy={handleCopy}
                    onDownload={handleDownload}
                    onClose={() => setShowDialog(false)}
                />
            )}
        </div>
    );
}
