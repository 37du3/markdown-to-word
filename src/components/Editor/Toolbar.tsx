import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table,
  Image,
  Trash2,
  Undo,
  Redo,
} from 'lucide-react';
import type { ToolbarProps } from '../../types';

export function Toolbar({
  onInsert,
  canUndo = true,
  canRedo = true,
  onUndo,
  onRedo,
  onClear,
}: ToolbarProps) {
  const tools = [
    { icon: Bold, label: '粗体', shortcut: 'Ctrl+B', insert: '**text**' },
    { icon: Italic, label: '斜体', shortcut: 'Ctrl+I', insert: '*text*' },
    { icon: Underline, label: '下划线', shortcut: 'Ctrl+U', insert: '<u>text</u>' },
    { icon: Code, label: '行内代码', shortcut: '`', insert: '`code`' },
    { icon: Heading1, label: '标题1', insert: '# ' },
    { icon: Heading2, label: '标题2', insert: '## ' },
    { icon: Heading3, label: '标题3', insert: '### ' },
    { icon: List, label: '无序列表', insert: '- ' },
    { icon: ListOrdered, label: '有序列表', insert: '1. ' },
    { icon: Quote, label: '引用', insert: '> ' },
    { icon: Table, label: '表格', insert: '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n' },
    { icon: Image, label: '图片', insert: '![alt](url)' },
  ];

  const handleToolClick = (insert: string) => {
    onInsert(insert);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
      {/* 撤销/重做 */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300 mr-2">
        <ToolButton
          icon={Undo}
          label="撤销"
          shortcut="Ctrl+Z"
          onClick={onUndo}
          disabled={!canUndo}
        />
        <ToolButton
          icon={Redo}
          label="重做"
          shortcut="Ctrl+Y"
          onClick={onRedo}
          disabled={!canRedo}
        />
      </div>

      {/* 格式化工具 */}
      <div className="flex items-center gap-1 flex-wrap">
        {tools.map((tool, index) => (
          <ToolButton
            key={index}
            icon={tool.icon}
            label={tool.label}
            shortcut={tool.shortcut}
            onClick={() => tool.insert && handleToolClick(tool.insert)}
            disabled={!tool.insert}
          />
        ))}
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* 清空按钮 */}
      <ToolButton
        icon={Trash2}
        label="清空"
        onClick={onClear}
        variant="danger"
      />
    </div>
  );
}

interface ToolButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

function ToolButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  variant = 'default',
}: ToolButtonProps) {
  const baseClasses = `
    relative group flex items-center justify-center
    w-8 h-8 rounded transition-all duration-150
    focus:outline-none focus:ring-2 focus:ring-primary-500
    disabled:opacity-40 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: `
      text-gray-600 hover:bg-white hover:text-gray-900
      active:bg-gray-200
    `,
    danger: `
      text-gray-500 hover:bg-red-50 hover:text-red-600
      active:bg-red-100
    `,
  };

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon className="w-4 h-4" />
      {/* Tooltip */}
      <span className="tooltip -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
        {label}
        {shortcut && <span className="ml-1 text-gray-400">({shortcut})</span>}
      </span>
    </button>
  );
}
