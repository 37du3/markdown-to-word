import React, { useRef, useEffect } from 'react';
import type { EditorProps } from '../../types';

export function MarkdownInput({
  value,
  onChange,
  placeholder = '在此输入 Markdown 文本...',
  readOnly = false,
  autoFocus = false,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value]);

  // 处理输入
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 处理 Tab 键插入空格而不是切换焦点
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // 恢复光标位置
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      readOnly={readOnly}
      autoFocus={autoFocus}
      className="w-full h-full min-h-[200px] p-4 resize-none outline-none
                 font-mono text-sm leading-relaxed
                 bg-white text-gray-900 placeholder-gray-400
                 focus:ring-2 focus:ring-primary-500/20"
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
    />
  );
}
