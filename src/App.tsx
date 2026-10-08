import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TextBuffer } from './core/buffer/TextBuffer';
import { UndoManager } from './core/buffer/UndoManager';
import { CharEncoding } from './core/encoding/CharEncoding';
import { SearchEngine, type SearchOptions } from './core/search/SearchEngine';
import type { CharacterEncoding, LineEnding, Position, SelectionRange } from './core/buffer/types';
import { BookmarkManager, BracketMatcher } from './core/navigation/BookmarkManager';
import { TextTransform } from './core/transform/TextTransform';
import { MacroEngine, MacroRecorder } from './core/macro/MacroEngine';
import { SakuraIni } from './core/config/SakuraIni';
import { MenuBar, type MenuGroup } from './ui/components/MenuBar';
import { ToolBar } from './ui/components/ToolBar';
import { TabBar } from './ui/components/TabBar';
import { StatusBar } from './ui/components/StatusBar';
import { EditorView } from './ui/components/EditorView';
import { SearchDialog } from './ui/components/Dialogs/SearchDialog';
import { TypeSettingDialog, type TypeSettingTabKey } from './ui/components/Dialogs/TypeSettingDialog';
import { TypeListDialog } from './ui/components/Dialogs/TypeListDialog';
import { DEFAULT_TYPE_SETTINGS, type TypeSettingItem } from './core/config/TypeSettingsModel';
import { GrepDialog } from './ui/components/Dialogs/GrepDialog';
import { EncodingDialog } from './ui/components/Dialogs/EncodingDialog';
import { AboutDialog } from './ui/components/Dialogs/AboutDialog';
import { DiffDialog } from './ui/components/Dialogs/DiffDialog';
import { JumpDialog } from './ui/components/Dialogs/JumpDialog';
import { NumberingDialog } from './ui/components/Dialogs/NumberingDialog';
import { MacroDialog } from './ui/components/Dialogs/MacroDialog';
import { CommonSettingDialog, type CommonTabKey } from './ui/components/Dialogs/CommonSettingDialog';
import { OutlineDialog } from './ui/components/Dialogs/OutlineDialog';
import { FilePropertyDialog } from './ui/components/Dialogs/FilePropertyDialog';
import { PageSetupDialog } from './ui/components/Dialogs/PageSetupDialog';
import { ExternalToolDialog } from './ui/components/Dialogs/ExternalToolDialog';
import { PrintPreviewDialog } from './ui/components/Dialogs/PrintPreviewDialog';
import { CommandListDialog } from './ui/components/Dialogs/CommandListDialog';
import { FontDialog } from './ui/components/Dialogs/FontDialog';
import { IncrementalSearchBar } from './ui/components/IncrementalSearchBar';
import type { GrepExecuteParams, GrepResultItem } from './ui/components/Dialogs/GrepDialog';
import { FileTreePanel } from './ui/components/FileTreePanel';
import { TitleBar } from './ui/components/TitleBar';
import { FunctionKeyBar } from './ui/components/FunctionKeyBar';
import { DEFAULT_COMMON_SETTINGS, type CommonSettingsModel, type MacroRegistration } from './core/config/CommonSettingsModel';
import { PlatformService } from './core/platform/PlatformService';
import type { InputBridge } from './input/InputBridge';
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
  GrepReplaceIcon,
  BookmarkIcon,
  BmNextIcon,
  BmPrevIcon,
  BmClearIcon,
  JumpIcon,
  OutlineIcon,
  FileTreeIcon,
  DiffIcon,
  BracketMatchIcon,
  TypeListIcon,
  TypeSettingsIcon,
  CommonSettingsIcon,
  FontIcon,
  ExportIniIcon,
  ImportIniIcon,
  WindowSplitIcon,
  MacroRecIcon,
  MacroPlayIcon,
  AboutIcon,
  IndentRightIcon,
  IndentLeftIcon,
  SaveCloseIcon,
  CloseUntitledIcon,
  CloseOpenIcon,
  PrintSetupIcon,
  GroupCloseIcon,
  ExitAllEditIcon,
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
  ZenKataToHanIcon,
  HanKataToZenIcon,
  HanKataToZenHiraIcon,
  TabToSpaceIcon,
  SpaceToTabIcon,
  ReturnSearchOriginIcon,
  TagJumpIcon,
  TagJumpBackIcon,
  TagCreateIcon,
  HeaderSourceIcon,
  DiffNextIcon,
  DiffPrevIcon,
  DiffClearIcon,
  WordCompleteIcon,
  CommandListIcon,
  IncSearchIcon,
  SplitQuadIcon,
} from './ui/components/Icons/SakuraIcons';
import './ui/styles/sakura-theme.css';

interface TabDoc {
  id: string;
  title: string;
  buffer: TextBuffer;
  encoding: CharacterEncoding;
  lineEnding: LineEnding;
  isModified: boolean;
  fileHandle?: any;
  rawBytes?: Uint8Array;
  cursor: Position;
  selection: SelectionRange | null;
  bookmarkManager: BookmarkManager;
  undoManager: UndoManager;
  diffMarks?: Map<number, 'add' | 'del' | 'mod'>;
}

const SAMPLE_TEXT = `【サクラエディタ Web SPA 完全クローンへようこそ】🌸
本エディタは、サクラエディタ（Sakura Editor）の動作・外観・速度・仕様を
ブラウザ上で完全再現したプロフェッショナル向けテキストエディタです。

■ 忠実に再現された機能群
1. 特殊記号の可視化：
   ・全角空白：　（薄い緑色の四角「□」）
   ・半角空白： (薄いドット)
   ・タブ記号：\t（青い右矢印「─→」）
   ・改行記号：行末の青緑色エンター矢印「↵」および「↓」
   ・[EOF]：ファイル末尾のインジケータ（水色枠・右端まで青実線）

2. 矩形選択（Alt + ドラッグ）＆ ガター操作：
   ・[Alt] キーを押しながらドラッグすると矩形選択が可能です！
   ・行番号列をクリック/ドラッグすると行全体を一括選択できます！
   ・行番号左端のブックマーク列をクリックするとワンクリックで●が設定されます！

3. ブックマーク（F11 / F2）：
   ・[F11] キーで現在行に行番号横の青丸「●」ブックマークを設定/解除！
   ・[F2] キーで次のブックマークへジャンプ、[Shift+F2] で前へ！

4. 対括弧の強調 & ジャンプ (Ctrl+[)：
   ・括弧 (), [], {}, 「」 の位置で [Ctrl+[] を押すと対の括弧へ瞬間ジャンプ！

5. 文字種変換（変換メニュー）：
   ・全角 ↔ 半角、ひらがな ↔ カタカナ、大文字 ↔ 小文字、TAB ↔ 空白
   ・行の昇順/降順ソート、重複行削除、行の二重化 (Ctrl+D)

6. アウトライン解析（F11 / ツールバー）：
   ・Markdown見出し、各言語の関数・クラス・構造体、テキスト章見出しをツリー一覧化
   ・ダブルクリックで該当行へ瞬間ジャンプ！

7. ウィンドウ画面分割（縦分割 / 横分割）：
   ・ツールバー分割アイコンまたはウィンドウメニューから、同一文書を独立スクロール・編集可能！

8. ファイルツリー（サイドバー）：
   ・開いている文書一覧および全ブックマークを左側にドッキング表示！

9. タグジャンプ（F12 / Shift+F12）：
   ・関数やクラスの定義行へ瞬間ジャンプ、[Shift+F12] で元の位置へ復帰！

サクラエディタと全く同じ操作感・ショートカットキー・クラシックUIでお使いいただけます。`;

