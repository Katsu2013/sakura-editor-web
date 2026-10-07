import type { TextBuffer } from '../buffer/TextBuffer';
import type { Position, SelectionRange } from '../buffer/types';
import type { BookmarkManager } from '../navigation/BookmarkManager';

export interface MacroContext {
  buffer: TextBuffer;
  cursor: Position;
  selection: SelectionRange | null;
  bookmarkManager: BookmarkManager;
  setCursor: (pos: Position) => void;
  setSelection: (sel: SelectionRange | null) => void;
  triggerChange: () => void;
}

export class MacroEngine {
  /**
   * サクラエディタのマクロ (.mac または .js) を実行
   */
  public static async executeMacro(scriptText: string, context: MacroContext): Promise<void> {
    const { buffer, bookmarkManager, setCursor, setSelection, triggerChange } = context;

    // サクラエディタ互換の Editor オブジェクト
    const Editor = {
      InsText: (text: string) => {
        if (context.selection) {
          buffer.deleteRange(context.selection);
          context.selection = null;
          setSelection(null);
        }
        const newPos = buffer.insert(context.cursor, text);
        context.cursor = newPos;
        setCursor(newPos);
        triggerChange();
      },
      Delete: () => {
        const curLine = buffer.getLine(context.cursor.line);
        if (context.cursor.column < curLine.length) {
          buffer.deleteRange({
            start: context.cursor,
            end: { line: context.cursor.line, column: context.cursor.column + 1 },
            isBoxSelect: false,
          });
          triggerChange();
        }
      },
      DeleteBack: () => {
        if (context.cursor.column > 0) {
          buffer.deleteRange({
            start: { line: context.cursor.line, column: context.cursor.column - 1 },
            end: context.cursor,
            isBoxSelect: false,
          });
          context.cursor = { line: context.cursor.line, column: context.cursor.column - 1 };
          setCursor(context.cursor);
          triggerChange();
        }
      },
      Down: () => {
        const nextLine = Math.min(buffer.getLineCount() - 1, context.cursor.line + 1);
        context.cursor = { line: nextLine, column: context.cursor.column };
        setCursor(context.cursor);
      },
      Up: () => {
        const prevLine = Math.max(0, context.cursor.line - 1);
        context.cursor = { line: prevLine, column: context.cursor.column };
        setCursor(context.cursor);
      },
      Left: () => {
        const prevCol = Math.max(0, context.cursor.column - 1);
        context.cursor = { line: context.cursor.line, column: prevCol };
        setCursor(context.cursor);
      },
      Right: () => {
        const lineLen = buffer.getLine(context.cursor.line).length;
        const nextCol = Math.min(lineLen, context.cursor.column + 1);
        context.cursor = { line: context.cursor.line, column: nextCol };
        setCursor(context.cursor);
      },
      GoLineTop: () => {
        context.cursor = { line: context.cursor.line, column: 0 };
        setCursor(context.cursor);
      },
      GoLineEnd: () => {
        const lineLen = buffer.getLine(context.cursor.line).length;
        context.cursor = { line: context.cursor.line, column: lineLen };
        setCursor(context.cursor);
      },
      BookmarkSet: () => {
        bookmarkManager.toggle(context.cursor.line);
        triggerChange();
      },
      BookmarkNext: () => {
        const next = bookmarkManager.getNext(context.cursor.line, buffer.getLineCount());
        if (next !== null) {
          context.cursor = { line: next, column: 0 };
          setCursor(context.cursor);
        }
      },
      BookmarkPrev: () => {
        const prev = bookmarkManager.getPrev(context.cursor.line);
        if (prev !== null) {
          context.cursor = { line: prev, column: 0 };
          setCursor(context.cursor);
        }
      },
      SelectAll: () => {
        const total = buffer.getLineCount();
        const lastLen = buffer.getLine(total - 1).length;
        const sel: SelectionRange = {
          start: { line: 0, column: 0 },
          end: { line: total - 1, column: lastLen },
          isBoxSelect: false,
        };
        context.selection = sel;
        setSelection(sel);
      },
      GetSelectedString: () => {
        if (!context.selection) return '';
        // 簡易取得
        return buffer.getText().substring(0, 1000);
      },
      GetLineData: (line: number) => {
        return buffer.getLine(line - 1);
      },
      GetLineCount: () => {
        return buffer.getLineCount();
      },
      Jump: (line: number, col: number = 1) => {
        const targetLine = Math.max(0, Math.min(buffer.getLineCount() - 1, line - 1));
        const lineLen = buffer.getLine(targetLine).length;
        const targetCol = Math.max(0, Math.min(lineLen, col - 1));
        context.cursor = { line: targetLine, column: targetCol };
        setCursor(context.cursor);
      },
    };

    // .mac 形式（S_XXX(...) または XXX(...)）の場合、JS構文に正規化して実行
    const normalizedScript = MacroEngine.normalizeMacroScript(scriptText);

    try {
      // 安全なFunctionコンストラクタによる実行
      const runner = new Function(
        'Editor',
        'S_InsText', 'InsText',
        'S_Delete', 'Delete',
        'S_DeleteBack', 'DeleteBack',
        'S_Down', 'Down',
        'S_Up', 'Up',
        'S_Left', 'Left',
        'S_Right', 'Right',
        'S_BookmarkSet', 'BookmarkSet',
        'S_Jump', 'Jump',
        normalizedScript
      );

      runner(
        Editor,
        Editor.InsText, Editor.InsText,
        Editor.Delete, Editor.Delete,
        Editor.DeleteBack, Editor.DeleteBack,
        Editor.Down, Editor.Down,
        Editor.Up, Editor.Up,
        Editor.Left, Editor.Left,
        Editor.Right, Editor.Right,
        Editor.BookmarkSet, Editor.BookmarkSet,
        Editor.Jump, Editor.Jump
      );
    } catch (err) {
      console.error('Macro execution error:', err);
      throw err;
    }
  }

  /**
   * サクラエディタの .mac 形式の記述を JavaScript 形式に変換
   */
  private static normalizeMacroScript(script: string): string {
    const lines = script.split(/\r\n|\r|\n/);
    const convertedLines: string[] = [];

    for (const rawLine of lines) {
      let line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) {
        continue;
      }

      // S_Char(13) 等の改行マクロ
      if (/^S_Char\(13\)/i.test(line)) {
        convertedLines.push('Editor.InsText("\\n");');
        continue;
      }
      if (/^S_Char\(9\)/i.test(line)) {
        convertedLines.push('Editor.InsText("\\t");');
        continue;
      }

      // S_ で始まるコマンドを Editor.xxx または直接関数呼び出しに
      if (/^S_([a-zA-Z0-9_]+)\((.*)\);?$/.test(line)) {
        convertedLines.push(line.replace(/^S_/, 'Editor.') + (line.endsWith(';') ? '' : ';'));
      } else {
        convertedLines.push(line);
      }
    }

    return convertedLines.join('\n');
  }
}

/**
 * キーボードマクロレコーダー (Ctrl+Shift+M / Ctrl+Shift+L)
 */
export class MacroRecorder {
  private isRecording: boolean = false;
  private recordedCommands: string[] = [];

  public start(): void {
    this.isRecording = true;
    this.recordedCommands = [];
  }

  public stop(): string {
    this.isRecording = false;
    return this.getMacroScript();
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public record(command: string): void {
    if (!this.isRecording) return;
    this.recordedCommands.push(command);
  }

  public getMacroScript(): string {
    return this.recordedCommands.join('\r\n');
  }

  public hasRecorded(): boolean {
    return this.recordedCommands.length > 0;
  }
}
