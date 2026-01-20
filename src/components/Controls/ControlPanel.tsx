/* eslint-disable */
import React, { useState } from 'react';
import { Copy, Check, Download, Loader2 } from 'lucide-react';
import type { ConversionStats, ControlPanelProps } from '../../types';

export function ControlPanel({
  onCopy,
  onDownload,
  isConverting = false,
  conversionStats,
  lastCopied = false,
  disabled = false,
}: ControlPanelProps) {
  return (
    <div className="flex items-center justify-between">
      {/* 统计信息 */}
      {conversionStats && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {conversionStats.tables > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {conversionStats.tables} 表格
            </span>
          )}
          {conversionStats.codeBlocks > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {conversionStats.codeBlocks} 代码块
            </span>
          )}
          {conversionStats.images > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {conversionStats.images} 图片
            </span>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center gap-3">
        {/* 复制按钮 */}
        <CopyButton
          onClick={onCopy}
          disabled={disabled || isConverting}
          copied={lastCopied}
        />

        {/* 下载按钮 */}
        <button
          onClick={onDownload}
          disabled={disabled || isConverting}
          className="btn-secondary"
        >
          <Download className="w-4 h-4 mr-2" />
          下载 Word 文档
        </button>
      </div>
    </div>
  );
}

interface CopyButtonProps {
  onClick: () => Promise<boolean>;
  disabled: boolean;
  copied: boolean;
}

function CopyButton({ onClick, disabled, copied }: CopyButtonProps) {
  const [isCopying, setIsCopying] = React.useState(false);

  const handleClick = async () => {
    if (isCopying || copied) return;
    setIsCopying(true);
    try {
      await onClick();
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isCopying || copied}
      className={copied ? 'btn-secondary bg-green-50 border-green-200 text-green-700' : 'btn-primary'}
    >
      {isCopying ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          复制中...
        </>
      ) : copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          已复制！
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          复制为 Word 格式
        </>
      )}
    </button>
  );
}
