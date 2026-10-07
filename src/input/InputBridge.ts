import type { Position } from '../core/buffer/types';

export interface InputBridgeHandlers {
  onInsertText: (text: string) => void;
  onDeleteChar: (direction: 'backspace' | 'delete') => void;
  onMoveCursor: (deltaLine: number, deltaCol: number, select: boolean, isBoxSelect: boolean) => void;
  onSetCursor: (pos: Position, select: boolean, isBoxSelect: boolean) => void;
  onBoxDrag: (startLine: number, endLine: number, startCol: number, endCol: number) => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: (text: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onScroll: (deltaX: number, deltaY: number) => void;
  onBookmarkToggle?: () => void;
  onBookmarkNext?: () => void;
  onBookmarkPrev?: () => void;
  onBracketJump?: () => void;
  onEscape?: () => void;
  onNavigateHome?: (select: boolean, isFileTop: boolean) => void;
  onNavigateEnd?: (select: boolean, isFileBottom: boolean) => void;
  onNavigatePage?: (direction: 'up' | 'down', select: boolean) => void;
  onNavigateWord?: (direction: 'left' | 'right', select: boolean) => void;
  onToggleOverstrike?: () => void;
  onZoomWheel?: (direction: number) => void;
  onWordComplete?: () => void;
  onIncrementalSearch?: (backward: boolean) => void;
}

export class InputBridge {
  private container: HTMLElement;
  private hiddenTextarea: HTMLTextAreaElement;
  private handlers: InputBridgeHandlers;
  private isComposing: boolean = false;

  constructor(container: HTMLElement, handlers: InputBridgeHandlers) {
    this.container = container;
    this.handlers = handlers;

    // 不可視 Textarea の生成
    const textarea = document.createElement('textarea');
    textarea.setAttribute('autocapitalize', 'off');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');
    textarea.setAttribute('spellcheck', 'false');
    textarea.setAttribute('tabindex', '0');
    textarea.style.position = 'absolute';
    textarea.style.top = '0px';
    textarea.style.left = '0px';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    textarea.style.color = 'transparent';
    textarea.style.background = 'transparent';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.overflow = 'hidden';
    textarea.style.whiteSpace = 'pre';
    textarea.style.padding = '0';
    textarea.style.margin = '0';
    textarea.style.zIndex = '-1';

    container.appendChild(textarea);
    this.hiddenTextarea = textarea;

    this.attachEventListeners();
  }

  public focus(): void {
    this.hiddenTextarea.focus();
  }

  /**
   * カーソル位置に合わせて透明Textareaの座標を更新（IMEウィンドウ位置の追従）
   */
  public updateCursorPosition(x: number, y: number): void {
    this.hiddenTextarea.style.top = `${Math.max(0, y)}px`;
    this.hiddenTextarea.style.left = `${Math.max(0, x)}px`;
  }

