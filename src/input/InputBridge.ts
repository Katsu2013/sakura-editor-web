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
  onSelectAll?: () => void;
  onSave?: () => void;
  onFind?: () => void;
  onFindNext?: () => void;
  onFindPrev?: () => void;
  onReplace?: () => void;
  onJump?: () => void;
}

export class InputBridge {
  private container: HTMLElement;
  private hiddenTextarea: HTMLTextAreaElement;
  private handlers: InputBridgeHandlers;
  private isComposing: boolean = false;
  private justComposed: boolean = false;
  private onWheelBound: (e: WheelEvent) => void;
  private onMouseDownBound: (e: MouseEvent) => void;

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
    textarea.style.pointerEvents = 'none';
    textarea.style.zIndex = '0';

    container.appendChild(textarea);
    this.hiddenTextarea = textarea;

    this.onWheelBound = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        this.handlers.onZoomWheel?.(-Math.sign(e.deltaY));
        return;
      }
      this.handlers.onScroll(e.deltaX, e.deltaY);
    };

    this.onMouseDownBound = () => {
      this.focus();
    };

    this.attachEventListeners();
  }

  public focus(): void {
    if (this.hiddenTextarea) {
      try {
        this.hiddenTextarea.focus({ preventScroll: true });
      } catch {
        this.hiddenTextarea.focus();
      }
    }
  }

  public isFocused(): boolean {
    return document.activeElement === this.hiddenTextarea;
  }

  public setHandlers(handlers: InputBridgeHandlers): void {
    this.handlers = handlers;
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
      this.justComposed = false;
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
      this.justComposed = true;
    });

    // 2. 通常の入力イベント
    ta.addEventListener('input', (e) => {
      if (this.isComposing) return;
      if (this.justComposed) {
        this.justComposed = false;
        ta.value = '';
        return;
      }
      const inputEvent = e as InputEvent;
      if (inputEvent.inputType === 'insertCompositionText') {
        ta.value = '';
        return;
      }
      const text = inputEvent.data ?? ta.value;
      if (text) {
        this.handlers.onInsertText(text);
      }
      ta.value = '';
    });

    // 3. キーダウン（ショートカット & ナビゲーション）
    ta.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      if (this.isComposing || e.isComposing || e.keyCode === 229) return;

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

      // すべて選択 Ctrl+A
      if (isCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.handlers.onSelectAll?.();
        return;
      }

      // 保存 Ctrl+S
      if (isCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.handlers.onSave?.();
        return;
      }

      // 検索 Ctrl+F
      if (isCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        this.handlers.onFind?.();
        return;
      }

      // 置換 Ctrl+R
      if (isCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        this.handlers.onReplace?.();
        return;
      }

      // 指定行ジャンプ Ctrl+J
      if (isCtrl && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        this.handlers.onJump?.();
        return;
      }

      // 次を検索 / 前を検索 F3 / Shift+F3
      if (e.key === 'F3') {
        e.preventDefault();
        if (isShift) {
          this.handlers.onFindPrev?.();
        } else {
          this.handlers.onFindNext?.();
        }
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
    this.container.addEventListener('wheel', this.onWheelBound, { passive: false });
    this.container.addEventListener('mousedown', this.onMouseDownBound);
  }

  public destroy(): void {
    this.container.removeEventListener('wheel', this.onWheelBound);
    this.container.removeEventListener('mousedown', this.onMouseDownBound);
    if (this.hiddenTextarea.parentElement) {
      this.hiddenTextarea.parentElement.removeChild(this.hiddenTextarea);
    }
  }
}
