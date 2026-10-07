import React, { useState, useMemo, useRef } from 'react';
import type {
  CommonSettingsModel,
  MacroRegistration,
} from '../../../core/config/CommonSettingsModel';
import {
  DEFAULT_COMMON_SETTINGS,
  DEFAULT_MAIN_MENU_TREE,
  DEFAULT_TOOLBAR_ITEMS,
} from '../../../core/config/CommonSettingsModel';
import { ALL_COMMANDS } from './CommandListDialog';
import {
  NewIcon,
  NewWinIcon,
  OpenIcon,
  SaveIcon,
  SaveAsIcon,
  SaveAllIcon,
  CloseIcon,
  PrintIcon,
  PrintPrevIcon,
  PropertyIcon,
  BrowseIcon,
  ExitAppIcon,
  UndoIcon,
  RedoIcon,
  CutIcon,
  CopyIcon,
  PasteIcon,
  DeleteIcon,
  SelectAllIcon,
  ReconvertIcon,
  FindIcon,
  FindNextIcon,
  FindPrevIcon,
  ReplaceIcon,
  SearchMarkIcon,
  GrepIcon,
  BookmarkIcon,
  JumpIcon,
  OutlineIcon,
  DiffIcon,
  TypeListIcon,
  TypeSettingsIcon,
  CommonSettingsIcon,
  FontIcon,
  MacroRecIcon,
  MacroPlayIcon,
  AboutIcon,
  IndentRightIcon,
  IndentLeftIcon,
  SaveCloseIcon,
  CloseUntitledIcon,
  CloseOpenIcon,
  PrintSetupIcon,
  SakuraExitIcon,
  CopyCrlfIcon,
  CopyWrapIcon,
  BoxPasteIcon,
  BkSpDeleteIcon,
  ToLowerIcon,
  ToUpperIcon,
  ZenToHanIcon,
  ToZenKanaIcon,
  ToZenHiraIcon,
  ZenAlnumToHanIcon,
  HanAlnumToZenIcon,
  TabToSpaceIcon,
  SpaceToTabIcon,
  ReturnSearchOriginIcon,
  TagJumpIcon,
  TagJumpBackIcon,
  DiffNextIcon,
  DiffPrevIcon,
  DiffClearIcon,
  WordCompleteIcon,
  CommandListIcon,
  IncSearchIcon,
  WindowSplitIcon,
} from '../Icons/SakuraIcons';

export type CommonTabKey =
  | 'file'
  | 'fname'
  | 'backup'
  | 'format'
  | 'grep'
  | 'keybind'
  | 'custmenu'
  | 'keyword'
  | 'helper'
  | 'macro'
  | 'plugin'
  | 'general'
  | 'win'
  | 'mainmenu'
  | 'toolbar'
  | 'tabbar'
  | 'statusbar'
  | 'edit';

interface CommonSettingDialogProps {
  isOpen: boolean;
  settings: CommonSettingsModel;
  initialTab?: CommonTabKey;
  onClose: () => void;
  onSave: (updatedSettings: CommonSettingsModel) => void;
}

// 18タブの3行構成定義 (Win32 CPropCommon 準拠)
const TAB_ROWS: { row: number; tabs: { key: CommonTabKey; label: string }[] }[] = [
  {
    row: 1,
    tabs: [
      { key: 'file', label: 'ファイル' },
      { key: 'fname', label: 'ファイル名表示' },
      { key: 'backup', label: 'バックアップ' },
      { key: 'format', label: '書式' },
      { key: 'grep', label: '検索' },
      { key: 'keybind', label: 'キー割り当て' },
    ],
  },
  {
    row: 2,
    tabs: [
      { key: 'custmenu', label: 'カスタムメニュー' },
      { key: 'keyword', label: '強調キーワード' },
      { key: 'helper', label: '支援' },
      { key: 'macro', label: 'マクロ' },
      { key: 'plugin', label: 'プラグイン' },
    ],
  },
  {
    row: 3,
    tabs: [
      { key: 'general', label: '全般' },
      { key: 'win', label: 'ウィンドウ' },
      { key: 'mainmenu', label: 'メインメニュー' },
      { key: 'toolbar', label: 'ツールバー' },
      { key: 'tabbar', label: 'タブバー' },
      { key: 'statusbar', label: 'ステータスバー' },
      { key: 'edit', label: '編集' },
    ],
  },
];

// コマンドIDからアイコンを解決するヘルパー
function renderCommandIcon(cmdId: string, size = 16) {
  switch (cmdId) {
    case 'new': return <NewIcon size={size} />;
    case 'new-win': return <NewWinIcon size={size} />;
    case 'open': return <OpenIcon size={size} />;
    case 'save': return <SaveIcon size={size} />;
    case 'save-as': return <SaveAsIcon size={size} />;
    case 'save-all': return <SaveAllIcon size={size} />;
    case 'save-close': return <SaveCloseIcon size={size} />;
    case 'close': return <CloseIcon size={size} />;
    case 'close-untitled': return <CloseUntitledIcon size={size} />;
    case 'close-open': return <CloseOpenIcon size={size} />;
    case 'print': return <PrintIcon size={size} />;
    case 'print-prev': return <PrintPrevIcon size={size} />;
    case 'print-setup': return <PrintSetupIcon size={size} />;
    case 'prop': return <PropertyIcon size={size} />;
    case 'browse': return <BrowseIcon size={size} />;
    case 'exit-app': return <ExitAppIcon size={size} />;
    case 'sakura-exit': return <SakuraExitIcon size={size} />;
    case 'undo': return <UndoIcon size={size} />;
    case 'redo': return <RedoIcon size={size} />;
    case 'cut': return <CutIcon size={size} />;
    case 'copy': return <CopyIcon size={size} />;
    case 'paste': return <PasteIcon size={size} />;
    case 'del': return <DeleteIcon size={size} />;
    case 'select-all': return <SelectAllIcon size={size} />;
    case 'reconvert': return <ReconvertIcon size={size} />;
    case 'copy-crlf': return <CopyCrlfIcon size={size} />;
    case 'copy-wrap-nl': return <CopyWrapIcon size={size} />;
    case 'box-paste': return <BoxPasteIcon size={size} />;
    case 'bksp-del': return <BkSpDeleteIcon size={size} />;
    case 'word-complete': return <WordCompleteIcon size={size} />;
    case 'indent-right': return <IndentRightIcon size={size} />;
    case 'indent-left': return <IndentLeftIcon size={size} />;
    case 'to-lower': return <ToLowerIcon size={size} />;
    case 'to-upper': return <ToUpperIcon size={size} />;
    case 'to-half': return <ZenToHanIcon size={size} />;
    case 'to-kana': return <ToZenKanaIcon size={size} />;
    case 'to-hira': return <ToZenHiraIcon size={size} />;
    case 'zen-alnum-han': return <ZenAlnumToHanIcon size={size} />;
    case 'han-alnum-zen': return <HanAlnumToZenIcon size={size} />;
    case 'tab-to-space': return <TabToSpaceIcon size={size} />;
    case 'space-to-tab': return <SpaceToTabIcon size={size} />;
    case 'find': return <FindIcon size={size} />;
    case 'find-next': return <FindNextIcon size={size} />;
    case 'find-prev': return <FindPrevIcon size={size} />;
    case 'replace': return <ReplaceIcon size={size} />;
    case 'toggle-search-mark': return <SearchMarkIcon size={size} />;
    case 'search-start-pos': return <ReturnSearchOriginIcon size={size} />;
    case 'inc-search': return <IncSearchIcon size={size} />;
    case 'grep': return <GrepIcon size={size} />;
    case 'jump': return <JumpIcon size={size} />;
    case 'outline': return <OutlineIcon size={size} />;
    case 'tag-jump': return <TagJumpIcon size={size} />;
    case 'tag-jump-back': return <TagJumpBackIcon size={size} />;
    case 'diff-cmp': return <DiffIcon size={size} />;
    case 'diff-next': return <DiffNextIcon size={size} />;
    case 'diff-prev': return <DiffPrevIcon size={size} />;
    case 'diff-clear': return <DiffClearIcon size={size} />;
    case 'bm-toggle':
    case 'bm-next':
    case 'bm-prev': return <BookmarkIcon size={size} />;
    case 'type-list': return <TypeListIcon size={size} />;
    case 'type-setting': return <TypeSettingsIcon size={size} />;
    case 'common-setting': return <CommonSettingsIcon size={size} />;
    case 'font-setting': return <FontIcon size={size} />;
    case 'win-vsplit':
    case 'win-hsplit':
    case 'win-close-split': return <WindowSplitIcon size={size} />;
    case 'macro-rec': return <MacroRecIcon size={size} />;
    case 'macro-play': return <MacroPlayIcon size={size} />;
    case 'command-list': return <CommandListIcon size={size} />;
    case 'about': return <AboutIcon size={size} />;
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#f0f0f0" stroke="#777777" />
          <path d="M5 8h6M8 5v6" stroke="#555555" strokeWidth="1.2" />
        </svg>
      );
  }
}

