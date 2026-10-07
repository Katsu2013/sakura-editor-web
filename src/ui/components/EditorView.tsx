import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TextBuffer } from '../../core/buffer/TextBuffer';
import { LayoutEngine } from '../../core/layout/LayoutEngine';
import { LineMap } from '../../core/layout/LineMap';
import { CanvasRenderer, type ViewportState } from '../../renderer/CanvasRenderer';
import { FontMetrics, type FontMetricsInfo } from '../../renderer/FontMetrics';
import { InputBridge } from '../../input/InputBridge';
import type { Position, SelectionRange } from '../../core/buffer/types';
import type { SyntaxRule } from '../../core/syntax/SyntaxHighlighter';
import {
  C_CPP_RULES,
  JS_TS_RULES,
  PYTHON_RULES,
} from '../../core/syntax/SyntaxHighlighter';
import type { TypeSettingItem } from '../../core/config/TypeSettingsModel';
import { BookmarkManager, BracketMatcher } from '../../core/navigation/BookmarkManager';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import {
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
  BookmarkIcon,
  PropertyIcon,
  WordCompleteIcon,
} from './Icons/SakuraIcons';
import { WordCompletionPopup, type CompletionCandidate } from './WordCompletionPopup';

interface EditorViewProps {
  buffer: TextBuffer;
  settings: TypeSettingItem;
  cursor: Position;
  selection: SelectionRange | null;
  onCursorChange: (pos: Position, visualCol: number, charCode: string) => void;
  onSelectionChange: (sel: SelectionRange | null) => void;
  onContentChange: () => void;
  onUndo: () => void;
  onRedo: () => void;
  inputBridgeRef: React.MutableRefObject<InputBridge | null>;
  bookmarkManager: BookmarkManager;
  searchHighlight: { query: string; isRegex: boolean; matchCase: boolean } | null;
  onClearSearchHighlight?: () => void;
  onOpenSearch?: () => void;
  onOpenReplace?: () => void;
  onFindNext?: () => void;
  onFindPrev?: () => void;
  onOpenProperty?: () => void;
  onToggleOverstrike?: () => void;
  diffMarks?: Map<number, 'add' | 'del' | 'mod'>;
  onOpenIncrementalSearch?: (backward?: boolean) => void;
  onLineDoubleClick?: (lineText: string, lineIndex: number) => void;
  zoomPercent?: number;
  onZoomChange?: (delta: number) => void;
  isOverstrike?: boolean;
  freeCursor?: boolean;
  showModifiedGutter?: boolean;
}

const SYNTAX_KEYWORDS: Record<string, string[]> = {
  'C/C++': [
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
    'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register',
    'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef',
    'union', 'unsigned', 'void', 'volatile', 'while', 'class', 'public', 'protected',
    'private', 'template', 'typename', 'virtual', 'override', 'include', 'define',
    'std', 'vector', 'string', 'map', 'set', 'nullptr', 'true', 'false',
  ],
  'JavaScript/TypeScript': [
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'let', 'static', 'async', 'await', 'interface', 'type', 'from', 'as',
    'null', 'undefined', 'true', 'false', 'console', 'window', 'document',
  ],
  'Python': [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def',
    'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global',
    'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass',
    'raise', 'return', 'True', 'try', 'while', 'with', 'yield', 'self', 'print', 'range', 'len',
  ],
  'HTML': [
    'html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'table', 'tr', 'td', 'th',
    'ul', 'ol', 'li', 'form', 'input', 'button', 'header', 'footer', 'nav', 'section',
    'script', 'style', 'title', 'meta', 'link', 'textarea', 'select', 'option',
  ],
};

