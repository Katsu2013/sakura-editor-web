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

const createTypeItem = (
  id: string,
  name: string,
  extensions: string,
  syntaxName: string = 'Text',
  outlineRule: string = 'text',
  wrapMode: 'none' | 'column' | 'window' = 'none',
  wrapColumn: number = 80,
  tabSize: number = 4
): TypeSettingItem => ({
  id,
  name,
  extensions,
  wrapConfig: { wrapMode, wrapColumn, tabSize },
  lineSpacing: 1,
  charSpacing: 0,
  autoIndent: true,
  lineNumberType: 'logical',
  showRuler: true,
  showLineNumbers: true,
  fontSize: 14,
  fontFamily: "'BIZ UDGothic', 'MS Gothic', monospace",
  syntaxName,
  outlineRule,
  showSymbols: { fullSpace: true, halfSpace: false, tab: true, lineEnd: true, eof: true },
  colorSettings: { ...INITIAL_COLOR_SETTINGS },
  theme: { ...classicSakuraTheme },
});

export const DEFAULT_TYPE_SETTINGS: TypeSettingItem[] = [
  createTypeItem('type-base', '基本', '', 'Text', 'text', 'none', 10240, 4),
  createTypeItem('type-text', 'テキスト', 'txt,log,lst,err,ps', 'Text', 'text', 'column', 80, 4),
  createTypeItem('type-cpp', 'C/C++', 'c,cpp,cxx,cc,cp,c++,h,hpp,hxx', 'C/C++', 'cpp', 'none', 80, 4),
  createTypeItem('type-html', 'HTML', 'html,htm,shtml,plg', 'HTML', 'html', 'column', 120, 2),
  createTypeItem('type-plsql', 'PL/SQL', 'sql,plsql', 'SQL', 'text', 'none', 80, 4),
  createTypeItem('type-cobol', 'COBOL', 'cbl,cpy,pco,cob', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-java', 'Java', 'java,jav', 'Java', 'java', 'none', 80, 4),
  createTypeItem('type-asm', 'アセンブラ', 'asm', 'Text', 'text', 'none', 80, 8),
  createTypeItem('type-awk', 'AWK', 'awk', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-bat', 'MS-DOSバッチファイル', 'bat,cmd', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-pascal', 'Pascal', 'dpr,pas', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-tex', 'TeX', 'tex,ltx,sty,bio,log,blg,aux,bbl,toc', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-perl', 'Perl', 'cgi,pl,pm', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-python', 'Python', 'py,pyw', 'Python', 'python', 'none', 80, 4),
  createTypeItem('type-vb', 'Visual Basic', 'bas,frm,cls,ctl,pag,dob,ds', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-rtf', 'リッチテキスト', 'rtf', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-cfg', '設定ファイル', 'ini,inf,cnt,kwd,col', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-php', 'PHP', 'php', 'HTML', 'html', 'none', 80, 4),
  createTypeItem('type-ini', 'INI', 'ini,conf,socket,service', 'Text', 'text', 'none', 80, 4),
  createTypeItem('type-css', 'CSS', 'css,scss,less', 'CSS', 'text', 'none', 80, 2),
  createTypeItem('type-js', 'JavaScript', 'js,jsx,ts,tsx,mjs', 'JavaScript/TypeScript', 'cpp', 'none', 80, 2),
  createTypeItem('type-ps1', 'PowerShell', 'ps1,psm1', 'Text', 'text', 'none', 80, 4),
];

