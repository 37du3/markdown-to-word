import React from 'react';
import { FileText, Github, Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between no-print">
      {/* Logo 和标题 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">
            Markdown 转 Word
          </h1>
          <p className="text-xs text-gray-500">
            大模型输出格式转换工具
          </p>
        </div>
      </div>

      {/* 导航链接 */}
      <nav className="flex items-center gap-4">
        <a
          href="https://github.com/your-username/markdown-to-word"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          title="查看 GitHub 仓库"
        >
          <Github className="w-4 h-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>

        {/* 移动端菜单按钮 */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="打开菜单"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </nav>
    </header>
  );
}
