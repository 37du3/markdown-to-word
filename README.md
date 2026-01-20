# Markdown 转 Word

一个纯前端的 Markdown 转 Word 格式转换工具，支持表格、代码块等复杂格式的完美转换。

## 功能特点

- **纯前端运行**：所有转换操作在浏览器本地完成，数据不上传服务器，隐私安全
- **格式完整转换**：支持表格（含合并单元格）、代码块、格式化文本、图片、列表、标题等
- **双输出模式**：支持一键复制为 Word 富文本格式，或直接下载为 .docx 文件
- **实时预览**：左侧输入，右侧即时显示 Word 风格的转换效果
- **开源免费**：MIT 许可证，完全免费使用

## 使用场景

- 将 ChatGPT、Claude 等大模型输出的 Markdown 内容转换为 Word 格式
- 整理技术文档、项目报告、需求文档等内容
- 解决 Markdown 直接复制到 Word 格式丢失的问题

## 快速开始

### 在线使用

直接访问：[https://your-username.github.io/markdown-to-word](https://your-username.github.io/markdown-to-word)

### 本地运行

```bash
# 克隆项目
git clone https://github.com/your-username/markdown-to-word.git
cd markdown-to-word

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 使用方法

1. 在左侧文本框粘贴 Markdown 内容（大模型输出的文本）
2. 右侧实时预览 Word 格式效果
3. 点击「复制为 Word 格式」按钮，粘贴到 Word、Notion、飞书等工具
4. 或点击「下载 Word 文档」下载 .docx 文件

## 支持的格式

### Markdown 元素

| 元素 | 状态 | 说明 |
|------|------|------|
| 标题 (H1-H6) | ✅ 支持 | 自动应用 Word 标题样式 |
| 粗体/斜体 | ✅ 支持 | 保留文本格式 |
| 代码块 | ✅ 支持 | 语法高亮，预览支持行号 |
| 行内代码 | ✅ 支持 | 保持等宽字体 |
| 无序列表 | ✅ 支持 | 转换为 Word 项目符号 |
| 有序列表 | ✅ 支持 | 转换为 Word 编号列表 |
| 嵌套列表 | ✅ 支持 | 保持缩进层级 |
| 链接 | ✅ 支持 | 保持链接地址和样式 |
| 图片 | ✅ 支持 | 转换为内嵌图片 |
| 表格 | ✅ 支持 | 基本表格与合并单元格（↑/→/同上/同左） |
| 数学公式 | ✅ 支持 | 预览渲染，复制/下载可选择保留 LaTeX |

### 输出格式

- **HTML 富文本**：直接复制粘贴到 Word、Notion、飞书等
- **.docx 文件**：标准 Word 文档格式，支持进一步编辑

## 技术栈

- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5
- **Markdown 解析**：marked
- **Word 生成**：docx.js
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **测试**：Vitest

## 项目结构

```
markdown-to-word/
├── public/                 # 静态资源
├── src/
│   ├── components/        # React 组件
│   │   ├── Controls/     # 控制面板组件
│   │   ├── Editor/       # 编辑器组件
│   │   ├── Layout/       # 布局组件
│   │   └── Preview/      # 预览组件
│   ├── hooks/            # 自定义 Hooks
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型定义
│   ├── App.tsx           # 应用入口组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── tests/                # 测试文件
├── docs/                 # 文档
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 开发指南

### 环境要求

- Node.js 18+
- npm 9+

### 添加新功能

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交改动：`git commit -am 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写类型安全的代码
- 遵循 ESLint 和 Prettier 配置
- 为新功能添加单元测试
- 更新相关文档

## 路线图

- [x] MVP：基础 Markdown 转 HTML
- [ ] 表格支持：合并单元格、自定义样式
- [ ] 代码块优化：语法高亮、行号
- [ ] 主题定制：字体、颜色、样式预设
- [ ] Chrome 扩展：页面一键转换
- [ ] 桌面应用：Electron 打包

## 贡献者

感谢所有为本项目做出贡献的人！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## 联系方式

- 项目地址：[https://github.com/your-username/markdown-to-word](https://github.com/your-username/markdown-to-word)
- 问题反馈：[Issues](https://github.com/your-username/markdown-to-word/issues)
