import type { CharacterEncoding, LineEnding } from '../buffer/types';

export interface MacroRegistration {
  id: number;
  name: string;
  path: string;
  shortcut?: string;
}

export interface CommonSettingsModel {
  general: {
    freeCursor: boolean;            // フリーカーソルモード
    overstrike: boolean;            // 挿入/上書きモード
    wordWrapByPunctuation: boolean; // 単語単位移動で句読点を区切る
    smoothScroll: boolean;          // スムーズスクロール
    scrollLines: number;            // スクロール行数
    showModifiedGutter: boolean;    // 変更行マーク (Gutter緑バー)
  };
  file: {
    defaultEncoding: CharacterEncoding;
    defaultLineEnding: LineEnding;
    autoSave: boolean;
    autoSaveIntervalMinutes: number;
    exclusiveLock: boolean;
  };
  backup: {
    createBackup: boolean;
    backupFolder: string;
    backupExtension: string;
  };
  format: {
    dateTimeFormat: string;
    quoteString: string;
  };
  toolbar: {
    showToolbar: boolean;
    flatButtons: boolean;
    showTooltips: boolean;
  };
  tabbar: {
    showTabbar: boolean;
    position: 'top' | 'bottom';
    showCloseButton: boolean;
    showModifiedMarker: boolean;
  };
  statusbar: {
    showStatusbar: boolean;
    showCursorPos: boolean;
    showCharCount: boolean;
    showEncoding: boolean;
    showLineEnding: boolean;
    showCharCode: boolean;
    showInsOvr: boolean;
  };
  functionKey: {
    showFunctionKey: boolean;
    position: 'top' | 'bottom';
  };
  macros: MacroRegistration[];
  keyBindings: Record<string, string>;
}

export const DEFAULT_COMMON_SETTINGS: CommonSettingsModel = {
  general: {
    freeCursor: false,
    overstrike: false,
    wordWrapByPunctuation: true,
    smoothScroll: true,
    scrollLines: 3,
    showModifiedGutter: true,
  },
  file: {
    defaultEncoding: 'UTF-8',
    defaultLineEnding: 'CRLF',
    autoSave: false,
    autoSaveIntervalMinutes: 5,
    exclusiveLock: false,
  },
  backup: {
    createBackup: false,
    backupFolder: '',
    backupExtension: '.bak',
  },
  format: {
    dateTimeFormat: 'YYYY/MM/DD HH:mm:ss',
    quoteString: '> ',
  },
  toolbar: {
    showToolbar: true,
    flatButtons: true,
    showTooltips: true,
  },
  tabbar: {
    showTabbar: true,
    position: 'top',
    showCloseButton: true,
    showModifiedMarker: true,
  },
  statusbar: {
    showStatusbar: true,
    showCursorPos: true,
    showCharCount: true,
    showEncoding: true,
    showLineEnding: true,
    showCharCode: true,
    showInsOvr: true,
  },
  functionKey: {
    showFunctionKey: true,
    position: 'bottom',
  },
  macros: [
    { id: 0, name: 'キーマクロ記録', path: '(RecKeyMacro)', shortcut: 'Ctrl+Shift+M' },
    { id: 1, name: 'キーマクロ実行', path: '(ExecKeyMacro)', shortcut: 'Ctrl+Shift+L' },
  ],
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
};
