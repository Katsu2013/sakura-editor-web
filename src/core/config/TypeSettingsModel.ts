import type { WrapConfig } from '../layout/LayoutEngine';
import type { EditorTheme } from '../../renderer/CanvasRenderer';
import { classicSakuraTheme } from '../../renderer/CanvasRenderer';

export interface ColorItemSetting {
  name: string;
  key: string;
  fg?: string;
  bg?: string;
  bold?: boolean;
  underline?: boolean;
  show?: boolean;
}

export interface TypeSettingItem {
  id: string;
  name: string;             // 設定の名前 (&N)
  extensions: string;       // ファイル拡張子 (&E)
  wrapConfig: WrapConfig;   // 折り返し方法、折り返し桁数、TAB幅
  lineSpacing: number;      // 行の間隔 (ドット)
  charSpacing: number;      // 文字の隙間 (ドット)
  autoIndent: boolean;      // 自動インデント
  lineNumberType: 'logical' | 'visual'; // 行番号表示 (論理行 / 表示行)
  showRuler: boolean;       // ルーラー表示
  showLineNumbers: boolean; // 行番号表示
  fontSize: number;         // フォントサイズ
  fontFamily: string;       // フォント名
  syntaxName: string;       // 構文タイプ
  outlineRule: string;      // アウトライン解析ルール
  showSymbols: {
    fullSpace: boolean;
    halfSpace: boolean;
    tab: boolean;
    lineEnd: boolean;
    eof: boolean;
  };
  colorSettings: Record<string, ColorItemSetting>;
  theme: EditorTheme;
}

export const INITIAL_COLOR_SETTINGS: Record<string, ColorItemSetting> = {
  text: { name: 'テキスト', key: 'text', fg: '#000000', bg: '#ffffef', bold: false, underline: false },
  selection: { name: '選択範囲', key: 'selection', fg: '#ffffff', bg: '#3390ff' },
  currentLine: { name: '現在行', key: 'currentLine', bg: '#f7faff', underline: false },
  lineNumber: { name: '行番号', key: 'lineNumber', fg: '#606060', bg: '#ffffef' },
  ruler: { name: 'ルーラー', key: 'ruler', fg: '#404040', bg: '#ffffef' },
  fullSpace: { name: '全角空白', key: 'fullSpace', fg: '#2e8b57', show: true },
  halfSpace: { name: '半角空白', key: 'halfSpace', fg: '#a0a0a0', show: false },
  tab: { name: 'TAB', key: 'tab', fg: '#4169e1', show: true },
  lineEnd: { name: '改行', key: 'lineEnd', fg: '#008b8b', show: true },
  eof: { name: 'EOF', key: 'eof', fg: '#00008b', show: true },
  bookmark: { name: 'ブックマーク', key: 'bookmark', fg: '#0066cc' },
  keyword: { name: 'キーワード (予約語)', key: 'keyword', fg: '#0000ff', bold: true },
  comment: { name: 'コメント', key: 'comment', fg: '#008000' },
  string: { name: '文字列', key: 'string', fg: '#a52a2a' },
  number: { name: '数値', key: 'number', fg: '#800080' },
  url: { name: 'URL', key: 'url', fg: '#0000ee', underline: true },
  bracket: { name: '対括弧の強調', key: 'bracket', fg: '#ff0000', bold: true },
  searchMark: { name: '検索マーク', key: 'searchMark', fg: '#000000', bg: '#ffff55' },
  modifiedLine: { name: '変更行マーク', key: 'modifiedLine', fg: '#32cd32' },
  wrapMarker: { name: '折り返し記号', key: 'wrapMarker', fg: '#cc0000' },
  caret: { name: 'キャレット (カーソル)', key: 'caret', fg: '#000000' },
};

export const DEFAULT_TYPE_SETTINGS: TypeSettingItem[] = [
  {
    id: 'type-text',
    name: '基本',
    extensions: 'txt,log,ini',
    wrapConfig: { wrapMode: 'column', wrapColumn: 80, tabSize: 4 },
    lineSpacing: 2,
    charSpacing: 0,
    autoIndent: false,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'Text',
    outlineRule: 'text',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
  {
    id: 'type-c-cpp',
    name: 'C/C++',
    extensions: 'c,cpp,h,hpp,cc,cxx',
    wrapConfig: { wrapMode: 'none', wrapColumn: 80, tabSize: 4 },
    lineSpacing: 2,
    charSpacing: 0,
    autoIndent: true,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'C/C++',
    outlineRule: 'cpp',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
  {
    id: 'type-js-ts',
    name: 'JavaScript / TypeScript',
    extensions: 'js,jsx,ts,tsx,mjs',
    wrapConfig: { wrapMode: 'none', wrapColumn: 80, tabSize: 2 },
    lineSpacing: 2,
    charSpacing: 0,
    autoIndent: true,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'JavaScript/TypeScript',
    outlineRule: 'cpp',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
  {
    id: 'type-python',
    name: 'Python',
    extensions: 'py,pyw',
    wrapConfig: { wrapMode: 'none', wrapColumn: 80, tabSize: 4 },
    lineSpacing: 2,
    charSpacing: 0,
    autoIndent: true,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'Python',
    outlineRule: 'python',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
  {
    id: 'type-html',
    name: 'HTML',
    extensions: 'html,htm,xhtml',
    wrapConfig: { wrapMode: 'column', wrapColumn: 120, tabSize: 2 },
    lineSpacing: 2,
    charSpacing: 0,
    autoIndent: true,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'HTML',
    outlineRule: 'html',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
  {
    id: 'type-markdown',
    name: 'Markdown',
    extensions: 'md,markdown',
    wrapConfig: { wrapMode: 'window', wrapColumn: 80, tabSize: 4 },
    lineSpacing: 3,
    charSpacing: 0,
    autoIndent: true,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'Markdown',
    outlineRule: 'markdown',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
  {
    id: 'type-json',
    name: 'JSON',
    extensions: 'json',
    wrapConfig: { wrapMode: 'none', wrapColumn: 80, tabSize: 2 },
    lineSpacing: 2,
    charSpacing: 0,
    autoIndent: true,
    lineNumberType: 'logical',
    showRuler: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
    syntaxName: 'JavaScript/TypeScript',
    outlineRule: 'text',
    showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
    colorSettings: { ...INITIAL_COLOR_SETTINGS },
    theme: { ...classicSakuraTheme },
  },
];