export const App: React.FC = () => {
  // 初期ドキュメント
  const [tabs, setTabs] = useState<TabDoc[]>(() => [
    {
      id: 'tab-1',
      title: '(無題)1',
      buffer: new TextBuffer(SAMPLE_TEXT, 'CRLF'),
      encoding: 'Shift_JIS',
      lineEnding: 'CRLF',
      isModified: false,
      cursor: { line: 0, column: 0 },
      selection: null,
      bookmarkManager: new BookmarkManager(),
      undoManager: new UndoManager(),
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // 最近使ったファイル履歴
  const [recentFiles, setRecentFiles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sakura_recent_files');
      return saved ? JSON.parse(saved) : ['(無題)1'];
    } catch {
      return ['(無題)1'];
    }
  });

  const addRecentFile = useCallback((name: string) => {
    setRecentFiles((prev) => {
      const next = [name, ...prev.filter((f) => f !== name)].slice(0, 10);
      try {
        localStorage.setItem('sakura_recent_files', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // 画面分割状態 (none, vertical, horizontal, quad)
  const [splitMode, setSplitMode] = useState<'none' | 'vertical' | 'horizontal' | 'quad'>('none');
  const [cursor2, setCursor2] = useState<Position>({ line: 0, column: 0 });
  const [selection2, setSelection2] = useState<SelectionRange | null>(null);
  const inputBridgeRef2 = useRef<InputBridge | null>(null);

  const [cursor3, setCursor3] = useState<Position>({ line: 0, column: 0 });
  const [selection3, setSelection3] = useState<SelectionRange | null>(null);
  const inputBridgeRef3 = useRef<InputBridge | null>(null);

  const [cursor4, setCursor4] = useState<Position>({ line: 0, column: 0 });
  const [selection4, setSelection4] = useState<SelectionRange | null>(null);
  const inputBridgeRef4 = useRef<InputBridge | null>(null);

  // ファイルツリー (サイドバー)
  const [isTreeOpen, setIsTreeOpen] = useState(false);

  // タグジャンプスタック
  const [tagJumpStack, setTagJumpStack] = useState<Position[]>([]);

  // 検索開始位置
  const [searchOriginPos, setSearchOriginPos] = useState<Position | null>(null);

  // タイプ別設定リスト & 現在適用中のタイプID
  const [typeSettingsList, setTypeSettingsList] = useState<TypeSettingItem[]>(DEFAULT_TYPE_SETTINGS);
  const [activeTypeId, setActiveTypeId] = useState<string>('type-text');
  const [editingTypeItem, setEditingTypeItem] = useState<TypeSettingItem | null>(null);

  // 現在のドキュメントに適用されているタイプ設定
  const activeTypeSetting =
    typeSettingsList.find((t) => t.id === activeTypeId) || typeSettingsList[0];

  // ファイル名からタイプ設定を自動判別
  const detectTypeFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (!ext) return 'type-text';
    for (const item of typeSettingsList) {
      const extList = item.extensions.split(',').map((e) => e.trim().toLowerCase());
      if (extList.includes(ext)) {
        return item.id;
      }
    }
    return 'type-text';
  };

  // 検索ハイライト
  const [searchHighlight, setSearchHighlight] = useState<{
    query: string;
    isRegex: boolean;
    matchCase: boolean;
  } | null>(null);

  // マクロレコーダー
  const macroRecorderRef = useRef<MacroRecorder>(new MacroRecorder());
  const [isRecordingMacro, setIsRecordingMacro] = useState(false);
  const [lastMacroScript, setLastMacroScript] = useState('');

  // ステータス表示情報
  const [visualCol, setVisualCol] = useState(0);
  const [currentCharCode, setCurrentCharCode] = useState('');

  // ダイアログ状態
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [isTypeListOpen, setIsTypeListOpen] = useState(false);
  const [isTypeSettingsOpen, setIsTypeSettingsOpen] = useState(false);
  const [isGrepOpen, setIsGrepOpen] = useState(false);
  const [isEncodingOpen, setIsEncodingOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [isNumberingOpen, setIsNumberingOpen] = useState(false);
  const [isMacroOpen, setIsMacroOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isPropertyOpen, setIsPropertyOpen] = useState(false);
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [isCommandListOpen, setIsCommandListOpen] = useState(false);
  const [isExternalToolOpen, setIsExternalToolOpen] = useState(false);
  const [isCommonSettingsOpen, setIsCommonSettingsOpen] = useState(false);
  const [commonSettingInitialTab, setCommonSettingInitialTab] = useState<CommonTabKey>('general');
  const [typeSettingInitialTab, setTypeSettingInitialTab] = useState<TypeSettingTabKey>('screen');
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isGrepReplaceMode, setIsGrepReplaceMode] = useState(false);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [commonSettings, setCommonSettings] = useState<CommonSettingsModel>(DEFAULT_COMMON_SETTINGS);

  // インクリメンタルサーチ状態
  const [isIncSearchOpen, setIsIncSearchOpen] = useState(false);
  const [incSearchQuery, setIncSearchQuery] = useState('');
  const [incSearchMatchCase, setIncSearchMatchCase] = useState(false);
  const [incSearchIsRegex, setIncSearchIsRegex] = useState(false);

  const inputBridgeRef = useRef<InputBridge | null>(null);

  // アクティブドキュメント
  const currentDoc = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // タイトルバー・ブラウザタブタイトル同期 (サクラエディタ標準書式)
  useEffect(() => {
    document.title = `${currentDoc.title}${currentDoc.isModified ? ' *' : ''} - サクラエディタ32bit 2.4.3.7173`;
  }, [currentDoc.title, currentDoc.isModified]);

  // 選択範囲文字数・行数計算 (ステータスバー連動)
  const selectedInfo = useMemo(() => {
    if (!currentDoc.selection) return { chars: 0, lines: 0 };
    if (
      currentDoc.selection.isBoxSelect &&
      currentDoc.selection.boxStartCol !== undefined &&
      currentDoc.selection.boxEndCol !== undefined
    ) {
      const sLine = Math.min(currentDoc.selection.start.line, currentDoc.selection.end.line);
      const eLine = Math.max(currentDoc.selection.start.line, currentDoc.selection.end.line);
      const sCol = Math.min(currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
      const eCol = Math.max(currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
      const lines = eLine - sLine + 1;
      const chars = lines * Math.abs(eCol - sCol);
      return { chars, lines };
    }
    const text = currentDoc.buffer.getTextInRange(currentDoc.selection);
    let sL = currentDoc.selection.start.line;
    let eL = currentDoc.selection.end.line;
    if (sL > eL) {
      const tmp = sL;
      sL = eL;
      eL = tmp;
    }
    const lines = eL - sL + 1;
    return { chars: text.length, lines };
  }, [currentDoc.selection, currentDoc.buffer]);

  // ドキュメント更新トリガー
  const updateCurrentDoc = useCallback((updater: (doc: TabDoc) => TabDoc) => {
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? updater(t) : t)));
  }, [activeTabId]);

  // アンドゥ用スナップショットの保存
  const pushUndoState = useCallback(() => {
    currentDoc.undoManager.pushState({
      text: currentDoc.buffer.getText(),
      cursor: { ...currentDoc.cursor },
      selection: currentDoc.selection ? { ...currentDoc.selection } : null,
    });
  }, [currentDoc]);

  // 元に戻す (Ctrl+Z)
  const handleUndo = useCallback(() => {
    const prev = currentDoc.undoManager.undo({
      text: currentDoc.buffer.getText(),
      cursor: { ...currentDoc.cursor },
      selection: currentDoc.selection ? { ...currentDoc.selection } : null,
    });
    if (prev) {
      currentDoc.buffer.setText(prev.text);
      updateCurrentDoc((d) => ({
        ...d,
        cursor: prev.cursor,
        selection: prev.selection,
        isModified: true,
      }));
    }
  }, [currentDoc, updateCurrentDoc]);

  // やり直し (Ctrl+Y)
  const handleRedo = useCallback(() => {
    const next = currentDoc.undoManager.redo({
      text: currentDoc.buffer.getText(),
      cursor: { ...currentDoc.cursor },
      selection: currentDoc.selection ? { ...currentDoc.selection } : null,
    });
    if (next) {
      currentDoc.buffer.setText(next.text);
      updateCurrentDoc((d) => ({
        ...d,
        cursor: next.cursor,
        selection: next.selection,
        isModified: true,
      }));
    }
  }, [currentDoc, updateCurrentDoc]);

  // 切り取り (Ctrl+X / F7)
  const handleCut = useCallback(async () => {
    if (!currentDoc.selection) return;
    pushUndoState();
    const textToCut = currentDoc.buffer.getTextInRange(currentDoc.selection);
    try {
      await navigator.clipboard.writeText(textToCut);
    } catch {}
    if (currentDoc.selection.isBoxSelect && currentDoc.selection.boxStartCol !== undefined && currentDoc.selection.boxEndCol !== undefined) {
      currentDoc.buffer.deleteBox(currentDoc.selection.start.line, currentDoc.selection.end.line, currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
    } else {
      currentDoc.buffer.deleteRange(currentDoc.selection);
    }
    updateCurrentDoc((d) => ({ ...d, selection: null, isModified: true }));
  }, [currentDoc, pushUndoState, updateCurrentDoc]);

  // コピー (Ctrl+C / F8)
  const handleCopy = useCallback(async () => {
    if (!currentDoc.selection) return;
    const textToCopy = currentDoc.buffer.getTextInRange(currentDoc.selection);
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {}
  }, [currentDoc]);

  // 貼り付け (Ctrl+V / F9)
  const handlePaste = useCallback(async () => {
    try {
      const textToPaste = await navigator.clipboard.readText();
      if (!textToPaste) return;
      pushUndoState();
      if (currentDoc.selection) {
        if (currentDoc.selection.isBoxSelect && currentDoc.selection.boxStartCol !== undefined && currentDoc.selection.boxEndCol !== undefined) {
          currentDoc.buffer.deleteBox(currentDoc.selection.start.line, currentDoc.selection.end.line, currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
        } else {
          currentDoc.buffer.deleteRange(currentDoc.selection);
        }
      }
      const newPos = currentDoc.buffer.insert(currentDoc.cursor, textToPaste);
      updateCurrentDoc((d) => ({ ...d, cursor: newPos, selection: null, isModified: true }));
    } catch (e) {
      console.error(e);
    }
  }, [currentDoc, pushUndoState, updateCurrentDoc]);

  // 削除 (Del)
  const handleDelete = useCallback(() => {
    pushUndoState();
    if (currentDoc.selection) {
      if (currentDoc.selection.isBoxSelect && currentDoc.selection.boxStartCol !== undefined && currentDoc.selection.boxEndCol !== undefined) {
        currentDoc.buffer.deleteBox(currentDoc.selection.start.line, currentDoc.selection.end.line, currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
      } else {
        currentDoc.buffer.deleteRange(currentDoc.selection);
      }
      updateCurrentDoc((d) => ({ ...d, selection: null, isModified: true }));
    } else {
      const curLine = currentDoc.buffer.getLine(currentDoc.cursor.line);
      if (currentDoc.cursor.column < curLine.length) {
        currentDoc.buffer.deleteRange({
          start: currentDoc.cursor,
          end: { line: currentDoc.cursor.line, column: currentDoc.cursor.column + 1 },
          isBoxSelect: false,
        });
        updateCurrentDoc((d) => ({ ...d, isModified: true }));
      } else if (currentDoc.cursor.line < currentDoc.buffer.getLineCount() - 1) {
        currentDoc.buffer.deleteRange({
          start: currentDoc.cursor,
          end: { line: currentDoc.cursor.line + 1, column: 0 },
          isBoxSelect: false,
        });
        updateCurrentDoc((d) => ({ ...d, isModified: true }));
      }
    }
  }, [currentDoc, pushUndoState, updateCurrentDoc]);

  // すべて選択 (Ctrl+A)
  const handleSelectAll = useCallback(() => {
    const lineCount = currentDoc.buffer.getLineCount();
    const lastLineLen = currentDoc.buffer.getLine(lineCount - 1).length;
    updateCurrentDoc((d) => ({
      ...d,
      cursor: { line: lineCount - 1, column: lastLineLen },
      selection: {
        start: { line: 0, column: 0 },
        end: { line: lineCount - 1, column: lastLineLen },
        isBoxSelect: false,
      },
    }));
  }, [currentDoc, updateCurrentDoc]);

  // 単語を選択
  const handleSelectWord = useCallback(() => {
    const lineText = currentDoc.buffer.getLine(currentDoc.cursor.line);
    if (!lineText) return;
    let startCol = currentDoc.cursor.column;
    let endCol = currentDoc.cursor.column;
    const isWordChar = (ch: string) => /[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(ch);
    while (startCol > 0 && isWordChar(lineText[startCol - 1])) startCol--;
    while (endCol < lineText.length && isWordChar(lineText[endCol])) endCol++;
    if (startCol < endCol) {
      updateCurrentDoc((d) => ({
        ...d,
        cursor: { line: d.cursor.line, column: endCol },
        selection: {
          start: { line: d.cursor.line, column: startCol },
          end: { line: d.cursor.line, column: endCol },
          isBoxSelect: false,
        },
      }));
    }
  }, [currentDoc, updateCurrentDoc]);

  // 再変換 (全角半角/大文字小文字の反転)
  const handleReconvert = useCallback(() => {
    if (!currentDoc.selection) {
      handleSelectWord();
    }
    const fullText = currentDoc.buffer.getText();
    pushUndoState();
    if (/[a-z]/.test(fullText)) {
      currentDoc.buffer.setText(TextTransform.toUpperCase(fullText));
    } else if (/[A-Z]/.test(fullText)) {
      currentDoc.buffer.setText(TextTransform.toLowerCase(fullText));
    } else {
      currentDoc.buffer.setText(TextTransform.toFullWidth(fullText));
    }
    updateCurrentDoc((d) => ({ ...d, isModified: true }));
  }, [currentDoc, handleSelectWord, pushUndoState, updateCurrentDoc]);

  // CRLF改行でコピー
  const handleCopyCrlf = useCallback(async () => {
    if (!currentDoc.selection) return;
    const text = currentDoc.buffer.getTextInRange(currentDoc.selection);
    const crlfText = text.replace(/\r\n|\r|\n/g, '\r\n');
    try {
      await navigator.clipboard.writeText(crlfText);
    } catch {}
  }, [currentDoc]);

  // 折り返し位置に改行をつけてコピー
  const handleCopyWrap = useCallback(async () => {
    if (!currentDoc.selection) return;
    const wrapCol = activeTypeSetting.wrapConfig.wrapColumn || 80;
    const rawText = currentDoc.buffer.getTextInRange(currentDoc.selection);
    const lines = rawText.split(/\r\n|\r|\n/);
    const wrappedLines: string[] = [];
    for (const l of lines) {
      if (l.length <= wrapCol) {
        wrappedLines.push(l);
      } else {
        for (let i = 0; i < l.length; i += wrapCol) {
          wrappedLines.push(l.slice(i, i + wrapCol));
        }
      }
    }
    try {
      await navigator.clipboard.writeText(wrappedLines.join('\r\n'));
    } catch {}
  }, [currentDoc, activeTypeSetting]);

  // 矩形貼り付け
  const handleBoxPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;
      pushUndoState();
      const pasteLines = text.split(/\r\n|\r|\n/);
      const startLine = currentDoc.cursor.line;
      const endLine = startLine + pasteLines.length - 1;
      currentDoc.buffer.insertBox(startLine, endLine, currentDoc.cursor.column, pasteLines);
      updateCurrentDoc((d) => ({ ...d, isModified: true }));
    } catch {}
  }, [currentDoc, pushUndoState, updateCurrentDoc]);

  // 対括弧の検索 (Ctrl+[)
  const handleMatchBracket = useCallback(() => {
    const match = BracketMatcher.findMatchingBracket(currentDoc.buffer, currentDoc.cursor);
    if (match) {
      updateCurrentDoc((d) => ({ ...d, cursor: match, selection: null }));
    } else {
      alert('カーソル位置に対になる括弧が見つかりませんでした。');
    }
  }, [currentDoc, updateCurrentDoc]);

  // Grep結果行やタグ行からの直接ジャンプ
  const handleJumpFromGrepOrTag = useCallback((lineText: string) => {
    const match = lineText.match(/^([^(:\\s]+)\((\d+)(?:,\s*(\d+))?\)/);
    if (!match) return;
    const targetFilename = match[1].trim();
    const targetLine = Math.max(0, parseInt(match[2], 10) - 1);
    const targetCol = match[3] ? Math.max(0, parseInt(match[3], 10) - 1) : 0;

    const targetTab = tabs.find((t) => t.title === targetFilename || t.title.endsWith(targetFilename));
    if (targetTab) {
      setTagJumpStack((prev) => [...prev, currentDoc.cursor]);
      setActiveTabId(targetTab.id);
      const lineLen = targetTab.buffer.getLine(targetLine).length;
      setTabs((prev) =>
        prev.map((t) =>
          t.id === targetTab.id
            ? {
                ...t,
                cursor: { line: targetLine, column: targetCol },
                selection: {
                  start: { line: targetLine, column: 0 },
                  end: { line: targetLine, column: lineLen },
                  isBoxSelect: false,
                },
              }
            : t
        )
      );
    }
  }, [tabs, currentDoc, setTagJumpStack, setActiveTabId, setTabs]);

  // タグジャンプ (F12)
  const handleTagJump = useCallback(() => {
    const lineText = currentDoc.buffer.getLine(currentDoc.cursor.line);

    // 1. Grep 結果行またはコンパイラ出力行形式の判定 (例: "Sample.ts(15, 4): ...")
    const grepMatch = lineText.match(/^([^(:\\s]+)\((\d+)(?:,\s*(\d+))?\)/);
    if (grepMatch) {
      handleJumpFromGrepOrTag(lineText);
      return;
    }

    let startCol = currentDoc.cursor.column;
    let endCol = currentDoc.cursor.column;
    const isWordChar = (ch: string) => /[a-zA-Z0-9_]/.test(ch);
    while (startCol > 0 && isWordChar(lineText[startCol - 1])) startCol--;
    while (endCol < lineText.length && isWordChar(lineText[endCol])) endCol++;
    const word = lineText.substring(startCol, endCol);
    if (!word) {
      alert('タグジャンプ対象のシンボル（関数名・クラス名等）にカーソルを合わせてください。');
      return;
    }

    const totalLines = currentDoc.buffer.getLineCount();
    let targetLine = -1;
    const regex = new RegExp(`\\b(function|def|class|struct|interface|type)\\s+${word}\\b|^#+\\s+.*${word}`, 'i');
    for (let i = 0; i < totalLines; i++) {
      if (i === currentDoc.cursor.line) continue;
      if (regex.test(currentDoc.buffer.getLine(i))) {
        targetLine = i;
        break;
      }
    }
    if (targetLine === -1) {
      for (let i = 0; i < totalLines; i++) {
        if (i === currentDoc.cursor.line) continue;
        if (currentDoc.buffer.getLine(i).includes(word)) {
          targetLine = i;
          break;
        }
      }
    }

    if (targetLine !== -1) {
      setTagJumpStack((prev) => [...prev, currentDoc.cursor]);
      updateCurrentDoc((d) => ({
        ...d,
        cursor: { line: targetLine, column: 0 },
        selection: null,
      }));
    } else {
      alert(`タグ「${word}」の定義先が見つかりませんでした。`);
    }
  }, [currentDoc, updateCurrentDoc, handleJumpFromGrepOrTag]);

  // タグファイル (tags) 作成
  const handleCreateTagsFile = useCallback(() => {
    const tagEntries: string[] = [
      '!_TAG_FILE_FORMAT\t2\t/extended format/',
      '!_TAG_FILE_SORTED\t1\t/0=unsorted, 1=sorted, 2=foldcase/',
    ];

    let count = 0;
    tabs.forEach((tab) => {
      const lineCount = tab.buffer.getLineCount();
      for (let i = 0; i < lineCount; i++) {
        const line = tab.buffer.getLine(i);
        const defMatch = line.match(/\b(function|class|def|interface|type|struct|enum)\s+([a-zA-Z0-9_]+)/);
        if (defMatch) {
          const symbol = defMatch[2];
          const kind = defMatch[1][0];
          tagEntries.push(`${symbol}\t${tab.title}\t/^${line.replace(/\\/g, '\\\\')}$/;"\t${kind}`);
          count++;
        }
      }
    });

    tagEntries.sort();
    const tagsContent = tagEntries.join('\r\n');

    const newId = `tab-tags-${Date.now()}`;
    const newDoc: TabDoc = {
      id: newId,
      title: 'tags',
      buffer: new TextBuffer(tagsContent, 'CRLF'),
      encoding: 'UTF-8',
      lineEnding: 'CRLF',
      isModified: false,
      cursor: { line: 0, column: 0 },
      selection: null,
      bookmarkManager: new BookmarkManager(),
      undoManager: new UndoManager(),
    };
    setTabs((prev) => [...prev, newDoc]);
    setActiveTabId(newId);
    alert(`タグファイル（tags）を作成しました。${count} 個のシンボルを登録しました。`);
  }, [tabs]);

  // キーワードを指定してタグジャンプ
  const handleKeywordTagJump = useCallback(() => {
    const word = prompt('ジャンプするキーワード（シンボル名）を入力してください:');
    if (!word) return;
    const totalLines = currentDoc.buffer.getLineCount();
    let targetLine = -1;
    const regex = new RegExp(`\\b(function|def|class|struct|interface|type)\\s+${word}\\b|^#+\\s+.*${word}`, 'i');
    for (let i = 0; i < totalLines; i++) {
      if (regex.test(currentDoc.buffer.getLine(i))) {
        targetLine = i;
        break;
      }
    }
    if (targetLine === -1) {
      for (let i = 0; i < totalLines; i++) {
        if (currentDoc.buffer.getLine(i).includes(word)) {
          targetLine = i;
          break;
        }
      }
    }
    if (targetLine !== -1) {
      setTagJumpStack((prev) => [...prev, currentDoc.cursor]);
      updateCurrentDoc((d) => ({
        ...d,
        cursor: { line: targetLine, column: 0 },
        selection: null,
      }));
    } else {
      alert(`キーワード「${word}」の定義先が見つかりませんでした。`);
    }
  }, [currentDoc, setTagJumpStack, updateCurrentDoc]);

  // タグジャンプバック (Shift+F12)
  const handleTagJumpBack = useCallback(() => {
    if (tagJumpStack.length === 0) {
      alert('タグジャンプの戻り先履歴がありません。');
      return;
    }
    const prevPos = tagJumpStack[tagJumpStack.length - 1];
    setTagJumpStack((prev) => prev.slice(0, -1));
    updateCurrentDoc((d) => ({
      ...d,
      cursor: prevPos,
      selection: null,
    }));
  }, [tagJumpStack, updateCurrentDoc]);

  // ブラウズ (Ctrl+B)
  const handleBrowse = useCallback(() => {
    const content = currentDoc.buffer.getText();
    const isHtml = currentDoc.title.endsWith('.html') || currentDoc.title.endsWith('.htm');
    const htmlToView = isHtml
      ? content
      : `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${currentDoc.title}</title><style>body{font-family:Meiryo,sans-serif;padding:20px;white-space:pre-wrap;}</style></head><body>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</body></html>`;
    const blob = new Blob([htmlToView], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [currentDoc]);


  // 差分ジャンプ (次の差分 / 前の差分 / 差分解除)
  const handleDiffNext = useCallback(() => {
    const lineCount = currentDoc.buffer.getLineCount();
    const hasDiffMarks = currentDoc.diffMarks && currentDoc.diffMarks.size > 0;
    const isDiff = (line: number) =>
      hasDiffMarks ? currentDoc.diffMarks!.has(line) : currentDoc.buffer.isLineModified(line);

    for (let i = currentDoc.cursor.line + 1; i < lineCount; i++) {
      if (isDiff(i)) {
        updateCurrentDoc((d) => ({ ...d, cursor: { line: i, column: 0 }, selection: null }));
        return;
      }
    }
    for (let i = 0; i <= currentDoc.cursor.line; i++) {
      if (isDiff(i)) {
        updateCurrentDoc((d) => ({ ...d, cursor: { line: i, column: 0 }, selection: null }));
        return;
      }
    }
    alert('これ以降に差分・変更行はありません。');
  }, [currentDoc, updateCurrentDoc]);

  const handleDiffPrev = useCallback(() => {
    const lineCount = currentDoc.buffer.getLineCount();
    const hasDiffMarks = currentDoc.diffMarks && currentDoc.diffMarks.size > 0;
    const isDiff = (line: number) =>
      hasDiffMarks ? currentDoc.diffMarks!.has(line) : currentDoc.buffer.isLineModified(line);

    for (let i = currentDoc.cursor.line - 1; i >= 0; i--) {
      if (isDiff(i)) {
        updateCurrentDoc((d) => ({ ...d, cursor: { line: i, column: 0 }, selection: null }));
        return;
      }
    }
    for (let i = lineCount - 1; i >= currentDoc.cursor.line; i--) {
      if (isDiff(i)) {
        updateCurrentDoc((d) => ({ ...d, cursor: { line: i, column: 0 }, selection: null }));
        return;
      }
    }
    alert('これより前に差分・変更行はありません。');
  }, [currentDoc, updateCurrentDoc]);

  const handleDiffClear = useCallback(() => {
    currentDoc.buffer.clearModifiedStatus();
    updateCurrentDoc((d) => ({ ...d, diffMarks: undefined }));
  }, [currentDoc, updateCurrentDoc]);

  // Grep検索の実行 (結果を新タブ「(Grep結果)」に出力)
  const handleExecuteGrep = useCallback((params: GrepExecuteParams, folderResults?: GrepResultItem[]) => {
    let resultItems: { fileName: string; line: number; col: number; encoding: string; text: string }[] = [];

    const testLine = (line: string, q: string, regex: boolean, matchCase: boolean, wholeWord: boolean): boolean => {
      if (!q) return false;
      try {
        if (regex) {
          const reg = new RegExp(q, matchCase ? 'g' : 'gi');
          return reg.test(line);
        }
        let pattern = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (wholeWord) pattern = `\\b${pattern}\\b`;
        const reg = new RegExp(pattern, matchCase ? 'g' : 'gi');
        return reg.test(line);
      } catch {
        return false;
      }
    };

    if (params.targetScope === 'folder' && folderResults) {
      resultItems = folderResults.map((r) => ({
        fileName: r.fileName,
        line: r.line,
        col: r.column,
        encoding: 'UTF-8',
        text: r.lineText,
      }));
    } else {
      const docsToSearch = params.targetScope === 'current-tab' ? [currentDoc] : tabs;
      for (const doc of docsToSearch) {
        const lineCount = doc.buffer.getLineCount();
        for (let i = 0; i < lineCount; i++) {
          const lineText = doc.buffer.getLine(i);
          if (testLine(lineText, params.query, params.isRegex, params.matchCase, params.matchWholeWord)) {
            resultItems.push({
              fileName: doc.title,
              line: i + 1,
              col: 1,
              encoding: doc.encoding,
              text: lineText,
            });
            if (resultItems.length >= 2000) break;
          }
        }
      }
    }

    if (params.isReplaceMode) {
      const repText = params.replaceText || '';
      const docIds = new Set((params.targetScope === 'current-tab' ? [currentDoc] : tabs).map((d) => d.id));
      setTabs((prev) =>
        prev.map((doc) => {
          if (!docIds.has(doc.id)) return doc;
          const origText = doc.buffer.getText();
          let newText = origText;
          if (params.isRegex) {
            const reg = new RegExp(params.query, params.matchCase ? 'g' : 'gi');
            newText = origText.replace(reg, repText);
          } else {
            let pat = params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (params.matchWholeWord) pat = `\\b${pat}\\b`;
            const reg = new RegExp(pat, params.matchCase ? 'g' : 'gi');
            newText = origText.replace(reg, repText);
          }
          if (newText !== origText) {
            doc.undoManager.pushState({ text: origText, cursor: { ...doc.cursor }, selection: null });
            doc.buffer.setText(newText);
            return { ...doc, isModified: true };
          }
          return doc;
        })
      );
    }

    const nowStr = new Date().toLocaleString('ja-JP');
    const headerLines = [
      `■ ${params.isReplaceMode ? '置換条件' : '検索条件'} ----------------------------------------------------`,
      `条件: "${params.query}"${params.isReplaceMode ? ` -> "${params.replaceText || ''}"` : ''}`,
      `対象: ${params.targetScope === 'folder' ? 'フォルダ指定' : params.targetScope === 'current-tab' ? `現在のファイル (${currentDoc.title})` : '開いている全ファイル'} (${params.filePattern})`,
      `大文字/小文字の区別: ${params.matchCase ? 'あり' : 'なし'}`,
      `正規表現: ${params.isRegex ? 'あり' : 'なし'}`,
      `単語単位: ${params.matchWholeWord ? 'あり' : 'なし'}`,
      `検索日時: ${nowStr}`,
      `================================================================`,
    ];

    const bodyLines = resultItems.map(
      (r) => `${r.fileName}(${r.line}, ${r.col}) [${r.encoding}]: ${r.text}`
    );

    const footerLines = [
      `================================================================`,
      `${params.isReplaceMode ? '置換終了' : '検索終了'}: ${resultItems.length} 個${params.isReplaceMode ? '置換しました' : '見つかりました'}`,
    ];

    const grepText = [...headerLines, ...bodyLines, ...footerLines].join('\r\n');
    const grepTabTitle = params.isReplaceMode ? `(Grep置換結果)` : `(Grep結果)`;
    const existingGrepTab = tabs.find((t) => t.title === grepTabTitle);

    if (existingGrepTab) {
      existingGrepTab.buffer.setText(grepText);
      existingGrepTab.isModified = false;
      existingGrepTab.cursor = { line: 8, column: 0 };
      setActiveTabId(existingGrepTab.id);
      setTabs((prev) => [...prev]);
    } else {
      const newId = `tab-grep-${Date.now()}`;
      const newDoc: TabDoc = {
        id: newId,
        title: grepTabTitle,
        buffer: new TextBuffer(grepText, 'CRLF'),
        encoding: 'UTF-8',
        lineEnding: 'CRLF',
        isModified: false,
        cursor: { line: 8, column: 0 },
        selection: null,
        bookmarkManager: new BookmarkManager(),
        undoManager: new UndoManager(),
      };
      setTabs((prev) => [...prev, newDoc]);
      setActiveTabId(newId);
    }
  }, [tabs, currentDoc]);

  // 検索開始位置へ戻る
  const handleReturnSearchOrigin = useCallback(() => {
    if (searchOriginPos) {
      updateCurrentDoc((d) => ({ ...d, cursor: searchOriginPos, selection: null }));
    } else {
      alert('検索開始位置が記録されていません。');
    }
  }, [searchOriginPos, updateCurrentDoc]);

  // ブラウザ離脱時の未保存ガード
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = tabs.some((t) => t.isModified);
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tabs]);

  // 自動保存タイマー (共通設定連動)
  useEffect(() => {
    if (!commonSettings.file.autoSave || commonSettings.file.autoSaveIntervalMinutes <= 0) return;
    const interval = commonSettings.file.autoSaveIntervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      tabs.forEach((tab) => {
        if (tab.isModified) {
          try {
            localStorage.setItem(`sakura_autosave_${tab.title}`, tab.buffer.getText());
          } catch {}
        }
      });
    }, interval);
    return () => clearInterval(timer);
  }, [commonSettings.file.autoSave, commonSettings.file.autoSaveIntervalMinutes, tabs]);

  // 新規作成
  const handleNew = () => {
    const newId = `tab-${Date.now()}`;
    const newTitle = `(無題)${tabs.length + 1}`;
    const newDoc: TabDoc = {
      id: newId,
      title: newTitle,
      buffer: new TextBuffer('', 'CRLF'),
      encoding: 'Shift_JIS',
      lineEnding: 'CRLF',
      isModified: false,
      cursor: { line: 0, column: 0 },
      selection: null,
      bookmarkManager: new BookmarkManager(),
      undoManager: new UndoManager(),
    };
    setTabs((prev) => [...prev, newDoc]);
    setActiveTabId(newId);
    addRecentFile(newTitle);
  };

  // タイプ別新規作成
  const handleNewWithType = (syntax: string) => {
    const extMap: Record<string, string> = {
      'C/C++': '.cpp',
      'HTML': '.html',
      'JavaScript/TypeScript': '.ts',
      'Python': '.py',
    };
    const ext = extMap[syntax] || '.txt';
    const newId = `tab-${Date.now()}`;
    const newTitle = `(無題)${tabs.length + 1}${ext}`;
    const newDoc: TabDoc = {
      id: newId,
      title: newTitle,
      buffer: new TextBuffer('', 'CRLF'),
      encoding: 'UTF-8',
      lineEnding: 'CRLF',
      isModified: false,
      cursor: { line: 0, column: 0 },
      selection: null,
      bookmarkManager: new BookmarkManager(),
      undoManager: new UndoManager(),
    };
    setTabs((prev) => [...prev, newDoc]);
    setActiveTabId(newId);
    setActiveTypeId(detectTypeFromFilename(newTitle));
    addRecentFile(newTitle);
  };

  // すべて上書き保存
  const handleSaveAll = () => {
    tabs.forEach((tab) => {
      if (tab.isModified) {
        const text = tab.buffer.getText(tab.lineEnding);
        if (commonSettings.backup.createBackup) {
          PlatformService.saveBackup(
            tab.title,
            text,
            commonSettings.backup.backupType,
            commonSettings.backup.backupExtension,
            commonSettings.backup.backupFolder
          );
        }
        const blob = new Blob([text], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = tab.title;
        a.click();
      }
    });
    setTabs((prev) => prev.map((t) => ({ ...t, isModified: false })));
  };

  // 行インデント (字下げ)
  const handleIndent = useCallback(() => {
    pushUndoState();
    const sel = currentDoc.selection;
    const tabStr = ' '.repeat(activeTypeSetting.wrapConfig.tabSize || 4);
    if (sel) {
      const sLine = Math.min(sel.start.line, sel.end.line);
      const eLine = Math.max(sel.start.line, sel.end.line);
      for (let i = sLine; i <= eLine; i++) {
        currentDoc.buffer.insert({ line: i, column: 0 }, tabStr);
      }
    } else {
      currentDoc.buffer.insert({ line: currentDoc.cursor.line, column: 0 }, tabStr);
    }
    updateCurrentDoc((d) => ({ ...d, isModified: true }));
  }, [currentDoc, activeTypeSetting, pushUndoState, updateCurrentDoc]);

  // 行逆インデント (字上げ)
  const handleUnindent = useCallback(() => {
    pushUndoState();
    const sel = currentDoc.selection;
    const tabSize = activeTypeSetting.wrapConfig.tabSize || 4;
    const sLine = sel ? Math.min(sel.start.line, sel.end.line) : currentDoc.cursor.line;
    const eLine = sel ? Math.max(sel.start.line, sel.end.line) : currentDoc.cursor.line;
    for (let i = sLine; i <= eLine; i++) {
      const line = currentDoc.buffer.getLine(i);
      if (line.startsWith('\t')) {
        currentDoc.buffer.deleteRange({ start: { line: i, column: 0 }, end: { line: i, column: 1 }, isBoxSelect: false });
      } else {
        const leadingSpaces = line.match(/^ +/)?.[0].length || 0;
        const toRemove = Math.min(tabSize, leadingSpaces);
        if (toRemove > 0) {
          currentDoc.buffer.deleteRange({ start: { line: i, column: 0 }, end: { line: i, column: toRemove }, isBoxSelect: false });
        }
      }
    }
    updateCurrentDoc((d) => ({ ...d, isModified: true }));
  }, [currentDoc, activeTypeSetting, pushUndoState, updateCurrentDoc]);

  // 同名 C/C++ ソース/ヘッダーを開く (Shift+Ctrl+C)
  const handleToggleHeaderSource = useCallback(() => {
    const curTitle = currentDoc.title;
    let targetExt = '';
    let baseName = '';
    if (curTitle.endsWith('.cpp')) {
      baseName = curTitle.slice(0, -4);
      targetExt = '.h';
    } else if (curTitle.endsWith('.c')) {
      baseName = curTitle.slice(0, -2);
      targetExt = '.h';
    } else if (curTitle.endsWith('.h')) {
      baseName = curTitle.slice(0, -2);
      targetExt = '.cpp';
    } else if (curTitle.endsWith('.hpp')) {
      baseName = curTitle.slice(0, -4);
      targetExt = '.cpp';
    } else {
      alert('現在のファイルは C/C++ ソースまたはヘッダーではありません。');
      return;
    }
    const targetTitle = baseName + targetExt;
    const existing = tabs.find((t) => t.title.toLowerCase() === targetTitle.toLowerCase());
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newId = `tab-${Date.now()}`;
      const newDoc: TabDoc = {
        id: newId,
        title: targetTitle,
        buffer: new TextBuffer(`// ${targetTitle}\n#pragma once\n\n`, 'CRLF'),
        encoding: 'UTF-8',
        lineEnding: 'CRLF',
        isModified: true,
        cursor: { line: 3, column: 0 },
        selection: null,
        bookmarkManager: new BookmarkManager(),
        undoManager: new UndoManager(),
      };
      setTabs((prev) => [...prev, newDoc]);
      setActiveTabId(newId);
      setActiveTypeId('type-c-cpp');
    }
  }, [currentDoc, tabs, setActiveTabId, setActiveTypeId]);

  // ファイルを開く
  const handleOpen = async () => {
    try {
      if ('showOpenFilePicker' in window) {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          types: [
            {
              description: 'テキストファイル (*.txt;*.c;*.cpp;*.js;*.py;*.*)',
              accept: { 'text/*': ['.txt', '.c', '.cpp', '.h', '.js', '.ts', '.py', '.html', '.md', '.log', '.ini', '.mac'] },
            },
          ],
        });
        const file = await fileHandle.getFile();
        const arrayBuf = await file.arrayBuffer();
        const rawBytes = new Uint8Array(arrayBuf);
        const decoded = CharEncoding.decode(rawBytes);

        const newId = `tab-${Date.now()}`;
        const newDoc: TabDoc = {
          id: newId,
          title: file.name,
          buffer: new TextBuffer(decoded.text, decoded.lineEnding),
          encoding: decoded.encoding,
          lineEnding: decoded.lineEnding,
          isModified: false,
          fileHandle,
          rawBytes,
          cursor: { line: 0, column: 0 },
          selection: null,
          bookmarkManager: new BookmarkManager(),
          undoManager: new UndoManager(),
        };
        setTabs((prev) => [...prev, newDoc]);
        setActiveTabId(newId);
        setActiveTypeId(detectTypeFromFilename(file.name));
        addRecentFile(file.name);
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const arrayBuf = await file.arrayBuffer();
          const rawBytes = new Uint8Array(arrayBuf);
          const decoded = CharEncoding.decode(rawBytes);
          const newId = `tab-${Date.now()}`;
          const newDoc: TabDoc = {
            id: newId,
            title: file.name,
            buffer: new TextBuffer(decoded.text, decoded.lineEnding),
            encoding: decoded.encoding,
            lineEnding: decoded.lineEnding,
            isModified: false,
            rawBytes,
            cursor: { line: 0, column: 0 },
            selection: null,
            bookmarkManager: new BookmarkManager(),
            undoManager: new UndoManager(),
          };
          setTabs((prev) => [...prev, newDoc]);
          setActiveTabId(newId);
          setActiveTypeId(detectTypeFromFilename(file.name));
          addRecentFile(file.name);
        };
        input.click();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  // 開き直す (指定文字コードで再デコード)
  const handleReopenWithEncoding = useCallback((enc: CharacterEncoding) => {
    if (currentDoc.rawBytes) {
      const decoded = CharEncoding.decodeWithEncoding(currentDoc.rawBytes, enc);
      pushUndoState();
      currentDoc.buffer.setText(decoded.text);
      updateCurrentDoc((d) => ({
        ...d,
        encoding: enc,
        lineEnding: decoded.lineEnding,
        cursor: { line: 0, column: 0 },
        selection: null,
      }));
    } else {
      updateCurrentDoc((d) => ({ ...d, encoding: enc }));
    }
  }, [currentDoc, pushUndoState, updateCurrentDoc]);

  // 上書き保存 / 名前を付けて保存
  const handleSave = async (saveAs: boolean = false) => {
    try {
      const text = currentDoc.buffer.getText(currentDoc.lineEnding);
      const encoded = CharEncoding.encode(text, currentDoc.encoding);

      let handle = currentDoc.fileHandle;
      if (saveAs || !handle) {
        if ('showSaveFilePicker' in window) {
          handle = await (window as any).showSaveFilePicker({
            suggestedName: currentDoc.title,
            types: [
              {
                description: 'テキストファイル (*.txt;*.c;*.cpp;*.js;*.py;*.*)',
                accept: { 'text/*': ['.txt', '.c', '.cpp', '.h', '.js', '.ts', '.py', '.html', '.md', '.log', '.ini', '.mac'] },
              },
            ],
          });
        } else {
          const blob = new Blob([encoded as any], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = currentDoc.title;
          a.click();
          if (commonSettings.backup.createBackup) {
            PlatformService.saveBackup(
              currentDoc.title,
              text,
              commonSettings.backup.backupType,
              commonSettings.backup.backupExtension,
              commonSettings.backup.backupFolder
            );
          }
          URL.revokeObjectURL(url);
          updateCurrentDoc((d) => ({ ...d, isModified: false }));
          addRecentFile(currentDoc.title);
          return;
        }
      }

      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(encoded);
        await writable.close();
        const file = await handle.getFile();
        if (commonSettings.backup.createBackup) {
          PlatformService.saveBackup(
            file.name,
            text,
            commonSettings.backup.backupType,
            commonSettings.backup.backupExtension,
            commonSettings.backup.backupFolder
          );
        }
        updateCurrentDoc((d) => ({
          ...d,
          title: file.name,
          fileHandle: handle,
          isModified: false,
        }));
        addRecentFile(file.name);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error(err);
    }
  };

  // タブ閉じる
  const handleCloseTab = (id: string) => {
    const target = tabs.find((t) => t.id === id);
    if (target?.isModified) {
      const ok = window.confirm(`「${target.title}」の変更を保存せずに閉じますか？`);
      if (!ok) return;
    }

    if (tabs.length === 1) {
      setTabs([
        {
          id: `tab-${Date.now()}`,
          title: '無題1.txt',
          buffer: new TextBuffer('', 'CRLF'),
          encoding: 'Shift_JIS',
          lineEnding: 'CRLF',
          isModified: false,
          cursor: { line: 0, column: 0 },
          selection: null,
          bookmarkManager: new BookmarkManager(),
          undoManager: new UndoManager(),
        },
      ]);
      return;
    }

    const filtered = tabs.filter((t) => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
  };

  // 検索処理 (サクラエディタ標準 F3/Shift+F3 対応)
  const handleFindNext = (options?: SearchOptions, quiet: boolean = false) => {
    const opts = options || (searchHighlight ? { ...searchHighlight, matchWholeWord: false } : null);
    if (!opts || !opts.query) {
      if (!quiet) {
        setIsReplaceMode(false);
        setIsSearchOpen(true);
      }
      return;
    }
    if (!searchOriginPos) {
      setSearchOriginPos(currentDoc.cursor);
    }
    setSearchHighlight({
      query: opts.query,
      isRegex: opts.isRegex,
      matchCase: opts.matchCase,
    });
    const match = SearchEngine.findNext(currentDoc.buffer, opts, currentDoc.cursor);
    if (match) {
      const newPos = { line: match.line, column: match.endCol };
      updateCurrentDoc((d) => ({
        ...d,
        cursor: newPos,
        selection: {
          start: { line: match.line, column: match.startCol },
          end: newPos,
          isBoxSelect: false,
        },
      }));
    } else if (!quiet) {
      alert(`「${opts.query}」は見つかりませんでした。`);
    }
  };

  const handleFindPrevious = (options?: SearchOptions, quiet: boolean = false) => {
    const opts = options || (searchHighlight ? { ...searchHighlight, matchWholeWord: false } : null);
    if (!opts || !opts.query) {
      if (!quiet) {
        setIsReplaceMode(false);
        setIsSearchOpen(true);
      }
      return;
    }
    if (!searchOriginPos) {
      setSearchOriginPos(currentDoc.cursor);
    }
    setSearchHighlight({
      query: opts.query,
      isRegex: opts.isRegex,
      matchCase: opts.matchCase,
    });
    const match = SearchEngine.findPrevious(currentDoc.buffer, opts, currentDoc.cursor);
    if (match) {
      const newPos = { line: match.line, column: match.endCol };
      updateCurrentDoc((d) => ({
        ...d,
        cursor: newPos,
        selection: {
          start: { line: match.line, column: match.startCol },
          end: newPos,
          isBoxSelect: false,
        },
      }));
    } else if (!quiet) {
      alert(`「${opts.query}」は見つかりませんでした。`);
    }
  };

  // インクリメンタルサーチ処理 (Ctrl+I)
  const handleIncSearchChange = (q: string) => {
    setIncSearchQuery(q);
    if (!q) {
      setSearchHighlight(null);
    } else {
      setSearchHighlight({
        query: q,
        isRegex: incSearchIsRegex,
        matchCase: incSearchMatchCase,
      });
      handleFindNext(
        {
          query: q,
          isRegex: incSearchIsRegex,
          matchCase: incSearchMatchCase,
          matchWholeWord: false,
        },
        true
      );
    }
  };

  const handleIncSearchNext = () => {
    if (incSearchQuery) {
      handleFindNext({
        query: incSearchQuery,
        isRegex: incSearchIsRegex,
        matchCase: incSearchMatchCase,
        matchWholeWord: false,
      });
    }
  };

  const handleIncSearchPrev = () => {
    if (incSearchQuery) {
      handleFindPrevious({
        query: incSearchQuery,
        isRegex: incSearchIsRegex,
        matchCase: incSearchMatchCase,
        matchWholeWord: false,
      });
    }
  };

  const incSearchMatchCount = useMemo(() => {
    if (!incSearchQuery) return 0;
    try {
      return SearchEngine.countMatches(currentDoc.buffer.getText(), {
        query: incSearchQuery,
        isRegex: incSearchIsRegex,
        matchCase: incSearchMatchCase,
        matchWholeWord: false,
      });
    } catch {
      return 0;
    }
  }, [currentDoc.buffer, incSearchQuery, incSearchMatchCase, incSearchIsRegex]);

  const handleReplace = (options: SearchOptions, replaceText: string) => {
    pushUndoState();
    if (currentDoc.selection) {
      currentDoc.buffer.deleteRange(currentDoc.selection);
      currentDoc.buffer.insert(currentDoc.cursor, replaceText);
      updateCurrentDoc((d) => ({ ...d, isModified: true, selection: null }));
    }
    handleFindNext(options);
  };

  const handleReplaceAll = (options: SearchOptions, replaceText: string) => {
    pushUndoState();
    let count = 0;
    let match = SearchEngine.findNext(currentDoc.buffer, options, { line: 0, column: 0 });
    while (match) {
      count++;
      currentDoc.buffer.deleteRange({
        start: { line: match.line, column: match.startCol },
        end: { line: match.line, column: match.endCol },
        isBoxSelect: false,
      });
      currentDoc.buffer.insert({ line: match.line, column: match.startCol }, replaceText);
      match = SearchEngine.findNext(currentDoc.buffer, options, {
        line: match.line,
        column: match.startCol + replaceText.length,
      });
      if (count > 5000) break;
    }
    updateCurrentDoc((d) => ({ ...d, isModified: true, selection: null }));
    alert(`${count} 箇所を置換しました。`);
  };

  // テキスト変換・整形ハンドラ (サクラエディタ仕様: 選択範囲優先)
  const applyTransform = (transformFn: (text: string) => string) => {
    if (currentDoc.selection) {
      pushUndoState();
      if (
        currentDoc.selection.isBoxSelect &&
        currentDoc.selection.boxStartCol !== undefined &&
        currentDoc.selection.boxEndCol !== undefined
      ) {
        // 矩形選択範囲に対する変換
        const sLine = Math.min(currentDoc.selection.start.line, currentDoc.selection.end.line);
        const eLine = Math.max(currentDoc.selection.start.line, currentDoc.selection.end.line);
        const sCol = Math.min(currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
        const eCol = Math.max(currentDoc.selection.boxStartCol, currentDoc.selection.boxEndCol);
        for (let l = sLine; l <= eLine; l++) {
          const lineText = currentDoc.buffer.getLine(l);
          if (sCol < lineText.length) {
            const left = lineText.substring(0, sCol);
            const mid = lineText.substring(sCol, Math.min(eCol, lineText.length));
            const right = lineText.substring(Math.min(eCol, lineText.length));
            const transformed = transformFn(mid);
            currentDoc.buffer.replaceLine(l, left + transformed + right);
          }
        }
        updateCurrentDoc((d) => ({ ...d, isModified: true }));
      } else {
        // 通常のストリーム選択範囲に対する変換
        let { start, end } = currentDoc.selection;
        if (start.line > end.line || (start.line === end.line && start.column > end.column)) {
          const tmp = start;
          start = end;
          end = tmp;
        }
        const selText = currentDoc.buffer.getTextInRange(currentDoc.selection);
        const transformed = transformFn(selText);
        currentDoc.buffer.deleteRange(currentDoc.selection);
        const newEnd = currentDoc.buffer.insert(start, transformed);
        updateCurrentDoc((d) => ({
          ...d,
          isModified: true,
          cursor: newEnd,
          selection: { start, end: newEnd, isBoxSelect: false },
        }));
      }
    } else {
      // 選択範囲なし: 全体変換 (TAB展開などの場合)
      pushUndoState();
      const fullText = currentDoc.buffer.getText();
      const newText = transformFn(fullText);
      currentDoc.buffer.setText(newText);
      updateCurrentDoc((d) => ({ ...d, isModified: true }));
    }
  };

  const applyLineTransform = (lineTransformFn: (lines: string[]) => string[]) => {
    pushUndoState();
    const lineCount = currentDoc.buffer.getLineCount();
    const lines: string[] = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(currentDoc.buffer.getLine(i));
    }
    const newLines = lineTransformFn(lines);
    currentDoc.buffer.setText(newLines.join('\r\n'));
    updateCurrentDoc((d) => ({ ...d, isModified: true }));
  };

  // 行の二重化 (Ctrl+D)
  const duplicateCurrentLine = () => {
    pushUndoState();
    const curLine = currentDoc.buffer.getLine(currentDoc.cursor.line);
    currentDoc.buffer.insert({ line: currentDoc.cursor.line, column: curLine.length }, '\r\n' + curLine);
    updateCurrentDoc((d) => ({
      ...d,
      isModified: true,
      cursor: { line: d.cursor.line + 1, column: d.cursor.column },
    }));
  };

  // ブックマーク行の抽出
  const extractBookmarksToNewTab = () => {
    const bmLines = currentDoc.bookmarkManager.getBookmarkedLines();
    if (bmLines.length === 0) {
      alert('ブックマークが設定されている行はありません。');
      return;
    }
    const extracted = bmLines.map((l) => currentDoc.buffer.getLine(l)).join('\r\n');
    const newId = `tab-${Date.now()}`;
    const newDoc: TabDoc = {
      id: newId,
      title: `ブックマーク抽出.txt`,
      buffer: new TextBuffer(extracted, 'CRLF'),
      encoding: 'Shift_JIS',
      lineEnding: 'CRLF',
      isModified: true,
      cursor: { line: 0, column: 0 },
      selection: null,
      bookmarkManager: new BookmarkManager(),
      undoManager: new UndoManager(),
    };
    setTabs((prev) => [...prev, newDoc]);
    setActiveTabId(newId);
  };

  // ブックマーク行の反転 (Invert Bookmarks)
  const handleInvertBookmarks = () => {
    currentDoc.bookmarkManager.invert(currentDoc.buffer.getLineCount());
    updateCurrentDoc((d) => ({ ...d }));
  };

  // ブックマーク行の削除 (Delete Bookmarked Lines)
  const handleDeleteBookmarkedLines = () => {
    const bmLines = currentDoc.bookmarkManager.getBookmarkedLines();
    if (bmLines.length === 0) {
      alert('ブックマークが設定されている行はありません。');
      return;
    }
    pushUndoState();
    currentDoc.buffer.deleteLines(bmLines);
    currentDoc.bookmarkManager.clearAll();
    updateCurrentDoc((d) => ({
      ...d,
      isModified: true,
      cursor: { line: Math.min(d.cursor.line, d.buffer.getLineCount() - 1), column: 0 },
      selection: null,
    }));
  };

  // 文字コード変換
  const handleConvertEncoding = (targetEnc: CharacterEncoding) => {
    if (currentDoc.encoding === targetEnc) return;
    pushUndoState();
    updateCurrentDoc((d) => ({ ...d, encoding: targetEnc, isModified: true }));
  };

  // 改行コード変換
  const handleConvertLineEnding = (targetEnding: LineEnding) => {
    if (currentDoc.lineEnding === targetEnding) return;
    pushUndoState();
    currentDoc.buffer.convertAllLineEndings(targetEnding);
    updateCurrentDoc((d) => ({ ...d, lineEnding: targetEnding, isModified: true }));
  };

  // 変更を破棄して開き直す (Revert Modifications)
  const handleRevertDocument = () => {
    if (!currentDoc.isModified) return;
    if (!confirm('変更内容を破棄して開き直しますか？')) return;
    pushUndoState();
    if (currentDoc.rawBytes) {
      const decoded = CharEncoding.decodeWithEncoding(currentDoc.rawBytes, currentDoc.encoding);
      currentDoc.buffer.setText(decoded.text);
    } else {
      currentDoc.buffer.setText('');
    }
    currentDoc.buffer.clearModifiedStatus();
    updateCurrentDoc((d) => ({
      ...d,
      isModified: false,
      selection: null,
      cursor: { line: 0, column: 0 },
    }));
  };

  // マクロの記録トグル (Ctrl+Shift+M)
  const toggleMacroRecording = useCallback(() => {
    if (isRecordingMacro) {
      const script = macroRecorderRef.current.stop();
      setIsRecordingMacro(false);
      setLastMacroScript(script);
      alert('マクロの記録を終了しました。');
    } else {
      macroRecorderRef.current.start();
      setIsRecordingMacro(true);
      alert('マクロの記録を開始しました (Ctrl+Shift+M で終了)。');
    }
  }, [isRecordingMacro]);

  // 記録したマクロの実行 (Ctrl+Shift+L)
  const executeRecordedMacro = useCallback(async () => {
    if (!lastMacroScript) {
      alert('実行できるマクロがありません。');
      return;
    }
    try {
      pushUndoState();
      await MacroEngine.executeMacro(lastMacroScript, {
        buffer: currentDoc.buffer,
        cursor: currentDoc.cursor,
        selection: currentDoc.selection,
        bookmarkManager: currentDoc.bookmarkManager,
        setCursor: (pos) => updateCurrentDoc((d) => ({ ...d, cursor: pos })),
        setSelection: (sel) => updateCurrentDoc((d) => ({ ...d, selection: sel })),
        triggerChange: () => updateCurrentDoc((d) => ({ ...d, isModified: true })),
      });
    } catch (err: any) {
      alert(`マクロ実行エラー: ${err.message}`);
    }
  }, [lastMacroScript, pushUndoState, currentDoc, updateCurrentDoc]);

  // 登録済みマクロの実行 (Webストレージ/ファイル連携)
  const executeRegisteredMacro = useCallback(async (macro: MacroRegistration) => {
    let script = PlatformService.getMacroCode(macro.id);
    if (!script && macro.path) {
      if (macro.path.includes('\n') || macro.path.includes('Editor.')) {
        script = macro.path;
      }
    }
    if (!script) {
      alert(`マクロ「${macro.name || macro.id}」のスクリプトが読み込まれていません。「設定」-「共通設定」-「マクロ」タブの「参照...」ボタンからスクリプトを取り込んでください。`);
      return;
    }
    try {
      pushUndoState();
      await MacroEngine.executeMacro(script, {
        buffer: currentDoc.buffer,
        cursor: currentDoc.cursor,
        selection: currentDoc.selection,
        bookmarkManager: currentDoc.bookmarkManager,
        setCursor: (pos) => updateCurrentDoc((d) => ({ ...d, cursor: pos })),
        setSelection: (sel) => updateCurrentDoc((d) => ({ ...d, selection: sel })),
        triggerChange: () => updateCurrentDoc((d) => ({ ...d, isModified: true })),
      });
    } catch (err: any) {
      alert(`マクロ実行エラー: ${err.message}`);
    }
  }, [pushUndoState, currentDoc, updateCurrentDoc]);

  // sakura.ini エクスポート
  const handleExportIni = useCallback(() => {
    const iniContent = SakuraIni.exportToIni(activeTypeSetting);
    const blob = new Blob([iniContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sakura.ini';
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTypeSetting]);

  // sakura.ini インポート
  const handleImportIni = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ini,.txt';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      const imported = SakuraIni.parseFromIni(text);
      setTypeSettingsList((prev) =>
        prev.map((t) =>
          t.id === activeTypeId
            ? {
                ...t,
                ...imported,
                wrapConfig: {
                  ...t.wrapConfig,
                  ...(imported.wrapConfig || {}),
                },
                showSymbols: {
                  ...t.showSymbols,
                  ...(imported.showSymbols || {}),
                },
              }
            : t
        )
      );
      alert('sakura.ini 設定を読み込みました。');
    };
    input.click();
  }, [activeTypeId]);

  // 外部コマンド実行結果の適用
  const handleExecuteExternalTool = (output: string) => {
    if (output) {
      pushUndoState();
      currentDoc.buffer.insert(currentDoc.cursor, output);
      updateCurrentDoc((d) => ({ ...d, isModified: true }));
    }
  };

  // コマンド一覧からの全コマンド直接実行ハンドラ
  const handleExecuteCommand = (cmdId: string) => {
    switch (cmdId) {
      case 'new':
      case 'file-new': handleNew(); break;
      case 'new-win': window.open(window.location.href, '_blank'); break;
      case 'open':
      case 'file-open': handleOpen(); break;
      case 'save':
      case 'file-save': handleSave(false); break;
      case 'save-as':
      case 'file-save-as': handleSave(true); break;
      case 'save-all': handleSaveAll(); break;
      case 'save-close': handleSave(false); handleCloseTab(activeTabId); break;
      case 'close': handleCloseTab(activeTabId); break;
      case 'close-untitled': handleCloseTab(activeTabId); handleNew(); break;
      case 'close-open': handleCloseTab(activeTabId); handleOpen(); break;
      case 'print': window.print(); break;
      case 'print-prev': setIsPrintPreviewOpen(true); break;
      case 'print-setup': setIsPageSetupOpen(true); break;
      case 'prop': setIsPropertyOpen(true); break;
      case 'browse': handleBrowse(); break;
      case 'exit-all-edit': tabs.forEach((t) => handleCloseTab(t.id)); break;
      case 'exit-app': window.close(); break;
      case 'undo':
      case 'edit-undo': handleUndo(); break;
      case 'redo':
      case 'edit-redo': handleRedo(); break;
      case 'cut':
      case 'edit-cut': handleCut(); break;
      case 'copy':
      case 'edit-copy': handleCopy(); break;
      case 'paste':
      case 'edit-paste': handlePaste(); break;
      case 'del': handleDelete(); break;
      case 'select-all': handleSelectAll(); break;
      case 'reconvert': handleReconvert(); break;
      case 'copy-crlf': handleCopyCrlf(); break;
      case 'copy-wrap-nl': handleCopyWrap(); break;
      case 'box-paste': handleBoxPaste(); break;
      case 'word-complete': inputBridgeRef.current?.focus(); break;
      case 'ins-datetime': {
        pushUndoState();
        const formatStr = commonSettings.format.dateTimeFormat || 'YYYY/MM/DD HH:mm:ss';
        const d = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formattedDate = formatStr
          .replace(/YYYY/g, d.getFullYear().toString())
          .replace(/MM/g, pad(d.getMonth() + 1))
          .replace(/DD/g, pad(d.getDate()))
          .replace(/HH/g, pad(d.getHours()))
          .replace(/mm/g, pad(d.getMinutes()))
          .replace(/ss/g, pad(d.getSeconds()));
        currentDoc.buffer.insert(currentDoc.cursor, formattedDate);
        updateCurrentDoc((d) => ({ ...d, isModified: true }));
        break;
      }
      case 'ins-num': setIsNumberingOpen(true); break;
      case 'ins-quote': {
        const quote = commonSettings.format.quoteString ?? '> ';
        applyLineTransform((lines) => lines.map((l) => quote + l));
        break;
      }
      case 'ins-filename': {
        pushUndoState();
        currentDoc.buffer.insert(currentDoc.cursor, currentDoc.title);
        updateCurrentDoc((d) => ({ ...d, isModified: true }));
        break;
      }
      case 'dup-line': duplicateCurrentLine(); break;
      case 'del-line': {
        pushUndoState();
        const l = currentDoc.cursor.line;
        currentDoc.buffer.deleteRange({ start: { line: l, column: 0 }, end: { line: l + 1, column: 0 }, isBoxSelect: false });
        updateCurrentDoc((d) => ({ ...d, isModified: true }));
        break;
      }
      case 'trim-head': applyLineTransform(TextTransform.trimLineStart); break;
      case 'trim-tail': applyLineTransform(TextTransform.trimLineEnd); break;
      case 'remove-empty': applyLineTransform(TextTransform.removeEmptyLines); break;
      case 'remove-dup': applyLineTransform(TextTransform.removeDuplicateLines); break;
      case 'sort-asc': applyLineTransform(TextTransform.sortLinesAsc); break;
      case 'sort-desc': applyLineTransform(TextTransform.sortLinesDesc); break;
      case 'indent-right': handleIndent(); break;
      case 'indent-left': handleUnindent(); break;
      case 'to-lower': applyTransform(TextTransform.toLowerCase); break;
      case 'to-upper': applyTransform(TextTransform.toUpperCase); break;
      case 'to-half': applyTransform(TextTransform.toHalfWidth); break;
      case 'to-kana': applyTransform(TextTransform.hanPlusZenHiraToZenKata); break;
      case 'to-hira': applyTransform(TextTransform.hanPlusZenKataToZenHira); break;
      case 'to-half-alnum': applyTransform(TextTransform.zenAlnumToHan); break;
      case 'to-full-alnum': applyTransform(TextTransform.hanAlnumToZen); break;
      case 'to-half-kana': applyTransform(TextTransform.zenKataToHan); break;
      case 'to-full-kana': applyTransform(TextTransform.hanKataToZen); break;
      case 'to-full-hira': applyTransform(TextTransform.hanKataToZenHira); break;
      case 'tab-to-space': applyTransform((t) => TextTransform.tabToSpaces(t, activeTypeSetting.wrapConfig.tabSize)); break;
      case 'space-to-tab': applyTransform((t) => TextTransform.spacesToTab(t, activeTypeSetting.wrapConfig.tabSize)); break;
      case 'code-change': setIsEncodingOpen(true); break;
      case 'find':
      case 'search-find': setIsReplaceMode(false); setIsSearchOpen(true); break;
      case 'find-next': handleFindNext(); break;
      case 'find-prev': handleFindPrevious(); break;
      case 'replace':
      case 'search-replace': setIsReplaceMode(true); setIsSearchOpen(true); break;
      case 'toggle-search-mark': setSearchHighlight((prev) => (prev ? null : { query: 'サクラ', isRegex: false, matchCase: false })); break;
      case 'search-start-pos': handleReturnSearchOrigin(); break;
      case 'inc-search': setIsIncSearchOpen(true); break;
      case 'bm-toggle': currentDoc.bookmarkManager.toggle(currentDoc.cursor.line); updateCurrentDoc((d) => ({ ...d })); break;
      case 'bm-next': {
        const next = currentDoc.bookmarkManager.getNext(currentDoc.cursor.line, currentDoc.buffer.getLineCount());
        if (next !== null) updateCurrentDoc((d) => ({ ...d, cursor: { line: next, column: 0 } }));
        break;
      }
      case 'bm-prev': {
        const prev = currentDoc.bookmarkManager.getPrev(currentDoc.cursor.line);
        if (prev !== null) updateCurrentDoc((d) => ({ ...d, cursor: { line: prev, column: 0 } }));
        break;
      }
      case 'bm-clear': currentDoc.bookmarkManager.clearAll(); updateCurrentDoc((d) => ({ ...d })); break;
      case 'bm-extract': extractBookmarksToNewTab(); break;
      case 'bm-invert': handleInvertBookmarks(); break;
      case 'bm-delete': handleDeleteBookmarkedLines(); break;
      case 'ro-revert': handleRevertDocument(); break;
      case 'grep':
      case 'search-grep': setIsGrepOpen(true); break;
      case 'jump':
      case 'search-jump': setIsJumpOpen(true); break;
      case 'outline': setIsOutlineOpen(true); break;
      case 'file-tree': setIsTreeOpen((prev) => !prev); break;
      case 'tag-jump': handleTagJump(); break;
      case 'tag-jump-back': handleTagJumpBack(); break;
      case 'tag-file-create': handleCreateTagsFile(); break;
      case 'toggle-header': handleToggleHeaderSource(); break;
      case 'diff-cmp': setIsDiffOpen(true); break;
      case 'diff-next': handleDiffNext(); break;
      case 'diff-prev': handleDiffPrev(); break;
      case 'diff-clear': handleDiffClear(); break;
      case 'match-bracket': handleMatchBracket(); break;
      case 'macro-rec': toggleMacroRecording(); break;
      case 'macro-play': executeRecordedMacro(); break;
      case 'macro-manage': setIsMacroOpen(true); break;
      case 'macro-register': setCommonSettingInitialTab('macro'); setIsCommonSettingsOpen(true); break;
      case 'external-tool': setIsExternalToolOpen(true); break;
      case 'type-list': setIsTypeListOpen(true); break;
      case 'type-settings': setEditingTypeItem(activeTypeSetting); setTypeSettingInitialTab('screen'); setIsTypeSettingsOpen(true); break;
      case 'color-settings': setEditingTypeItem(activeTypeSetting); setTypeSettingInitialTab('color'); setIsTypeSettingsOpen(true); break;
      case 'common-settings': setCommonSettingInitialTab('general'); setIsCommonSettingsOpen(true); break;
      case 'font-dialog': setIsFontOpen(true); break;
      case 'export-ini': handleExportIni(); break;
      case 'import-ini': handleImportIni(); break;
      case 'split-v': setSplitMode('vertical'); break;
      case 'split-h': setSplitMode('horizontal'); break;
      case 'split-quad': setSplitMode('quad'); break;
      case 'split-clear': setSplitMode('none'); break;
      case 'next-tab': {
        const idx = tabs.findIndex((t) => t.id === activeTabId);
        setActiveTabId(tabs[(idx + 1) % tabs.length].id);
        break;
      }
      case 'prev-tab': {
        const idx = tabs.findIndex((t) => t.id === activeTabId);
        setActiveTabId(tabs[(idx - 1 + tabs.length) % tabs.length].id);
        break;
      }
      case 'command-list': setIsCommandListOpen(true); break;
      case 'about': setIsAboutOpen(true); break;
      default: break;
    }
  };

  const handleExecuteCommandRef = useRef(handleExecuteCommand);
  useEffect(() => {
    handleExecuteCommandRef.current = handleExecuteCommand;
  });

  // グローバルショートカット & マクロ & カスタムキーバインド判定
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      // 1. キーコンビネーションの正規化
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
      if (e.altKey) parts.push('Alt');
      if (e.shiftKey) parts.push('Shift');

      let k = e.key;
      if (k === 'Escape') k = 'Esc';
      else if (k === ' ') k = 'Space';
      else if (k.length === 1) k = k.toUpperCase();
      parts.push(k);
      const pressedCombo = parts.join('+');

      // 2. 登録マクロの個別ショートカット判定
      for (const macro of commonSettings.macros) {
        if (macro.shortcut) {
          const normMacro = macro.shortcut.replace(/ /g, '').toUpperCase();
          if (normMacro === pressedCombo.toUpperCase()) {
            e.preventDefault();
            if (macro.path === '(RecKeyMacro)') handleExecuteCommandRef.current('macro-rec');
            else if (macro.path === '(ExecKeyMacro)') handleExecuteCommandRef.current('macro-play');
            else {
              executeRegisteredMacro(macro);
            }
            return;
          }
        }
      }

      // 3. 共通設定のカスタムキーバインド (keyBindings) 判定
      for (const [cmdId, boundKey] of Object.entries(commonSettings.keyBindings)) {
        if (boundKey && boundKey.replace(/ /g, '').toUpperCase() === pressedCombo.toUpperCase()) {
          e.preventDefault();
          handleExecuteCommandRef.current(cmdId);
          return;
        }
      }

      // 4. サクラエディタ標準デフォルトショートカット
      const defaultMap: Record<string, string> = {
        'Ctrl+Z': 'undo',
        'Ctrl+Y': 'redo',
        'Ctrl+Shift+Z': 'redo',
        'Ctrl+A': 'select-all',
        'Ctrl+S': 'save',
        'Ctrl+Shift+S': 'save-as',
        'Shift+Ctrl+S': 'save-as',
        'Ctrl+O': 'open',
        'Ctrl+N': 'new',
        'Ctrl+F': 'find',
        'F3': 'find-next',
        'Shift+F3': 'find-prev',
        'Ctrl+R': 'replace',
        'Ctrl+F3': 'toggle-search-mark',
        'Ctrl+Shift+F3': 'search-start-pos',
        'Shift+Ctrl+F3': 'search-start-pos',
        'Ctrl+G': 'grep',
        'Ctrl+J': 'jump',
        'F11': 'outline',
        'F12': 'tag-jump',
        'Shift+F12': 'tag-jump-back',
        'Shift+F11': 'bm-toggle',
        'F2': 'bm-next',
        'Shift+F2': 'bm-prev',
        'Ctrl+Enter': 'diff-cmp',
        'F7': 'diff-next',
        'Shift+F7': 'diff-prev',
        'Ctrl+[': 'match-bracket',
        'Ctrl+Shift+M': 'macro-rec',
        'Ctrl+Shift+L': 'macro-play',
        'Ctrl+Shift+K': 'command-list',
        'Ctrl+I': 'inc-search',
        'Ctrl+Shift+I': 'inc-search',
        'Ctrl+D': 'dup-line',
        'Ctrl+Shift+C': 'toggle-header',
        'Shift+Ctrl+C': 'toggle-header',
        'Ctrl+Shift+P': 'print-prev',
        'Shift+Ctrl+P': 'print-prev',
        'Ctrl+P': 'print',
        'Ctrl+Alt+P': 'print-setup',
        'Ctrl+B': 'browse',
        'Alt+Enter': 'prop',
        'Ctrl+W': 'close',
        'Ctrl+F4': 'close',
        'Ctrl+Tab': 'next-tab',
        'Ctrl+Shift+Tab': 'prev-tab',
        'Shift+Ctrl+Tab': 'prev-tab',
        'Ctrl+Alt+F5': 'tab-to-space',
        'Shift+Ctrl+Alt+F5': 'space-to-tab',
        'Ctrl+Shift+Alt+F5': 'space-to-tab',
        'Ctrl+F6': 'to-lower',
        'Ctrl+F7': 'to-upper',
        'Ctrl+F8': 'to-half',
        'Ctrl+F9': 'to-kana',
        'Ctrl+F10': 'to-hira',
      };

      const matchedCmd = defaultMap[pressedCombo];
      if (matchedCmd) {
        e.preventDefault();
        handleExecuteCommandRef.current(matchedCmd);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    commonSettings,
    currentDoc,
    updateCurrentDoc,
  ]);

  // メニュー構造（サクラエディタ Windows版 画面準拠・完全再現）
  const menuGroups: MenuGroup[] = [
    {
      title: 'ファイル',
      accessKey: 'F',
      items: [
        { id: 'new', label: '新規作成(N)', shortcut: 'Ctrl+N', icon: <NewIcon size={16} />, action: handleNew },
        { id: 'new-win', label: '新規ウインドウを開く(M)', icon: <NewWinIcon size={16} />, action: () => window.open(window.location.href, '_blank') },
        { id: 'open', label: '開く(O)...', shortcut: 'Ctrl+O', icon: <OpenIcon size={16} />, action: handleOpen },
        { id: 'save', label: '上書き保存(S)', shortcut: 'Ctrl+S', icon: <SaveIcon size={16} />, action: () => handleSave(false), disabled: !currentDoc.isModified },
        { id: 'save-as', label: '名前を付けて保存(A)...', shortcut: 'Shift+Ctrl+S', icon: <SaveAsIcon size={16} />, action: () => handleSave(true) },
        { id: 'save-all', label: 'すべて上書き保存(Z)', icon: <SaveAllIcon size={16} />, action: handleSaveAll },
        { id: 'f-sep1', label: '', separator: true },
        { id: 'save-close', label: '保存して閉じる(E)', icon: <SaveCloseIcon size={16} />, action: () => { handleSave(false); handleCloseTab(activeTabId); } },
        { id: 'close', label: '閉じる(C)', shortcut: 'Ctrl+F4', icon: <CloseIcon size={16} />, action: () => handleCloseTab(activeTabId) },
        { id: 'close-untitled', label: '閉じて(無題)(R)', icon: <CloseUntitledIcon size={16} />, action: () => { handleCloseTab(activeTabId); handleNew(); } },
        { id: 'close-open', label: '閉じて開く(L)...', shortcut: 'Shift+Ctrl+F4', icon: <CloseOpenIcon size={16} />, action: () => { handleCloseTab(activeTabId); handleOpen(); } },
        {
          id: 'reopen',
          label: '開き直す(W)',
          icon: <OpenIcon size={16} />,
          children: [
            { id: 'ro-sjis', label: 'SJISで開き直す', action: () => handleReopenWithEncoding('Shift_JIS') },
            { id: 'ro-jis', label: 'JISで開き直す', action: () => handleReopenWithEncoding('ISO-2022-JP') },
            { id: 'ro-euc', label: 'EUCで開き直す', action: () => handleReopenWithEncoding('EUC-JP') },
            { id: 'ro-unicode', label: 'Unicodeで開き直す', action: () => handleReopenWithEncoding('UTF-16LE') },
            { id: 'ro-unicode-be', label: 'UnicodeBEで開き直す', action: () => handleReopenWithEncoding('UTF-16BE') },
            { id: 'ro-utf8', label: 'UTF-8で開き直す', action: () => handleReopenWithEncoding('UTF-8') },
            { id: 'ro-utf8-bom', label: 'UTF-8(BOM付)で開き直す', action: () => handleReopenWithEncoding('UTF-8-BOM') },
            { id: 'ro-sep', label: '', separator: true },
            { id: 'ro-revert', label: '変更を破棄して開き直す(R)', action: handleRevertDocument, disabled: !currentDoc.isModified },
          ],
        },
        { id: 'f-sep2', label: '', separator: true },
        { id: 'print', label: '印刷(P)...', shortcut: 'Ctrl+P', icon: <PrintIcon size={16} />, action: () => window.print() },
        { id: 'print-prev', label: '印刷プレビュー(V)', shortcut: 'Shift+Ctrl+P', icon: <PrintPrevIcon size={16} />, action: () => setIsPrintPreviewOpen(true) },
        { id: 'print-setup', label: '印刷ページ設定(U)...', shortcut: 'Ctrl+Alt+P', icon: <PrintSetupIcon size={16} />, action: () => setIsPageSetupOpen(true) },
        { id: 'f-sep3', label: '', separator: true },
        { id: 'prop', label: 'ファイルのプロパティ(T)', shortcut: 'Alt+Enter', icon: <PropertyIcon size={16} />, action: () => setIsPropertyOpen(true) },
        { id: 'browse', label: 'ブラウズ(B)', shortcut: 'Ctrl+B', icon: <BrowseIcon size={16} />, action: handleBrowse, disabled: !currentDoc.fileHandle && !currentDoc.rawBytes && !currentDoc.isModified },
        { id: 'f-sep4', label: '', separator: true },
        {
          id: 'recent-files',
          label: '最近使ったファイル(F)',
          children:
            recentFiles.length > 0
              ? recentFiles.map((name, idx) => ({
                  id: `rf-${idx}`,
                  label: name,
                  action: () => {
                    const existing = tabs.find((t) => t.title === name);
                    if (existing) {
                      setActiveTabId(existing.id);
                    } else {
                      handleOpen();
                    }
                  },
                }))
              : [{ id: 'rf-empty', label: '(履歴なし)', disabled: true }],
        },
        {
          id: 'recent-folders',
          label: '最近使ったフォルダー(D)',
          children: [{ id: 'rd-1', label: '(ローカルドキュメント)', disabled: true }],
        },
        { id: 'f-sep5', label: '', separator: true },
        { id: 'close-grp', label: 'グループを閉じる(G)', shortcut: 'Alt+F4', icon: <GroupCloseIcon size={16} />, action: () => handleCloseTab(activeTabId) },
        { id: 'exit-all-edit', label: '編集の全終了(Q)', shortcut: 'Shift+Alt+F4', icon: <ExitAllEditIcon size={16} />, action: () => tabs.forEach((t) => handleCloseTab(t.id)) },
        { id: 'exit-app', label: 'サクラエディタの全終了(X)', shortcut: 'Ctrl+Alt+F4', icon: <SakuraExitIcon size={16} />, action: () => window.close() },
      ],
    },
    {
      title: '編集',
      accessKey: 'E',
      items: [
        { id: 'undo', label: '元に戻す(U)', shortcut: 'Ctrl+Z', icon: <UndoIcon size={16} />, action: handleUndo, disabled: !currentDoc.undoManager.canUndo() },
        { id: 'redo', label: 'やり直し(R)', shortcut: 'Ctrl+Y', icon: <RedoIcon size={16} />, action: handleRedo, disabled: !currentDoc.undoManager.canRedo() },
        { id: 'e-sep1', label: '', separator: true },
        { id: 'cut', label: '切り取り(T)', shortcut: 'F7', icon: <CutIcon size={16} />, action: handleCut, disabled: !currentDoc.selection },
        { id: 'copy', label: 'コピー(C)', shortcut: 'F8', icon: <CopyIcon size={16} />, action: handleCopy, disabled: !currentDoc.selection },
        { id: 'paste', label: '貼り付け(P)', shortcut: 'F9', icon: <PasteIcon size={16} />, action: handlePaste },
        { id: 'del', label: '削除(D)', shortcut: 'Del', icon: <DeleteIcon size={16} />, action: handleDelete },
        { id: 'select-all', label: 'すべて選択(A)', shortcut: 'Ctrl+A', icon: <SelectAllIcon size={16} />, action: handleSelectAll },
        { id: 'e-sep2', label: '', separator: true },
        { id: 'reconvert', label: '再変換(R)', icon: <ReconvertIcon size={16} />, action: handleReconvert, disabled: !currentDoc.selection },
        { id: 'e-sep3', label: '', separator: true },
        { id: 'copy-crlf', label: 'CRLF改行でコピー(L)', shortcut: 'Shift+F8', icon: <CopyCrlfIcon size={16} />, action: handleCopyCrlf, disabled: !currentDoc.selection },
        { id: 'copy-wrap-nl', label: '折り返し位置に改行をつけてコピー(H)', icon: <CopyWrapIcon size={16} />, action: handleCopyWrap, disabled: !currentDoc.selection },
        { id: 'box-paste', label: '矩形貼り付け(X)', shortcut: 'Shift+F9', icon: <BoxPasteIcon size={16} />, action: handleBoxPaste, disabled: true },
        { id: 'del-prev-caret', label: 'カーソル前を削除(B)', shortcut: 'BkSp', icon: <BkSpDeleteIcon size={16} />, action: handleDelete },
        { id: 'e-sep4', label: '', separator: true },
        {
          id: 'insert-sub',
          label: '挿入(I)',
          children: [
            { id: 'word-complete', label: '単語補完(W)', shortcut: 'Ctrl+Space', icon: <WordCompleteIcon size={16} />, action: () => inputBridgeRef.current?.focus() },
            {
              id: 'ins-datetime',
              label: '現在日時を挿入',
              action: () => {
                pushUndoState();
                const now = new Date().toLocaleString('ja-JP');
                currentDoc.buffer.insert(currentDoc.cursor, now);
                updateCurrentDoc((d) => ({ ...d, isModified: true }));
              },
            },
            { id: 'ins-num', label: '連番挿入...', action: () => setIsNumberingOpen(true) },
            { id: 'ins-quote', label: '引用符を付加', action: () => applyLineTransform((lines) => lines.map((l) => '> ' + l)) },
            {
              id: 'ins-filename',
              label: 'ファイル名を挿入',
              action: () => {
                pushUndoState();
                currentDoc.buffer.insert(currentDoc.cursor, currentDoc.title);
                updateCurrentDoc((d) => ({ ...d, isModified: true }));
              },
            },
          ],
        },
        {
          id: 'advanced-sub',
          label: '高度な操作(V)',
          children: [
            { id: 'dup-line', label: '行の二重化', shortcut: 'Ctrl+D', action: duplicateCurrentLine },
            {
              id: 'del-line',
              label: '行の削除',
              action: () => {
                pushUndoState();
                const lineIdx = currentDoc.cursor.line;
                currentDoc.buffer.deleteRange({
                  start: { line: lineIdx, column: 0 },
                  end: { line: lineIdx + 1, column: 0 },
                  isBoxSelect: false,
                });
                updateCurrentDoc((d) => ({ ...d, isModified: true }));
              },
            },
            { id: 'trim-head', label: '行頭の空白削除', action: () => applyLineTransform(TextTransform.trimLineStart) },
            { id: 'trim-tail', label: '行末の空白削除', action: () => applyLineTransform(TextTransform.trimLineEnd) },
            { id: 'remove-empty', label: '空行の削除', action: () => applyLineTransform(TextTransform.removeEmptyLines) },
            { id: 'remove-dup', label: '重複行の削除 (ユニーク)', action: () => applyLineTransform(TextTransform.removeDuplicateLines) },
            { id: 'sort-asc', label: '行の昇順ソート', action: () => applyLineTransform(TextTransform.sortLinesAsc) },
            { id: 'sort-desc', label: '行の降順ソート', action: () => applyLineTransform(TextTransform.sortLinesDesc) },
          ],
        },
        {
          id: 'move-sub',
          label: '移動(O)',
          children: [
            { id: 'mv-head', label: '行頭へ移動', shortcut: 'Home', action: () => updateCurrentDoc((d) => ({ ...d, cursor: { line: d.cursor.line, column: 0 } })) },
            { id: 'mv-tail', label: '行末へ移動', shortcut: 'End', action: () => updateCurrentDoc((d) => ({ ...d, cursor: { line: d.cursor.line, column: d.buffer.getLine(d.cursor.line).length } })) },
            { id: 'mv-top', label: 'ファイル先頭へ移動', shortcut: 'Ctrl+Home', action: () => updateCurrentDoc((d) => ({ ...d, cursor: { line: 0, column: 0 } })) },
            { id: 'mv-bot', label: 'ファイル末尾へ移動', shortcut: 'Ctrl+End', action: () => updateCurrentDoc((d) => ({ ...d, cursor: { line: d.buffer.getLineCount() - 1, column: 0 } })) },
          ],
        },
        {
          id: 'select-sub',
          label: '選択(S)',
          children: [
            {
              id: 'sel-line',
              label: '現在行を選択',
              action: () => {
                const lineIdx = currentDoc.cursor.line;
                const len = currentDoc.buffer.getLine(lineIdx).length;
                updateCurrentDoc((d) => ({
                  ...d,
                  cursor: { line: lineIdx, column: len },
                  selection: {
                    start: { line: lineIdx, column: 0 },
                    end: { line: lineIdx, column: len },
                    isBoxSelect: false,
                  },
                }));
              },
            },
            { id: 'sel-word', label: '単語を選択', action: handleSelectWord },
          ],
        },
        {
          id: 'box-select-sub',
          label: '矩形選択(F)',
          children: [
            { id: 'box-sel-guide', label: 'Altキーを押しながらドラッグで矩形選択', disabled: true },
          ],
        },
        {
          id: 'format-sub',
          label: '整形(K)',
          children: [
            { id: 'tab-to-sp', label: 'TAB→空白', shortcut: 'Ctrl+Alt+F5', icon: <TabToSpaceIcon size={16} />, action: () => applyTransform((t) => TextTransform.tabToSpaces(t, activeTypeSetting.wrapConfig.tabSize)) },
            { id: 'sp-to-tab', label: '空白→TAB', shortcut: 'Shift+Ctrl+Alt+F5', icon: <SpaceToTabIcon size={16} />, action: () => applyTransform((t) => TextTransform.spacesToTab(t, activeTypeSetting.wrapConfig.tabSize)) },
            { id: 'indent-right', label: '行インデント(I)', icon: <IndentRightIcon size={16} />, action: handleIndent },
            { id: 'indent-left', label: '行逆インデント(U)', icon: <IndentLeftIcon size={16} />, action: handleUnindent },
          ],
        },
      ],
    },
    {
      title: '変換',
      accessKey: 'C',
      items: [
        { id: 'to-lower', label: '小文字(L)', shortcut: 'Ctrl+F6', icon: <ToLowerIcon size={16} />, action: () => applyTransform(TextTransform.toLowerCase), disabled: !currentDoc.selection },
        { id: 'to-upper', label: '大文字(U)', shortcut: 'Ctrl+F7', icon: <ToUpperIcon size={16} />, action: () => applyTransform(TextTransform.toUpperCase), disabled: !currentDoc.selection },
        { id: 'c-sep1', label: '', separator: true },
        { id: 'to-half', label: '全角→半角(F)', shortcut: 'Ctrl+F8', icon: <ZenToHanIcon size={16} />, action: () => applyTransform(TextTransform.toHalfWidth), disabled: !currentDoc.selection },
        { id: 'to-kana', label: '半角＋全ひら→全角・カタカナ(Z)', shortcut: 'Ctrl+F9', icon: <ToZenKanaIcon size={16} />, action: () => applyTransform(TextTransform.hanPlusZenHiraToZenKata), disabled: !currentDoc.selection },
        { id: 'to-hira', label: '半角＋全カタ→全角・ひらがな(N)', shortcut: 'Ctrl+F10', icon: <ToZenHiraIcon size={16} />, action: () => applyTransform(TextTransform.hanPlusZenKataToZenHira), disabled: !currentDoc.selection },
        { id: 'to-half-alnum', label: '全角英数→半角英数(A)', icon: <ZenAlnumToHanIcon size={16} />, action: () => applyTransform(TextTransform.zenAlnumToHan), disabled: !currentDoc.selection },
        { id: 'to-full-alnum', label: '半角英数→全角英数(M)', icon: <HanAlnumToZenIcon size={16} />, action: () => applyTransform(TextTransform.hanAlnumToZen), disabled: !currentDoc.selection },
        { id: 'to-half-kana', label: '全角カタカナ→半角カタカナ(J)', icon: <ZenKataToHanIcon size={16} />, action: () => applyTransform(TextTransform.zenKataToHan), disabled: !currentDoc.selection },
        { id: 'to-full-kana', label: '半角カタカナ→全角カタカナ(K)', shortcut: 'Ctrl+F11', icon: <HanKataToZenIcon size={16} />, action: () => applyTransform(TextTransform.hanKataToZen), disabled: !currentDoc.selection },
        { id: 'to-full-hira', label: '半角カタカナ→全角ひらがな(H)', shortcut: 'Ctrl+F12', icon: <HanKataToZenHiraIcon size={16} />, action: () => applyTransform(TextTransform.hanKataToZenHira), disabled: !currentDoc.selection },
        { id: 'c-sep2', label: '', separator: true },
        { id: 'tab-to-space', label: 'TAB→空白(S)', shortcut: 'Ctrl+Alt+F5', icon: <TabToSpaceIcon size={16} />, action: () => applyTransform((t) => TextTransform.tabToSpaces(t, activeTypeSetting.wrapConfig.tabSize)), disabled: !currentDoc.selection },
        { id: 'space-to-tab', label: '空白→TAB(T)', shortcut: 'Shift+Ctrl+Alt+F5', icon: <SpaceToTabIcon size={16} />, action: () => applyTransform((t) => TextTransform.spacesToTab(t, activeTypeSetting.wrapConfig.tabSize)), disabled: !currentDoc.selection },
        {
          id: 'code-change-sub',
          label: '文字コード変換(C)',
          children: [
            { id: 'cc-sjis', label: 'SJISに変換', action: () => handleConvertEncoding('Shift_JIS') },
            { id: 'cc-jis', label: 'JISに変換', action: () => handleConvertEncoding('ISO-2022-JP') },
            { id: 'cc-euc', label: 'EUCに変換', action: () => handleConvertEncoding('EUC-JP') },
            { id: 'cc-unicode', label: 'Unicodeに変換', action: () => handleConvertEncoding('UTF-16LE') },
            { id: 'cc-unicode-be', label: 'UnicodeBEに変換', action: () => handleConvertEncoding('UTF-16BE') },
            { id: 'cc-utf8', label: 'UTF-8に変換', action: () => handleConvertEncoding('UTF-8') },
            { id: 'cc-utf8-bom', label: 'UTF-8(BOM付)に変換', action: () => handleConvertEncoding('UTF-8-BOM') },
            { id: 'cc-sep1', label: '', separator: true },
            { id: 'cc-crlf', label: 'CRLFに変換', action: () => handleConvertLineEnding('CRLF') },
            { id: 'cc-lf', label: 'LFに変換', action: () => handleConvertLineEnding('LF') },
            { id: 'cc-cr', label: 'CRに変換', action: () => handleConvertLineEnding('CR') },
            { id: 'cc-sep2', label: '', separator: true },
            { id: 'cc-dialog', label: '文字コード・改行指定...', action: () => setIsEncodingOpen(true) },
          ],
        },
      ],
    },
    {
      title: '検索',
      accessKey: 'S',
      items: [
        { id: 'find', label: '検索(F)...', shortcut: 'Ctrl+F', icon: <FindIcon size={16} />, action: () => { setIsReplaceMode(false); setIsSearchOpen(true); } },
        { id: 'find-next', label: '次を検索(N)', shortcut: 'F3', icon: <FindNextIcon size={16} />, action: () => handleFindNext() },
        { id: 'find-prev', label: '前を検索(P)', shortcut: 'Shift+F3', icon: <FindPrevIcon size={16} />, action: () => handleFindPrevious() },
        { id: 'replace', label: '置換(R)...', shortcut: 'Ctrl+R', icon: <ReplaceIcon size={16} />, action: () => { setIsReplaceMode(true); setIsSearchOpen(true); } },
        {
          id: 'toggle-search-mark',
          label: '検索マークの切替え(C)',
          shortcut: 'Ctrl+F3',
          icon: <SearchMarkIcon size={16} />,
          action: () => setSearchHighlight((prev) => (prev ? null : { query: 'サクラ', isRegex: false, matchCase: false })),
        },
        { id: 'search-start-pos', label: '検索開始位置へ戻る(I)', shortcut: 'Shift+Ctrl+F3', icon: <ReturnSearchOriginIcon size={16} />, action: handleReturnSearchOrigin, disabled: !searchOriginPos },
        {
          id: 'inc-search',
          label: 'インクリメンタルサーチ(S)',
          icon: <IncSearchIcon size={16} />,
          children: [
            { id: 'inc-fwd', label: '前方インクリメンタルサーチ', shortcut: 'Ctrl+I', action: () => setIsIncSearchOpen(true) },
            { id: 'inc-bwd', label: '後方インクリメンタルサーチ', shortcut: 'Shift+Ctrl+I', action: () => setIsIncSearchOpen(true) },
          ],
        },
        { id: 's-sep1', label: '', separator: true },
        {
          id: 'bm-sub',
          label: 'ブックマーク(M)',
          children: [
            {
              id: 'bm-toggle',
              label: 'ブックマーク設定・解除(B)',
              shortcut: 'F11',
              icon: <BookmarkIcon size={16} />,
              action: () => {
                currentDoc.bookmarkManager.toggle(currentDoc.cursor.line);
                updateCurrentDoc((d) => ({ ...d }));
              },
            },
            {
              id: 'bm-next',
              label: '次のブックマーク(N)',
              shortcut: 'F2',
              icon: <BmNextIcon size={16} />,
              action: () => {
                const next = currentDoc.bookmarkManager.getNext(currentDoc.cursor.line, currentDoc.buffer.getLineCount());
                if (next !== null) updateCurrentDoc((d) => ({ ...d, cursor: { line: next, column: 0 } }));
              },
            },
            {
              id: 'bm-prev',
              label: '前のブックマーク(P)',
              shortcut: 'Shift+F2',
              icon: <BmPrevIcon size={16} />,
              action: () => {
                const prev = currentDoc.bookmarkManager.getPrev(currentDoc.cursor.line);
                if (prev !== null) updateCurrentDoc((d) => ({ ...d, cursor: { line: prev, column: 0 } }));
              },
            },
            {
              id: 'bm-clear',
              label: '全ブックマーク解除(C)',
              icon: <BmClearIcon size={16} />,
              action: () => {
                currentDoc.bookmarkManager.clearAll();
                updateCurrentDoc((d) => ({ ...d }));
              },
            },
            { id: 'bm-extract', label: 'ブックマーク行の抽出(E)...', icon: <BookmarkIcon size={16} />, action: extractBookmarksToNewTab },
            { id: 'bm-invert', label: 'ブックマーク行の反転(I)', action: handleInvertBookmarks },
            { id: 'bm-delete', label: 'ブックマーク行の削除(D)', action: handleDeleteBookmarkedLines },
          ],
        },
        { id: 's-sep2', label: '', separator: true },
        { id: 'grep', label: 'Grep(G)...', shortcut: 'Ctrl+G', icon: <GrepIcon size={16} />, action: () => { setIsGrepReplaceMode(false); setIsGrepOpen(true); } },
        { id: 'grep-rep', label: 'Grep置換...', icon: <GrepReplaceIcon size={16} />, action: () => { setIsGrepReplaceMode(true); setIsGrepOpen(true); } },
        { id: 'jump', label: '指定行へジャンプ(J)...', shortcut: 'Ctrl+J', icon: <JumpIcon size={16} />, action: () => setIsJumpOpen(true) },
        { id: 'outline', label: 'アウトライン解析(L)...', shortcut: 'F11', icon: <OutlineIcon size={16} />, action: () => setIsOutlineOpen(true) },
        { id: 'file-tree', label: 'ファイルツリー(E)', icon: <FileTreeIcon size={16} />, action: () => setIsTreeOpen((prev) => !prev) },
        { id: 'tag-jump', label: 'タグジャンプ(T)', shortcut: 'F12', icon: <TagJumpIcon size={16} />, action: handleTagJump },
        { id: 'tag-jump-back', label: 'タグジャンプバック(B)', shortcut: 'Shift+F12', icon: <TagJumpBackIcon size={16} />, action: handleTagJumpBack },
        { id: 'tag-file-create', label: 'タグファイルの作成...', icon: <TagCreateIcon size={16} />, action: handleCreateTagsFile },
        { id: 'direct-tag-jump', label: 'ダイレクトタグジャンプ', icon: <TagJumpIcon size={16} />, action: handleTagJump, disabled: true },
        { id: 'keyword-tag-jump', label: 'キーワードを指定してタグジャンプ...', icon: <FindIcon size={16} />, action: handleKeywordTagJump, disabled: true },
        { id: 'toggle-header', label: '同名のC/C++ヘッダー(ソース)を開く(C)', shortcut: 'Shift+Ctrl+C', icon: <HeaderSourceIcon size={16} />, action: handleToggleHeaderSource, disabled: !(/\.(c|cpp|cc|cxx|h|hpp)$/i.test(currentDoc.title)) },
        { id: 's-sep3', label: '', separator: true },
        { id: 'diff-cmp', label: 'ファイル内容比較(@)...', shortcut: 'Ctrl+Enter', icon: <DiffIcon size={16} />, action: () => setIsDiffOpen(true), disabled: tabs.length <= 1 },
        { id: 'diff-show', label: 'DIFF差分表示(D)...', icon: <DiffIcon size={16} />, action: () => setIsDiffOpen(true) },
        { id: 'diff-next', label: '次の差分へ', icon: <DiffNextIcon size={16} />, action: handleDiffNext, disabled: !currentDoc.diffMarks || currentDoc.diffMarks.size === 0 },
        { id: 'diff-prev', label: '前の差分へ', icon: <DiffPrevIcon size={16} />, action: handleDiffPrev, disabled: !currentDoc.diffMarks || currentDoc.diffMarks.size === 0 },
        { id: 'diff-clear', label: '差分表示の全解除', icon: <DiffClearIcon size={16} />, action: handleDiffClear, disabled: !currentDoc.diffMarks || currentDoc.diffMarks.size === 0 },
        { id: 's-sep4', label: '', separator: true },
        { id: 'match-bracket', label: '対括弧の検索([)', shortcut: 'Ctrl+[', icon: <BracketMatchIcon size={16} />, action: handleMatchBracket },
      ],
    },
    {
      title: 'ツール',
      accessKey: 'T',
      items: [
        {
          id: 'macro-rec',
          label: isRecordingMacro ? 'キーマクロの記録終了(M)' : 'キーマクロの記録開始(M)',
          shortcut: 'Ctrl+Shift+M',
          icon: <MacroRecIcon size={16} />,
          action: toggleMacroRecording,
        },
        { id: 'macro-save', label: 'キーマクロの保存(S)...', icon: <SaveIcon size={16} />, action: () => setIsMacroOpen(true) },
        { id: 'macro-load', label: 'キーマクロの読み込み(L)...', icon: <OpenIcon size={16} />, action: () => setIsMacroOpen(true) },
        { id: 'macro-play', label: 'キーマクロの実行(E)', shortcut: 'Ctrl+Shift+L', icon: <MacroPlayIcon size={16} />, action: executeRecordedMacro },
        { id: 't-sep1', label: '', separator: true },
        {
          id: 'macro-list-sub',
          label: 'マクロ(A)',
          children:
            commonSettings.macros.length > 0
              ? commonSettings.macros.map((m) => ({
                  id: `macro-run-${m.id}`,
                  label: `${m.id}: ${m.name || '(名称未設定)'}${m.shortcut ? `\t${m.shortcut}` : ''}`,
                  action: () => executeRegisteredMacro(m),
                }))
              : [{ id: 'no-macro', label: '(登録マクロなし)', disabled: true }],
        },
        { id: 'macro-manage', label: 'マクロの実行・管理...', action: () => setIsMacroOpen(true) },
        {
          id: 'macro-register',
          label: 'マクロ登録(R)...',
          action: () => {
            setCommonSettingInitialTab('macro');
            setIsCommonSettingsOpen(true);
          },
        },
        { id: 'external-tool', label: '外部コマンド実行(X)...', action: () => setIsExternalToolOpen(true) },
      ],
    },
    {
      title: '設定',
      accessKey: 'O',
      items: [
        { id: 'type-list', label: 'タイプ別設定一覧(L)...', icon: <TypeListIcon size={16} />, action: () => setIsTypeListOpen(true) },
        {
          id: 'type-settings',
          label: 'タイプ別設定(Y)...',
          icon: <TypeSettingsIcon size={16} />,
          action: () => {
            setEditingTypeItem(activeTypeSetting);
            setTypeSettingInitialTab('screen');
            setIsTypeSettingsOpen(true);
          },
        },
        {
          id: 'color-settings',
          label: 'カラー設定(E)...',
          icon: <TypeSettingsIcon size={16} />,
          action: () => {
            setEditingTypeItem(activeTypeSetting);
            setTypeSettingInitialTab('color');
            setIsTypeSettingsOpen(true);
          },
        },
        {
          id: 'common-settings',
          label: '共通設定(C)...',
          icon: <CommonSettingsIcon size={16} />,
          action: () => {
            setCommonSettingInitialTab('general');
            setIsCommonSettingsOpen(true);
          },
        },
        { id: 'o-sep1', label: '', separator: true },
        {
          id: 'font-dialog',
          label: 'フォント(F)...',
          icon: <FontIcon size={16} />,
          action: () => setIsFontOpen(true),
        },
        { id: 'o-sep2', label: '', separator: true },
        {
          id: 'toggle-toolbar',
          label: 'ツールバー表示(T)',
          checked: commonSettings.toolbar.showToolbar,
          action: () =>
            setCommonSettings((prev) => ({
              ...prev,
              toolbar: { ...prev.toolbar, showToolbar: !prev.toolbar.showToolbar },
            })),
        },
        {
          id: 'toggle-fnkey',
          label: 'ファンクションキー表示(K)',
          checked: !!commonSettings.functionKey?.showFunctionKey,
          action: () =>
            setCommonSettings((prev) => ({
              ...prev,
              functionKey: {
                ...prev.functionKey,
                showFunctionKey: !prev.functionKey?.showFunctionKey,
                position: prev.functionKey?.position || 'bottom',
              },
            })),
        },
        {
          id: 'toggle-statusbar',
          label: 'ステータスバー表示(S)',
          checked: commonSettings.statusbar.showStatusbar,
          action: () =>
            setCommonSettings((prev) => ({
              ...prev,
              statusbar: { ...prev.statusbar, showStatusbar: !prev.statusbar.showStatusbar },
            })),
        },
        {
          id: 'toggle-ruler',
          label: 'ルーラー表示(R)',
          checked: activeTypeSetting.showRuler,
          action: () => {
            const updated = { ...activeTypeSetting, showRuler: !activeTypeSetting.showRuler };
            setTypeSettingsList((prev) => prev.map((t) => (t.id === activeTypeId ? updated : t)));
          },
        },
        {
          id: 'toggle-tabbar',
          label: 'タブバー表示(B)',
          checked: commonSettings.tabbar.showTabbar,
          action: () =>
            setCommonSettings((prev) => ({
              ...prev,
              tabbar: { ...prev.tabbar, showTabbar: !prev.tabbar.showTabbar },
            })),
        },
        {
          id: 'toggle-linenum',
          label: '行番号表示(N)',
          checked: activeTypeSetting.showLineNumbers,
          action: () => {
            const updated = { ...activeTypeSetting, showLineNumbers: !activeTypeSetting.showLineNumbers };
            setTypeSettingsList((prev) => prev.map((t) => (t.id === activeTypeId ? updated : t)));
          },
        },
        { id: 'o-sep3', label: '', separator: true },
        { id: 'export-ini', label: '設定のエクスポート (sakura.ini)...', icon: <ExportIniIcon size={16} />, action: handleExportIni },
        { id: 'import-ini', label: '設定のインポート (sakura.ini)...', icon: <ImportIniIcon size={16} />, action: handleImportIni },
      ],
    },
    {
      title: 'ウィンドウ',
      accessKey: 'W',
      items: [
        { id: 'split-v', label: '縦に分割(V)', icon: <WindowSplitIcon size={16} />, action: () => setSplitMode('vertical') },
        { id: 'split-h', label: '横に分割(H)', icon: <WindowSplitIcon size={16} />, action: () => setSplitMode('horizontal') },
        { id: 'split-quad', label: '4分割(4)', icon: <SplitQuadIcon size={16} />, action: () => setSplitMode('quad') },
        { id: 'split-clear', label: '分割解除(R)', icon: <CloseIcon size={16} />, action: () => setSplitMode('none') },
        { id: 'w-sep1', label: '', separator: true },
        {
          id: 'next-tab',
          label: '次のタブ',
          shortcut: 'Ctrl+Tab',
          icon: <NewWinIcon size={16} />,
          action: () => {
            const idx = tabs.findIndex((t) => t.id === activeTabId);
            const next = tabs[(idx + 1) % tabs.length];
            setActiveTabId(next.id);
          },
        },
        {
          id: 'prev-tab',
          label: '前のタブ',
          shortcut: 'Shift+Ctrl+Tab',
          icon: <NewWinIcon size={16} />,
          action: () => {
            const idx = tabs.findIndex((t) => t.id === activeTabId);
            const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
            setActiveTabId(prev.id);
          },
        },
        { id: 'close-tab-win', label: '閉じる', shortcut: 'Ctrl+W', icon: <CloseIcon size={16} />, action: () => handleCloseTab(activeTabId) },
        { id: 'w-sep2', label: '', separator: true },
        ...tabs.map((tab, idx) => ({
          id: `w-tab-${tab.id}`,
          label: `${idx + 1}: ${tab.title}${tab.isModified ? ' *' : ''}`,
          checked: tab.id === activeTabId,
          action: () => {
            setActiveTabId(tab.id);
            setActiveTypeId(detectTypeFromFilename(tab.title));
          },
        })),
      ],
    },
    {
      title: 'ヘルプ',
      accessKey: 'H',
      items: [
        { id: 'help-index', label: '目次(C)', action: () => setIsAboutOpen(true) },
        { id: 'command-list', label: 'コマンド一覧(K)...', shortcut: 'Ctrl+Shift+K', icon: <CommandListIcon size={16} />, action: () => setIsCommandListOpen(true) },
        { id: 'about', label: 'サクラエディタについて(A)...', icon: <AboutIcon size={16} />, action: () => setIsAboutOpen(true) },
      ],
    },
  ];

  // 該当行マーク (検索に一致した全行にブックマークを設定)
  const handleMarkAll = (options: SearchOptions) => {
    if (!options.query) return;
    const lineCount = currentDoc.buffer.getLineCount();
    let markCount = 0;
    for (let i = 0; i < lineCount; i++) {
      const lineText = currentDoc.buffer.getLine(i);
      let matched = false;
      if (options.isRegex) {
        try {
          const reg = new RegExp(options.query, options.matchCase ? 'g' : 'gi');
          matched = reg.test(lineText);
        } catch {}
      } else {
        matched = options.matchCase
          ? lineText.includes(options.query)
          : lineText.toLowerCase().includes(options.query.toLowerCase());
      }
      if (matched) {
        if (!currentDoc.bookmarkManager.isBookmarked(i)) {
          currentDoc.bookmarkManager.toggle(i);
        }
        markCount++;
      }
    }
    updateCurrentDoc((d) => ({ ...d }));
    alert(`${markCount} 行に該当行マーク（ブックマーク）を設定しました。`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* ウィンドウ タイトルバー (Windows サクラエディタ完全再現) */}
      <TitleBar title={currentDoc.title} isModified={currentDoc.isModified} />

      {/* メニューバー (真正 Win32 アイコン付き) */}
      <MenuBar groups={menuGroups} />

      {/* ツールバー (真正 Win32 アイコン付き) */}
      {commonSettings.toolbar.showToolbar && (
        <ToolBar
          onNew={handleNew}
          onNewWithType={handleNewWithType}
          onOpen={handleOpen}
          onSave={() => handleSave(false)}
          onSaveAs={() => handleSave(true)}
          onPrint={() => window.print()}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          onFind={() => {
            setIsReplaceMode(false);
            setIsSearchOpen(true);
          }}
          onFindNext={() => handleFindNext()}
          onFindPrev={() => handleFindPrevious()}
          onReplace={() => {
            setIsReplaceMode(true);
            setIsSearchOpen(true);
          }}
          onGrep={() => setIsGrepOpen(true)}
          onOutline={() => setIsOutlineOpen(true)}
          onBookmarkToggle={() => {
            currentDoc.bookmarkManager.toggle(currentDoc.cursor.line);
            updateCurrentDoc((d) => ({ ...d }));
          }}
          onBookmarkPrev={() => {
            const prev = currentDoc.bookmarkManager.getPrev(currentDoc.cursor.line);
            if (prev !== null) updateCurrentDoc((d) => ({ ...d, cursor: { line: prev, column: 0 } }));
          }}
          onBookmarkNext={() => {
            const next = currentDoc.bookmarkManager.getNext(currentDoc.cursor.line, currentDoc.buffer.getLineCount());
            if (next !== null) updateCurrentDoc((d) => ({ ...d, cursor: { line: next, column: 0 } }));
          }}
          onBookmarkClear={() => {
            currentDoc.bookmarkManager.clearAll();
            updateCurrentDoc((d) => ({ ...d }));
          }}
          onTypeSettings={() => {
            setEditingTypeItem(activeTypeSetting);
            setTypeSettingInitialTab('screen');
            setIsTypeSettingsOpen(true);
          }}
          onCommonSettings={() => {
            setCommonSettingInitialTab('general');
            setIsCommonSettingsOpen(true);
          }}
          canUndo={currentDoc.undoManager.canUndo()}
          canRedo={currentDoc.undoManager.canRedo()}
          canSave={currentDoc.isModified}
          canCut={!!currentDoc.selection}
          canCopy={!!currentDoc.selection}
          flatButtons={commonSettings.toolbar.flatButtons}
          showTooltips={commonSettings.toolbar.showTooltips}
        />
      )}

      {/* タブバー (上部配置の場合) */}
      {commonSettings.tabbar.showTabbar && commonSettings.tabbar.position !== 'bottom' && (
        <TabBar
          tabs={tabs.map((t) => ({ id: t.id, title: t.title, isModified: t.isModified }))}
          activeTabId={activeTabId}
          onSelectTab={(id) => {
            setActiveTabId(id);
            const doc = tabs.find((t) => t.id === id);
            if (doc) {
              setActiveTypeId(detectTypeFromFilename(doc.title));
            }
          }}
          onCloseTab={handleCloseTab}
          onCloseOtherTabs={(keepId) => {
            setTabs((prev) => prev.filter((t) => t.id === keepId));
            setActiveTabId(keepId);
          }}
          onCloseAllTabs={() => {
            handleNew();
            setTabs((prev) => prev.slice(-1));
          }}
          onSaveTab={(id) => {
            setActiveTabId(id);
            handleSave(false);
          }}
          onNewTab={handleNew}
          showCloseButton={commonSettings.tabbar.showCloseButton}
          showModifiedMarker={commonSettings.tabbar.showModifiedMarker}
          position="top"
        />
      )}

      {/* メイン領域 (ファイルツリー + エディタ本体 + 分割ビュー) */}
      <div style={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* ドッキング型ファイルツリー (左側パネル) */}
        <FileTreePanel
          isOpen={isTreeOpen}
          onClose={() => setIsTreeOpen(false)}
          tabs={tabs.map((t) => ({ id: t.id, title: t.title, isModified: t.isModified }))}
          activeTabId={activeTabId}
          onSelectTab={(id) => {
            setActiveTabId(id);
            const doc = tabs.find((t) => t.id === id);
            if (doc) setActiveTypeId(detectTypeFromFilename(doc.title));
          }}
          bookmarkedLines={currentDoc.bookmarkManager.getBookmarkedLines()}
          onJumpToLine={(line) => updateCurrentDoc((d) => ({ ...d, cursor: { line: line - 1, column: 0 } }))}
        />

        {/* エディタ分割コンテナ */}
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: splitMode === 'horizontal' ? 'column' : 'row',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {splitMode === 'quad' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* 上段 (Pane 1 & Pane 2) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <EditorView
                    key={`${currentDoc.id}-quad-1`}
                    buffer={currentDoc.buffer}
                    settings={activeTypeSetting}
                    cursor={currentDoc.cursor}
                    selection={currentDoc.selection}
                    diffMarks={currentDoc.diffMarks}
                    onCursorChange={(pos, vCol, charCode) => {
                      updateCurrentDoc((d) => ({ ...d, cursor: pos }));
                      setVisualCol(vCol);
                      setCurrentCharCode(charCode);
                    }}
                    onSelectionChange={(sel) => updateCurrentDoc((d) => ({ ...d, selection: sel }))}
                    onContentChange={() => {
                      pushUndoState();
                      updateCurrentDoc((d) => ({ ...d, isModified: true }));
                    }}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    inputBridgeRef={inputBridgeRef}
                    bookmarkManager={currentDoc.bookmarkManager}
                    searchHighlight={searchHighlight}
                    onClearSearchHighlight={() => setSearchHighlight(null)}
                    onOpenSearch={() => { setIsReplaceMode(false); setIsSearchOpen(true); }}
                    onOpenReplace={() => { setIsReplaceMode(true); setIsSearchOpen(true); }}
                    onFindNext={() => handleFindNext()}
                    onFindPrev={() => handleFindPrevious()}
                    onOpenProperty={() => setIsPropertyOpen(true)}
                    onToggleOverstrike={() =>
                      setCommonSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, overstrike: !prev.general.overstrike },
                      }))
                    }
                    onOpenIncrementalSearch={(back) => { setIsIncSearchOpen(true); if (back) handleIncSearchPrev(); }}
                    onLineDoubleClick={handleJumpFromGrepOrTag}
                    zoomPercent={zoomPercent}
                    onZoomChange={(delta) => setZoomPercent((prev) => Math.min(300, Math.max(50, prev + delta * 10)))}
                    isOverstrike={commonSettings.general.overstrike}
                    freeCursor={commonSettings.general.freeCursor}
                    showModifiedGutter={commonSettings.general.showModifiedGutter}
                  />
                </div>
                <div style={{ backgroundColor: '#808080', width: '4px', cursor: 'col-resize', zIndex: 5 }} />
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <EditorView
                    key={`${currentDoc.id}-quad-2`}
                    buffer={currentDoc.buffer}
                    settings={activeTypeSetting}
                    cursor={cursor2}
                    selection={selection2}
                    diffMarks={currentDoc.diffMarks}
                    onCursorChange={(pos) => setCursor2(pos)}
                    onSelectionChange={(sel) => setSelection2(sel)}
                    onContentChange={() => {
                      pushUndoState();
                      updateCurrentDoc((d) => ({ ...d, isModified: true }));
                    }}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    inputBridgeRef={inputBridgeRef2}
                    bookmarkManager={currentDoc.bookmarkManager}
                    searchHighlight={searchHighlight}
                    onClearSearchHighlight={() => setSearchHighlight(null)}
                    onOpenSearch={() => { setIsReplaceMode(false); setIsSearchOpen(true); }}
                    onOpenReplace={() => { setIsReplaceMode(true); setIsSearchOpen(true); }}
                    onFindNext={() => handleFindNext()}
                    onFindPrev={() => handleFindPrevious()}
                    onOpenProperty={() => setIsPropertyOpen(true)}
                    onToggleOverstrike={() =>
                      setCommonSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, overstrike: !prev.general.overstrike },
                      }))
                    }
                    onOpenIncrementalSearch={(back) => { setIsIncSearchOpen(true); if (back) handleIncSearchPrev(); }}
                    onLineDoubleClick={handleJumpFromGrepOrTag}
                    zoomPercent={zoomPercent}
                    onZoomChange={(delta) => setZoomPercent((prev) => Math.min(300, Math.max(50, prev + delta * 10)))}
                    isOverstrike={commonSettings.general.overstrike}
                    freeCursor={commonSettings.general.freeCursor}
                    showModifiedGutter={commonSettings.general.showModifiedGutter}
                  />
                </div>
              </div>

              {/* 水平スプリッター */}
              <div style={{ backgroundColor: '#808080', height: '4px', cursor: 'row-resize', zIndex: 5 }} />

              {/* 下段 (Pane 3 & Pane 4) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <EditorView
                    key={`${currentDoc.id}-quad-3`}
                    buffer={currentDoc.buffer}
                    settings={activeTypeSetting}
                    cursor={cursor3}
                    selection={selection3}
                    diffMarks={currentDoc.diffMarks}
                    onCursorChange={(pos) => setCursor3(pos)}
                    onSelectionChange={(sel) => setSelection3(sel)}
                    onContentChange={() => {
                      pushUndoState();
                      updateCurrentDoc((d) => ({ ...d, isModified: true }));
                    }}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    inputBridgeRef={inputBridgeRef3}
                    bookmarkManager={currentDoc.bookmarkManager}
                    searchHighlight={searchHighlight}
                    onClearSearchHighlight={() => setSearchHighlight(null)}
                    onOpenSearch={() => { setIsReplaceMode(false); setIsSearchOpen(true); }}
                    onOpenReplace={() => { setIsReplaceMode(true); setIsSearchOpen(true); }}
                    onFindNext={() => handleFindNext()}
                    onFindPrev={() => handleFindPrevious()}
                    onOpenProperty={() => setIsPropertyOpen(true)}
                    onToggleOverstrike={() =>
                      setCommonSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, overstrike: !prev.general.overstrike },
                      }))
                    }
                    onOpenIncrementalSearch={(back) => { setIsIncSearchOpen(true); if (back) handleIncSearchPrev(); }}
                    onLineDoubleClick={handleJumpFromGrepOrTag}
                    zoomPercent={zoomPercent}
                    onZoomChange={(delta) => setZoomPercent((prev) => Math.min(300, Math.max(50, prev + delta * 10)))}
                    isOverstrike={commonSettings.general.overstrike}
                    freeCursor={commonSettings.general.freeCursor}
                    showModifiedGutter={commonSettings.general.showModifiedGutter}
                  />
                </div>
                <div style={{ backgroundColor: '#808080', width: '4px', cursor: 'col-resize', zIndex: 5 }} />
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <EditorView
                    key={`${currentDoc.id}-quad-4`}
                    buffer={currentDoc.buffer}
                    settings={activeTypeSetting}
                    cursor={cursor4}
                    selection={selection4}
                    diffMarks={currentDoc.diffMarks}
                    onCursorChange={(pos) => setCursor4(pos)}
                    onSelectionChange={(sel) => setSelection4(sel)}
                    onContentChange={() => {
                      pushUndoState();
                      updateCurrentDoc((d) => ({ ...d, isModified: true }));
                    }}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    inputBridgeRef={inputBridgeRef4}
                    bookmarkManager={currentDoc.bookmarkManager}
                    searchHighlight={searchHighlight}
                    onClearSearchHighlight={() => setSearchHighlight(null)}
                    onOpenSearch={() => { setIsReplaceMode(false); setIsSearchOpen(true); }}
                    onOpenReplace={() => { setIsReplaceMode(true); setIsSearchOpen(true); }}
                    onFindNext={() => handleFindNext()}
                    onFindPrev={() => handleFindPrevious()}
                    onOpenProperty={() => setIsPropertyOpen(true)}
                    onToggleOverstrike={() =>
                      setCommonSettings((prev) => ({
                        ...prev,
                        general: { ...prev.general, overstrike: !prev.general.overstrike },
                      }))
                    }
                    onOpenIncrementalSearch={(back) => { setIsIncSearchOpen(true); if (back) handleIncSearchPrev(); }}
                    onLineDoubleClick={handleJumpFromGrepOrTag}
                    zoomPercent={zoomPercent}
                    onZoomChange={(delta) => setZoomPercent((prev) => Math.min(300, Math.max(50, prev + delta * 10)))}
                    isOverstrike={commonSettings.general.overstrike}
                    freeCursor={commonSettings.general.freeCursor}
                    showModifiedGutter={commonSettings.general.showModifiedGutter}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ペイン 1 */}
              <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <EditorView
                  key={currentDoc.id}
                  buffer={currentDoc.buffer}
                  settings={activeTypeSetting}
                  cursor={currentDoc.cursor}
                  selection={currentDoc.selection}
                  diffMarks={currentDoc.diffMarks}
                  onCursorChange={(pos, vCol, charCode) => {
                    updateCurrentDoc((d) => ({ ...d, cursor: pos }));
                    setVisualCol(vCol);
                    setCurrentCharCode(charCode);
                  }}
                  onSelectionChange={(sel) => updateCurrentDoc((d) => ({ ...d, selection: sel }))}
                  onContentChange={() => {
                    pushUndoState();
                    updateCurrentDoc((d) => ({ ...d, isModified: true }));
                  }}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  inputBridgeRef={inputBridgeRef}
                  bookmarkManager={currentDoc.bookmarkManager}
                  searchHighlight={searchHighlight}
                  onClearSearchHighlight={() => setSearchHighlight(null)}
                  onOpenSearch={() => { setIsReplaceMode(false); setIsSearchOpen(true); }}
                  onOpenReplace={() => { setIsReplaceMode(true); setIsSearchOpen(true); }}
                  onFindNext={() => handleFindNext()}
                  onFindPrev={() => handleFindPrevious()}
                  onOpenProperty={() => setIsPropertyOpen(true)}
                  onToggleOverstrike={() =>
                    setCommonSettings((prev) => ({
                      ...prev,
                      general: { ...prev.general, overstrike: !prev.general.overstrike },
                    }))
                  }
                  onOpenIncrementalSearch={(back) => { setIsIncSearchOpen(true); if (back) handleIncSearchPrev(); }}
                  onLineDoubleClick={handleJumpFromGrepOrTag}
                  zoomPercent={zoomPercent}
                  onZoomChange={(delta) => setZoomPercent((prev) => Math.min(300, Math.max(50, prev + delta * 10)))}
                  isOverstrike={commonSettings.general.overstrike}
                  freeCursor={commonSettings.general.freeCursor}
                  showModifiedGutter={commonSettings.general.showModifiedGutter}
                />
              </div>

              {/* スプリッター & ペイン 2 (画面分割時) */}
              {splitMode !== 'none' && (
                <>
                  <div
                    style={{
                      backgroundColor: '#808080',
                      width: splitMode === 'vertical' ? '4px' : '100%',
                      height: splitMode === 'horizontal' ? '4px' : '100%',
                      cursor: splitMode === 'vertical' ? 'col-resize' : 'row-resize',
                      zIndex: 5,
                    }}
                  />
                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    <EditorView
                      key={`${currentDoc.id}-split-pane`}
                      buffer={currentDoc.buffer}
                      settings={activeTypeSetting}
                      cursor={cursor2}
                      selection={selection2}
                      diffMarks={currentDoc.diffMarks}
                      onCursorChange={(pos) => setCursor2(pos)}
                      onSelectionChange={(sel) => setSelection2(sel)}
                      onContentChange={() => {
                        pushUndoState();
                        updateCurrentDoc((d) => ({ ...d, isModified: true }));
                      }}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      inputBridgeRef={inputBridgeRef2}
                      bookmarkManager={currentDoc.bookmarkManager}
                      searchHighlight={searchHighlight}
                      onClearSearchHighlight={() => setSearchHighlight(null)}
                      onOpenSearch={() => { setIsReplaceMode(false); setIsSearchOpen(true); }}
                      onOpenReplace={() => { setIsReplaceMode(true); setIsSearchOpen(true); }}
                      onFindNext={() => handleFindNext()}
                      onFindPrev={() => handleFindPrevious()}
                      onOpenProperty={() => setIsPropertyOpen(true)}
                      onToggleOverstrike={() =>
                        setCommonSettings((prev) => ({
                          ...prev,
                          general: { ...prev.general, overstrike: !prev.general.overstrike },
                        }))
                      }
                      onOpenIncrementalSearch={(back) => { setIsIncSearchOpen(true); if (back) handleIncSearchPrev(); }}
                      onLineDoubleClick={handleJumpFromGrepOrTag}
                      zoomPercent={zoomPercent}
                      onZoomChange={(delta) => setZoomPercent((prev) => Math.min(300, Math.max(50, prev + delta * 10)))}
                      isOverstrike={commonSettings.general.overstrike}
                      freeCursor={commonSettings.general.freeCursor}
                      showModifiedGutter={commonSettings.general.showModifiedGutter}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* タブバー (下部配置の場合) */}
      {commonSettings.tabbar.showTabbar && commonSettings.tabbar.position === 'bottom' && (
        <TabBar
          tabs={tabs.map((t) => ({ id: t.id, title: t.title, isModified: t.isModified }))}
          activeTabId={activeTabId}
          onSelectTab={(id) => {
            setActiveTabId(id);
            const doc = tabs.find((t) => t.id === id);
            if (doc) {
              setActiveTypeId(detectTypeFromFilename(doc.title));
            }
          }}
          onCloseTab={handleCloseTab}
          onCloseOtherTabs={(keepId) => {
            setTabs((prev) => prev.filter((t) => t.id === keepId));
            setActiveTabId(keepId);
          }}
          onCloseAllTabs={() => {
            handleNew();
            setTabs((prev) => prev.slice(-1));
          }}
          onSaveTab={(id) => {
            setActiveTabId(id);
            handleSave(false);
          }}
          onNewTab={handleNew}
          showCloseButton={commonSettings.tabbar.showCloseButton}
          showModifiedMarker={commonSettings.tabbar.showModifiedMarker}
          position="bottom"
        />
      )}

      {/* インクリメンタルサーチツールバー */}
      <IncrementalSearchBar
        isOpen={isIncSearchOpen}
        onClose={() => setIsIncSearchOpen(false)}
        query={incSearchQuery}
        onChangeQuery={handleIncSearchChange}
        onFindNext={handleIncSearchNext}
        onFindPrev={handleIncSearchPrev}
        matchCase={incSearchMatchCase}
        onChangeMatchCase={setIncSearchMatchCase}
        isRegex={incSearchIsRegex}
        onChangeIsRegex={setIncSearchIsRegex}
        matchCount={incSearchMatchCount}
      />

      {/* ファンクションキーバー (サクラエディタ標準 F1〜F12 バー) */}
      {commonSettings.functionKey?.showFunctionKey && (
        <FunctionKeyBar
          onExecuteCommand={(cmd) => handleExecuteCommand(cmd)}
          position={commonSettings.functionKey.position || 'bottom'}
        />
      )}

      {/* ステータスバー */}
      {commonSettings.statusbar.showStatusbar && (
        <StatusBar
          cursor={currentDoc.cursor}
          visualCol={visualCol}
          totalLines={currentDoc.buffer.getLineCount()}
          selectedChars={selectedInfo.chars}
          selectedLines={selectedInfo.lines}
          encoding={currentDoc.encoding}
          lineEnding={currentDoc.lineEnding}
          isOverstrike={commonSettings.general.overstrike}
          currentCharCode={currentCharCode}
          isRecordingMacro={isRecordingMacro}
          config={commonSettings.statusbar}
          onPositionClick={() => setIsJumpOpen(true)}
          onEncodingClick={() => setIsEncodingOpen(true)}
          onLineEndingClick={() => setIsEncodingOpen(true)}
          onMacroRecClick={toggleMacroRecording}
          onOverstrikeClick={() =>
            setCommonSettings((prev) => ({
              ...prev,
              general: { ...prev.general, overstrike: !prev.general.overstrike },
            }))
          }
          zoomPercent={zoomPercent}
          onZoomClick={() =>
            setZoomPercent((prev) =>
              prev === 100 ? 125 : prev === 125 ? 150 : prev === 150 ? 200 : prev === 200 ? 50 : prev === 50 ? 75 : 100
            )
          }
        />
      )}

      {/* ダイアログ群 */}
      <SearchDialog
        isOpen={isSearchOpen}
        isReplaceMode={isReplaceMode}
        onClose={() => setIsSearchOpen(false)}
        onFindNext={handleFindNext}
        onFindPrevious={handleFindPrevious}
        onReplace={handleReplace}
        onReplaceAll={handleReplaceAll}
        onMarkAll={handleMarkAll}
      />

      <TypeListDialog
        isOpen={isTypeListOpen}
        typeSettingsList={typeSettingsList}
        activeTypeId={activeTypeId}
        onClose={() => setIsTypeListOpen(false)}
        onSelectType={(id) => setActiveTypeId(id)}
        onEditType={(item) => {
          setEditingTypeItem(item);
          setTypeSettingInitialTab('screen');
          setIsTypeSettingsOpen(true);
        }}
        onUpdateList={(newList) => setTypeSettingsList(newList)}
      />

      <TypeSettingDialog
        isOpen={isTypeSettingsOpen}
        typeItem={editingTypeItem || activeTypeSetting}
        initialTab={typeSettingInitialTab}
        onClose={() => setIsTypeSettingsOpen(false)}
        onSave={(updated) => {
          setTypeSettingsList((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
        }}
      />

      <CommonSettingDialog
        isOpen={isCommonSettingsOpen}
        settings={commonSettings}
        initialTab={commonSettingInitialTab}
        onClose={() => setIsCommonSettingsOpen(false)}
        onSave={(updated) => setCommonSettings(updated)}
      />

      <OutlineDialog
        isOpen={isOutlineOpen}
        buffer={currentDoc.buffer}
        syntaxName={activeTypeSetting.syntaxName}
        outlineRule={activeTypeSetting.outlineRule}
        onClose={() => setIsOutlineOpen(false)}
        onJumpToLine={(line) => {
          updateCurrentDoc((d) => ({
            ...d,
            cursor: { line: line - 1, column: 0 },
            selection: null,
          }));
        }}
      />

      <FilePropertyDialog
        isOpen={isPropertyOpen}
        title={currentDoc.title}
        encoding={currentDoc.encoding}
        lineEnding={currentDoc.lineEnding}
        buffer={currentDoc.buffer}
        onClose={() => setIsPropertyOpen(false)}
      />

      <PageSetupDialog
        isOpen={isPageSetupOpen}
        onClose={() => setIsPageSetupOpen(false)}
      />

      <ExternalToolDialog
        isOpen={isExternalToolOpen}
        onClose={() => setIsExternalToolOpen(false)}
        onExecute={handleExecuteExternalTool}
      />

      <GrepDialog
        isOpen={isGrepOpen}
        isReplaceMode={isGrepReplaceMode}
        currentFileName={currentDoc.title}
        onClose={() => setIsGrepOpen(false)}
        onExecuteGrep={handleExecuteGrep}
      />

      <FontDialog
        isOpen={isFontOpen}
        currentFontFamily={activeTypeSetting.fontFamily}
        currentFontSize={activeTypeSetting.fontSize}
        onClose={() => setIsFontOpen(false)}
        onApply={(fontFamily, fontSize) => {
          setTypeSettingsList((prev) =>
            prev.map((t) => (t.id === activeTypeId ? { ...t, fontFamily, fontSize } : t))
          );
        }}
      />

      <EncodingDialog
        isOpen={isEncodingOpen}
        currentEncoding={currentDoc.encoding}
        currentLineEnding={currentDoc.lineEnding}
        onClose={() => setIsEncodingOpen(false)}
        onApply={(newEnc, newEnding) => {
          currentDoc.buffer.convertAllLineEndings(newEnding);
          updateCurrentDoc((d) => ({
            ...d,
            encoding: newEnc,
            lineEnding: newEnding,
            isModified: true,
          }));
        }}
      />

      <DiffDialog
        isOpen={isDiffOpen}
        currentTitle={currentDoc.title}
        currentText={currentDoc.buffer.getText()}
        otherTabs={tabs
          .filter((t) => t.id !== activeTabId)
          .map((t) => ({ id: t.id, title: t.title, text: t.buffer.getText() }))}
        onClose={() => setIsDiffOpen(false)}
        onJumpToLine={(line) => {
          updateCurrentDoc((d) => ({ ...d, cursor: { line: line - 1, column: 0 } }));
        }}
        onApplyDiffMarks={(marks) => {
          updateCurrentDoc((d) => ({ ...d, diffMarks: marks }));
        }}
      />

      <JumpDialog
        isOpen={isJumpOpen}
        totalLines={currentDoc.buffer.getLineCount()}
        currentLine={currentDoc.cursor.line}
        onClose={() => setIsJumpOpen(false)}
        onJump={(line) => {
          updateCurrentDoc((d) => ({ ...d, cursor: { line: line - 1, column: 0 } }));
        }}
      />

      <NumberingDialog
        isOpen={isNumberingOpen}
        selectedLineCount={1}
        onClose={() => setIsNumberingOpen(false)}
        onInsert={(seq) => {
          pushUndoState();
          const textToInsert = seq.join('\r\n');
          currentDoc.buffer.insert(currentDoc.cursor, textToInsert);
          updateCurrentDoc((d) => ({ ...d, isModified: true }));
        }}
      />

      <MacroDialog
        isOpen={isMacroOpen}
        onClose={() => setIsMacroOpen(false)}
        lastRecordedScript={lastMacroScript}
        onExecute={async (script) => {
          try {
            pushUndoState();
            await MacroEngine.executeMacro(script, {
              buffer: currentDoc.buffer,
              cursor: currentDoc.cursor,
              selection: currentDoc.selection,
              bookmarkManager: currentDoc.bookmarkManager,
              setCursor: (pos) => updateCurrentDoc((d) => ({ ...d, cursor: pos })),
              setSelection: (sel) => updateCurrentDoc((d) => ({ ...d, selection: sel })),
              triggerChange: () => updateCurrentDoc((d) => ({ ...d, isModified: true })),
            });
          } catch (err: any) {
            alert(`マクロエラー: ${err.message}`);
          }
        }}
      />

      <PrintPreviewDialog
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        buffer={currentDoc.buffer}
        title={currentDoc.title}
        wrapColumn={activeTypeSetting.wrapConfig.wrapColumn}
      />

      <CommandListDialog
        isOpen={isCommandListOpen}
        onClose={() => setIsCommandListOpen(false)}
        onExecuteCommand={handleExecuteCommand}
      />

      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default App;
