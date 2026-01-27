// ============================================
// Markdown AST 类型定义
// ============================================

export interface MarkdownTokens {
  type: string;
  raw: string;
  text?: string;
  depth?: number;
  ordered?: boolean;
  start?: boolean;
  body?: string;
  tokens?: MarkdownTokens[];
  items?: MarkdownTokens[];
  headingLevel?: number;
  lang?: string;
  escaped?: boolean;
  tableData?: TableData;
}

export interface MarkdownAST {
  type: 'root';
  tokens: MarkdownTokens[];
  raw: string;
}

// 表格相关类型
export interface TableCell {
  content: string;
  align?: 'left' | 'center' | 'right';
  isHeader?: boolean;
  rowspan?: number;
  colspan?: number;
  raw?: unknown;
  tokens?: MarkdownTokens[];
  mergeWithPrevious?: boolean;
}

export interface TableData {
  headers: TableCell[];
  rows: TableRow[];
  columnCount: number;
  rowCount: number;
  alignments?: ('left' | 'center' | 'right')[];
}

export interface TableRow {
  cells: TableCell[];
  isHeader?: boolean;
}

// 代码块相关类型
export interface CodeBlock {
  text: string;
  language: string;
  highlighted?: boolean;
}

// 列表相关类型
export interface ListItem {
  content: string;
  children?: ListItem[];
  ordered?: boolean;
  number?: number;
}

// 图片相关类型
export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
}

// ============================================
// 转换配置类型
// ============================================

export interface ConversionOptions {
  // 表格配置
  table: {
    enableMergedCells: boolean;
    defaultAlign: 'left' | 'center' | 'right';
    headerBackground: string;
    borderColor: string;
  };

  // 代码块配置
  code: {
    showLineNumbers: boolean;
    theme: 'light' | 'dark';
    fontFamily: string;
    fontSize: number;
  };

  // 文本配置
  text: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    linkColor: string;
  };

  // 标题配置
  heading: {
    fontFamily: string;
    h1Size: number;
    h2Size: number;
    h3Size: number;
    h4Size: number;
    h5Size: number;
    h6Size: number;
  };

  // 数学公式配置
  math: {
    output: 'katex' | 'latex' | 'unicodemath' | 'text';
  };
}

export interface ConversionResult {
  success: boolean;
  html?: string;
  docx?: Blob;
  plainText?: string;
  error?: ConversionError;
  stats?: ConversionStats;
}

export interface ConversionError {
  type: 'parse' | 'convert' | 'system';
  message: string;
  location?: {
    line: number;
    column: number;
  };
  recoverable: boolean;
}

export interface ConversionStats {
  characters: number;
  words: number;
  lines: number;
  tables: number;
  codeBlocks: number;
  images: number;
  headings: number;
  links: number;
}

// ============================================
// 剪贴板类型
// ============================================

export interface ClipboardData {
  html: string;
  plainText: string;
  richText?: string;
}

export interface ClipboardWriteOptions {
  preferHTML?: boolean;
  fallbackToPlain?: boolean;
}

export interface ClipboardResult {
  success: boolean;
  format?: 'html' | 'plain' | 'rtf';
  error?: Error;
}

// ============================================
// 文档生成类型
// ============================================

export interface DocxDocumentOptions {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface DocxGeneratorConfig {
  pageSize: {
    width: number;
    height: number;
  };
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  styles: {
    defaultFont: string;
    defaultFontSize: number;
    heading1Font: string;
    heading1Size: number;
    heading1Bold: boolean;
  };
}

// ============================================
// UI 组件类型
// ============================================

export interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export interface PreviewProps {
  html: string;
  wordMode?: boolean;
  className?: string;
}

export interface ControlPanelProps {
  onCopy: () => Promise<boolean>;
  onDownload: () => void;
  isConverting?: boolean;
  conversionStats?: ConversionStats;
  lastCopied?: boolean;
  disabled?: boolean;
}

export interface ToolbarProps {
  onInsert: (pattern: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onClear?: () => void;
}

// ============================================
// 应用状态类型
// ============================================

export interface AppState {
  input: string;
  output: string;
  isConverting: boolean;
  error: ConversionError | null;
  stats: ConversionStats | null;
  settings: ConversionOptions;
  theme: 'light' | 'dark';
}

export type Action =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_OUTPUT'; payload: string }
  | { type: 'SET_CONVERTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: ConversionError | null }
  | { type: 'SET_STATS'; payload: ConversionStats }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ConversionOptions> }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'RESET' };

// ============================================
// 主题配置类型
// ============================================

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
}

// ============================================
// 工具类型
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PickByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? P : never]: T[P];
};

export type NonNullableFields<T> = {
  [P in keyof T as T[P] extends null | undefined ? never : P]: T[P];
};

export type AsyncFunction<T, Args extends unknown[]> = (
  ...args: Args
) => Promise<T>;

export type DebouncedFunction<F extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<F>): void;
  cancel(): void;
};
