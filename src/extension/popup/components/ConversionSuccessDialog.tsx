import React from 'react';

interface ConversionSuccessDialogProps {
    onCopy: () => void;
    onDownload: () => void;
    onClose: () => void;
}

export function ConversionSuccessDialog({ onCopy, onDownload, onClose }: ConversionSuccessDialogProps) {
    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
                <button className="dialog-close" onClick={onClose} aria-label="关闭">
                    {/* Heroicon: x-mark */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="dialog-header">
                    <div className="success-icon">
                        {/* Heroicon: check-circle */}
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="dialog-title">转换完成！</h2>
                    <p className="dialog-subtitle">选择下一步操作</p>
                </div>

                <div className="dialog-actions">
                    <button className="dialog-btn primary" onClick={onCopy}>
                        {/* Heroicon: clipboard-document */}
                        <svg style={{ width: 48, height: 48 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                        </svg>
                        <span>复制到剪贴板</span>
                    </button>

                    <button className="dialog-btn secondary" onClick={onDownload}>
                        {/* Heroicon: arrow-down-tray */}
                        <svg style={{ width: 48, height: 48 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        <span>下载 Word 文档</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