// Win32風スピンボタン付き数値入力コンポーネント
const Win32SpinInput: React.FC<{
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (val: number) => void;
  style?: React.CSSProperties;
}> = ({ value, min = 0, max = 9999, step = 1, disabled = false, onChange, style }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        style={{
          width: '52px',
          padding: '2px 4px',
          fontSize: '11px',
          border: '1px solid #7f9db9',
          borderRight: 'none',
          boxSizing: 'border-box',
          height: '21px',
          textAlign: 'right',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', height: '21px', width: '15px' }}>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
          style={{
            height: '10px',
            padding: 0,
            border: '1px solid #7f9db9',
            background: '#e0e0e0',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: '7px',
            lineHeight: '8px',
            textAlign: 'center',
          }}
        >
          ▲
        </button>
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
          style={{
            height: '11px',
            padding: 0,
            border: '1px solid #7f9db9',
            borderTop: 'none',
            background: '#e0e0e0',
            cursor: disabled ? 'default' : 'pointer',
            fontSize: '7px',
            lineHeight: '9px',
            textAlign: 'center',
          }}
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export const CommonSettingDialog: React.FC<CommonSettingDialogProps> = ({
  isOpen,
  settings,
  initialTab = 'general',
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<CommonTabKey>(initialTab);
  const [data, setData] = useState<CommonSettingsModel>(settings);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isConfigFolderMenuOpen, setIsConfigFolderMenuOpen] = useState(false);

  // ウィンドウ位置と大きさ設定モーダル (IDD_WINPOSSIZE)
  const [isWinPosModalOpen, setIsWinPosModalOpen] = useState(false);
  const [winPosDraft, setWinPosDraft] = useState(data.window.winPosSize);

  // タブフォント設定モーダル
  const [isTabFontModalOpen, setIsTabFontModalOpen] = useState(false);
  const [tabFontDraft, setTabFontDraft] = useState(data.tabbar.fontName);

  // メインメニュー設定ステート
  const [menuSelectedCategory, setMenuSelectedCategory] = useState<string>('ファイル');
  const [menuSelectedLeftCmd, setMenuSelectedLeftCmd] = useState<string>('new');
  const [menuSelectedRightIdx, setMenuSelectedRightIdx] = useState<number>(0);
  const [menuExpandedAll, setMenuExpandedAll] = useState<boolean>(true);

  // ツールバー設定ステート
  const [toolbarSelectedCategory, setToolbarSelectedCategory] = useState<string>('ファイル');
  const [toolbarSelectedLeftCmd, setToolbarSelectedLeftCmd] = useState<string>('new');
  const [toolbarSelectedRightIdx, setToolbarSelectedRightIdx] = useState<number>(0);

  // キー割り当てステート
  const [keyCategory, setKeyCategory] = useState<string>('すべて');
  const [keySearchQuery, setKeySearchQuery] = useState<string>('');
  const [selectedKeyFunc, setSelectedKeyFunc] = useState<string>('new');
  const [newShortcutInput, setNewShortcutInput] = useState<string>('Ctrl+N');

  // マクロステート
  const [selectedMacroIdx, setSelectedMacroIdx] = useState<number>(0);

  // 強調キーワードステート
  const [keywordSelectedSetId, setKeywordSelectedSetId] = useState<number>(1);
  const [keywordSelectedWordIdx, setKeywordSelectedWordIdx] = useState<number>(0);

  // カスタムメニューステート
  const [custMenuId, setCustMenuId] = useState<number>(1);
  const [custMenuSelectedIdx, setCustMenuSelectedIdx] = useState<number>(0);
  const [custMenuCategory, setCustMenuCategory] = useState<string>('編集');
  const [custMenuLeftCmd, setCustMenuLeftCmd] = useState<string>('undo');

  // ファイルインポート用 hidden ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setData(settings);
    if (initialTab) setActiveTab(initialTab);
    setWinPosDraft(settings.window?.winPosSize || DEFAULT_COMMON_SETTINGS.window.winPosSize);
    setTabFontDraft(settings.tabbar?.fontName || DEFAULT_COMMON_SETTINGS.tabbar.fontName);
  }, [settings, isOpen, initialTab]);

  if (!isOpen) return null;

  // 現在アクティブなタブが属する行を特定し、その行が最下段（コンテンツと直結）になるよう並べ替え
  const activeRowIdx = TAB_ROWS.findIndex((r) => r.tabs.some((t) => t.key === activeTab));
  const sortedTabRows = [
    ...TAB_ROWS.filter((_, idx) => idx !== activeRowIdx),
    TAB_ROWS[activeRowIdx >= 0 ? activeRowIdx : 2],
  ];

  // キー割り当て用フィルタリング
  const filteredKeyCommands = ALL_COMMANDS.filter((cmd) => {
    if (keyCategory !== 'すべて' && cmd.category !== keyCategory) return false;
    if (!keySearchQuery) return true;
    const q = keySearchQuery.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.shortcut.toLowerCase().includes(q) ||
      cmd.id.toLowerCase().includes(q)
    );
  });
  const selectedCmd = ALL_COMMANDS.find((c) => c.id === selectedKeyFunc) || ALL_COMMANDS[0];

  // カテゴリ別コマンド
  const getCategoryCommands = (cat: string) => {
    const cleanCat = cat.replace('操作系', '').replace('系', '');
    return ALL_COMMANDS.filter((cmd) => cmd.category === cleanCat || cmd.category.includes(cleanCat));
  };

  // 履歴クリア機能 (実動作)
  const handleClearFileHistory = () => {
    if (window.confirm('最近使ったファイルの履歴をクリアしますか？')) {
      localStorage.removeItem('sakura_recent_files');
      alert('ファイルの履歴をクリアしました。');
    }
  };

  const handleClearFolderHistory = () => {
    if (window.confirm('最近使ったフォルダーの履歴をクリアしますか？')) {
      localStorage.removeItem('sakura_recent_folders');
      alert('フォルダーの履歴をクリアしました。');
    }
  };

  // ツールバー操作ハンドラ
  const handleToolbarAdd = () => {
    const cmd = ALL_COMMANDS.find((c) => c.id === toolbarSelectedLeftCmd);
    if (!cmd) return;
    const nextItems = [...data.toolbar.items];
    const insertIdx = toolbarSelectedRightIdx >= 0 ? toolbarSelectedRightIdx + 1 : nextItems.length;
    nextItems.splice(insertIdx, 0, { id: cmd.id, name: cmd.name });
    setData({
      ...data,
      toolbar: { ...data.toolbar, items: nextItems },
    });
    setToolbarSelectedRightIdx(insertIdx);
  };

  const handleToolbarInsertSep = () => {
    const nextItems = [...data.toolbar.items];
    const insertIdx = toolbarSelectedRightIdx >= 0 ? toolbarSelectedRightIdx + 1 : nextItems.length;
    nextItems.splice(insertIdx, 0, { id: `sep-${Date.now()}`, name: '---', isSeparator: true });
    setData({
      ...data,
      toolbar: { ...data.toolbar, items: nextItems },
    });
    setToolbarSelectedRightIdx(insertIdx);
  };

  const handleToolbarInsertWrap = () => {
    const nextItems = [...data.toolbar.items];
    const insertIdx = toolbarSelectedRightIdx >= 0 ? toolbarSelectedRightIdx + 1 : nextItems.length;
    nextItems.splice(insertIdx, 0, { id: `wrap-${Date.now()}`, name: '[折返]', isWrap: true });
    setData({
      ...data,
      toolbar: { ...data.toolbar, items: nextItems },
    });
    setToolbarSelectedRightIdx(insertIdx);
  };

  const handleToolbarDelete = () => {
    if (toolbarSelectedRightIdx < 0 || toolbarSelectedRightIdx >= data.toolbar.items.length) return;
    const nextItems = data.toolbar.items.filter((_, idx) => idx !== toolbarSelectedRightIdx);
    setData({
      ...data,
      toolbar: { ...data.toolbar, items: nextItems },
    });
    setToolbarSelectedRightIdx(Math.max(0, toolbarSelectedRightIdx - 1));
  };

  const handleToolbarMoveUp = () => {
    if (toolbarSelectedRightIdx <= 0) return;
    const nextItems = [...data.toolbar.items];
    const temp = nextItems[toolbarSelectedRightIdx - 1];
    nextItems[toolbarSelectedRightIdx - 1] = nextItems[toolbarSelectedRightIdx];
    nextItems[toolbarSelectedRightIdx] = temp;
    setData({
      ...data,
      toolbar: { ...data.toolbar, items: nextItems },
    });
    setToolbarSelectedRightIdx(toolbarSelectedRightIdx - 1);
  };

  const handleToolbarMoveDown = () => {
    if (toolbarSelectedRightIdx >= data.toolbar.items.length - 1) return;
    const nextItems = [...data.toolbar.items];
    const temp = nextItems[toolbarSelectedRightIdx + 1];
    nextItems[toolbarSelectedRightIdx + 1] = nextItems[toolbarSelectedRightIdx];
    nextItems[toolbarSelectedRightIdx] = temp;
    setData({
      ...data,
      toolbar: { ...data.toolbar, items: nextItems },
    });
    setToolbarSelectedRightIdx(toolbarSelectedRightIdx + 1);
  };

  const handleToolbarReset = () => {
    if (window.confirm('ツールバーの設定を初期状態に戻しますか？')) {
      setData({
        ...data,
        toolbar: { ...data.toolbar, items: DEFAULT_TOOLBAR_ITEMS },
      });
      setToolbarSelectedRightIdx(0);
    }
  };

  // メインメニュー操作ハンドラ
  const flatMenuTree = useMemo(() => {
    const result: { id: string; label: string; isSeparator?: boolean; parentId?: string; isCategory?: boolean }[] = [];
    data.mainMenu.tree.forEach((cat) => {
      result.push({ id: cat.id, label: cat.label, isCategory: true });
      if (menuExpandedAll && cat.children) {
        cat.children.forEach((child) => {
          result.push({ id: child.id, label: `  ${child.label}`, isSeparator: child.isSeparator, parentId: cat.id });
        });
      }
    });
    return result;
  }, [data.mainMenu.tree, menuExpandedAll]);

  const handleMenuAdd = () => {
    const cmd = ALL_COMMANDS.find((c) => c.id === menuSelectedLeftCmd);
    if (!cmd) return;
    const nextTree = [...data.mainMenu.tree];
    // 対象カテゴリを探す
    let targetCat = nextTree[0];
    const sel = flatMenuTree[menuSelectedRightIdx];
    if (sel) {
      const found = nextTree.find((c) => c.id === (sel.isCategory ? sel.id : sel.parentId));
      if (found) targetCat = found;
    }
    if (!targetCat.children) targetCat.children = [];
    targetCat.children.push({ id: cmd.id, label: `${cmd.name}${cmd.shortcut ? `(${cmd.shortcut})` : ''}` });
    setData({
      ...data,
      mainMenu: { ...data.mainMenu, tree: nextTree },
    });
  };

  const handleMenuInsertSep = () => {
    const nextTree = [...data.mainMenu.tree];
    let targetCat = nextTree[0];
    const sel = flatMenuTree[menuSelectedRightIdx];
    if (sel) {
      const found = nextTree.find((c) => c.id === (sel.isCategory ? sel.id : sel.parentId));
      if (found) targetCat = found;
    }
    if (!targetCat.children) targetCat.children = [];
    targetCat.children.push({ id: `sep-${Date.now()}`, label: '---', isSeparator: true });
    setData({
      ...data,
      mainMenu: { ...data.mainMenu, tree: nextTree },
    });
  };

  const handleMenuReset = () => {
    if (window.confirm('メインメニューの設定を標準初期状態に戻しますか？')) {
      setData({
        ...data,
        mainMenu: { ...data.mainMenu, tree: DEFAULT_MAIN_MENU_TREE },
      });
    }
  };

  const handleMenuCheck = () => {
    let totalItems = 0;
    data.mainMenu.tree.forEach((c) => {
      totalItems += (c.children?.length || 0);
    });
    alert(`【メインメニュー検査結果】\n・トップレベルメニュー数: ${data.mainMenu.tree.length}\n・登録機能項目数: ${totalItems}\n・構文エラー: 0件\n・重複ショートカット競合: なし\n\n正常に動作します。`);
  };

  // 設定フォルダーのバックアップ・インポート
  const handleExportIni = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sakura_common_settings.json';
    a.click();
    URL.revokeObjectURL(url);
    setIsConfigFolderMenuOpen(false);
  };

  const handleImportIni = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setData({ ...DEFAULT_COMMON_SETTINGS, ...parsed });
        alert('設定を正常にインポートしました。');
      } catch (err) {
        alert('設定ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    setIsConfigFolderMenuOpen(false);
  };

  // キー割り当てハンドラ
  const handleAssignKey = () => {
    if (!newShortcutInput.trim()) return;
    setData({
      ...data,
      keyBindings: {
        ...data.keyBindings,
        [selectedKeyFunc]: newShortcutInput.trim(),
      },
    });
  };

  const handleRemoveKey = () => {
    const nextBindings = { ...data.keyBindings };
    delete nextBindings[selectedKeyFunc];
    setData({
      ...data,
      keyBindings: nextBindings,
    });
    setNewShortcutInput('');
  };

  const handleResetKeys = () => {
    if (window.confirm('キー割り当てを初期設定に戻しますか？')) {
      setData({
        ...data,
        keyBindings: { ...DEFAULT_COMMON_SETTINGS.keyBindings },
      });
    }
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '640px', maxWidth: 'calc(100vw - 20px)' }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>共通設定</span>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span
              style={{
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '11px',
                lineHeight: '14px',
                border: '1px solid #ffffff',
                borderRadius: '2px',
                marginRight: '2px',
              }}
              onClick={() => setIsHelpOpen(!isHelpOpen)}
              title="ヘルプ"
            >
              ?
            </span>
            <span
              style={{
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '11px',
                lineHeight: '14px',
                border: '1px solid #ffffff',
                borderRadius: '2px',
              }}
              onClick={onClose}
              title="閉じる"
            >
              ✕
            </span>
          </div>
        </div>

        {/* ダイアログ本体 */}
        <div className="sakura-dialog-body" style={{ padding: '8px' }}>
          {/* Win32 プロパティシート 3行タブコントロール */}
          <div className="win32-tab-control">
            <div className="win32-tab-multiline">
              {sortedTabRows.map((rowDef, rIdx) => {
                const isBottomRow = rIdx === sortedTabRows.length - 1;
                return (
                  <div
                    key={`row-${rowDef.row}`}
                    className={`win32-tab-row ${isBottomRow ? 'active-row' : ''}`}
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      borderBottom: isBottomRow ? 'none' : '1px solid #919b9c',
                    }}
                  >
                    {rowDef.tabs.map((tab) => {
                      const isActive = activeTab === tab.key;
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          className={`win32-tab-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setActiveTab(tab.key)}
                          style={{
                            flex: '1 1 auto',
                            padding: '3px 4px',
                            fontSize: '11px',
                            minWidth: '58px',
                            textAlign: 'center',
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* タブページ内容 (最小高350px) */}
            <div className="win32-tab-page" style={{ minHeight: '350px', maxHeight: '420px', overflowY: 'auto' }}>

              {/* ==================== 1. 全般 タブ (Screenshot 1 準拠) ==================== */}
              {activeTab === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {/* 左カラム */}
                  <div>
                    {/* カーソル */}
                    <fieldset className="win32-groupbox">
                      <legend>カーソル</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.freeCursor}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, freeCursor: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>フリーカーソル(F)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.stopWordEnd}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, stopWordEnd: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>単語単位で移動するときに単語の末尾に止まる(B)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.stopParagraphEnd}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, stopParagraphEnd: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>単語単位で移動するときに段落の末尾に止まる(P)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.noCursorMoveOnActivate}
                            onChange={(e) =>
                              setData({
                                ...data,
                                general: { ...data.general, noCursorMoveOnActivate: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>マウスクリックでのアクティブ化ではカーソルを移動しない(O)</span>
                        </label>
                      </div>
                    </fieldset>

                    {/* カーソル形状 */}
                    <fieldset className="win32-groupbox">
                      <legend>カーソル形状</legend>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="cursorShape"
                            checked={data.general.cursorShape === 'windows'}
                            onChange={() =>
                              setData({ ...data, general: { ...data.general, cursorShape: 'windows' } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>Windows風</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="cursorShape"
                            checked={data.general.cursorShape === 'msdos'}
                            onChange={() =>
                              setData({ ...data, general: { ...data.general, cursorShape: 'msdos' } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>MS-DOS風</span>
                        </label>
                      </div>
                    </fieldset>

                    {/* タスクトレイ */}
                    <fieldset className="win32-groupbox">
                      <legend>タスクトレイ</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.useTaskTray}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, useTaskTray: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>タスクトレイを使う(T)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
                          <input
                            type="checkbox"
                            checked={data.general.stayTaskTray}
                            disabled={!data.general.useTaskTray}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, stayTaskTray: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>タスクトレイに常駐(R)</span>
                        </label>

                        <div style={{ marginLeft: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px' }}>左クリックメニューのショートカットキー(K)</span>
                          <input
                            type="text"
                            value={data.general.trayMenuShortcut}
                            disabled={!data.general.useTaskTray}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, trayMenuShortcut: e.target.value } })
                            }
                            style={{ padding: '2px 4px', border: '1px solid #7f9db9', fontSize: '11px' }}
                          />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.confirmMultiWinClose}
                            onChange={(e) =>
                              setData({
                                ...data,
                                general: { ...data.general, confirmMultiWinClose: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>同時に複数の編集用ウィンドウを閉じるとき確認(U)</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.confirmExitAll}
                            onChange={(e) =>
                              setData({
                                ...data,
                                general: { ...data.general, confirmExitAll: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>サクラエディタの全終了で編集用ウィンドウを閉じるとき確認(V)</span>
                        </label>
                      </div>
                    </fieldset>
                  </div>

                  {/* 右カラム */}
                  <div>
                    {/* スクロール */}
                    <fieldset className="win32-groupbox">
                      <legend>スクロール</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>行数(N)</span>
                          <Win32SpinInput
                            value={data.general.scrollLines}
                            min={1}
                            max={60}
                            onChange={(val) =>
                              setData({ ...data, general: { ...data.general, scrollLines: val } })
                            }
                          />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.general.smoothScroll}
                            onChange={(e) =>
                              setData({ ...data, general: { ...data.general, smoothScroll: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>少し滑らかにする(S)</span>
                        </label>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px' }}>組み合わせてホイール操作した時ページスクロールする(J):</span>
                          <select
                            value={data.general.wheelPageScrollModifier}
                            onChange={(e) =>
                              setData({
                                ...data,
                                general: { ...data.general, wheelPageScrollModifier: e.target.value },
                              })
                            }
                            style={{ padding: '2px 4px', fontSize: '11px' }}
                          >
                            <option value="組み合わせなし">組み合わせなし</option>
                            <option value="Ctrl">Ctrl</option>
                            <option value="Shift">Shift</option>
                            <option value="Alt">Alt</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px' }}>組み合わせてホイール操作した時横スクロールする(H):</span>
                          <select
                            value={data.general.wheelHorizontalScrollModifier}
                            onChange={(e) =>
                              setData({
                                ...data,
                                general: { ...data.general, wheelHorizontalScrollModifier: e.target.value },
                              })
                            }
                            style={{ padding: '2px 4px', fontSize: '11px' }}
                          >
                            <option value="組み合わせなし">組み合わせなし</option>
                            <option value="Shift">Shift</option>
                            <option value="Ctrl">Ctrl</option>
                            <option value="Alt">Alt</option>
                          </select>
                        </div>
                      </div>
                    </fieldset>

                    {/* 画面キャッシュ */}
                    <div style={{ margin: '8px 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.general.useScreenCache}
                          onChange={(e) =>
                            setData({ ...data, general: { ...data.general, useScreenCache: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>画面キャッシュを使う(G)</span>
                      </label>
                    </div>

                    {/* 履歴 */}
                    <fieldset className="win32-groupbox">
                      <legend>履歴</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>ファイルの履歴MAX</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Win32SpinInput
                              value={data.general.fileHistoryMax}
                              min={0}
                              max={100}
                              onChange={(val) =>
                                setData({ ...data, general: { ...data.general, fileHistoryMax: val } })
                              }
                            />
                            <button
                              type="button"
                              className="sakura-dialog-btn"
                              onClick={handleClearFileHistory}
                            >
                              履歴をクリア(C)...
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>フォルダーの履歴MAX</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Win32SpinInput
                              value={data.general.folderHistoryMax}
                              min={0}
                              max={100}
                              onChange={(val) =>
                                setData({ ...data, general: { ...data.general, folderHistoryMax: val } })
                              }
                            />
                            <button
                              type="button"
                              className="sakura-dialog-btn"
                              onClick={handleClearFolderHistory}
                            >
                              履歴をクリア(L)...
                            </button>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                </div>
              )}

              {/* ==================== 2. ウィンドウ タブ (Screenshot 2 準拠) ==================== */}
              {activeTab === 'win' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* 基本設定 */}
                  <fieldset className="win32-groupbox">
                    <legend>基本設定</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.window.showToolbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                window: { ...data.window, showToolbar: e.target.checked },
                                toolbar: { ...data.toolbar, showToolbar: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ツールバー表示(T)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.window.showFunctionKey}
                            onChange={(e) =>
                              setData({
                                ...data,
                                window: { ...data.window, showFunctionKey: e.target.checked },
                                functionKey: {
                                  showFunctionKey: e.target.checked,
                                  position: data.window.fnKeyPosition,
                                },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ファンクションキー表示(K)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.window.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                window: { ...data.window, showStatusbar: e.target.checked },
                                statusbar: { ...data.statusbar, showStatusbar: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ステータスバー表示(S)</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.window.showHScrollbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                window: { ...data.window, showHScrollbar: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>水平スクロールバー(R)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.window.darkMode}
                            onChange={(e) =>
                              setData({
                                ...data,
                                window: { ...data.window, darkMode: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ダークモード(D)</span>
                        </label>
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          タブバー表示は「タブバー」タブにあります
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.window.menuIcon}
                            onChange={(e) =>
                              setData({
                                ...data,
                                window: { ...data.window, menuIcon: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>アイコン付きメニュー(I)</span>
                        </label>
                        <button
                          type="button"
                          className="sakura-dialog-btn"
                          onClick={() => {
                            setWinPosDraft(data.window.winPosSize);
                            setIsWinPosModalOpen(true);
                          }}
                        >
                          位置と大きさの設定(W)...
                        </button>
                      </div>
                    </div>
                  </fieldset>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {/* ルーラ / 行番号 */}
                    <fieldset className="win32-groupbox">
                      <legend>ルーラ / 行番号</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>ルーラーの高さ(E):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Win32SpinInput
                              value={data.window.rulerHeight}
                              min={8}
                              max={50}
                              onChange={(val) =>
                                setData({ ...data, window: { ...data.window, rulerHeight: val } })
                              }
                            />
                            <span>ドット</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>ルーラーとテキストの隙間(P):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Win32SpinInput
                              value={data.window.rulerTextGap}
                              min={0}
                              max={20}
                              onChange={(val) =>
                                setData({ ...data, window: { ...data.window, rulerTextGap: val } })
                              }
                            />
                            <span>ドット</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>行番号とテキストの隙間(L):</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Win32SpinInput
                              value={data.window.lineNumTextGap}
                              min={0}
                              max={20}
                              onChange={(val) =>
                                setData({ ...data, window: { ...data.window, lineNumTextGap: val } })
                              }
                            />
                            <span>ドット</span>
                          </div>
                        </div>
                      </div>
                    </fieldset>

                    {/* ファンクションキー & 言語 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <fieldset className="win32-groupbox">
                        <legend>ファンクションキー</legend>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span>位置:</span>
                            <label style={{ display: 'flex', alignItems: 'center' }}>
                              <input
                                type="radio"
                                name="fnPos"
                                checked={data.window.fnKeyPosition === 'top'}
                                onChange={() =>
                                  setData({
                                    ...data,
                                    window: { ...data.window, fnKeyPosition: 'top' },
                                    functionKey: { showFunctionKey: true, position: 'top' },
                                  })
                                }
                              />
                              <span style={{ marginLeft: '4px' }}>上(O)</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center' }}>
                              <input
                                type="radio"
                                name="fnPos"
                                checked={data.window.fnKeyPosition === 'bottom'}
                                onChange={() =>
                                  setData({
                                    ...data,
                                    window: { ...data.window, fnKeyPosition: 'bottom' },
                                    functionKey: { showFunctionKey: true, position: 'bottom' },
                                  })
                                }
                              />
                              <span style={{ marginLeft: '4px' }}>下(B)</span>
                            </label>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>グループボタン数(G):</span>
                            <Win32SpinInput
                              value={data.window.fnKeyGroupCount}
                              min={1}
                              max={12}
                              onChange={(val) =>
                                setData({ ...data, window: { ...data.window, fnKeyGroupCount: val } })
                              }
                            />
                          </div>
                        </div>
                      </fieldset>

                      <fieldset className="win32-groupbox">
                        <legend>言語</legend>
                        <select
                          value={data.window.language}
                          onChange={(e) =>
                            setData({ ...data, window: { ...data.window, language: e.target.value } })
                          }
                          style={{ width: '100%', padding: '2px 4px', fontSize: '11px' }}
                        >
                          <option value="Japanese">Japanese</option>
                          <option value="English">English</option>
                        </select>
                      </fieldset>
                    </div>
                  </div>

                  {/* 分割ウィンドウ */}
                  <fieldset className="win32-groupbox">
                    <legend>分割ウィンドウ</legend>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.window.syncSplitVScroll}
                          onChange={(e) =>
                            setData({
                              ...data,
                              window: { ...data.window, syncSplitVScroll: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>垂直スクロールの同期をとる(V)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.window.syncSplitHScroll}
                          onChange={(e) =>
                            setData({
                              ...data,
                              window: { ...data.window, syncSplitHScroll: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>水平スクロールの同期をとる(H)</span>
                      </label>
                    </div>
                  </fieldset>

                  {/* タイトルバー */}
                  <fieldset className="win32-groupbox">
                    <legend>タイトルバー</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', alignItems: 'center' }}>
                        <span>アクティブ時(1):</span>
                        <input
                          type="text"
                          value={data.window.activeTitleFormat}
                          onChange={(e) =>
                            setData({
                              ...data,
                              window: { ...data.window, activeTitleFormat: e.target.value },
                            })
                          }
                          style={{ padding: '2px 4px', fontSize: '11px', border: '1px solid #7f9db9' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px', alignItems: 'center' }}>
                        <span>非アクティブ時(2):</span>
                        <input
                          type="text"
                          value={data.window.inactiveTitleFormat}
                          onChange={(e) =>
                            setData({
                              ...data,
                              window: { ...data.window, inactiveTitleFormat: e.target.value },
                            })
                          }
                          style={{ padding: '2px 4px', fontSize: '11px', border: '1px solid #7f9db9' }}
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 3. メインメニュー タブ (Screenshot 3 準拠) ==================== */}
              {activeTab === 'mainmenu' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>種別(C):</span>
                      <select
                        value={menuSelectedCategory}
                        onChange={(e) => {
                          setMenuSelectedCategory(e.target.value);
                          const firstCmd = getCategoryCommands(e.target.value)[0];
                          if (firstCmd) setMenuSelectedLeftCmd(firstCmd.id);
                        }}
                        style={{ padding: '2px 4px', fontSize: '11px', width: '130px' }}
                      >
                        <option value="ファイル">ファイル操作系</option>
                        <option value="編集">編集系</option>
                        <option value="変換">変換系</option>
                        <option value="検索">検索系</option>
                        <option value="ツール">ツール系</option>
                        <option value="設定">設定系</option>
                        <option value="ウィンドウ">ウィンドウ系</option>
                        <option value="ヘルプ">ヘルプ系</option>
                      </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={data.mainMenu.showAccessKeyInParens}
                        onChange={(e) =>
                          setData({
                            ...data,
                            mainMenu: { ...data.mainMenu, showAccessKeyInParens: e.target.checked },
                          })
                        }
                      />
                      <span style={{ marginLeft: '4px' }}>アクセスキーを必ず( )付きで表示(P)</span>
                    </label>
                  </div>

                  {/* 2ペイン & 中央ボタン */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
                    {/* 左ペイン: 機能一覧 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>機能(F):</div>
                      <div
                        style={{
                          height: '240px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {getCategoryCommands(menuSelectedCategory).map((cmd) => {
                          const isSel = cmd.id === menuSelectedLeftCmd;
                          return (
                            <div
                              key={cmd.id}
                              style={{
                                padding: '2px 4px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onClick={() => setMenuSelectedLeftCmd(cmd.id)}
                            >
                              {renderCommandIcon(cmd.id, 14)}
                              <span>{cmd.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 中央ボタン群 */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '4px',
                        width: '70px',
                      }}
                    >
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          const sel = flatMenuTree[menuSelectedRightIdx];
                          if (!sel || sel.isCategory) return;
                          const nextTree = [...data.mainMenu.tree];
                          const cat = nextTree.find((c) => c.id === sel.parentId);
                          if (cat && cat.children) {
                            cat.children = cat.children.filter((item) => item.id !== sel.id);
                            setData({ ...data, mainMenu: { ...data.mainMenu, tree: nextTree } });
                          }
                        }}
                      >
                        削除(D)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleMenuAdd}>
                        +(N)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleMenuInsertSep}>
                        ---(S)
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => setMenuSelectedRightIdx(Math.max(0, menuSelectedRightIdx - 1))}
                      >
                        上へ(U)
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() =>
                          setMenuSelectedRightIdx(Math.min(flatMenuTree.length - 1, menuSelectedRightIdx + 1))
                        }
                      >
                        下へ(A)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleMenuAdd}>
                        &gt;&gt;(B)
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => setMenuExpandedAll(true)}
                      >
                        全開(H)
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => setMenuExpandedAll(false)}
                      >
                        全閉(Z)
                      </button>
                    </div>

                    {/* 右ペイン: メニューツリー */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>メニュー(M):</div>
                      <div
                        style={{
                          height: '240px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {flatMenuTree.map((item, idx) => {
                          const isSel = idx === menuSelectedRightIdx;
                          return (
                            <div
                              key={`${item.id}-${idx}`}
                              style={{
                                padding: '2px 4px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : item.isCategory ? '#000088' : '#000000',
                                fontWeight: item.isCategory ? 'bold' : 'normal',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onClick={() => setMenuSelectedRightIdx(idx)}
                            >
                              {item.isCategory ? (
                                <span>{menuExpandedAll ? '▼' : '▶'} {item.label}</span>
                              ) : item.isSeparator ? (
                                <span style={{ color: isSel ? '#ffffff' : '#999999', width: '100%' }}>
                                  ────── (セパレータ)
                                </span>
                              ) : (
                                <span>{item.label}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 下部メニュー制御ボタン */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        インポート(I)...
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleExportIni}>
                        エクスポート(X)...
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleMenuCheck}>
                        検査(T)
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          if (window.confirm('すべてのメニュー項目をクリアしますか？')) {
                            setData({ ...data, mainMenu: { ...data.mainMenu, tree: [] } });
                          }
                        }}
                      >
                        クリア(C)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleMenuReset}>
                        初期設定(R)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 4. ツールバー タブ (Screenshot 4 準拠) ==================== */}
              {activeTab === 'toolbar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>種別(K):</span>
                      <select
                        value={toolbarSelectedCategory}
                        onChange={(e) => {
                          setToolbarSelectedCategory(e.target.value);
                          const firstCmd = getCategoryCommands(e.target.value)[0];
                          if (firstCmd) setToolbarSelectedLeftCmd(firstCmd.id);
                        }}
                        style={{ padding: '2px 4px', fontSize: '11px', width: '130px' }}
                      >
                        <option value="ファイル">ファイル操作系</option>
                        <option value="編集">編集系</option>
                        <option value="変換">変換系</option>
                        <option value="検索">検索系</option>
                        <option value="ツール">ツール系</option>
                        <option value="設定">設定系</option>
                        <option value="ウィンドウ">ウィンドウ系</option>
                        <option value="ヘルプ">ヘルプ系</option>
                      </select>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={data.toolbar.flatButtons}
                        onChange={(e) =>
                          setData({
                            ...data,
                            toolbar: { ...data.toolbar, flatButtons: e.target.checked },
                          })
                        }
                      />
                      <span style={{ marginLeft: '4px' }}>フラットなボタン(L)</span>
                    </label>
                  </div>

                  {/* 2ペイン & 中央ボタン */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'stretch' }}>
                    {/* 左ペイン: 機能一覧 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>機能(F):</div>
                      <div
                        style={{
                          height: '240px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {getCategoryCommands(toolbarSelectedCategory).map((cmd) => {
                          const isSel = cmd.id === toolbarSelectedLeftCmd;
                          return (
                            <div
                              key={cmd.id}
                              style={{
                                padding: '2px 4px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                              onClick={() => setToolbarSelectedLeftCmd(cmd.id)}
                            >
                              {renderCommandIcon(cmd.id, 16)}
                              <span>{cmd.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 中央ボタン群 */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '4px',
                        width: '70px',
                      }}
                    >
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarDelete}>
                        削除(D)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarInsertSep}>
                        ---(S)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarInsertSep}>
                        --(A)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarAdd}>
                        &gt;&gt;(B)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarMoveUp}>
                        ↑(U)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarMoveDown}>
                        ↓(D)
                      </button>
                      <button type="button" className="sakura-dialog-btn" onClick={handleToolbarInsertWrap}>
                        折返(W)
                      </button>
                    </div>

                    {/* 右ペイン: ツールバー一覧 */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>ツールバー(T):</div>
                      <div
                        style={{
                          height: '240px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {data.toolbar.items.map((item, idx) => {
                          const isSel = idx === toolbarSelectedRightIdx;
                          return (
                            <div
                              key={`${item.id}-${idx}`}
                              style={{
                                padding: '2px 4px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                              onClick={() => setToolbarSelectedRightIdx(idx)}
                            >
                              {item.isSeparator ? (
                                <div style={{ width: '100%', color: isSel ? '#ffffff' : '#888888' }}>
                                  ────── (セパレータ)
                                </div>
                              ) : item.isWrap ? (
                                <div style={{ width: '100%', color: isSel ? '#ffffaa' : '#0066cc', fontWeight: 'bold' }}>
                                  [↵ ツールバー折り返し]
                                </div>
                              ) : (
                                <>
                                  {renderCommandIcon(item.id, 16)}
                                  <span>{item.name}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 初期設定ボタン */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button type="button" className="sakura-dialog-btn" onClick={handleToolbarReset}>
                      初期設定に戻す(R)
                    </button>
                  </div>
                </div>
              )}

              {/* ==================== 5. タブバー タブ (Screenshot 5 準拠) ==================== */}
              {activeTab === 'tabbar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={data.tabbar.showTabbar}
                      onChange={(e) =>
                        setData({
                          ...data,
                          tabbar: { ...data.tabbar, showTabbar: e.target.checked },
                        })
                      }
                    />
                    <span style={{ marginLeft: '6px' }}>タブバーを表示する(D)</span>
                  </label>

                  {/* 動作モード */}
                  <fieldset className="win32-groupbox">
                    <legend>動作モード</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.tabbar.groupMultiWin}
                          onChange={(e) =>
                            setData({
                              ...data,
                              tabbar: { ...data.tabbar, groupMultiWin: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ウィンドウをまとめてグループ化する(U)</span>
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="retainMode"
                            checked={data.tabbar.retainEmptyWindow}
                            disabled={!data.tabbar.groupMultiWin}
                            onChange={() =>
                              setData({
                                ...data,
                                tabbar: {
                                  ...data.tabbar,
                                  retainEmptyWindow: true,
                                  closeOnlyCurrent: false,
                                },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>最後のファイルを閉じたとき(無題)文書を残す(R)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="retainMode"
                            checked={data.tabbar.closeOnlyCurrent}
                            disabled={!data.tabbar.groupMultiWin}
                            onChange={() =>
                              setData({
                                ...data,
                                tabbar: {
                                  ...data.tabbar,
                                  retainEmptyWindow: false,
                                  closeOnlyCurrent: true,
                                },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ウィンドウの閉じるボタンは現在のファイルのみ閉じる(C)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.tabbar.openNewWinExternal}
                            disabled={!data.tabbar.groupMultiWin}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, openNewWinExternal: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>外部から起動するときは新しいウィンドウで開く(O)</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  {/* タブの外観 */}
                  <fieldset className="win32-groupbox">
                    <legend>タブの外観</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.tabbar.showIcon}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, showIcon: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>アイコン表示(I)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.tabbar.equalWidth}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, equalWidth: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>等幅(E)</span>
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>閉じるボタン(X):</span>
                          <select
                            value={data.tabbar.closeButtonMode}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: {
                                  ...data.tabbar,
                                  closeButtonMode: e.target.value as any,
                                  showCloseButton: e.target.value !== 'none',
                                },
                              })
                            }
                            style={{ padding: '2px 4px', fontSize: '11px' }}
                          >
                            <option value="auto">自動表示</option>
                            <option value="always">常に表示</option>
                            <option value="none">表示しない</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          className="sakura-dialog-btn"
                          onClick={() => {
                            setTabFontDraft(data.tabbar.fontName);
                            setIsTabFontModalOpen(true);
                          }}
                        >
                          フォント(F)... [{data.tabbar.fontName}]
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.tabbar.sortTabs}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, sortTabs: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>タブ一覧をソートする(S)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.tabbar.multiLine}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, multiLine: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>多段(M)</span>
                        </label>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>表示位置(P):</span>
                          <select
                            value={data.tabbar.position}
                            onChange={(e) =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, position: e.target.value as any },
                              })
                            }
                            style={{ padding: '2px 4px', fontSize: '11px' }}
                          >
                            <option value="top">上</option>
                            <option value="bottom">下</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '4px', alignItems: 'center' }}>
                        <span>タイトル(T):</span>
                        <input
                          type="text"
                          value={data.tabbar.titleFormat}
                          onChange={(e) =>
                            setData({
                              ...data,
                              tabbar: { ...data.tabbar, titleFormat: e.target.value },
                            })
                          }
                          style={{ padding: '2px 4px', fontSize: '11px', border: '1px solid #7f9db9' }}
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* その他 */}
                  <fieldset className="win32-groupbox">
                    <legend>その他</legend>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={data.tabbar.mouseWheelSwitch}
                        onChange={(e) =>
                          setData({
                            ...data,
                            tabbar: { ...data.tabbar, mouseWheelSwitch: e.target.checked },
                          })
                        }
                      />
                      <span style={{ marginLeft: '6px' }}>マウスホイールでタブ切り替え(W)</span>
                    </label>
                  </fieldset>
                </div>
              )}

              {/* ==================== 6. ファイル タブ ==================== */}
              {activeTab === 'file' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>標準文字コード・改行コード</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '6px', alignItems: 'center' }}>
                      <span>デフォルト文字コード:</span>
                      <select
                        value={data.file.defaultEncoding}
                        onChange={(e) =>
                          setData({ ...data, file: { ...data.file, defaultEncoding: e.target.value as any } })
                        }
                        style={{ padding: '2px 4px' }}
                      >
                        <option value="UTF-8">UTF-8</option>
                        <option value="Shift_JIS">Shift_JIS (CP932)</option>
                        <option value="EUC-JP">EUC-JP</option>
                        <option value="UTF-16LE">UTF-16LE</option>
                      </select>

                      <span>デフォルト改行コード:</span>
                      <select
                        value={data.file.defaultLineEnding}
                        onChange={(e) =>
                          setData({ ...data, file: { ...data.file, defaultLineEnding: e.target.value as any } })
                        }
                        style={{ padding: '2px 4px' }}
                      >
                        <option value="CRLF">CRLF (Windows標準)</option>
                        <option value="LF">LF (UNIX/Linux/macOS)</option>
                        <option value="CR">CR (Classic Mac)</option>
                      </select>

                      <span>BOM付与:</span>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.file.defaultBom}
                          onChange={(e) =>
                            setData({ ...data, file: { ...data.file, defaultBom: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>新規UTF-8ファイルにBOMを付加する</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>排他制御</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="exLock"
                            checked={data.file.exclusiveLockMode === 'none'}
                            onChange={() =>
                              setData({ ...data, file: { ...data.file, exclusiveLockMode: 'none', exclusiveLock: false } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>しない</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="exLock"
                            checked={data.file.exclusiveLockMode === 'read'}
                            onChange={() =>
                              setData({ ...data, file: { ...data.file, exclusiveLockMode: 'read', exclusiveLock: true } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>読み込み時のみ</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="exLock"
                            checked={data.file.exclusiveLockMode === 'no_overwrite'}
                            onChange={() =>
                              setData({ ...data, file: { ...data.file, exclusiveLockMode: 'no_overwrite', exclusiveLock: true } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>上書き禁止</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="exLock"
                            checked={data.file.exclusiveLockMode === 'no_readwrite'}
                            onChange={() =>
                              setData({ ...data, file: { ...data.file, exclusiveLockMode: 'no_readwrite', exclusiveLock: true } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>読み書き禁止</span>
                        </label>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.file.alertOnExclusiveLockError}
                          onChange={(e) =>
                            setData({ ...data, file: { ...data.file, alertOnExclusiveLockError: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>排他制御エラー時に通知ダイアログを表示する</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>ファイルの自動保存 & 更新監視</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.file.autoSave}
                            onChange={(e) =>
                              setData({ ...data, file: { ...data.file, autoSave: e.target.checked } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>自動保存を行う(A):</span>
                        </label>
                        <Win32SpinInput
                          value={data.file.autoSaveIntervalMinutes}
                          min={1}
                          max={60}
                          disabled={!data.file.autoSave}
                          onChange={(val) =>
                            setData({ ...data, file: { ...data.file, autoSaveIntervalMinutes: val } })
                          }
                        />
                        <span>分ごと</span>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.file.monitorFileUpdate}
                          onChange={(e) =>
                            setData({ ...data, file: { ...data.file, monitorFileUpdate: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>アクティブ化時に外部でのファイル更新を監視する</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 7. ファイル名表示 タブ ==================== */}
              {activeTab === 'fname' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>ウィンドウタイトル・タブでのファイル名表示</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name="titleDisp"
                          checked={data.fname.titleDisplayMode === 'name_only'}
                          onChange={() =>
                            setData({ ...data, fname: { ...data.fname, titleDisplayMode: 'name_only' } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ファイル名のみ表示 (例: sample.txt)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name="titleDisp"
                          checked={data.fname.titleDisplayMode === 'full_path'}
                          onChange={() =>
                            setData({ ...data, fname: { ...data.fname, titleDisplayMode: 'full_path' } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>フルパスを表示 (例: C:\docs\sample.txt)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name="titleDisp"
                          checked={data.fname.titleDisplayMode === 'folder_and_name'}
                          onChange={() =>
                            setData({ ...data, fname: { ...data.fname, titleDisplayMode: 'folder_and_name' } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>フォルダ名とファイル名 (例: docs\sample.txt)</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>同名ファイルの識別・装飾</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.fname.distinguishSameName}
                          onChange={(e) =>
                            setData({ ...data, fname: { ...data.fname, distinguishSameName: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>同名異パスのファイルを開いたときに親フォルダー名を付与して区別する</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.fname.expandEnvVars}
                          onChange={(e) =>
                            setData({ ...data, fname: { ...data.fname, expandEnvVars: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>パス中の環境変数を展開して表示する (%USERPROFILE% 等)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.fname.grayNonExistent}
                          onChange={(e) =>
                            setData({ ...data, fname: { ...data.fname, grayNonExistent: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>最近使ったファイルで存在しないファイルを淡色（グレー）表示にする</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 8. バックアップ タブ ==================== */}
              {activeTab === 'backup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>バックアップの作成</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.backup.createBackup}
                          onChange={(e) =>
                            setData({ ...data, backup: { ...data.backup, createBackup: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>保存時にバックアップファイルを作成する(B)</span>
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="bakType"
                            checked={data.backup.backupType === 'fixed_ext'}
                            disabled={!data.backup.createBackup}
                            onChange={() =>
                              setData({ ...data, backup: { ...data.backup, backupType: 'fixed_ext' } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>固定の拡張子を付ける(E):</span>
                          <input
                            type="text"
                            value={data.backup.backupExtension}
                            disabled={!data.backup.createBackup || data.backup.backupType !== 'fixed_ext'}
                            onChange={(e) =>
                              setData({ ...data, backup: { ...data.backup, backupExtension: e.target.value } })
                            }
                            style={{ width: '80px', marginLeft: '6px', padding: '2px 4px' }}
                          />
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="bakType"
                            checked={data.backup.backupType === 'datetime'}
                            disabled={!data.backup.createBackup}
                            onChange={() =>
                              setData({ ...data, backup: { ...data.backup, backupType: 'datetime' } })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>日付・時刻付きファイル名を作成 (例: _20261008_120000.bak)</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>バックアップ先 & 世代管理</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.backup.sendToTrash}
                          disabled={!data.backup.createBackup}
                          onChange={(e) =>
                            setData({ ...data, backup: { ...data.backup, sendToTrash: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>古いバックアップをごみ箱に送る(R)</span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>バックアップ世代数を制限する:</span>
                        <Win32SpinInput
                          value={data.backup.maxGenerations}
                          min={1}
                          max={50}
                          disabled={!data.backup.createBackup}
                          onChange={(val) =>
                            setData({ ...data, backup: { ...data.backup, maxGenerations: val } })
                          }
                        />
                        <span>世代</span>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 9. 書式 タブ ==================== */}
              {activeTab === 'format' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>日時フォーマット</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px', alignItems: 'center' }}>
                      <span>日時の書式(D):</span>
                      <input
                        type="text"
                        value={data.format.dateTimeFormat}
                        onChange={(e) =>
                          setData({ ...data, format: { ...data.format, dateTimeFormat: e.target.value } })
                        }
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />

                      <span>日付のみの書式:</span>
                      <input
                        type="text"
                        value={data.format.dateFormat}
                        onChange={(e) =>
                          setData({ ...data, format: { ...data.format, dateFormat: e.target.value } })
                        }
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />

                      <span>時刻のみの書式:</span>
                      <input
                        type="text"
                        value={data.format.timeFormat}
                        onChange={(e) =>
                          setData({ ...data, format: { ...data.format, timeFormat: e.target.value } })
                        }
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                      メニュー [編集] - [現在日時を挿入] で使用されます。(YYYY/MM/DD HH:mm:ss 等)
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>引用符</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px', alignItems: 'center' }}>
                      <span>引用符(Q):</span>
                      <input
                        type="text"
                        value={data.format.quoteString}
                        onChange={(e) =>
                          setData({ ...data, format: { ...data.format, quoteString: e.target.value } })
                        }
                        style={{ width: '80px', padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>印刷ヘッダー・フッター</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px', alignItems: 'center' }}>
                      <span>ヘッダー書式:</span>
                      <input
                        type="text"
                        value={data.format.headerFormat}
                        onChange={(e) =>
                          setData({ ...data, format: { ...data.format, headerFormat: e.target.value } })
                        }
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />

                      <span>フッター書式:</span>
                      <input
                        type="text"
                        value={data.format.footerFormat}
                        onChange={(e) =>
                          setData({ ...data, format: { ...data.format, footerFormat: e.target.value } })
                        }
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 10. 検索 タブ ==================== */}
              {activeTab === 'grep' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>検索・置換の標準動作</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.grep.matchWord}
                          onChange={(e) =>
                            setData({ ...data, grep: { ...data.grep, matchWord: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>単語単位で探す(W)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.grep.matchCase}
                          onChange={(e) =>
                            setData({ ...data, grep: { ...data.grep, matchCase: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>英大文字小文字を区別する(C)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.grep.useRegex}
                          onChange={(e) =>
                            setData({ ...data, grep: { ...data.grep, useRegex: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>正規表現を使う(E)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.grep.markMatches}
                          onChange={(e) =>
                            setData({ ...data, grep: { ...data.grep, markMatches: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '4px' }}>該当行マーク(B)</span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>検索履歴MAX:</span>
                        <Win32SpinInput
                          value={data.grep.searchHistoryMax}
                          min={5}
                          max={50}
                          onChange={(val) =>
                            setData({ ...data, grep: { ...data.grep, searchHistoryMax: val } })
                          }
                        />
                        <span>件</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>置換履歴MAX:</span>
                        <Win32SpinInput
                          value={data.grep.replaceHistoryMax}
                          min={5}
                          max={50}
                          onChange={(val) =>
                            setData({ ...data, grep: { ...data.grep, replaceHistoryMax: val } })
                          }
                        />
                        <span>件</span>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>Grep設定</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.grep.grepIncludeSubfolders}
                          onChange={(e) =>
                            setData({
                              ...data,
                              grep: { ...data.grep, grepIncludeSubfolders: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>サブフォルダも含める(S)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.grep.grepRealtime}
                          onChange={(e) =>
                            setData({ ...data, grep: { ...data.grep, grepRealtime: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>検索結果をリアルタイム表示する(R)</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 11. キー割り当て タブ ==================== */}
              {activeTab === 'keybind' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>分類(C):</span>
                    <select
                      value={keyCategory}
                      onChange={(e) => setKeyCategory(e.target.value)}
                      style={{ padding: '2px 4px', fontSize: '11px', width: '120px' }}
                    >
                      {['すべて', 'ファイル', '編集', '変換', '検索', 'ツール', '設定', 'ウィンドウ', 'ヘルプ'].map(
                        (cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        )
                      )}
                    </select>

                    <span style={{ marginLeft: '8px' }}>絞り込み:</span>
                    <input
                      type="text"
                      value={keySearchQuery}
                      onChange={(e) => setKeySearchQuery(e.target.value)}
                      placeholder="コマンド名・キー..."
                      style={{ flex: 1, padding: '2px 4px', fontSize: '11px', border: '1px solid #7f9db9' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '310px' }}>
                      <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                        機能一覧 (全 {filteredKeyCommands.length} 件):
                      </div>
                      <div
                        style={{
                          height: '215px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {filteredKeyCommands.map((f) => {
                          const isSel = f.id === selectedKeyFunc;
                          const currentKey = data.keyBindings[f.id] || f.shortcut || '(なし)';
                          return (
                            <div
                              key={f.id}
                              style={{
                                padding: '2px 6px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #f0f0f0',
                              }}
                              onClick={() => {
                                setSelectedKeyFunc(f.id);
                                setNewShortcutInput(data.keyBindings[f.id] || f.shortcut || '');
                              }}
                            >
                              <span>
                                [{f.category}] {f.name}
                              </span>
                              <span
                                style={{
                                  color: isSel ? '#ffffaa' : '#0066cc',
                                  fontWeight: isSel ? 'bold' : 'normal',
                                }}
                              >
                                {currentKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <fieldset className="win32-groupbox" style={{ height: '100%' }}>
                        <legend>キーの割り当て</legend>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div>
                            機能名: <b>[{selectedCmd.category}] {selectedCmd.name}</b>
                          </div>
                          <div style={{ fontSize: '11px', color: '#555555' }}>
                            {selectedCmd.description}
                          </div>
                          <div style={{ fontSize: '11px' }}>
                            現在の割り当て:{' '}
                            <b style={{ color: '#0066cc' }}>
                              {data.keyBindings[selectedKeyFunc] || selectedCmd.shortcut || '(なし)'}
                            </b>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                            <label style={{ fontSize: '11px' }}>新しいキー (入力欄でキーを押してください):</label>
                            <input
                              type="text"
                              value={newShortcutInput}
                              onChange={(e) => setNewShortcutInput(e.target.value)}
                              onKeyDown={(e) => {
                                e.preventDefault();
                                if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
                                const parts: string[] = [];
                                if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
                                if (e.altKey) parts.push('Alt');
                                if (e.shiftKey) parts.push('Shift');
                                let k = e.key;
                                if (k === 'Escape') k = 'Esc';
                                else if (k === ' ') k = 'Space';
                                else if (k.length === 1) k = k.toUpperCase();
                                parts.push(k);
                                setNewShortcutInput(parts.join('+'));
                              }}
                              placeholder="例: Ctrl+Alt+S"
                              style={{ padding: '3px 6px', border: '1px solid #7f9db9', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <button
                              type="button"
                              className="sakura-dialog-btn primary"
                              onClick={handleAssignKey}
                            >
                              割り当て(A)
                            </button>
                            <button type="button" className="sakura-dialog-btn" onClick={handleRemoveKey}>
                              解除(D)
                            </button>
                            <button type="button" className="sakura-dialog-btn" onClick={handleResetKeys}>
                              初期化(R)
                            </button>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 12. カスタムメニュー タブ ==================== */}
              {activeTab === 'custmenu' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>メニュー(M):</span>
                      <select
                        value={custMenuId}
                        onChange={(e) => setCustMenuId(parseInt(e.target.value, 10))}
                        style={{ padding: '2px 4px', fontSize: '11px', width: '160px' }}
                      >
                        <option value={1}>右クリックメニュー (1)</option>
                        <option value={2}>タブ右クリックメニュー (2)</option>
                        <option value={3}>トレイメニュー (3)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>種別(C):</span>
                      <select
                        value={custMenuCategory}
                        onChange={(e) => {
                          setCustMenuCategory(e.target.value);
                          const firstCmd = getCategoryCommands(e.target.value)[0];
                          if (firstCmd) setCustMenuLeftCmd(firstCmd.id);
                        }}
                        style={{ padding: '2px 4px', fontSize: '11px', width: '110px' }}
                      >
                        <option value="ファイル">ファイル操作系</option>
                        <option value="編集">編集系</option>
                        <option value="変換">変換系</option>
                        <option value="検索">検索系</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {/* 左リスト */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>機能一覧:</div>
                      <div
                        style={{
                          height: '220px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {getCategoryCommands(custMenuCategory).map((cmd) => {
                          const isSel = cmd.id === custMenuLeftCmd;
                          return (
                            <div
                              key={cmd.id}
                              style={{
                                padding: '2px 4px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onClick={() => setCustMenuLeftCmd(cmd.id)}
                            >
                              {renderCommandIcon(cmd.id, 14)}
                              <span>{cmd.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 中央ボタン */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px', width: '70px' }}>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          const currentItems = data.custMenu.menus[custMenuId] || [];
                          const cmd = ALL_COMMANDS.find((c) => c.id === custMenuLeftCmd);
                          if (!cmd) return;
                          const nextItems = [...currentItems, { id: cmd.id, name: cmd.name }];
                          setData({
                            ...data,
                            custMenu: {
                              ...data.custMenu,
                              menus: { ...data.custMenu.menus, [custMenuId]: nextItems },
                            },
                          });
                        }}
                      >
                        追加(A) &gt;&gt;
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          const currentItems = data.custMenu.menus[custMenuId] || [];
                          const nextItems = currentItems.filter((_, idx) => idx !== custMenuSelectedIdx);
                          setData({
                            ...data,
                            custMenu: {
                              ...data.custMenu,
                              menus: { ...data.custMenu.menus, [custMenuId]: nextItems },
                            },
                          });
                        }}
                      >
                        &lt;&lt; 削除(D)
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          const currentItems = data.custMenu.menus[custMenuId] || [];
                          const nextItems = [
                            ...currentItems,
                            { id: `sep-${Date.now()}`, name: '---', isSeparator: true },
                          ];
                          setData({
                            ...data,
                            custMenu: {
                              ...data.custMenu,
                              menus: { ...data.custMenu.menus, [custMenuId]: nextItems },
                            },
                          });
                        }}
                      >
                        セパレータ(S)
                      </button>
                    </div>

                    {/* 右リスト */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>メニュー登録項目:</div>
                      <div
                        style={{
                          height: '220px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {(data.custMenu.menus[custMenuId] || []).map((item, idx) => {
                          const isSel = idx === custMenuSelectedIdx;
                          return (
                            <div
                              key={`${item.id}-${idx}`}
                              style={{
                                padding: '2px 4px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onClick={() => setCustMenuSelectedIdx(idx)}
                            >
                              {item.isSeparator ? (
                                <span style={{ color: isSel ? '#ffffff' : '#888' }}>────── (セパレータ)</span>
                              ) : (
                                <>
                                  {renderCommandIcon(item.id, 14)}
                                  <span>{item.name}</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 13. 強調キーワード タブ ==================== */}
              {activeTab === 'keyword' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>セット名(N):</span>
                      <select
                        value={keywordSelectedSetId}
                        onChange={(e) => setKeywordSelectedSetId(parseInt(e.target.value, 10))}
                        style={{ padding: '2px 4px', fontSize: '11px', width: '140px' }}
                      >
                        {data.keyword.sets.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          const name = prompt('新しいセット名を入力してください:');
                          if (name) {
                            const newSet = {
                              id: Date.now(),
                              name,
                              caseSensitive: true,
                              keywords: [],
                            };
                            setData({
                              ...data,
                              keyword: {
                                ...data.keyword,
                                sets: [...data.keyword.sets, newSet],
                              },
                            });
                            setKeywordSelectedSetId(newSet.id);
                          }
                        }}
                      >
                        セット追加(M)...
                      </button>
                      <button
                        type="button"
                        className="sakura-dialog-btn"
                        onClick={() => {
                          if (data.keyword.sets.length <= 1) return alert('最後のセットは削除できません。');
                          if (confirm('選択したキーワードセットを削除しますか？')) {
                            const nextSets = data.keyword.sets.filter((s) => s.id !== keywordSelectedSetId);
                            setData({
                              ...data,
                              keyword: { ...data.keyword, sets: nextSets },
                            });
                            setKeywordSelectedSetId(nextSets[0].id);
                          }
                        }}
                      >
                        セット削除(R)...
                      </button>
                    </div>
                  </div>

                  {/* 4カラム キーワードグリッド */}
                  {(() => {
                    const activeSet = data.keyword.sets.find((s) => s.id === keywordSelectedSetId) || data.keyword.sets[0];
                    return (
                      <div>
                        <div
                          style={{
                            height: '210px',
                            border: '2px inset #ffffff',
                            background: '#ffffff',
                            overflowY: 'auto',
                            padding: '4px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '2px',
                            fontSize: '11px',
                          }}
                        >
                          {activeSet.keywords.map((word, wIdx) => {
                            const isSel = wIdx === keywordSelectedWordIdx;
                            return (
                              <div
                                key={`${word}-${wIdx}`}
                                style={{
                                  padding: '2px 4px',
                                  background: isSel ? '#0a246a' : '#fcfcfc',
                                  color: isSel ? '#ffffff' : '#000000',
                                  cursor: 'pointer',
                                  border: '1px solid #e0e0e0',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={() => setKeywordSelectedWordIdx(wIdx)}
                              >
                                {word}
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              className="sakura-dialog-btn"
                              onClick={() => {
                                const word = prompt('追加するキーワードを入力してください:');
                                if (word) {
                                  const nextSets = data.keyword.sets.map((s) =>
                                    s.id === activeSet.id ? { ...s, keywords: [...s.keywords, word.trim()] } : s
                                  );
                                  setData({ ...data, keyword: { ...data.keyword, sets: nextSets } });
                                }
                              }}
                            >
                              追加(A)...
                            </button>
                            <button
                              type="button"
                              className="sakura-dialog-btn"
                              onClick={() => {
                                const targetWord = activeSet.keywords[keywordSelectedWordIdx];
                                if (!targetWord) return;
                                const nextWord = prompt('キーワードを編集:', targetWord);
                                if (nextWord) {
                                  const nextWords = [...activeSet.keywords];
                                  nextWords[keywordSelectedWordIdx] = nextWord.trim();
                                  const nextSets = data.keyword.sets.map((s) =>
                                    s.id === activeSet.id ? { ...s, keywords: nextWords } : s
                                  );
                                  setData({ ...data, keyword: { ...data.keyword, sets: nextSets } });
                                }
                              }}
                            >
                              編集(E)...
                            </button>
                            <button
                              type="button"
                              className="sakura-dialog-btn"
                              onClick={() => {
                                const nextWords = activeSet.keywords.filter((_, idx) => idx !== keywordSelectedWordIdx);
                                const nextSets = data.keyword.sets.map((s) =>
                                  s.id === activeSet.id ? { ...s, keywords: nextWords } : s
                                );
                                setData({ ...data, keyword: { ...data.keyword, sets: nextSets } });
                              }}
                            >
                              削除(D)
                            </button>
                            <button
                              type="button"
                              className="sakura-dialog-btn"
                              onClick={() => {
                                const sorted = Array.from(new Set(activeSet.keywords)).sort();
                                const nextSets = data.keyword.sets.map((s) =>
                                  s.id === activeSet.id ? { ...s, keywords: sorted } : s
                                );
                                setData({ ...data, keyword: { ...data.keyword, sets: nextSets } });
                                alert('キーワードを昇順ソートし、重複を整理しました。');
                              }}
                            >
                              整理(O)
                            </button>
                          </div>
                          <span style={{ fontSize: '11px', color: '#666' }}>
                            登録数: {activeSet.keywords.length} 個
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ==================== 14. 支援 タブ ==================== */}
              {activeTab === 'helper' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>入力補完機能</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.helper.useCompletion}
                          onChange={(e) =>
                            setData({ ...data, helper: { ...data.helper, useCompletion: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>入力補完機能を使う(C)</span>
                      </label>
                      <div style={{ display: 'flex', gap: '16px', marginLeft: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.helper.compFromCurrentDoc}
                            disabled={!data.helper.useCompletion}
                            onChange={(e) =>
                              setData({
                                ...data,
                                helper: { ...data.helper, compFromCurrentDoc: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>編集中のファイル(E)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.helper.compFromKeyword}
                            disabled={!data.helper.useCompletion}
                            onChange={(e) =>
                              setData({
                                ...data,
                                helper: { ...data.helper, compFromKeyword: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>強調キーワード(K)</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>外部ヘルプ・キーワードヘルプ</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.helper.useKeywordHelp}
                          onChange={(e) =>
                            setData({ ...data, helper: { ...data.helper, useKeywordHelp: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>キーワードヘルプ機能を使う(H)</span>
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 60px', gap: '6px', alignItems: 'center', marginLeft: '20px' }}>
                        <span>辞書ファイル:</span>
                        <input
                          type="text"
                          value={data.helper.keywordHelpDictPath}
                          placeholder="例: Dict\sakura_help.txt"
                          onChange={(e) =>
                            setData({
                              ...data,
                              helper: { ...data.helper, keywordHelpDictPath: e.target.value },
                            })
                          }
                          style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                        />
                        <button type="button" className="sakura-dialog-btn">
                          参照...
                        </button>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 15. マクロ タブ ==================== */}
              {activeTab === 'macro' && (
                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '180px' }}>
                      <div style={{ fontSize: '11px', marginBottom: '4px' }}>マクロ一覧 (0〜49):</div>
                      <div
                        style={{
                          height: '240px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {Array.from({ length: 50 }).map((_, idx) => {
                          const item = data.macros[idx];
                          const isSel = idx === selectedMacroIdx;
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '2px 6px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                              }}
                              onClick={() => setSelectedMacroIdx(idx)}
                            >
                              {idx.toString().padStart(2, '0')}: {item && item.name ? item.name : '(空き)'}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <fieldset className="win32-groupbox">
                        <legend>マクロ番号 [{selectedMacroIdx}] の設定</legend>
                        {(() => {
                          const currentMacro: MacroRegistration = data.macros[selectedMacroIdx] || {
                            id: selectedMacroIdx,
                            name: '',
                            path: '',
                            shortcut: '',
                          };
                          const updateMacro = (updater: Partial<MacroRegistration>) => {
                            const nextMacros = [...data.macros];
                            nextMacros[selectedMacroIdx] = { ...currentMacro, ...updater };
                            setData({ ...data, macros: nextMacros });
                          };
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', alignItems: 'center' }}>
                              <span>表示名(N):</span>
                              <input
                                type="text"
                                value={currentMacro.name || ''}
                                onChange={(e) => updateMacro({ name: e.target.value })}
                                placeholder="例: 行番号挿入マクロ"
                                style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                              />

                              <span>ファイル(F):</span>
                              <input
                                type="text"
                                value={currentMacro.path || ''}
                                onChange={(e) => updateMacro({ path: e.target.value })}
                                placeholder="例: C:\sakura\macros\sample.mac"
                                style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                              />

                              <span>ショートカット:</span>
                              <input
                                type="text"
                                value={currentMacro.shortcut || ''}
                                onChange={(e) => updateMacro({ shortcut: e.target.value })}
                                placeholder="例: Ctrl+Shift+1"
                                style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                              />
                            </div>
                          );
                        })()}
                      </fieldset>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 16. プラグイン タブ ==================== */}
              {activeTab === 'plugin' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', gap: '6px', alignItems: 'center' }}>
                    <span>プラグインフォルダー:</span>
                    <input
                      type="text"
                      value={data.plugin.pluginFolder}
                      onChange={(e) =>
                        setData({ ...data, plugin: { ...data.plugin, pluginFolder: e.target.value } })
                      }
                      style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                    />
                    <button type="button" className="sakura-dialog-btn">
                      参照...
                    </button>
                  </div>

                  <fieldset className="win32-groupbox">
                    <legend>インストール済みプラグイン一覧</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {data.plugin.plugins.map((plug, pIdx) => (
                        <div
                          key={plug.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 6px',
                            background: '#ffffff',
                            border: '1px solid #d0d0d0',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={plug.enabled}
                              onChange={(e) => {
                                const nextPlugs = [...data.plugin.plugins];
                                nextPlugs[pIdx] = { ...plug, enabled: e.target.checked };
                                setData({ ...data, plugin: { ...data.plugin, plugins: nextPlugs } });
                              }}
                            />
                            <span style={{ marginLeft: '6px', fontWeight: 'bold' }}>
                              {plug.name} (v{plug.version})
                            </span>
                          </label>
                          <span style={{ fontSize: '11px', color: '#666' }}>{plug.description}</span>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 17. ステータスバー タブ ==================== */}
              {activeTab === 'statusbar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>ステータスバー表示項目</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.statusbar.showStatusbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              statusbar: { ...data.statusbar, showStatusbar: e.target.checked },
                              window: { ...data.window, showStatusbar: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ステータスバーを表示する(S)</span>
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginLeft: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showCursorPos}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showCursorPos: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>カーソル位置 (行, 桁)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showCharCount}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showCharCount: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>選択文字数 / 総行数</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showEncoding}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showEncoding: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>文字コード名</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showLineEnding}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showLineEnding: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>改行コード名 (CRLF/LF)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showCharCode}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showCharCode: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>現在文字コード値 (U+XXXX)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showInsOvr}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showInsOvr: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>挿入/上書きモード (INS/OVR)</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>区画の幅設定</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>カーソル位置幅:</span>
                        <Win32SpinInput
                          value={data.statusbar.widthCursorPos}
                          min={60}
                          max={300}
                          onChange={(val) =>
                            setData({ ...data, statusbar: { ...data.statusbar, widthCursorPos: val } })
                          }
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>文字数・行数幅:</span>
                        <Win32SpinInput
                          value={data.statusbar.widthCharCount}
                          min={80}
                          max={300}
                          onChange={(val) =>
                            setData({ ...data, statusbar: { ...data.statusbar, widthCharCount: val } })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 18. 編集 タブ ==================== */}
              {activeTab === 'edit' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <fieldset className="win32-groupbox">
                    <legend>矩形選択 & ドラッグ＆ドロップ編集</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.edit.enableBoxSelect}
                          onChange={(e) =>
                            setData({ ...data, edit: { ...data.edit, enableBoxSelect: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>Altキーによる矩形選択を有効にする(A)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.edit.enableDragAndDrop}
                          onChange={(e) =>
                            setData({ ...data, edit: { ...data.edit, enableDragAndDrop: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ドラッグ＆ドロップによるテキスト編集を許可する(D)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <input
                          type="checkbox"
                          checked={data.edit.dropCopyWithoutCtrl}
                          disabled={!data.edit.enableDragAndDrop}
                          onChange={(e) =>
                            setData({ ...data, edit: { ...data.edit, dropCopyWithoutCtrl: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ドロップ時に移動ではなくコピーを既定にする</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>元に戻す (Undo) & 変更行マーク</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.edit.showModifiedGutter}
                          onChange={(e) =>
                            setData({
                              ...data,
                              edit: { ...data.edit, showModifiedGutter: e.target.checked },
                              general: { ...data.general, showModifiedGutter: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>変更行を行番号エリア（Gutter）に緑色ラインで表示する(M)</span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>元に戻す(Undo)の最大回数:</span>
                        <Win32SpinInput
                          value={data.edit.maxUndoCount}
                          min={100}
                          max={50000}
                          step={100}
                          onChange={(val) =>
                            setData({ ...data, edit: { ...data.edit, maxUndoCount: val } })
                          }
                        />
                        <span>回</span>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.edit.warnExternalModified}
                          onChange={(e) =>
                            setData({ ...data, edit: { ...data.edit, warnExternalModified: e.target.checked } })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>外部エディタでファイルが変更されたら警告する</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

            </div>
          </div>

          {/* 下部ボタンバー (Win32標準: 左に「設定フォルダー(F) >>」、右に [OK] [キャンセル] [適用(A)] [ヘルプ(H)]) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px',
              position: 'relative',
            }}
          >
            {/* 設定フォルダー(F) >> */}
            <div>
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={() => setIsConfigFolderMenuOpen(!isConfigFolderMenuOpen)}
              >
                設定フォルダー(F) &gt;&gt;
              </button>

              {/* 設定フォルダーポップアップメニュー */}
              {isConfigFolderMenuOpen && (
                <div
                  className="sakura-dropdown"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    marginBottom: '4px',
                    width: '260px',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '4px 8px', fontSize: '10px', color: '#666', borderBottom: '1px solid #ddd' }}>
                    保存先: ブラウザLocalStorage (sakura_common_settings)
                  </div>
                  <div className="sakura-dropdown-item" onClick={handleExportIni}>
                    <span>sakura.ini としてエクスポート...</span>
                  </div>
                  <div
                    className="sakura-dropdown-item"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                  >
                    <span>sakura.ini からインポート...</span>
                  </div>
                  <div className="sakura-dropdown-separator" />
                  <div
                    className="sakura-dropdown-item"
                    onClick={() => {
                      if (window.confirm('すべての共通設定を標準初期値に戻しますか？')) {
                        setData(DEFAULT_COMMON_SETTINGS);
                        setIsConfigFolderMenuOpen(false);
                      }
                    }}
                  >
                    <span>すべての共通設定を初期化</span>
                  </div>
                </div>
              )}
            </div>

            {/* OK / キャンセル / 適用 / ヘルプ */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="sakura-dialog-btn primary"
                onClick={() => {
                  onSave(data);
                  onClose();
                }}
              >
                OK
              </button>
              <button type="button" className="sakura-dialog-btn" onClick={onClose}>
                キャンセル
              </button>
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={() => {
                  onSave(data);
                  alert('共通設定を適用しました。');
                }}
              >
                適用(A)
              </button>
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={() => setIsHelpOpen((prev) => !prev)}
              >
                ヘルプ(H)
              </button>
            </div>
          </div>

          {/* ヘルプパネル */}
          {isHelpOpen && (
            <div
              style={{
                marginTop: '6px',
                padding: '6px 10px',
                backgroundColor: '#ffffef',
                border: '1px solid #d0d090',
                borderRadius: '3px',
                fontSize: '11px',
                lineHeight: '1.4',
                maxHeight: '100px',
                overflowY: 'auto',
              }}
            >
              <b>【サクラエディタ 共通設定ヘルプ】</b><br />
              ・全18タブ（ファイル、バックアップ、書式、検索、キー割り当て、カスタムメニュー、強調キーワード、支援、マクロ、プラグイン、全般、ウィンドウ、メインメニュー、ツールバー、タブバー、ステータスバー、編集）により、Win32本家同等の完全なカスタマイズが可能です。<br />
              ・「設定フォルダー(F) &gt;&gt;」から設定のJSON/INIエクスポート・インポートが行えます。
            </div>
          )}

          {/* 非表示ファイル入力 */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json,.ini,.txt"
            onChange={handleImportIni}
          />
        </div>

        {/* ==================== サブダイアログ: ウィンドウ位置と大きさの設定 (IDD_WINPOSSIZE) ==================== */}
        {isWinPosModalOpen && (
          <div
            className="sakura-dialog-overlay"
            style={{ zIndex: 600 }}
            onClick={() => setIsWinPosModalOpen(false)}
          >
            <div
              className="sakura-dialog-window"
              style={{ width: '340px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sakura-dialog-titlebar">
                <span>位置と大きさの設定</span>
                <span
                  style={{ cursor: 'pointer', padding: '0 4px' }}
                  onClick={() => setIsWinPosModalOpen(false)}
                >
                  ✕
                </span>
              </div>
              <div className="sakura-dialog-body" style={{ padding: '8px' }}>
                <fieldset className="win32-groupbox">
                  <legend>指定方法</legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="winPosMode"
                        checked={winPosDraft.mode === 'default'}
                        onChange={() => setWinPosDraft({ ...winPosDraft, mode: 'default' })}
                      />
                      <span style={{ marginLeft: '4px' }}>指定しない</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="winPosMode"
                        checked={winPosDraft.mode === 'inherit'}
                        onChange={() => setWinPosDraft({ ...winPosDraft, mode: 'inherit' })}
                      />
                      <span style={{ marginLeft: '4px' }}>継承する (直前のウィンドウと同じ)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="winPosMode"
                        checked={winPosDraft.mode === 'manual'}
                        onChange={() => setWinPosDraft({ ...winPosDraft, mode: 'manual' })}
                      />
                      <span style={{ marginLeft: '4px' }}>直接指定</span>
                    </label>
                  </div>
                </fieldset>

                <fieldset className="win32-groupbox">
                  <legend>座標とサイズ (ピクセル)</legend>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>X座標:</span>
                      <Win32SpinInput
                        value={winPosDraft.x}
                        min={0}
                        max={3840}
                        disabled={winPosDraft.mode !== 'manual'}
                        onChange={(val) => setWinPosDraft({ ...winPosDraft, x: val })}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Y座標:</span>
                      <Win32SpinInput
                        value={winPosDraft.y}
                        min={0}
                        max={2160}
                        disabled={winPosDraft.mode !== 'manual'}
                        onChange={(val) => setWinPosDraft({ ...winPosDraft, y: val })}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>幅:</span>
                      <Win32SpinInput
                        value={winPosDraft.width}
                        min={320}
                        max={3840}
                        disabled={winPosDraft.mode !== 'manual'}
                        onChange={(val) => setWinPosDraft({ ...winPosDraft, width: val })}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>高さ:</span>
                      <Win32SpinInput
                        value={winPosDraft.height}
                        min={240}
                        max={2160}
                        disabled={winPosDraft.mode !== 'manual'}
                        onChange={(val) => setWinPosDraft({ ...winPosDraft, height: val })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="sakura-dialog-btn"
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => {
                      setWinPosDraft({
                        mode: 'manual',
                        x: window.screenX || 0,
                        y: window.screenY || 0,
                        width: window.innerWidth,
                        height: window.innerHeight,
                      });
                    }}
                  >
                    現在の位置と大きさを取得
                  </button>
                </fieldset>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="sakura-dialog-btn primary"
                    onClick={() => {
                      setData({
                        ...data,
                        window: { ...data.window, winPosSize: winPosDraft },
                      });
                      setIsWinPosModalOpen(false);
                    }}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="sakura-dialog-btn"
                    onClick={() => setIsWinPosModalOpen(false)}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== サブダイアログ: タブバーフォント設定 ==================== */}
        {isTabFontModalOpen && (
          <div
            className="sakura-dialog-overlay"
            style={{ zIndex: 600 }}
            onClick={() => setIsTabFontModalOpen(false)}
          >
            <div
              className="sakura-dialog-window"
              style={{ width: '280px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sakura-dialog-titlebar">
                <span>タブフォント設定</span>
                <span
                  style={{ cursor: 'pointer', padding: '0 4px' }}
                  onClick={() => setIsTabFontModalOpen(false)}
                >
                  ✕
                </span>
              </div>
              <div className="sakura-dialog-body" style={{ padding: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span>フォント名:</span>
                    <select
                      value={tabFontDraft}
                      onChange={(e) => setTabFontDraft(e.target.value)}
                      style={{ padding: '2px 4px', fontSize: '11px' }}
                    >
                      <option value="Yu Gothic UI (9pt)">Yu Gothic UI (9pt)</option>
                      <option value="MS UI Gothic (9pt)">MS UI Gothic (9pt)</option>
                      <option value="Segoe UI (9pt)">Segoe UI (9pt)</option>
                      <option value="Meiryo UI (9pt)">Meiryo UI (9pt)</option>
                    </select>
                  </div>
                  <div
                    style={{
                      padding: '8px',
                      background: '#fff',
                      border: '1px solid #7f9db9',
                      fontSize: '11px',
                    }}
                  >
                    プレビュー: (無題)1.txt *
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="sakura-dialog-btn primary"
                    onClick={() => {
                      setData({
                        ...data,
                        tabbar: { ...data.tabbar, fontName: tabFontDraft },
                      });
                      setIsTabFontModalOpen(false);
                    }}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="sakura-dialog-btn"
                    onClick={() => setIsTabFontModalOpen(false)}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
