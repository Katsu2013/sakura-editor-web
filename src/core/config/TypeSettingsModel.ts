import type { WrapConfig } from '../layout/LayoutEngine';
import type { EditorTheme } from '../../renderer/CanvasRenderer';
import { classicSakuraTheme } from '../../renderer/CanvasRenderer';

export interface CommentStyleSetting {
  block1?: { start: string; end: string };
  block2?: { start: string; end: string };
  line1?: string;
  line2?: string;
  line3?: string;
}

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
  keywordSet1?: string;
  keywordSets2to10?: string[];
  commentStyle?: CommentStyleSetting;
  stringEscape?: string;
}

export const INITIAL_COLOR_SETTINGS: Record<string, ColorItemSetting> = {
  text: { name: 'テキスト', key: 'text', fg: '#000000', bg: '#ffffef', bold: false, underline: false, show: true },
  selection: { name: '選択範囲', key: 'selection', fg: '#ffffff', bg: '#3390ff', show: true },
  currentLine: { name: '現在行', key: 'currentLine', bg: '#f7faff', underline: false, show: true },
  lineNumber: { name: '行番号', key: 'lineNumber', fg: '#606060', bg: '#ffffef', show: true },
  ruler: { name: 'ルーラー', key: 'ruler', fg: '#404040', bg: '#ffffef', show: true },
  fullSpace: { name: '全角空白', key: 'fullSpace', fg: '#2e8b57', show: true },
  halfSpace: { name: '半角空白', key: 'halfSpace', fg: '#a0a0a0', show: false },
  tab: { name: 'TAB', key: 'tab', fg: '#4169e1', show: true },
  lineEnd: { name: '改行', key: 'lineEnd', fg: '#008b8b', show: true },
  eof: { name: 'EOF', key: 'eof', fg: '#00008b', show: true },
  bookmark: { name: 'ブックマーク', key: 'bookmark', fg: '#0066cc', show: true },
  keyword: { name: 'キーワード (予約語)', key: 'keyword', fg: '#0000ff', bold: true, show: true },
  keyword2: { name: '強調キーワード2', key: 'keyword2', fg: '#008080', bold: false, underline: false, show: true },
  keyword3: { name: '強調キーワード3', key: 'keyword3', fg: '#b8860b', bold: false, underline: false, show: true },
  keyword4: { name: '強調キーワード4', key: 'keyword4', fg: '#8b0000', bold: false, underline: false, show: true },
  keyword5: { name: '強調キーワード5', key: 'keyword5', fg: '#4b0082', bold: false, underline: false, show: true },
  keyword6: { name: '強調キーワード6', key: 'keyword6', fg: '#2f4f4f', bold: false, underline: false, show: true },
  keyword7: { name: '強調キーワード7', key: 'keyword7', fg: '#800000', bold: false, underline: false, show: true },
  keyword8: { name: '強調キーワード8', key: 'keyword8', fg: '#006400', bold: false, underline: false, show: true },
  keyword9: { name: '強調キーワード9', key: 'keyword9', fg: '#1e90ff', bold: false, underline: false, show: true },
  keyword10: { name: '強調キーワード10', key: 'keyword10', fg: '#ff1493', bold: false, underline: false, show: true },
  comment: { name: 'コメント', key: 'comment', fg: '#008000', show: true },
  string: { name: '文字列', key: 'string', fg: '#a52a2a', show: true },
  number: { name: '数値', key: 'number', fg: '#800080', show: true },
  url: { name: 'URL', key: 'url', fg: '#0000ee', underline: true, show: true },
  bracket: { name: '対括弧の強調', key: 'bracket', fg: '#ff0000', bold: true, show: true },
  searchMark: { name: '検索マーク', key: 'searchMark', fg: '#000000', bg: '#ffff55', show: true },
  modifiedLine: { name: '変更行マーク', key: 'modifiedLine', fg: '#32cd32', show: true },
  wrapMarker: { name: '折り返し記号', key: 'wrapMarker', fg: '#cc0000', show: true },
  caret: { name: 'キャレット (カーソル)', key: 'caret', fg: '#000000', show: true },
};

const createTypeItem = (
  id: string,
  name: string,
  extensions: string,
  syntaxName: string = 'Text',
  outlineRule: string = 'text',
  wrapMode: 'none' | 'column' | 'window' = 'none',
  wrapColumn: number = 80,
  tabSize: number = 4,
  keywordSet1: string = '',
  commentStyle?: CommentStyleSetting
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
  keywordSet1: keywordSet1 || (syntaxName !== 'Text' ? syntaxName : ''),
  keywordSets2to10: Array(9).fill(''),
  commentStyle: commentStyle || {},
  stringEscape: 'C/C++言語風 \\',
});