export const EditorView: React.FC<EditorViewProps> = ({
  buffer,
  settings,
  cursor,
  selection,
  onCursorChange,
  onSelectionChange,
  onContentChange,
  onUndo,
  onRedo,
  inputBridgeRef,
  bookmarkManager,
  searchHighlight,
  onClearSearchHighlight,
  onOpenSearch,
  onOpenReplace,
  onFindNext,
  onFindPrev,
  onOpenProperty,
  onToggleOverstrike,
  diffMarks,
  onOpenIncrementalSearch,
  onLineDoubleClick,
  zoomPercent = 100,
  onZoomChange,
  isOverstrike = false,
  freeCursor = false,
  showModifiedGutter = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // 単語補完状態
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);
  const [completionAnchor, setCompletionAnchor] = useState({ x: 0, y: 0 });
  const [completionPrefix, setCompletionPrefix] = useState('');
  const [completionCandidates, setCompletionCandidates] = useState<CompletionCandidate[]>([]);

  const effectiveFontSize = Math.max(8, Math.round(settings.fontSize * (zoomPercent / 100)));

  const [metrics, setMetrics] = useState<FontMetricsInfo>(() =>
    FontMetrics.getMetrics(settings.fontFamily, effectiveFontSize)
  );

  const [layoutEngine] = useState<LayoutEngine>(
    () => new LayoutEngine(settings.wrapConfig)
  );
  const [lineMap] = useState<LineMap>(
    () => new LineMap(buffer, layoutEngine)
  );

  const [viewport, setViewport] = useState<ViewportState>({
    scrollTop: 0,
    scrollLeft: 0,
    width: 800,
    height: 600,
  });

  // コンテキストメニュー状態
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number }>({
    isOpen: false,
    x: 0,
    y: 0,
  });

  // スクロールバーのドラッグ状態
  const [isDraggingVThumb, setIsDraggingVThumb] = useState(false);
  const [isDraggingHThumb, setIsDraggingHThumb] = useState(false);
  const dragStartPosRef = useRef({ mouse: 0, scroll: 0 });

  // 設定変更時の反映
  useEffect(() => {
    const curEffectiveFontSize = Math.max(8, Math.round(settings.fontSize * (zoomPercent / 100)));
    const newMetrics = FontMetrics.getMetrics(
      settings.fontFamily,
      curEffectiveFontSize
    );
    setMetrics(newMetrics);
    if (rendererRef.current && settings.theme) {
      rendererRef.current.setTheme(settings.theme);
    }
    layoutEngine.setConfig(settings.wrapConfig);
    lineMap.rebuildAll(Math.floor((viewport.width - 60) / newMetrics.charWidth));
    requestRender();
  }, [settings, viewport.width, zoomPercent]);

  // バッファ変更時の行マップ再構築
  useEffect(() => {
    lineMap.rebuildAll(Math.floor((viewport.width - 60) / metrics.charWidth));
    requestRender();
  }, [buffer]);

  // シンタックスルール
  const getSyntaxRule = (): SyntaxRule | undefined => {
    switch (settings.syntaxName) {
      case 'C/C++': return C_CPP_RULES;
      case 'JavaScript/TypeScript': return JS_TS_RULES;
      case 'Python': return PYTHON_RULES;
      default: return undefined;
    }
  };

  // 再描画トリガー
  const requestRender = useCallback(() => {
    if (!rendererRef.current || !canvasRef.current) return;
    const rule = getSyntaxRule();
    const matchingBracket = BracketMatcher.findMatchingBracket(buffer, cursor);

    rendererRef.current.render(
      buffer,
      lineMap,
      metrics,
      viewport,
      cursor,
      selection,
      rule,
      undefined,
      settings.wrapConfig.wrapMode === 'column' ? settings.wrapConfig.wrapColumn : 0,
      null,
      settings.showSymbols,
      bookmarkManager,
      matchingBracket,
      searchHighlight,
      {
        showRuler: settings.showRuler,
        showLineNumbers: settings.showLineNumbers,
        lineNumberType: settings.lineNumberType,
        lineSpacing: settings.lineSpacing,
        showModifiedGutter,
      },
      diffMarks
    );
  }, [buffer, lineMap, metrics, viewport, cursor, selection, settings, bookmarkManager, searchHighlight, diffMarks, showModifiedGutter]);

  useEffect(() => {
    requestRender();
  }, [requestRender]);

  // カーソル位置情報（ステータスバー用）の算出
  const updateCursorDetails = useCallback(
    (pos: Position) => {
      const vPos = lineMap.logicalToVisual(pos);
      const lineText = buffer.getLine(pos.line);
      const char = lineText[pos.column] || '';
      const charCode = char
        ? `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')} ('${char}')`
        : '';
      onCursorChange(pos, vPos.visualColumn, charCode);

      // IME 入力位置の更新
      if (inputBridgeRef.current && rendererRef.current) {
        const effectiveLineHeight = metrics.lineHeight + (settings.lineSpacing || 0);
        const gutterW = rendererRef.current.getGutterWidth(settings.showLineNumbers);
        const rulerH = rendererRef.current.getRulerHeight(settings.showRuler);
        const x = gutterW + vPos.visualColumn * metrics.charWidth - viewport.scrollLeft;
        const y = rulerH + vPos.visualLine * effectiveLineHeight - viewport.scrollTop;
        inputBridgeRef.current.updateCursorPosition(x, y);
      }
    },
    [buffer, lineMap, metrics, viewport, onCursorChange, inputBridgeRef, settings]
  );

  // コンテナのリサイズ監視
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // スクロールバー幅 (16px) を差し引いた表示領域
        setViewport((prev) => ({
          ...prev,
          width: Math.max(100, width - 16),
          height: Math.max(100, height - 16),
        }));
      }
    });
    ro.observe(container);

    if (canvasRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current);
    }

    return () => ro.disconnect();
  }, []);

  const effectiveLineHeight = metrics.lineHeight + (settings.lineSpacing || 0);
  const totalVisualLines = lineMap.getVisualLineCount();
  const maxScrollY = Math.max(0, totalVisualLines * effectiveLineHeight - viewport.height + 100);
  const maxScrollX = Math.max(0, 250 * metrics.charWidth - viewport.width + 100);

  // 単語補完のトリガー
  const handleTriggerWordCompletion = useCallback(() => {
    const lineText = buffer.getLine(cursor.line);
    let startCol = cursor.column;
    while (startCol > 0 && /[a-zA-Z0-9_]/.test(lineText[startCol - 1])) {
      startCol--;
    }
    const prefix = lineText.slice(startCol, cursor.column);

    // Buffer 内の単語収集
    const fullText = buffer.getText();
    const wordMatches = fullText.match(/\b[a-zA-Z_][a-zA-Z0-9_]{1,}\b/g) || [];
    const uniqueWords = Array.from(new Set(wordMatches));

    // 予約語
    const kwList = SYNTAX_KEYWORDS[settings.syntaxName] || SYNTAX_KEYWORDS['JavaScript/TypeScript'] || [];

    const lowerPrefix = prefix.toLowerCase();
    const candList: CompletionCandidate[] = [];

    // 予約語から先頭一致
    for (const kw of kwList) {
      if (!prefix || kw.toLowerCase().startsWith(lowerPrefix)) {
        candList.push({ word: kw, isKeyword: true });
      }
    }
    // 本文単語から先頭一致
    for (const w of uniqueWords) {
      if ((!prefix || w.toLowerCase().startsWith(lowerPrefix)) && !candList.some((c) => c.word === w)) {
        candList.push({ word: w, isKeyword: false });
      }
    }

    if (candList.length === 0) return;

    // キャレットの画面座標計算
    const vPos = lineMap.logicalToVisual(cursor);
    const gutterW = rendererRef.current ? rendererRef.current.getGutterWidth(settings.showLineNumbers) : 56;
    const rulerH = rendererRef.current ? rendererRef.current.getRulerHeight(settings.showRuler) : 18;
    const curX = gutterW + vPos.visualColumn * metrics.charWidth - viewport.scrollLeft;
    const curY = rulerH + (vPos.visualLine + 1) * effectiveLineHeight - viewport.scrollTop;

    const rect = containerRef.current?.getBoundingClientRect();
    const screenX = (rect?.left || 0) + curX;
    const screenY = (rect?.top || 0) + curY;

    setCompletionPrefix(prefix);
    setCompletionCandidates(candList.slice(0, 80));
    setCompletionAnchor({ x: screenX, y: screenY });
    setIsCompletionOpen(true);
  }, [buffer, cursor, lineMap, settings.showLineNumbers, settings.showRuler, settings.syntaxName, metrics.charWidth, effectiveLineHeight, viewport.scrollLeft, viewport.scrollTop]);

  const handleSelectCompletion = useCallback((chosenWord: string) => {
    setIsCompletionOpen(false);
    const lineText = buffer.getLine(cursor.line);
    let startCol = cursor.column;
    while (startCol > 0 && /[a-zA-Z0-9_]/.test(lineText[startCol - 1])) {
      startCol--;
    }

    buffer.deleteRange({
      start: { line: cursor.line, column: startCol },
      end: cursor,
      isBoxSelect: false,
    });
    const newPos = buffer.insert({ line: cursor.line, column: startCol }, chosenWord);
    lineMap.rebuildAll();
    updateCursorDetails(newPos);
    onContentChange();
    inputBridgeRef.current?.focus();
  }, [buffer, cursor, lineMap, updateCursorDetails, onContentChange, inputBridgeRef]);

  // InputBridge の初期化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bridge = new InputBridge(container, {
      onInsertText: (text) => {
        if (selection) {
          if (selection.isBoxSelect && selection.boxStartCol !== undefined && selection.boxEndCol !== undefined) {
            buffer.deleteBox(selection.start.line, selection.end.line, selection.boxStartCol, selection.boxEndCol);
          } else {
            buffer.deleteRange(selection);
          }
          onSelectionChange(null);
        } else if (isOverstrike && text !== '\n' && text !== '\r\n') {
          // 上書きモード: カーソル位置から文字数分を上書き
          const curLine = buffer.getLine(cursor.line);
          const charsToOverwrite = text.length;
          const availableChars = Math.max(0, curLine.length - cursor.column);
          const deleteCount = Math.min(charsToOverwrite, availableChars);
          if (deleteCount > 0) {
            buffer.deleteRange({
              start: cursor,
              end: { line: cursor.line, column: cursor.column + deleteCount },
              isBoxSelect: false,
            });
          }
        }

        // フリーカーソル: 行末以降にカーソルがある場合、半角空白で埋める
        let insertPos = cursor;
        if (freeCursor) {
          const curLine = buffer.getLine(cursor.line);
          if (cursor.column > curLine.length) {
            const padSpaces = ' '.repeat(cursor.column - curLine.length);
            buffer.insert({ line: cursor.line, column: curLine.length }, padSpaces);
            insertPos = { line: cursor.line, column: cursor.column };
          }
        }

        // 自動インデント処理 (Enter キー時)
        let textToInsert = text;
        if (text === '\n' && settings.autoIndent) {
          const curLineText = buffer.getLine(cursor.line);
          const indentMatch = curLineText.match(/^([ \t]+)/);
          if (indentMatch) {
            textToInsert = '\n' + indentMatch[1];
          }
        }

        const newPos = buffer.insert(insertPos, textToInsert);
        lineMap.rebuildAll();
        updateCursorDetails(newPos);
        onContentChange();
      },
      onDeleteChar: (direction) => {
        if (selection) {
          if (selection.isBoxSelect && selection.boxStartCol !== undefined && selection.boxEndCol !== undefined) {
            buffer.deleteBox(selection.start.line, selection.end.line, selection.boxStartCol, selection.boxEndCol);
          } else {
            buffer.deleteRange(selection);
          }
          onSelectionChange(null);
          lineMap.rebuildAll();
          onContentChange();
          return;
        }

        if (direction === 'backspace') {
          if (cursor.column > 0) {
            buffer.deleteRange({
              start: { line: cursor.line, column: cursor.column - 1 },
              end: cursor,
              isBoxSelect: false,
            });
            const newPos = { line: cursor.line, column: cursor.column - 1 };
            lineMap.rebuildAll();
            updateCursorDetails(newPos);
            onContentChange();
          } else if (cursor.line > 0) {
            const prevLine = buffer.getLine(cursor.line - 1);
            buffer.deleteRange({
              start: { line: cursor.line - 1, column: prevLine.length },
              end: cursor,
              isBoxSelect: false,
            });
            const newPos = { line: cursor.line - 1, column: prevLine.length };
            lineMap.rebuildAll();
            updateCursorDetails(newPos);
            onContentChange();
          }
        } else {
          // delete
          const currentLine = buffer.getLine(cursor.line);
          if (cursor.column < currentLine.length) {
            buffer.deleteRange({
              start: cursor,
              end: { line: cursor.line, column: cursor.column + 1 },
              isBoxSelect: false,
            });
            lineMap.rebuildAll();
            onContentChange();
          } else if (cursor.line < buffer.getLineCount() - 1) {
            buffer.deleteRange({
              start: cursor,
              end: { line: cursor.line + 1, column: 0 },
              isBoxSelect: false,
            });
            lineMap.rebuildAll();
            onContentChange();
          }
        }
      },
      onMoveCursor: (deltaLine, deltaCol, select, isBoxSelect) => {
        const vPos = lineMap.logicalToVisual(cursor);
        let newVRow = vPos.visualLine + deltaLine;
        newVRow = Math.max(0, Math.min(newVRow, lineMap.getVisualLineCount() - 1));

        let newVCol = vPos.visualColumn + deltaCol;
        newVCol = Math.max(0, newVCol);

        let newPos = lineMap.visualToLogical(newVRow, newVCol);
        if (freeCursor) {
          newPos = { line: newPos.line, column: newVCol };
        }

        if (select) {
          if (!selection) {
            onSelectionChange({
              start: cursor,
              end: newPos,
              isBoxSelect,
              boxStartCol: vPos.visualColumn,
              boxEndCol: newVCol,
            });
          } else {
            onSelectionChange({
              ...selection,
              end: newPos,
              isBoxSelect,
              boxEndCol: newVCol,
            });
          }
        } else {
          onSelectionChange(null);
        }

        updateCursorDetails(newPos);
      },
      onSetCursor: (pos, select, _isBoxSelect) => {
        if (!select) onSelectionChange(null);
        updateCursorDetails(pos);
      },
      onBoxDrag: (sLine, eLine, sCol, eCol) => {
        onSelectionChange({
          start: { line: sLine, column: 0 },
          end: { line: eLine, column: 0 },
          isBoxSelect: true,
          boxStartCol: sCol,
          boxEndCol: eCol,
        });
      },
      onCopy: () => {
        if (!selection) return;
        const textToCopy = buffer.getTextInRange(selection);
        navigator.clipboard.writeText(textToCopy);
      },
      onCut: () => {
        if (!selection) return;
        const textToCut = buffer.getTextInRange(selection);
        navigator.clipboard.writeText(textToCut);
        if (selection.isBoxSelect && selection.boxStartCol !== undefined && selection.boxEndCol !== undefined) {
          buffer.deleteBox(selection.start.line, selection.end.line, selection.boxStartCol, selection.boxEndCol);
        } else {
          buffer.deleteRange(selection);
        }
        onSelectionChange(null);
        lineMap.rebuildAll();
        onContentChange();
      },
      onPaste: (text) => {
        if (selection) {
          buffer.deleteRange(selection);
          onSelectionChange(null);
        }
        const newPos = buffer.insert(cursor, text);
        lineMap.rebuildAll();
        updateCursorDetails(newPos);
        onContentChange();
      },
      onUndo,
      onRedo,
      onBookmarkToggle: () => {
        bookmarkManager.toggle(cursor.line);
        requestRender();
      },
      onBookmarkNext: () => {
        const next = bookmarkManager.getNext(cursor.line, buffer.getLineCount());
        if (next !== null) {
          updateCursorDetails({ line: next, column: 0 });
        }
      },
      onBookmarkPrev: () => {
        const prev = bookmarkManager.getPrev(cursor.line);
        if (prev !== null) {
          updateCursorDetails({ line: prev, column: 0 });
        }
      },
      onBracketJump: () => {
        const match = BracketMatcher.findMatchingBracket(buffer, cursor);
        if (match) {
          updateCursorDetails(match);
        }
      },
      onEscape: () => {
        onClearSearchHighlight?.();
      },
      onNavigateHome: (select, isFileTop) => {
        let newPos: Position;
        if (isFileTop) {
          newPos = { line: 0, column: 0 };
        } else {
          const curLineText = buffer.getLine(cursor.line);
          const firstNonWs = curLineText.search(/\S/);
          const targetCol = cursor.column === firstNonWs ? 0 : firstNonWs !== -1 ? firstNonWs : 0;
          newPos = { line: cursor.line, column: targetCol };
        }
        if (select) {
          onSelectionChange({
            start: selection ? selection.start : cursor,
            end: newPos,
            isBoxSelect: false,
          });
        } else {
          onSelectionChange(null);
        }
        updateCursorDetails(newPos);
      },
      onNavigateEnd: (select, isFileBottom) => {
        let newPos: Position;
        if (isFileBottom) {
          const lastIdx = buffer.getLineCount() - 1;
          newPos = { line: lastIdx, column: buffer.getLine(lastIdx).length };
        } else {
          newPos = { line: cursor.line, column: buffer.getLine(cursor.line).length };
        }
        if (select) {
          onSelectionChange({
            start: selection ? selection.start : cursor,
            end: newPos,
            isBoxSelect: false,
          });
        } else {
          onSelectionChange(null);
        }
        updateCursorDetails(newPos);
      },
      onNavigatePage: (direction, select) => {
        const linesPerPage = Math.max(1, Math.floor(viewport.height / effectiveLineHeight) - 1);
        const delta = direction === 'up' ? -linesPerPage : linesPerPage;
        const targetLine = Math.max(0, Math.min(buffer.getLineCount() - 1, cursor.line + delta));
        const newPos = { line: targetLine, column: Math.min(cursor.column, buffer.getLine(targetLine).length) };

        setViewport((prev) => ({
          ...prev,
          scrollTop: Math.max(0, Math.min(maxScrollY, prev.scrollTop + delta * effectiveLineHeight)),
        }));

        if (select) {
          onSelectionChange({
            start: selection ? selection.start : cursor,
            end: newPos,
            isBoxSelect: false,
          });
        } else {
          onSelectionChange(null);
        }
        updateCursorDetails(newPos);
      },
      onNavigateWord: (direction, select) => {
        const lineText = buffer.getLine(cursor.line);
        let col = cursor.column;
        const isWord = (ch: string) => /[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(ch);

        if (direction === 'left') {
          if (col > 0) {
            col--;
            while (col > 0 && !isWord(lineText[col])) col--;
            while (col > 0 && isWord(lineText[col - 1])) col--;
          }
        } else {
          if (col < lineText.length) {
            col++;
            while (col < lineText.length && isWord(lineText[col])) col++;
            while (col < lineText.length && !isWord(lineText[col])) col++;
          }
        }

        const newPos = { line: cursor.line, column: col };
        if (select) {
          onSelectionChange({
            start: selection ? selection.start : cursor,
            end: newPos,
            isBoxSelect: false,
          });
        } else {
          onSelectionChange(null);
        }
        updateCursorDetails(newPos);
      },
      onToggleOverstrike,
      onZoomWheel: (direction: number) => onZoomChange?.(direction),
      onWordComplete: handleTriggerWordCompletion,
      onIncrementalSearch: (backward) => onOpenIncrementalSearch?.(backward),
      onScroll: (dx, dy) => {
        setViewport((prev) => ({
          ...prev,
          scrollTop: Math.max(0, Math.min(prev.scrollTop + dy, maxScrollY)),
          scrollLeft: Math.max(0, Math.min(prev.scrollLeft + dx, maxScrollX)),
        }));
      },
    });

    inputBridgeRef.current = bridge;
    return () => bridge.destroy();
  }, [
    buffer,
    lineMap,
    metrics,
    cursor,
    selection,
    onSelectionChange,
    onContentChange,
    onUndo,
    onRedo,
    updateCursorDetails,
    settings,
    maxScrollY,
    maxScrollX,
    effectiveLineHeight,
    viewport.height,
    onToggleOverstrike,
    isOverstrike,
    freeCursor,
    onZoomChange,
    handleTriggerWordCompletion,
    onOpenIncrementalSearch,
  ]);

  // マウスイベント (クリック & ドラッグによる選択 / Alt 矩形選択 / ガタークリック)
  const isMouseDownRef = useRef(false);
  const isGutterDragRef = useRef(false);
  const gutterStartLineRef = useRef<number>(0);
  const dragStartLogicalRef = useRef<Position>({ line: 0, column: 0 });
  const dragStartVisualColRef = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) return; // 右クリックはコンテキストメニューへ
    if (!rendererRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gutterW = rendererRef.current.getGutterWidth(settings.showLineNumbers);
    const rulerH = rendererRef.current.getRulerHeight(settings.showRuler);

    if (mouseY < rulerH) return; // ルーラー領域

    const vRow = Math.floor((mouseY - rulerH + viewport.scrollTop) / effectiveLineHeight);
    const vCol = Math.round((mouseX - gutterW + viewport.scrollLeft) / metrics.charWidth);
    const pos = lineMap.visualToLogical(vRow, Math.max(0, vCol));

    // ガター（行番号・ブックマーク領域）クリック
    if (mouseX < gutterW) {
      if (mouseX < 16) {
        bookmarkManager.toggle(pos.line);
        requestRender();
        return;
      }
      isMouseDownRef.current = true;
      isGutterDragRef.current = true;
      gutterStartLineRef.current = pos.line;
      const curLineLen = buffer.getLine(pos.line).length;
      onSelectionChange({
        start: { line: pos.line, column: 0 },
        end: { line: pos.line, column: curLineLen },
        isBoxSelect: false,
      });
      updateCursorDetails({ line: pos.line, column: curLineLen });
      return;
    }

    // Ctrl + クリックで URL / メールアドレスを開く (サクラエディタ標準)
    if (e.ctrlKey) {
      const lineText = buffer.getLine(pos.line);
      const urlMatches = lineText.match(/(https?:\/\/[^\s"'<>\u3000\uff08\uff09()]+|mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
      if (urlMatches) {
        for (const u of urlMatches) {
          const uStart = lineText.indexOf(u);
          const uEnd = uStart + u.length;
          if (pos.column >= uStart && pos.column <= uEnd) {
            window.open(u, '_blank');
            return;
          }
        }
      }
    }

    isMouseDownRef.current = true;
    isGutterDragRef.current = false;
    dragStartLogicalRef.current = pos;
    dragStartVisualColRef.current = vCol;

    const isAlt = e.altKey;

    if (!e.shiftKey) {
      onSelectionChange(null);
      updateCursorDetails(pos);
    } else {
      onSelectionChange({
        start: cursor,
        end: pos,
        isBoxSelect: isAlt,
        boxStartCol: dragStartVisualColRef.current,
        boxEndCol: vCol,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current || !rendererRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const gutterW = rendererRef.current.getGutterWidth(settings.showLineNumbers);
    const rulerH = rendererRef.current.getRulerHeight(settings.showRuler);

    const vRow = Math.floor((mouseY - rulerH + viewport.scrollTop) / effectiveLineHeight);
    const vCol = Math.round((mouseX - gutterW + viewport.scrollLeft) / metrics.charWidth);
    const pos = lineMap.visualToLogical(vRow, Math.max(0, vCol));

    if (isGutterDragRef.current) {
      const sLine = Math.min(gutterStartLineRef.current, pos.line);
      const eLine = Math.max(gutterStartLineRef.current, pos.line);
      const endLineLen = buffer.getLine(eLine).length;
      onSelectionChange({
        start: { line: sLine, column: 0 },
        end: { line: eLine, column: endLineLen },
        isBoxSelect: false,
      });
      updateCursorDetails({ line: eLine, column: endLineLen });
      return;
    }

    const isAlt = e.altKey;
    onSelectionChange({
      start: dragStartLogicalRef.current,
      end: pos,
      isBoxSelect: isAlt,
      boxStartCol: dragStartVisualColRef.current,
      boxEndCol: vCol,
    });

    updateCursorDetails(pos);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    isGutterDragRef.current = false;
  };

  // ダブルクリック（単語選択）
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!rendererRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const gutterW = rendererRef.current.getGutterWidth(settings.showLineNumbers);
    const rulerH = rendererRef.current.getRulerHeight(settings.showRuler);

    if (mouseY < rulerH || mouseX < gutterW) return;

    const vRow = Math.floor((mouseY - rulerH + viewport.scrollTop) / effectiveLineHeight);
    const vCol = Math.round((mouseX - gutterW + viewport.scrollLeft) / metrics.charWidth);
    const pos = lineMap.visualToLogical(vRow, Math.max(0, vCol));

    const lineText = buffer.getLine(pos.line);
    if (!lineText) return;

    let startCol = pos.column;
    let endCol = pos.column;
    const isWordChar = (ch: string) => /[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(ch);

    while (startCol > 0 && isWordChar(lineText[startCol - 1])) startCol--;
    while (endCol < lineText.length && isWordChar(lineText[endCol])) endCol++;

    // URL またはメールアドレスをダブルクリックした場合はブラウザで開く (サクラエディタ標準)
    const urlMatches = lineText.match(/(https?:\/\/[^\s"'<>\u3000\uff08\uff09()]+|mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    if (urlMatches) {
      for (const u of urlMatches) {
        const uStart = lineText.indexOf(u);
        const uEnd = uStart + u.length;
        if (pos.column >= uStart && pos.column <= uEnd) {
          window.open(u, '_blank');
          return;
        }
      }
    }

    if (startCol < endCol) {
      onSelectionChange({
        start: { line: pos.line, column: startCol },
        end: { line: pos.line, column: endCol },
        isBoxSelect: false,
      });
      updateCursorDetails({ line: pos.line, column: endCol });
    }

    if (onLineDoubleClick) {
      onLineDoubleClick(lineText, pos.line);
    }
  };

  // 右クリック コンテキストメニュー
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // スクロールバードラッグ処理
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDraggingVThumb) {
        const delta = e.clientY - dragStartPosRef.current.mouse;
        const trackHeight = viewport.height - 32;
        const scrollDelta = (delta / trackHeight) * maxScrollY;
        setViewport((prev) => ({
          ...prev,
          scrollTop: Math.max(0, Math.min(maxScrollY, dragStartPosRef.current.scroll + scrollDelta)),
        }));
      } else if (isDraggingHThumb) {
        const delta = e.clientX - dragStartPosRef.current.mouse;
        const trackWidth = viewport.width - 32;
        const scrollDelta = (delta / trackWidth) * maxScrollX;
        setViewport((prev) => ({
          ...prev,
          scrollLeft: Math.max(0, Math.min(maxScrollX, dragStartPosRef.current.scroll + scrollDelta)),
        }));
      }
    };

    const handleWindowMouseUp = () => {
      setIsDraggingVThumb(false);
      setIsDraggingHThumb(false);
    };

    if (isDraggingVThumb || isDraggingHThumb) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
      };
    }
  }, [isDraggingVThumb, isDraggingHThumb, maxScrollY, maxScrollX, viewport.height, viewport.width]);

  // コンテキストメニュー項目定義
  const contextMenuItems: ContextMenuItem[] = [
    { id: 'cm-undo', label: '元に戻す(U)', shortcut: 'Ctrl+Z', icon: <UndoIcon size={14} />, action: onUndo },
    { id: 'cm-redo', label: 'やり直し(R)', shortcut: 'Ctrl+Y', icon: <RedoIcon size={14} />, action: onRedo },
    { id: 'cm-sep1', label: '', separator: true },
    {
      id: 'cm-cut',
      label: '切り取り(T)',
      shortcut: 'F7',
      icon: <CutIcon size={14} />,
      disabled: !selection,
      action: () => {
        if (!selection) return;
        const text = buffer.getTextInRange(selection);
        navigator.clipboard.writeText(text);
        buffer.deleteRange(selection);
        onSelectionChange(null);
        onContentChange();
      },
    },
    {
      id: 'cm-copy',
      label: 'コピー(C)',
      shortcut: 'F8',
      icon: <CopyIcon size={14} />,
      disabled: !selection,
      action: () => {
        if (!selection) return;
        const text = buffer.getTextInRange(selection);
        navigator.clipboard.writeText(text);
      },
    },
    {
      id: 'cm-paste',
      label: '貼り付け(P)',
      shortcut: 'F9',
      icon: <PasteIcon size={14} />,
      action: async () => {
        const text = await navigator.clipboard.readText();
        if (text) {
          if (selection) buffer.deleteRange(selection);
          const newPos = buffer.insert(cursor, text);
          onSelectionChange(null);
          updateCursorDetails(newPos);
          onContentChange();
        }
      },
    },
    {
      id: 'cm-del',
      label: '削除(D)',
      shortcut: 'Del',
      icon: <DeleteIcon size={14} />,
      action: () => {
        if (selection) {
          buffer.deleteRange(selection);
          onSelectionChange(null);
          onContentChange();
        }
      },
    },
    {
      id: 'cm-sel-all',
      label: 'すべて選択(A)',
      shortcut: 'Ctrl+A',
      icon: <SelectAllIcon size={14} />,
      action: () => {
        const lastIdx = buffer.getLineCount() - 1;
        onSelectionChange({
          start: { line: 0, column: 0 },
          end: { line: lastIdx, column: buffer.getLine(lastIdx).length },
          isBoxSelect: false,
        });
      },
    },
    { id: 'cm-sep2', label: '', separator: true },
    {
      id: 'cm-sel-word',
      label: '単語選択(W)',
      action: () => {
        const lineText = buffer.getLine(cursor.line);
        let s = cursor.column;
        let e = cursor.column;
        const isW = (ch: string) => /[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(ch);
        while (s > 0 && isW(lineText[s - 1])) s--;
        while (e < lineText.length && isW(lineText[e])) e++;
        if (s < e) {
          onSelectionChange({ start: { line: cursor.line, column: s }, end: { line: cursor.line, column: e }, isBoxSelect: false });
          updateCursorDetails({ line: cursor.line, column: e });
        }
      },
    },
    {
      id: 'cm-sel-line',
      label: '行選択(L)',
      action: () => {
        const len = buffer.getLine(cursor.line).length;
        onSelectionChange({ start: { line: cursor.line, column: 0 }, end: { line: cursor.line, column: len }, isBoxSelect: false });
        updateCursorDetails({ line: cursor.line, column: len });
      },
    },
    {
      id: 'cm-reconvert',
      label: '再変換(R)',
      icon: <ReconvertIcon size={14} />,
      disabled: !selection,
      action: () => {
        if (!selection) return;
        const text = buffer.getTextInRange(selection);
        let reconverted = text;
        if (/[a-z]/.test(text)) {
          reconverted = text.toUpperCase();
        } else if (/[A-Z]/.test(text)) {
          reconverted = text.toLowerCase();
        }
        buffer.deleteRange(selection);
        const endPos = buffer.insert(selection.start, reconverted);
        onSelectionChange({ start: selection.start, end: endPos, isBoxSelect: false });
        onContentChange();
      },
    },
    { id: 'cm-sep3', label: '', separator: true },
    {
      id: 'cm-word-complete',
      label: '単語補完(W)',
      shortcut: 'Ctrl+Space',
      icon: <WordCompleteIcon size={14} />,
      action: handleTriggerWordCompletion,
    },
    { id: 'cm-find', label: '検索(F)...', shortcut: 'Ctrl+F', icon: <FindIcon size={14} />, action: onOpenSearch },
    { id: 'cm-find-next', label: '次を検索(N)', shortcut: 'F3', icon: <FindNextIcon size={14} />, action: onFindNext },
    { id: 'cm-find-prev', label: '前を検索(P)', shortcut: 'Shift+F3', icon: <FindPrevIcon size={14} />, action: onFindPrev },
    { id: 'cm-replace', label: '置換(R)...', shortcut: 'Ctrl+R', icon: <ReplaceIcon size={14} />, action: onOpenReplace },
    { id: 'cm-sep4', label: '', separator: true },
    {
      id: 'cm-bm',
      label: 'ブックマーク設定・解除(M)',
      shortcut: 'F11',
      icon: <BookmarkIcon size={14} />,
      action: () => {
        bookmarkManager.toggle(cursor.line);
        requestRender();
      },
    },
    { id: 'cm-sep5', label: '', separator: true },
    { id: 'cm-prop', label: 'プロパティ(P)...', shortcut: 'Alt+Enter', icon: <PropertyIcon size={14} />, action: onOpenProperty },
  ];

  // スクロールバーの幾何計算
  const vTrackHeight = Math.max(20, viewport.height - 32);
  const vThumbHeight = maxScrollY > 0 ? Math.max(20, (viewport.height / (totalVisualLines * effectiveLineHeight + 100)) * vTrackHeight) : vTrackHeight;
  const vThumbTop = maxScrollY > 0 ? (viewport.scrollTop / maxScrollY) * (vTrackHeight - vThumbHeight) : 0;

  const hTrackWidth = Math.max(20, viewport.width - 32);
  const hThumbWidth = maxScrollX > 0 ? Math.max(20, (viewport.width / (250 * metrics.charWidth + 100)) * hTrackWidth) : hTrackWidth;
  const hThumbLeft = maxScrollX > 0 ? (viewport.scrollLeft / maxScrollX) * (hTrackWidth - hThumbWidth) : 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        flexGrow: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: 'text',
        backgroundColor: '#ffffef',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* エディタ描画キャンバス */}
      <canvas
        ref={canvasRef}
        style={{
          width: `${viewport.width}px`,
          height: `${viewport.height}px`,
          display: 'block',
        }}
      />

      {/* 垂直スクロールバー (Win32クラシックスタイル) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '16px',
          height: `${viewport.height}px`,
          backgroundColor: '#f0f0f0',
          borderLeft: '1px solid #d0d0d0',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 4,
        }}
      >
        {/* 上ボタン */}
        <button
          type="button"
          onClick={() => setViewport((prev) => ({ ...prev, scrollTop: Math.max(0, prev.scrollTop - effectiveLineHeight) }))}
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e1e1e1',
            border: '1px outset #ffffff',
            padding: 0,
            fontSize: '9px',
            cursor: 'default',
            lineHeight: '14px',
          }}
        >
          ▲
        </button>

        {/* トラック & つまみ */}
        <div
          style={{ position: 'relative', flexGrow: 1, backgroundColor: '#f0f0f0' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            if (clickY < vThumbTop) {
              setViewport((prev) => ({ ...prev, scrollTop: Math.max(0, prev.scrollTop - viewport.height) }));
            } else if (clickY > vThumbTop + vThumbHeight) {
              setViewport((prev) => ({ ...prev, scrollTop: Math.min(maxScrollY, prev.scrollTop + viewport.height) }));
            }
          }}
        >
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingVThumb(true);
              dragStartPosRef.current = { mouse: e.clientY, scroll: viewport.scrollTop };
            }}
            style={{
              position: 'absolute',
              top: `${vThumbTop}px`,
              left: '1px',
              width: '13px',
              height: `${vThumbHeight}px`,
              backgroundColor: '#cdcdcd',
              border: '1px outset #ffffff',
              cursor: 'default',
            }}
          />
        </div>

        {/* 下ボタン */}
        <button
          type="button"
          onClick={() => setViewport((prev) => ({ ...prev, scrollTop: Math.min(maxScrollY, prev.scrollTop + effectiveLineHeight) }))}
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e1e1e1',
            border: '1px outset #ffffff',
            padding: 0,
            fontSize: '9px',
            cursor: 'default',
            lineHeight: '14px',
          }}
        >
          ▼
        </button>
      </div>

      {/* 水平スクロールバー (Win32クラシックスタイル) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '16px',
          width: `${viewport.width}px`,
          backgroundColor: '#f0f0f0',
          borderTop: '1px solid #d0d0d0',
          userSelect: 'none',
          display: 'flex',
          zIndex: 4,
        }}
      >
        {/* 左ボタン */}
        <button
          type="button"
          onClick={() => setViewport((prev) => ({ ...prev, scrollLeft: Math.max(0, prev.scrollLeft - metrics.charWidth * 4) }))}
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e1e1e1',
            border: '1px outset #ffffff',
            padding: 0,
            fontSize: '9px',
            cursor: 'default',
            lineHeight: '14px',
          }}
        >
          ◀
        </button>

        {/* トラック & つまみ */}
        <div
          style={{ position: 'relative', flexGrow: 1, backgroundColor: '#f0f0f0' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < hThumbLeft) {
              setViewport((prev) => ({ ...prev, scrollLeft: Math.max(0, prev.scrollLeft - viewport.width) }));
            } else if (clickX > hThumbLeft + hThumbWidth) {
              setViewport((prev) => ({ ...prev, scrollLeft: Math.min(maxScrollX, prev.scrollLeft + viewport.width) }));
            }
          }}
        >
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDraggingHThumb(true);
              dragStartPosRef.current = { mouse: e.clientX, scroll: viewport.scrollLeft };
            }}
            style={{
              position: 'absolute',
              top: '1px',
              left: `${hThumbLeft}px`,
              width: `${hThumbWidth}px`,
              height: '13px',
              backgroundColor: '#cdcdcd',
              border: '1px outset #ffffff',
              cursor: 'default',
            }}
          />
        </div>

        {/* 右ボタン */}
        <button
          type="button"
          onClick={() => setViewport((prev) => ({ ...prev, scrollLeft: Math.min(maxScrollX, prev.scrollLeft + metrics.charWidth * 4) }))}
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#e1e1e1',
            border: '1px outset #ffffff',
            padding: 0,
            fontSize: '9px',
            cursor: 'default',
            lineHeight: '14px',
          }}
        >
          ▶
        </button>
      </div>

      {/* 右下コーナー グリップボックス */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '16px',
          height: '16px',
          backgroundColor: '#e8e8e8',
          borderLeft: '1px solid #d0d0d0',
          borderTop: '1px solid #d0d0d0',
          zIndex: 5,
        }}
      />

      {/* 右クリック コンテキストメニュー */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        items={contextMenuItems}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 単語補完ポップアップ (Win32 リストボックス) */}
      <WordCompletionPopup
        isOpen={isCompletionOpen}
        onClose={() => setIsCompletionOpen(false)}
        onSelect={handleSelectCompletion}
        anchorPos={completionAnchor}
        prefix={completionPrefix}
        candidates={completionCandidates}
      />
    </div>
  );
};
