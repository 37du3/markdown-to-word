import React, { useState } from 'react';
import { useClipboard } from '../hooks/useClipboard';
import { usePageExtract } from '../hooks/usePageExtract';
import { useConversion } from '../../../hooks/useConversion';
import { preprocessMarkdown } from '../../../lib/preprocessor';

export function QuickTab() {
    const [content, setContent] = useState('');
    const [aiClean, setAiClean] = useState(true);
    const [showLineNumbers, setShowLineNumbers] = useState(true);
    const [isConverting, setIsConverting] = useState(false);

    const { readClipboard, isReading } = useClipboard();
    const { extractFromCurrentPage, isExtracting } = usePageExtract();
    const { convertToDocx } = useConversion();

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

    const handleConvertAndDownload = async () => {
        if (!content.trim()) {
            alert('请先粘贴或提取内容');
            return;
        }

        setIsConverting(true);
        try {
            // Apply AI cleaning if enabled
            const processedContent = aiClean ? preprocessMarkdown(content) : content;

            // Convert to Word
            const result = await convertToDocx(processedContent, {
                code: { showLineNumbers, theme: 'light', fontFamily: 'JetBrains Mono', fontSize: 14 }
            });

            if (result.success && result.docx) {
                // Download the file
                const { saveAs } = await import('file-saver');
                saveAs(result.docx, 'converted-document.docx');

                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: '/icons/icon128.png',
                    title: '转换成功',
                    message: 'Word 文档已下载',
                });
            } else {
                throw result.error || new Error('转换失败');
            }
        } catch (err) {
            console.error('Conversion failed:', err);
            alert(err instanceof Error ? err.message : '转换失败');
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="quick-tab">
            <section className="quick-section">
                <h3 className="section-title">
                    <span className="section-icon">📋</span>
                    从剪贴板粘贴
                </h3>
                <button
                    className="action-btn primary"
                    onClick={handlePasteFromClipboard}
                    disabled={isReading}
                >
                    {isReading ? '读取中...' : '📋 粘贴剪贴板内容'}
                </button>
            </section>

            <section className="quick-section">
                <h3 className="section-title">
                    <span className="section-icon">🌐</span>
                    从当前页面提取
                </h3>
                <button
                    className="action-btn primary"
                    onClick={handleExtractFromPage}
                    disabled={isExtracting}
                >
                    {isExtracting ? '提取中...' : '🔍 提取页面内容'}
                </button>
            </section>

            {content && (
                <section className="quick-section">
                    <div className="content-preview">
                        <div className="preview-header">
                            <span className="preview-label">内容预览</span>
                            <span className="preview-length">{content.length} 字符</span>
                        </div>
                        <div className="preview-text">{content.substring(0, 200)}...</div>
                    </div>
                </section>
            )}

            <section className="quick-section">
                <h3 className="section-title">
                    <span className="section-icon">⚙️</span>
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
                    onClick={handleConvertAndDownload}
                    disabled={!content || isConverting}
                >
                    {isConverting ? '转换中...' : '✨ 转换并下载 Word'}
                </button>
            </div>
        </div>
    );
}