export const DEFAULT_TYPE_SETTINGS: TypeSettingItem[] = [
  createTypeItem('type-base', '基本', '', 'Text', 'text', 'none', 10240, 4, ''),
  createTypeItem('type-text', 'テキスト', 'txt,log,lst,err,ps,text', 'Text', 'text', 'column', 80, 4, ''),
  createTypeItem('type-cpp', 'C/C++', 'c,cpp,cxx,cc,cp,c++,h,hpp,hxx,inl,rc,rc2,rh,dlg,tlh,tli', 'C/C++', 'cpp', 'none', 80, 4, 'C/C++', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-html', 'HTML', 'htm,html,shtml,plg,xml,xhtml,svg,vue', 'HTML', 'html', 'column', 120, 2, 'HTML', { block1: { start: '<!--', end: '-->' } }),
  createTypeItem('type-plsql', 'PL/SQL', 'sql,plsql,pls,dps', 'SQL', 'text', 'none', 80, 4, 'SQL', { block1: { start: '/*', end: '*/' }, line1: '--' }),
  createTypeItem('type-cobol', 'COBOL', 'cbl,cpy,pco,cob', 'COBOL', 'text', 'none', 80, 4, 'COBOL', { line1: '*' }),
  createTypeItem('type-java', 'Java', 'java,jav', 'Java', 'java', 'none', 80, 4, 'Java', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-asm', 'アセンブラ', 'asm,s', 'Assembler', 'text', 'none', 80, 8, 'Assembler', { line1: ';' }),
  createTypeItem('type-awk', 'AWK', 'awk', 'AWK', 'text', 'none', 80, 4, 'AWK', { line1: '#' }),
  createTypeItem('type-bat', 'MS-DOSバッチファイル', 'bat,cmd', 'Batch', 'text', 'none', 80, 4, 'MS-DOSバッチファイル', { line1: 'REM', line2: '::' }),
  createTypeItem('type-pascal', 'Pascal', 'dpr,pas', 'Pascal', 'text', 'none', 80, 4, 'Pascal', { block1: { start: '(*', end: '*)' }, block2: { start: '{', end: '}' }, line1: '//' }),
  createTypeItem('type-tex', 'TeX', 'tex,ltx,sty,bio,log,blg,aux,bbl,toc,lof,lot,idx,ind,glo,gls', 'TeX', 'text', 'none', 80, 4, 'TeX', { line1: '%' }),
  createTypeItem('type-perl', 'Perl', 'cgi,pl,pm', 'Perl', 'text', 'none', 80, 4, 'Perl', { line1: '#' }),
  createTypeItem('type-python', 'Python', 'py,pyw', 'Python', 'python', 'none', 80, 4, 'Python', { line1: '#' }),
  createTypeItem('type-vb', 'Visual Basic', 'bas,frm,cls,ctl,pag,dob,dsr,vbs', 'Visual Basic', 'text', 'none', 80, 4, 'Visual Basic', { line1: "'" }),
  createTypeItem('type-rtf', 'リッチテキスト', 'rtf', 'Text', 'text', 'none', 80, 4, ''),
  createTypeItem('type-cfg', '設定ファイル', 'ini,inf,cnt,kwd,col,conf,cfg', 'INI', 'text', 'none', 80, 4, '設定ファイル', { line1: ';' }),
  createTypeItem('type-php', 'PHP', 'php,phtml,php3,php4,php5', 'PHP', 'html', 'none', 80, 4, 'PHP', { block1: { start: '/*', end: '*/' }, line1: '//', line2: '#' }),
  createTypeItem('type-ini', 'INI', 'ini,conf,socket,service,env', 'INI', 'text', 'none', 80, 4, 'INI', { line1: ';' }),
  createTypeItem('type-css', 'CSS', 'css,scss,sass,less', 'CSS', 'text', 'none', 80, 2, 'CSS', { block1: { start: '/*', end: '*/' } }),
  createTypeItem('type-js', 'JavaScript', 'js,mjs,cjs', 'JavaScript/TypeScript', 'cpp', 'none', 80, 2, 'JavaScript', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-ts', 'TypeScript', 'ts,tsx,jsx', 'JavaScript/TypeScript', 'cpp', 'none', 80, 2, 'JavaScript', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-json', 'JSON', 'json,jsonc,geojson', 'JSON', 'text', 'none', 80, 2, 'JSON'),
  createTypeItem('type-md', 'Markdown', 'md,markdown,mdown,mkd', 'Markdown', 'markdown', 'none', 80, 2, 'Markdown'),
  createTypeItem('type-cs', 'C#', 'cs,csx', 'C#', 'cpp', 'none', 80, 4, 'C#', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-go', 'Go', 'go', 'Go', 'cpp', 'none', 80, 4, 'Go', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-rust', 'Rust', 'rs', 'Rust', 'cpp', 'none', 80, 4, 'Rust', { block1: { start: '/*', end: '*/' }, line1: '//' }),
  createTypeItem('type-ruby', 'Ruby', 'rb,erb,rake,gemspec', 'Ruby', 'text', 'none', 80, 2, 'Ruby', { line1: '#' }),
  createTypeItem('type-sh', 'Shell Script', 'sh,bash,zsh,ksh', 'Shell', 'text', 'none', 80, 4, 'Shell Script', { line1: '#' }),
  createTypeItem('type-ps1', 'PowerShell', 'ps1,psm1,psd1', 'PowerShell', 'text', 'none', 80, 4, 'PowerShell', { block1: { start: '<#', end: '#>' }, line1: '#' }),
];

