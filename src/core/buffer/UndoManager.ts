import type { Position, SelectionRange } from './types';

export interface UndoStep {
  text: string;
  cursor: Position;
  selection: SelectionRange | null;
  description?: string;
}

export class UndoManager {
  private undoStack: UndoStep[] = [];
  private redoStack: UndoStep[] = [];
  private maxHistory: number = 100;

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  public pushState(step: UndoStep): void {
    this.undoStack.push(step);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // 新しい操作が行われたらredoスタックをクリア
    this.redoStack = [];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public undo(currentState: UndoStep): UndoStep | null {
    if (this.undoStack.length === 0) return null;
    const previous = this.undoStack.pop()!;
    this.redoStack.push(currentState);
    return previous;
  }

  public redo(currentState: UndoStep): UndoStep | null {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push(currentState);
    return next;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
