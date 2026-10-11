import type { CharacterEncoding, LineEnding } from '../buffer/types';

export interface MacroRegistration {
  id: number;
  name: string;
  path: string;
  shortcut?: string;
}

export interface MenuItemNode {
  id: string;
  label: string;
  isSeparator?: boolean;
  children?: MenuItemNode[];
}

export interface ToolbarItemConfig {
  id: string;
  name: string;
  isSeparator?: boolean;
  isWrap?: boolean;
}

export interface CommonSettingsModel {
  // 1. 全般 (General)
  general: {
    freeCursor: boolean;            // フリーカーソルモード
    stopWordEnd: boolean;           // 単語単位で移動するときに単語の末尾に止まる
    stopParagraphEnd: boolean;        // 単語単位で移動するときに段落の末尾に止まる
    noCursorMoveOnActivate: boolean; // マウスクリックでのアクティブ化ではカーソルを移動しない
    cursorShape: 'windows' | 'msdos';// カーソル形状 (Windows風 / MS-DOS風)
    useTaskTray: boolean;           // タスクトレイを使う
    stayTaskTray: boolean;          // タスクトレイに常駐
    trayMenuShortcut: string;       // 左クリックメニューのショートカットキー
    confirmMultiWinClose: boolean;  // 同時に複数の編集用ウィンドウを閉じるとき確認
    confirmExitAll: boolean;        // サクラエディタの全終了で編集用ウィンドウを閉じるとき確認
    scrollLines: number;            // スクロール行数
    smoothScroll: boolean;          // 少し滑らかにする (スムーズスクロール)
    wheelPageScrollModifier: string;// 組み合わせてホイール操作した時ページスクロールする
    wheelHorizontalScrollModifier: string; // 組み合わせてホイール操作した時横スクロールする
    useScreenCache: boolean;        // 画面キャッシュを使う
    fileHistoryMax: number;         // ファイルの履歴MAX
    folderHistoryMax: number;       // フォルダーの履歴MAX
    overstrike: boolean;            // 挿入/上書きモード
    wordWrapByPunctuation: boolean;// 単語単位移動で句読点を区切る
    showModifiedGutter: boolean;   // 変更行マーク
  };

  // 2. ウィンドウ (Window)
  window: {
    showToolbar: boolean;           // ツールバー表示
    showFunctionKey: boolean;       // ファンクションキー表示
    showStatusbar: boolean;         // ステータスバー表示
    showHScrollbar: boolean;        // 水平スクロールバー
    darkMode: boolean;              // ダークモード
    menuIcon: boolean;              // アイコン付きメニュー
    winPosSize: {
      mode: 'default' | 'inherit' | 'manual';
      x: number;
      y: number;
      width: number;
      height: number;
    };
    rulerHeight: number;            // ルーラーの高さ (ドット)
    rulerTextGap: number;           // ルーラーとテキストの隙間 (ドット)
    lineNumTextGap: number;         // 行番号とテキストの隙間 (ドット)
    fnKeyPosition: 'top' | 'bottom';// ファンクションキー位置
    fnKeyGroupCount: number;        // グループボタン数
    language: string;               // 言語
    syncSplitVScroll: boolean;      // 垂直スクロールの同期をとる
    syncSplitHScroll: boolean;      // 水平スクロールの同期をとる
    activeTitleFormat: string;      // タイトルバー (アクティブ時)
    inactiveTitleFormat: string;    // タイトルバー (非アクティブ時)
  };

  // 3. メインメニュー (MainMenu)
  mainMenu: {
    showAccessKeyInParens: boolean; // アクセスキーを必ず( )付きで表示
    tree: MenuItemNode[];
  };

  // 4. ツールバー (Toolbar)
  toolbar: {
    showToolbar: boolean;           // ツールバーを表示する
    flatButtons: boolean;           // フラットなボタン
    showTooltips: boolean;          // ツールチップを表示する
    items: ToolbarItemConfig[];     // ツールバー項目配列
  };