  private attachEventListeners(): void {
    const ta = this.hiddenTextarea;

    // 1. IME 変換イベント
    ta.addEventListener('compositionstart', () => {
      this.isComposing = true;
    });

    ta.addEventListener('compositionupdate', () => {
      // 変換中文字列の更新通知が必要ならここで行う
    });

    ta.addEventListener('compositionend', (e) => {
      this.isComposing = false;
      const text = e.data;
      if (text) {
        this.handlers.onInsertText(text);
      }
      ta.value = '';
    });

    // 2. 通常の入力イベント
    ta.addEventListener('input', (e) => {
      if (this.isComposing) return;
      const inputEvent = e as InputEvent;
      if (inputEvent.data) {
        this.handlers.onInsertText(inputEvent.data);
      }
      ta.value = '';
    });

    // 3. キーダウン（ショートカット & ナビゲーション）
    ta.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      if (this.isComposing) return;

      // Undo / Redo
      if (isCtrl && !isShift && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.handlers.onUndo();
        return;
      }
      if ((isCtrl && e.key.toLowerCase() === 'y') || (isCtrl && isShift && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        this.handlers.onRedo();
        return;
      }

      // ブックマーク F11
      if (e.key === 'F11') {
        e.preventDefault();
        this.handlers.onBookmarkToggle?.();
        return;
      }
      // ブックマーク移動 F2 / Shift+F2
      if (e.key === 'F2') {
        e.preventDefault();
        if (isShift) {
          this.handlers.onBookmarkPrev?.();
        } else {
          this.handlers.onBookmarkNext?.();
        }
        return;
      }
      // 対括弧ジャンプ Ctrl+[
      if (isCtrl && (e.key === '[' || e.key === 'bracketleft')) {
        e.preventDefault();
        this.handlers.onBracketJump?.();
        return;
      }
      // Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        this.handlers.onEscape?.();
        return;
      }

      // 単語補完 Ctrl+Space (または Ctrl+/)
      if (isCtrl && (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar' || e.key === '/')) {
        e.preventDefault();
        this.handlers.onWordComplete?.();
        return;
      }

      // インクリメンタルサーチ Ctrl+I
      if (isCtrl && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        this.handlers.onIncrementalSearch?.(isShift);
        return;
      }

      // クリップボード
      if (isCtrl && e.key.toLowerCase() === 'c') {
        this.handlers.onCopy();
        return;
      }
      if (isCtrl && e.key.toLowerCase() === 'x') {
        this.handlers.onCut();
        return;
      }

      // エンターキー（改行）
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handlers.onInsertText('\n');
        return;
      }

      // バックスペース
      if (e.key === 'Backspace') {
        e.preventDefault();
        this.handlers.onDeleteChar('backspace');
        return;
      }

      // Delete
      if (e.key === 'Delete') {
        e.preventDefault();
        this.handlers.onDeleteChar('delete');
        return;
      }

      // タブ文字
      if (e.key === 'Tab') {
        e.preventDefault();
        this.handlers.onInsertText('\t');
        return;
      }

      // Insert (上書き/挿入トグル)
      if (e.key === 'Insert') {
        e.preventDefault();
        this.handlers.onToggleOverstrike?.();
        return;
      }

      // Home / End / PageUp / PageDown
      if (e.key === 'Home') {
        e.preventDefault();
        this.handlers.onNavigateHome?.(isShift, isCtrl);
        return;
      }
      if (e.key === 'End') {
        e.preventDefault();
        this.handlers.onNavigateEnd?.(isShift, isCtrl);
        return;
      }
      if (e.key === 'PageUp') {
        e.preventDefault();
        this.handlers.onNavigatePage?.('up', isShift);
        return;
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        this.handlers.onNavigatePage?.('down', isShift);
        return;
      }

      // 矢印キー移動 (Ctrlキーで単語単位移動)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.handlers.onMoveCursor(-1, 0, isShift, isAlt);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.handlers.onMoveCursor(1, 0, isShift, isAlt);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (isCtrl) {
          this.handlers.onNavigateWord?.('left', isShift);
        } else {
          this.handlers.onMoveCursor(0, -1, isShift, isAlt);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isCtrl) {
          this.handlers.onNavigateWord?.('right', isShift);
        } else {
          this.handlers.onMoveCursor(0, 1, isShift, isAlt);
        }
      }
    });

    // 4. ペーストイベント
    ta.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        this.handlers.onPaste(text);
      }
    });

    // 5. マウス & スクロールイベント (コンテナ)
    this.container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // Ctrl+Wheel でフォントズーム
        this.handlers.onZoomWheel?.(-Math.sign(e.deltaY));
        return;
      }
      this.handlers.onScroll(e.deltaX, e.deltaY);
    }, { passive: false });

    this.container.addEventListener('mousedown', () => {
      this.focus();
    });
  }

  public destroy(): void {
    if (this.hiddenTextarea.parentElement) {
      this.hiddenTextarea.parentElement.removeChild(this.hiddenTextarea);
    }
  }
}
