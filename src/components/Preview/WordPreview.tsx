import React, { useMemo } from 'react';
import type { PreviewProps } from '../../types';

export function WordPreview({ html, wordMode = true, className = '' }: PreviewProps) {
  // 清理 HTML 内容，移除危险标签
  const sanitizedHtml = useMemo(() => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }, [html]);

  return (
    <div className={`h-full overflow-auto scrollbar-thin ${className}`}>
      <div
        className={`
          ${wordMode ? 'word-preview' : ''}
          min-h-full bg-white p-8 shadow-sm
        `}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