  // 5. タブバー (TabBar)
  tabbar: {
    showTabbar: boolean;            // タブバーを表示する
    groupMultiWin: boolean;         // ウィンドウをまとめてグループ化する
    retainEmptyWindow: boolean;     // 最後のファイルを閉じたとき(無題)文書を残す
    closeOnlyCurrent: boolean;      // ウィンドウの閉じるボタンは現在のファイルのみ閉じる
    openNewWinExternal: boolean;    // 外部から起動するときは新しいウィンドウで開く
    showIcon: boolean;              // アイコン表示
    equalWidth: boolean;            // 等幅
    closeButtonMode: 'auto' | 'none' | 'always'; // 閉じるボタン
    fontName: string;               // フォント
    sortTabs: boolean;              // タブ一覧をソートする
    multiLine: boolean;             // 多段
    position: 'top' | 'bottom';     // 表示位置
    titleFormat: string;            // タイトル形式
    mouseWheelSwitch: boolean;      // マウスホイールでタブ切り替え
    showCloseButton: boolean;       // 後方互換用
    showModifiedMarker: boolean;    // 後方互換用
  };

  // 6. ファイル (File)
  file: {
    defaultEncoding: CharacterEncoding;
    defaultLineEnding: LineEnding;
    defaultBom: boolean;
    exclusiveLock: boolean;
    exclusiveLockMode: 'none' | 'read' | 'no_overwrite' | 'no_readwrite';
    alertOnExclusiveLockError: boolean;
    autoSave: boolean;
    autoSaveIntervalMinutes: number;
    monitorFileUpdate: boolean;
    autoReloadModified: boolean;
    openDialogOnCloseOpen: boolean;
    dropOpenNewWindow: boolean;
  };

  // 7. ファイル名表示 (Fname)
  fname: {
    titleDisplayMode: 'name_only' | 'full_path' | 'folder_and_name';
    distinguishSameName: boolean;
    expandEnvVars: boolean;
    grayNonExistent: boolean;
  };

  // 8. バックアップ (Backup)
  backup: {
    createBackup: boolean;
    backupType: 'fixed_ext' | 'datetime' | 'serial';
    backupExtension: string;
    backupFolder: string;
    useSpecificFolder: boolean;
    sendToTrash: boolean;
    maxGenerations: number;
  };

  // 9. 書式 (Format)
  format: {
    dateTimeFormat: string;
    dateFormat: string;
    timeFormat: string;
    quoteString: string;
    quoteAddSpace: boolean;
    headerFormat: string;
    footerFormat: string;
  };

  // 10. 検索 (Grep / Search)
  grep: {
    matchWord: boolean;
    matchCase: boolean;
    useRegex: boolean;
    markMatches: boolean;
    autoCloseDialog: boolean;
    searchHistoryMax: number;
    replaceHistoryMax: number;
    grepIncludeSubfolders: boolean;
    grepRealtime: boolean;
    grepDefaultFolder: string;
  };

  // 11. キー割り当て (KeyBind)
  keyBindings: Record<string, string>;

  // 12. カスタムメニュー (CustMenu)
  custMenu: {
    currentMenuId: number;
    menus: Record<number, Array<{ id: string; name: string; isSeparator?: boolean }>>;
  };

  // 13. 強調キーワード (Keyword)
  keyword: {
    currentSetId: number;
    sets: Array<{ id: number; name: string; caseSensitive: boolean; keywords: string[] }>;
  };

  // 14. 支援 (Helper)
  helper: {
    useCompletion: boolean;
    compFromCurrentDoc: boolean;
    compFromKeyword: boolean;
    compWordFile: string;
    externalHelpPath: string;
    useKeywordHelp: boolean;
    keywordHelpDictPath: string;
  };

  // 15. マクロ (Macro)
  macros: MacroRegistration[];

  // 16. プラグイン (Plugin)
  plugin: {
    pluginFolder: string;
    plugins: Array<{ id: string; name: string; version: string; description: string; enabled: boolean }>;
  };

  // 17. ステータスバー (StatusBar)
  statusbar: {
    showStatusbar: boolean;
    showCursorPos: boolean;
    showCharCount: boolean;
    showEncoding: boolean;
    showLineEnding: boolean;
    showCharCode: boolean;
    showInsOvr: boolean;
    showZoom: boolean;
    showMacroRec: boolean;
    widthCursorPos: number;
    widthCharCount: number;
    widthEncoding: number;
    widthLineEnding: number;
  };

