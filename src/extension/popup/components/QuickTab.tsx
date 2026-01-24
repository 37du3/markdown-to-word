import React, { useState, useCallback } from 'react';
import { useClipboard } from '../hooks/useClipboard';
import { usePageExtract } from '../hooks/usePageExtract';
import { useConversion } from '../../../hooks/useConversion';
import { preprocessMarkdown } from '../../../lib/preprocessor';
import { ConversionSuccessDialog } from './ConversionSuccessDialog';

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
            // 1. Preprocess
            const processedContent = aiClean ? preprocessMarkdown(content) : content;
            const options = {
                code: { showLineNumbers, theme: 'light' as const, fontFamily: 'JetBrains Mono', fontSize: 14 }
            };

            // 2. Run conversions in parallel
            const [htmlResult, docxResult] = await Promise.all([
                convertToHtml(processedContent, options),
                convertToDocx(processedContent, options)
            ]);

            if (htmlResult.success && docxResult.success) {
                setConversionResult({
                    html: htmlResult.html,
                    text: htmlResult.plainText,
                    docx: docxResult.docx
                });
                setShowDialog(true);
            } else {
                throw new Error(htmlResult.error?.message || docxResult.error?.message || '转换失败');
            }
        } catch (err) {
            console.error('Conversion failed:', err);
            alert(err instanceof Error ? err.message : '转换失败');
        } finally {
            setIsConverting(false);
        }
    };

    const handleCopy = async () => {
        if (conversionResult.html && conversionResult.text) {
            try {
                await copy(conversionResult.html, conversionResult.text);
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/icons/icon128.png',
                    title: '已复制',
                    message: '内容已复制到剪贴板',
                });
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
                    {/* Heroicon: document-plus */}
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    导入内容
                </h3>
                <button
                    className="action-btn primary"
                    onClick={handlePasteFromClipboard}
                    disabled={isReading || isConverting}
                >
                    {/* Heroicon: clipboard */}
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    <span>{isReading ? '读取中...' : '从剪贴板粘贴'}</span>
                </button>
                <button
                    className="action-btn primary"
                    onClick={handleExtractFromPage}
                    disabled={isExtracting || isConverting}
                >
                    {/* Heroicon: globe-alt */}
                    <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0-18a9 9 0 018.716 6.747M12 3a9 9 0 00-8.716 6.747M12 3c2.485 0 4.5 4.03 4.5 9s-2.015 9-4.5 9m0-18c-2.485 0-4.5 4.03-4.5 9s2.015 9 4.5 9" />
                    </svg>
                    <span>{isExtracting ? '提取中...' : '从当前页面提取'}</span>
                </button>
            </section>

            {content && (
                <section className="quick-section">
                    <div className="status-card">
                        <div className="status-header">
                            <div className="status-icon">
                                {/* Heroicon: check-badge-solid */}
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm4.45 10.335a1 1 0 001.414-1.414l-4.5-4.5a1 1 0 00-1.414 0l-2 2a1 1 0 001.414 1.414L9 10.414l3.803 3.72z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h4 className="status-title">内容已准备就绪</h4>
                        </div>
                        <div className="status-info">
                            {/* Heroicon: chart-bar */}
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                            </svg>
                            <span>{content.length} 字符 | {content.split('\n').length} 行</span>
                        </div>
                    </div>
                </section>
            )}

            <section className="quick-section">
                <h3 className="section-title">
                    {/* Heroicon: adjustments-horizontal */}
                    <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
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
                            {/* Heroicon: sparkle-solid */}
                            <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM9 15a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 019 15z" clipRule="evenodd" />
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
