import React, { useState } from 'react';
import { useConversion } from '../../../hooks/useConversion';
import { useClipboard } from '../hooks/useClipboard';
import { preprocessMarkdown } from '../../../lib/preprocessor';
import '../styles/main-view.css';

export function MainView() {
    const [content, setContent] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [aiClean, setAiClean] = useState(true);
    const [showLineNumbers, setShowLineNumbers] = useState(true);

    const { convertToHtml } = useConversion();
    const { paste, copy } = useClipboard();

    const handlePaste = async () => {
        try {
            const text = await paste();
            if (text) {
                setContent(text);
            }
        } catch (err) {
            console.error('Paste failed:', err);
            alert('无法读取剪贴板内容');
        }
    };

    const handleConvert = async () => {
        if (!content.trim()) {
            alert('请先导入内容');
            return;
        }

        setIsConverting(true);
        try {
            const processedContent = aiClean ? preprocessMarkdown(content) : content;
            const options = {
                code: { showLineNumbers, theme: 'light' as const, fontFamily: 'JetBrains Mono', fontSize: 14 }
            };

            const htmlResult = await convertToHtml(processedContent, options);
            if (!htmlResult.success) {
                throw new Error(htmlResult.error?.message || '转换失败');
            }

            // Auto copy to clipboard
            await copy(htmlResult.html!, htmlResult.plainText!);
            setShowSuccess(true);
        } catch (err) {
            console.error('Conversion failed:', err);
            const errorMessage = err instanceof Error ? err.message : '转换失败';
            alert(`转换失败\n\n${errorMessage}`);
        } finally {
            setIsConverting(false);
        }
    };

    const handleReset = () => {
        setContent('');
        setShowSuccess(false);
    };

    if (showSuccess) {
        return (
            <div className="main-view">
                <div className="success-container">
                    <div className="success-icon-large">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="success-title">转换完成！</h2>
                    <p className="success-message">
                        已复制到剪贴板<br />
                        请粘贴到 Word、WPS 或其他文档中
                    </p>
                    <button className="btn-primary" onClick={handleReset}>
                        继续转换
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-view">
            {/* Import Card */}
            <div
                className={`import-card ${content ? 'has-content' : ''}`}
                onClick={!content ? handlePaste : undefined}
            >
                {content ? (
                    <>
                        <div className="content-preview">
                            <pre>{content.slice(0, 500)}{content.length > 500 ? '...' : ''}</pre>
                        </div>
                        <button className="btn-text" onClick={handleReset}>
                            清除并重新导入
                        </button>
                    </>
                ) : (
                    <>
                        <div className="import-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                            </svg>
                        </div>
                        <h3 className="import-title">从剪贴板导入 Markdown</h3>
                        <p className="import-hint">请先复制 AI 生成的内容</p>
                    </>
                )}
            </div>

            {/* Options */}
            <div className="options-section">
                <label className="option-row">
                    <span>AI 内容清洗</span>
                    <input
                        type="checkbox"
                        checked={aiClean}
                        onChange={(e) => setAiClean(e.target.checked)}
                        className="toggle-switch"
                    />
                </label>
                <label className="option-row">
                    <span>保留代码高亮</span>
                    <input
                        type="checkbox"
                        checked={showLineNumbers}
                        onChange={(e) => setShowLineNumbers(e.target.checked)}
                        className="toggle-switch"
                    />
                </label>
            </div>

            {/* Convert Button */}
            <button
                className={`btn-convert ${!content || isConverting ? 'disabled' : ''}`}
                onClick={handleConvert}
                disabled={!content || isConverting}
            >
                {isConverting ? (
                    <>
                        <span className="spinner"></span>
                        转换中...
                    </>
                ) : (
                    <>
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 20, height: 20 }}>
                            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                        </svg>
                        转换
                    </>
                )}
            </button>
        </div>
    );
}