  // 18. 編集 (Edit)
  edit: {
    enableBoxSelect: boolean;
    enableDragAndDrop: boolean;
    dropCopyWithoutCtrl: boolean;
    showModifiedGutter: boolean;
    maxUndoCount: number;
    warnExternalModified: boolean;
  };

  // 互換性プロパティ
  functionKey?: {
    showFunctionKey: boolean;
    position: 'top' | 'bottom';
  };
}

export const DEFAULT_MAIN_MENU_TREE: MenuItemNode[] = [
  {
    id: 'menu-file',
    label: 'ファイル(F)',
    children: [
      { id: 'new', label: '新規作成(N)' },
      { id: 'new-win', label: '新規ウインドウを開く(M)' },
      { id: 'open', label: '開く(O)...' },
      { id: 'save', label: '上書き保存(S)' },
      { id: 'save-as', label: '名前を付けて保存(A)...' },
      { id: 'save-all', label: 'すべて上書き保存(Z)' },
      { id: 'sep1', label: '---', isSeparator: true },
      { id: 'print', label: '印刷(P)...' },
      { id: 'print-prev', label: '印刷プレビュー(V)' },
      { id: 'print-setup', label: '印刷ページ設定(U)...' },
      { id: 'sep2', label: '---', isSeparator: true },
      { id: 'prop', label: 'ファイルのプロパティ(T)' },
      { id: 'browse', label: 'ブラウズ(B)' },
      { id: 'sep3', label: '---', isSeparator: true },
      { id: 'close', label: '閉じる(C)' },
      { id: 'exit-app', label: 'サクラエディタの全終了(X)' },
    ],
  },
  {
    id: 'menu-edit',
    label: '編集(E)',
    children: [
      { id: 'undo', label: '元に戻す(U)' },
      { id: 'redo', label: 'やり直し(R)' },
      { id: 'sep1', label: '---', isSeparator: true },
      { id: 'cut', label: '切り取り(T)' },
      { id: 'copy', label: 'コピー(C)' },
      { id: 'paste', label: '貼り付け(P)' },
      { id: 'del', label: '削除(D)' },
      { id: 'select-all', label: 'すべて選択(A)' },
      { id: 'sep2', label: '---', isSeparator: true },
      { id: 'ins-datetime', label: '現在日時を挿入' },
      { id: 'ins-num', label: '連番挿入' },
      { id: 'ins-quote', label: '引用符を付加' },
      { id: 'dup-line', label: '行の二重化' },
      { id: 'sort-asc', label: '行の昇順ソート' },
      { id: 'sort-desc', label: '行の降順ソート' },
    ],
  },
  {
    id: 'menu-convert',
    label: '変換(C)',
    children: [
      { id: 'to-lower', label: '小文字に変換(L)' },
      { id: 'to-upper', label: '大文字に変換(U)' },
      { id: 'to-half', label: '全角→半角(F)' },
      { id: 'to-kana', label: '半角カタカナ→全角カタカナ(K)' },
      { id: 'to-hira', label: '半角カタカナ→全角ひらがな(H)' },
      { id: 'tab-to-space', label: 'TAB→空白(S)' },
      { id: 'space-to-tab', label: '空白→TAB(T)' },
    ],
  },
  {
    id: 'menu-search',
    label: '検索(S)',
    children: [
      { id: 'find', label: '検索(F)...' },
      { id: 'find-next', label: '次を検索(N)' },
      { id: 'find-prev', label: '前を検索(P)' },
      { id: 'replace', label: '置換(R)...' },
      { id: 'toggle-search-mark', label: '検索マークの切替え(C)' },
      { id: 'grep', label: 'Grep検索(G)...' },
      { id: 'jump', label: '指定行へジャンプ(J)...' },
      { id: 'outline', label: 'アウトライン解析(L)...' },
      { id: 'diff-cmp', label: 'ファイル内容比較(DIFF)...' },
    ],
  },
  {
    id: 'menu-tool',
    label: 'ツール(T)',
    children: [
      { id: 'macro-rec', label: 'キーマクロ記録の開始/終了(M)' },
      { id: 'macro-play', label: 'キーマクロの実行(E)' },
      { id: 'macro-manage', label: 'マクロの実行・管理...' },
      { id: 'macro-register', label: 'マクロ登録(R)...' },
    ],
  },
  {
    id: 'menu-setting',
    label: '設定(O)',
    children: [
      { id: 'type-list', label: 'タイプ別設定一覧(L)...' },
      { id: 'type-setting', label: 'タイプ別設定(Y)...' },
      { id: 'common-setting', label: '共通設定(C)...' },
      { id: 'font-setting', label: 'フォント(F)...' },
    ],
  },
  {
    id: 'menu-window',
    label: 'ウィンドウ(W)',
    children: [
      { id: 'win-vsplit', label: '縦に分割(V)' },
      { id: 'win-hsplit', label: '横に分割(H)' },
      { id: 'win-close-split', label: '分割解除(R)' },
      { id: 'next-tab', label: '次のタブ' },
      { id: 'prev-tab', label: '前のタブ' },
    ],
  },
  {
    id: 'menu-help',
    label: 'ヘルプ(H)',
    children: [
      { id: 'command-list', label: 'コマンド一覧(K)...' },
      { id: 'about', label: 'サクラエディタについて(A)...' },
    ],
  },
];

