# PasteMD 项目分析与借鉴要点

## 项目概览
PasteMD 是一个 Python 桌面应用，用于将 Markdown 内容粘贴到 Word/WPS。

## 可借鉴的功能模块

### 1. AI 内容清洗 (`service/preprocessor`)
| 文件 | 功能 |
|------|------|
| `markdown.py` | 清理常见 AI 生成的"Copy code"等噪音 |
| `html.py` | HTML 预处理器 |

**借鉴点**：在扩展中加入预处理层，清洗 ChatGPT/Claude 等平台复制内容中的噪音。

### 2. 热键服务 (`service/hotkey`)
**借鉴点**：Chrome 扩展可配置快捷键 (`manifest.json` 中的 `commands`)，实现按 `Ctrl+Shift+M` 直接触发转换。

### 3. 系统通知 (`service/notification`)
**借鉴点**：使用 Chrome Notification API，在后台转换完成时弹出通知。

### 4. 国际化 (`i18n/locales`)
支持多语言 (zh, en, ja)。
**借鉴点**：规划从一开始就支持 i18n，使用 `chrome.i18n` API。

### 5. 文档类型识别 (`service/document`)
识别当前目标文档 (Word/WPS)。
**借鉴点**：扩展中可通过判断当前 URL (`chatgpt.com`, `claude.ai`) 自动识别内容来源。

---

## 差异化功能 (PasteMD 没有，我们可以做)

| 功能 | 描述 |
|------|------|
| **右键菜单转换** | 选中网页文本，右键直接转 Word |
| **一键抓取当前页** | 扩展自动提取技术博客/文档站全文 |
| **Side Panel 模式** | 浏览器侧边栏常驻，边看边转 |
| **在线预览** | 无需下载，直接在扩展内 HTML 预览 |
