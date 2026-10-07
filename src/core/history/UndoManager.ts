import type { Position, SelectionRange } from '../buffer/types';

export interface HistoryItem {
  type: 'insert' | 'delete' | 'box_delete' | 'box_insert';
  range: SelectionRange;
  text: string;
  cursorBefore: Position;
  cursorAfter: Position;
  // 矩形操作用
  boxParams?: {
    startLine: number;
    endLine: number;
    startCol: number;
    endCol: number;
    lines: string[];
  };
}

export class UndoManager {
  private undoStack: HistoryItem[] = [];
  private redoStack: HistoryItem[] = [];
  private maxHistory: number = 1000;

  public push(item: HistoryItem): void {
    this.undoStack.push(item);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // 新規操作時はRedoスタックをクリア
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public popUndo(): HistoryItem | undefined {
    const item = this.undoStack.pop();
    if (item) {
      this.redoStack.push(item);
    }
    return item;
  }

  public popRedo(): HistoryItem | undefined {
    const item = this.redoStack.pop();
    if (item) {
      this.undoStack.push(item);
    }
    return item;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