export const DEFAULT_TOOLBAR_ITEMS: ToolbarItemConfig[] = [
  { id: 'new', name: '新規作成' },
  { id: 'open', name: '開く...' },
  { id: 'save', name: '上書き保存' },
  { id: 'save-as', name: '名前を付けて保存...' },
  { id: 'sep1', name: '---', isSeparator: true },
  { id: 'print', name: '印刷' },
  { id: 'print-prev', name: '印刷プレビュー' },
  { id: 'sep2', name: '---', isSeparator: true },
  { id: 'undo', name: '元に戻す' },
  { id: 'redo', name: 'やり直し' },
  { id: 'sep3', name: '---', isSeparator: true },
  { id: 'cut', name: '切り取り' },
  { id: 'copy', name: 'コピー' },
  { id: 'paste', name: '貼り付け' },
  { id: 'sep4', name: '---', isSeparator: true },
  { id: 'find', name: '検索...' },
  { id: 'find-next', name: '次を検索' },
  { id: 'find-prev', name: '前を検索' },
  { id: 'replace', name: '置換...' },
  { id: 'grep', name: 'Grep検索...' },
  { id: 'jump', name: '指定行へジャンプ...' },
  { id: 'outline', name: 'アウトライン解析...' },
  { id: 'sep5', name: '---', isSeparator: true },
  { id: 'diff-cmp', name: 'DIFF差分比較' },
  { id: 'type-setting', name: 'タイプ別設定...' },
  { id: 'common-setting', name: '共通設定...' },
];

