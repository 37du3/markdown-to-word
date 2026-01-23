# Chrome Extension 开发详细计划

基于 PasteMD 项目分析，为 markdown-to-word 项目制定 Chrome 扩展开发计划。

## 用户确认事项

> [!IMPORTANT]
> **项目结构**：扩展代码将集成到现有项目中（`src/extension/`），共享核心转换逻辑。
> **部署隔离**：网页版构建到 `dist/`，扩展版构建到 `dist-extension/`，互不影响。

---

## 阶段一：项目配置 (Phase 1: Setup)

### [NEW] `src/extension/manifest.json`
Chrome Extension 配置文件 (Manifest V3)。
```json
{
  "manifest_version": 3,
  "name": "Markdown to Word",
  "version": "1.0.0",
  "description": "将 AI 对话/Markdown 一键转换为 Word 文档",
  "permissions": ["contextMenus", "notifications", "activeTab"],
  "action": { "default_popup": "popup.html" },
  "commands": {
    "_execute_action": { "suggested_key": { "default": "Ctrl+Shift+M" } }
  },
  "icons": { "128": "icons/icon128.png" }
}
```

### [MODIFY] `vite.config.ts`
增加扩展构建配置。

### [MODIFY] `package.json`
新增脚本:
- `build:ext` - 构建扩展
- `dev:ext` - 扩展开发模式

### [NEW] `@types/chrome` (Dev Dependency)
TypeScript 类型支持。

---

## 阶段二：核心功能 (Phase 2: Core)

### [NEW] `src/extension/popup.tsx`
弹出窗口入口，复用 `App.tsx` 或精简版 UI。

### [NEW] `src/extension/background.ts`
Service Worker：处理右键菜单、快捷键、通知。

### [NEW] `src/extension/content.ts`
内容脚本：从当前页面抓取 Markdown （ChatGPT/Claude专用）。

---

## 阶段三：借鉴 PasteMD 功能

| 功能 | 实现方式 |
|------|----------|
| **AI 内容清洗** | 新增 `src/lib/preprocessor.ts`，清理"Copy code"等噪音 |
| **快捷键** | `manifest.json` 的 `commands` + `background.ts` 监听 |
| **通知** | `chrome.notifications.create()` |
| **国际化** | `_locales/` 目录 + `chrome.i18n.getMessage()` |

---

## 阶段四：发布 (Phase 4: Release)

### [NEW] `.github/workflows/release-extension.yml`
自动化工作流：
1. 构建扩展 (`npm run build:ext`)
2. 压缩 `dist-extension/` 为 ZIP
3. 发布到 GitHub Releases

---

## 验证计划

### 本地测试
1. `npm run build:ext`
2. Chrome -> `chrome://extensions` -> 加载已解压的扩展程序
3. 测试 Popup 转换、右键菜单、快捷键

### 自动测试
- 运行现有单元测试确保核心逻辑无损
