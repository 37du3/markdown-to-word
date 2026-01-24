import React, { useState } from 'react';
import { useConversion } from '../../../hooks/useConversion';
import { preprocessMarkdown } from '../../../lib/preprocessor';

export function EditorTab() {
    const [content, setContent] = useState('');
    const [aiClean, setAiClean] = useState(true);
    const [isConverting, setIsConverting] = useState(false);

    const { convertToDocx } = useConversion();

    const handleClear = () => {
        if (content && window.confirm('确定要清空内容吗？')) {
            setContent('');
        }
    };

    const handleDownload = async () => {
        if (!content.trim()) {
            alert('请先输入内容');
            return;
        }

        setIsConverting(true);
        try {
            const processedContent = aiClean ? preprocessMarkdown(content) : content;

            const result = await convertToDocx(processedContent, {
                code: { showLineNumbers: true, theme: 'light', fontFamily: 'JetBrains Mono', fontSize: 14 }
            });

            if (result.success && result.docx) {
                const { saveAs } = await import('file-saver');
                saveAs(result.docx, 'converted-document.docx');

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
        <div className="editor-tab">
            <div className="editor-container">
                <label className="editor-label">
                    <span>📝 Markdown 编辑器</span>
                    <span className="char-count">{content.length} 字符</span>
                </label>
                <textarea
                    className="editor-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="在此输入或粘贴 Markdown 文本...&#10;&#10;# 示例标题&#10;这是**粗体**和*斜体*文本"
                    spellCheck={false}
                />
            </div>

            <div className="editor-actions">
                <div className="editor-options">
                    <label className="checkbox-sm">
                        <input
                            type="checkbox"
                            checked={aiClean}
                            onChange={(e) => setAiClean(e.target.checked)}
                        />
                        <span>AI清洗</span>
                    </label>
                    <button
                        className="action-btn-sm secondary"
                        onClick={handleClear}
                        disabled={!content}
                    >
                        ↩️ 清空
                    </button>
                </div>
                <button
                    className="action-btn download"
                    onClick={handleDownload}
                    disabled={!content || isConverting}
                >
                    {isConverting ? '转换中...' : '📥 下载Word'}
                </button>
            </div>
        </div>
    );
}