export const DEFAULT_COMMON_SETTINGS: CommonSettingsModel = {
  general: {
    freeCursor: false,
    stopWordEnd: false,
    stopParagraphEnd: false,
    noCursorMoveOnActivate: false,
    cursorShape: 'windows',
    useTaskTray: true,
    stayTaskTray: false,
    trayMenuShortcut: 'Ctrl + Alt + 7',
    confirmMultiWinClose: false,
    confirmExitAll: false,
    scrollLines: 3,
    smoothScroll: false,
    wheelPageScrollModifier: '組み合わせなし',
    wheelHorizontalScrollModifier: '組み合わせなし',
    useScreenCache: true,
    fileHistoryMax: 15,
    folderHistoryMax: 15,
    overstrike: false,
    wordWrapByPunctuation: true,
    showModifiedGutter: true,
  },
  window: {
    showToolbar: true,
    showFunctionKey: true,
    showStatusbar: true,
    showHScrollbar: true,
    darkMode: false,
    menuIcon: true,
    winPosSize: {
      mode: 'default',
      x: 100,
      y: 80,
      width: 1024,
      height: 768,
    },
    rulerHeight: 13,
    rulerTextGap: 0,
    lineNumTextGap: 0,
    fnKeyPosition: 'bottom',
    fnKeyGroupCount: 4,
    language: 'Japanese',
    syncSplitVScroll: true,
    syncSplitHScroll: false,
    activeTitleFormat: '${w?{h?$c:アウトプット$:${r?[?$f$n$S$N$n$]$:${r?[無題]:$f}} $U?[更新]:$} - $A $V $R?[ビューモード]:$ - [$c]$:',
    inactiveTitleFormat: '${w?{h?$c:アウトプット$:${r?[?$f$n$S$N$n$]$:${r?[無題]:$f}} $U?[更新]:$} - $A $V $R?[ビューモード]:$ - [$c]$:',
  },
  mainMenu: {
    showAccessKeyInParens: true,
    tree: DEFAULT_MAIN_MENU_TREE,
  },
  toolbar: {
    showToolbar: true,
    flatButtons: false,
    showTooltips: true,
    items: DEFAULT_TOOLBAR_ITEMS,
  },
  tabbar: {
    showTabbar: true,
    groupMultiWin: true,
    retainEmptyWindow: true,
    closeOnlyCurrent: false,
    openNewWinExternal: false,
    showIcon: false,
    equalWidth: false,
    closeButtonMode: 'auto',
    fontName: 'Yu Gothic UI (9pt)',
    sortTabs: true,
    multiLine: false,
    position: 'top',
    titleFormat: '${w?{Grep}:h?$c:[アウトプット]:$r?$f$n$d:$f}$U?[更新]:$r$R?[ビューモード]:$c上書き更新',
    mouseWheelSwitch: false,
    showCloseButton: true,
    showModifiedMarker: true,
  },
  file: {
    defaultEncoding: 'UTF-8',
    defaultLineEnding: 'CRLF',
    defaultBom: false,
    exclusiveLock: false,
    exclusiveLockMode: 'no_overwrite',
    alertOnExclusiveLockError: true,
    autoSave: false,
    autoSaveIntervalMinutes: 5,
    monitorFileUpdate: true,
    autoReloadModified: false,
    openDialogOnCloseOpen: false,
    dropOpenNewWindow: false,
  },
  fname: {
    titleDisplayMode: 'name_only',
    distinguishSameName: true,
    expandEnvVars: false,
    grayNonExistent: true,
  },
  backup: {
    createBackup: false,
    backupType: 'fixed_ext',
    backupExtension: '.bak',
    backupFolder: '',
    useSpecificFolder: false,
    sendToTrash: false,
    maxGenerations: 5,
  },
  format: {
    dateTimeFormat: 'YYYY/MM/DD HH:mm:ss',
    dateFormat: 'YYYY/MM/DD',
    timeFormat: 'HH:mm:ss',
    quoteString: '> ',
    quoteAddSpace: false,
    headerFormat: '&f - &p/&P',
    footerFormat: '&d &t',
  },
  grep: {
    matchWord: false,
    matchCase: false,
    useRegex: false,
    markMatches: true,
    autoCloseDialog: false,
    searchHistoryMax: 20,
    replaceHistoryMax: 20,
    grepIncludeSubfolders: true,
    grepRealtime: false,
    grepDefaultFolder: '.',
  },
  keyBindings: {
    'new': 'Ctrl+N',
    'open': 'Ctrl+O',
    'save': 'Ctrl+S',
    'save-as': 'Shift+Ctrl+S',
    'undo': 'Ctrl+Z',
    'redo': 'Ctrl+Y',
    'cut': 'Ctrl+X',
    'copy': 'Ctrl+C',
    'paste': 'Ctrl+V',
    'del': 'Delete',
    'select-all': 'Ctrl+A',
    'find': 'Ctrl+F',
    'find-next': 'F3',
    'find-prev': 'Shift+F3',
    'replace': 'Ctrl+R',
    'toggle-search-mark': 'Ctrl+F3',
    'search-start-pos': 'Shift+Ctrl+F3',
    'grep': 'Ctrl+G',
    'jump': 'Ctrl+J',
    'outline': 'F11',
    'tag-jump': 'F12',
    'tag-jump-back': 'Shift+F12',
    'bm-toggle': 'Shift+F11',
    'bm-next': 'F2',
    'bm-prev': 'Shift+F2',
    'diff-cmp': 'Ctrl+Enter',
    'diff-next': 'F7',
    'diff-prev': 'Shift+F7',
    'match-bracket': 'Ctrl+[',
    'macro-rec': 'Ctrl+Shift+M',
    'macro-play': 'Ctrl+Shift+L',
    'command-list': 'Ctrl+Shift+K',
    'inc-search': 'Ctrl+I',
    'dup-line': 'Ctrl+D',
    'toggle-header': 'Shift+Ctrl+C',
    'print-prev': 'Shift+Ctrl+P',
    'browse': 'Ctrl+B',
    'tab-to-space': 'Ctrl+Alt+F5',
    'space-to-tab': 'Shift+Ctrl+Alt+F5',
    'to-lower': 'Ctrl+F6',
    'to-upper': 'Ctrl+F7',
    'to-half': 'Ctrl+F8',
    'to-kana': 'Ctrl+F9',
    'to-hira': 'Ctrl+F10',
    'next-tab': 'Ctrl+Tab',
    'prev-tab': 'Shift+Ctrl+Tab',
    'close': 'Ctrl+W',
  },
  custMenu: {
    currentMenuId: 1,
    menus: {
      1: [
        { id: 'undo', name: '元に戻す(U)' },
        { id: 'redo', name: 'やり直し(R)' },
        { id: 'sep1', name: '---', isSeparator: true },
        { id: 'cut', name: '切り取り(T)' },
        { id: 'copy', name: 'コピー(C)' },
        { id: 'paste', name: '貼り付け(P)' },
        { id: 'del', name: '削除(D)' },
        { id: 'sep2', name: '---', isSeparator: true },
        { id: 'select-all', name: 'すべて選択(A)' },
      ],
      2: [
        { id: 'close', name: '閉じる(C)' },
        { id: 'save', name: '上書き保存(S)' },
        { id: 'prop', name: 'プロパティ(P)' },
      ],
    },
  },
  keyword: {
    currentSetId: 1,
    sets: [
      {
        id: 1,
        name: 'C/C++',
        caseSensitive: true,
        keywords: ['alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit', 'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private', 'protected', 'public', 'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'],
      },
      {
        id: 2,
        name: 'HTML',
        caseSensitive: false,
        keywords: ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr'],
      },
      {
        id: 3,
        name: 'JavaScript',
        caseSensitive: true,
        keywords: ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'enum', 'await', 'async', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'null', 'true', 'false', 'undefined', 'NaN', 'Infinity'],
      },
      {
        id: 4,
        name: 'Python',
        caseSensitive: true,
        keywords: ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'self', 'print', 'range', 'len'],
      },
      {
        id: 5,
        name: 'SQL',
        caseSensitive: false,
        keywords: ['ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CHECK', 'COLUMN', 'CONSTRAINT', 'CREATE', 'DATABASE', 'DEFAULT', 'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE', 'END', 'EXEC', 'EXISTS', 'FOREIGN', 'FROM', 'GROUP', 'HAVING', 'IN', 'INDEX', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT', 'NOT', 'NULL', 'OR', 'ORDER', 'OUTER', 'PRIMARY', 'RIGHT', 'SELECT', 'SET', 'TABLE', 'THEN', 'UNION', 'UNIQUE', 'UPDATE', 'VALUES', 'VIEW', 'WHEN', 'WHERE'],
      },
      {
        id: 6,
        name: 'Java',
        caseSensitive: true,
        keywords: ['abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'false', 'try', 'void', 'volatile', 'while', 'var', 'record'],
      },
      {
        id: 7,
        name: 'C#',
        caseSensitive: true,
        keywords: ['abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else', 'enum', 'event', 'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'goto', 'if', 'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock', 'long', 'namespace', 'new', 'null', 'object', 'operator', 'out', 'override', 'params', 'private', 'protected', 'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'virtual', 'void', 'volatile', 'while', 'async', 'await', 'var', 'yield'],
      },
      {
        id: 8,
        name: 'PHP',
        caseSensitive: false,
        keywords: ['echo', 'print', 'function', 'class', 'interface', 'trait', 'public', 'protected', 'private', 'static', 'final', 'abstract', 'const', 'return', 'if', 'else', 'elseif', 'while', 'do', 'for', 'foreach', 'as', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'new', 'clone', 'instanceof', 'use', 'namespace', 'require', 'require_once', 'include', 'include_once', 'yield', 'fn', 'match', 'true', 'false', 'null', 'array', 'isset', 'empty', 'die', 'exit'],
      },
      {
        id: 9,
        name: 'Ruby',
        caseSensitive: true,
        keywords: ['alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'defined?', 'do', 'else', 'elsif', 'end', 'ensure', 'false', 'for', 'if', 'in', 'module', 'next', 'nil', 'not', 'or', 'redo', 'rescue', 'retry', 'return', 'self', 'super', 'then', 'true', 'undef', 'unless', 'until', 'when', 'while', 'yield', 'puts', 'print', 'raise'],
      },
      {
        id: 10,
        name: 'Go',
        caseSensitive: true,
        keywords: ['break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type', 'var', 'nil', 'true', 'false', 'iota', 'make', 'new', 'append', 'len', 'cap', 'copy', 'delete', 'panic', 'recover', 'string', 'int', 'bool', 'byte', 'error'],
      },
      {
        id: 11,
        name: 'Rust',
        caseSensitive: true,
        keywords: ['as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while', 'yield', 'String', 'Vec', 'Option', 'Result'],
      },
      {
        id: 12,
        name: 'CSS',
        caseSensitive: false,
        keywords: ['color', 'background', 'background-color', 'border', 'margin', 'padding', 'width', 'height', 'font', 'font-family', 'font-size', 'font-weight', 'line-height', 'display', 'flex', 'grid', 'position', 'top', 'bottom', 'left', 'right', 'z-index', 'overflow', 'opacity', 'cursor', 'transition', 'transform', 'animation', 'none', 'block', 'inline', 'relative', 'absolute', 'fixed', 'sticky', '!important'],
      },
      {
        id: 13,
        name: 'Shell Script',
        caseSensitive: true,
        keywords: ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done', 'in', 'function', 'select', 'time', 'echo', 'export', 'source', 'exit', 'local', 'return', 'read', 'set', 'unset', 'alias', 'test', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep'],
      },
      {
        id: 14,
        name: 'PowerShell',
        caseSensitive: false,
        keywords: ['if', 'else', 'elseif', 'switch', 'foreach', 'for', 'while', 'do', 'until', 'break', 'continue', 'return', 'function', 'filter', 'param', 'begin', 'process', 'end', 'try', 'catch', 'finally', 'throw', 'trap', 'class', 'enum', 'using', 'Write-Host', 'Write-Output', 'Get-ChildItem', 'exit', 'true', 'false', 'null'],
      },
      {
        id: 15,
        name: 'MS-DOSバッチファイル',
        caseSensitive: false,
        keywords: ['@echo', 'echo', 'off', 'on', 'set', 'if', 'else', 'goto', 'call', 'exit', 'pause', 'for', 'in', 'do', 'shift', 'choice', 'errorlevel', 'exist', 'not', 'start', 'title', 'cls', 'cd', 'dir', 'copy', 'del', 'md', 'rd', 'type', 'find', 'findstr', 'ren', 'move', 'xcopy', 'robocopy'],
      },
      {
        id: 16,
        name: 'INI',
        caseSensitive: false,
        keywords: ['true', 'false', 'yes', 'no', 'on', 'off', 'enabled', 'disabled'],
      },
      {
        id: 17,
        name: 'Markdown',
        caseSensitive: false,
        keywords: ['http', 'https', 'ftp', 'mailto'],
      },
      {
        id: 18,
        name: 'Perl',
        caseSensitive: true,
        keywords: ['my', 'our', 'local', 'sub', 'if', 'unless', 'else', 'elsif', 'while', 'until', 'for', 'foreach', 'do', 'next', 'last', 'redo', 'return', 'print', 'use', 'require', 'package', 'die', 'warn', 'strict', 'warnings'],
      },
      {
        id: 19,
        name: 'Visual Basic',
        caseSensitive: false,
        keywords: ['dim', 'as', 'public', 'private', 'protected', 'sub', 'function', 'end', 'if', 'then', 'else', 'elseif', 'for', 'to', 'step', 'next', 'each', 'in', 'while', 'wend', 'do', 'loop', 'until', 'select', 'case', 'with', 'exit', 'return', 'new', 'set', 'call', 'const', 'true', 'false', 'nothing'],
      },
      {
        id: 20,
        name: 'Pascal',
        caseSensitive: false,
        keywords: ['program', 'unit', 'interface', 'implementation', 'uses', 'var', 'const', 'type', 'procedure', 'function', 'begin', 'end', 'if', 'then', 'else', 'case', 'of', 'for', 'to', 'downto', 'do', 'while', 'repeat', 'until', 'with', 'try', 'except', 'finally', 'raise', 'class', 'record', 'true', 'false', 'nil'],
      },
      {
        id: 21,
        name: 'COBOL',
        caseSensitive: false,
        keywords: ['identification', 'division', 'program-id', 'environment', 'data', 'working-storage', 'section', 'procedure', 'display', 'stop', 'run', 'move', 'to', 'compute', 'perform', 'varying', 'until', 'if', 'else', 'end-if', 'end-perform', 'pic', 'picture', 'value', 'occurs'],
      },
      {
        id: 22,
        name: 'TeX',
        caseSensitive: true,
        keywords: ['begin', 'end', 'documentclass', 'usepackage', 'section', 'subsection', 'subsubsection', 'paragraph', 'subparagraph', 'title', 'author', 'date', 'maketitle', 'tableofcontents', 'label', 'ref', 'cite', 'input', 'include', 'newcommand', 'renewcommand'],
      },
      {
        id: 23,
        name: 'Assembler',
        caseSensitive: false,
        keywords: ['mov', 'push', 'pop', 'add', 'sub', 'inc', 'dec', 'mul', 'div', 'jmp', 'je', 'jne', 'jz', 'jnz', 'cmp', 'call', 'ret', 'nop', 'int', 'lea', 'xor', 'and', 'or', 'not', 'eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'ebp', 'esp', 'section', 'data', 'text', 'global', 'extern'],
      },
      {
        id: 24,
        name: 'AWK',
        caseSensitive: true,
        keywords: ['BEGIN', 'END', 'if', 'else', 'while', 'do', 'for', 'in', 'break', 'continue', 'delete', 'exit', 'function', 'return', 'print', 'printf', 'getline', 'next', 'FS', 'RS', 'OFS', 'ORS', 'NF', 'NR', 'FNR', 'FILENAME', 'length', 'substr', 'split'],
      },
      {
        id: 25,
        name: 'JSON',
        caseSensitive: true,
        keywords: ['true', 'false', 'null'],
      },
      {
        id: 26,
        name: '設定ファイル',
        caseSensitive: false,
        keywords: ['true', 'false', 'yes', 'no', 'on', 'off', 'enabled', 'disabled'],
      },
    ],
  },
  helper: {
    useCompletion: true,
    compFromCurrentDoc: true,
    compFromKeyword: true,
    compWordFile: '',
    externalHelpPath: '',
    useKeywordHelp: true,
    keywordHelpDictPath: '',
  },
  macros: [
    { id: 0, name: 'キーマクロ記録', path: '(RecKeyMacro)', shortcut: 'Ctrl+Shift+M' },
    { id: 1, name: 'キーマクロ実行', path: '(ExecKeyMacro)', shortcut: 'Ctrl+Shift+L' },
  ],
  plugin: {
    pluginFolder: 'plugins',
    plugins: [
      { id: 'emmet', name: 'Emmet / HTML展開', version: '1.2.0', description: 'HTML/CSSの高速記述コード展開', enabled: true },
      { id: 'mdpreview', name: 'Markdown ライブプレビュー', version: '2.0.1', description: 'リアルタイムMarkdownプレビュー', enabled: true },
      { id: 'gitdiff', name: 'Git Status 連携', version: '1.0.4', description: '変更行Gutterマーク連携', enabled: true },
      { id: 'jsonformat', name: 'JSON Formatter', version: '1.1.0', description: 'JSON整形・バリデーション', enabled: true },
    ],
  },
  statusbar: {
    showStatusbar: true,
    showCursorPos: true,
    showCharCount: true,
    showEncoding: true,
    showLineEnding: true,
    showCharCode: true,
    showInsOvr: true,
    showZoom: true,
    showMacroRec: true,
    widthCursorPos: 120,
    widthCharCount: 140,
    widthEncoding: 90,
    widthLineEnding: 60,
  },
  edit: {
    enableBoxSelect: true,
    enableDragAndDrop: true,
    dropCopyWithoutCtrl: false,
    showModifiedGutter: true,
    maxUndoCount: 10000,
    warnExternalModified: true,
  },
  functionKey: {
    showFunctionKey: true,
    position: 'bottom',
  },
};
