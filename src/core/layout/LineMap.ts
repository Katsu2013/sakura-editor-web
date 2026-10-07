import { LayoutEngine, type VisualLineSpan } from './LayoutEngine';
import type { TextBuffer } from '../buffer/TextBuffer';
import type { Position, VisualPosition } from '../buffer/types';

export class LineMap {
  private spans: VisualLineSpan[] = [];
  private logicalToSpanIndex: number[] = []; // 各論理行の最初のspanインデックス
  private layoutEngine: LayoutEngine;
  private buffer: TextBuffer;

  constructor(buffer: TextBuffer, layoutEngine: LayoutEngine) {
    this.buffer = buffer;
    this.layoutEngine = layoutEngine;
    this.rebuildAll();
  }

  public rebuildAll(windowColumns: number = 80): void {
    const totalLines = this.buffer.getLineCount();
    const newSpans: VisualLineSpan[] = [];
    const newLogicalMap: number[] = new Array(totalLines);

    for (let l = 0; l < totalLines; l++) {
      newLogicalMap[l] = newSpans.length;
      const lineText = this.buffer.getLine(l);
      const lineSpans = this.layoutEngine.layoutLogicalLine(l, lineText, windowColumns);
      for (const s of lineSpans) {
        newSpans.push(s);
      }
    }

    this.spans = newSpans;
    this.logicalToSpanIndex = newLogicalMap;
  }

  public getVisualLineCount(): number {
    return this.spans.length;
  }

  public getSpan(visualRow: number): VisualLineSpan | undefined {
    return this.spans[visualRow];
  }

  /**
   * 表示行 + 表示桁 (visualCol: 半角換算) から論理位置への変換
   */
  public visualToLogical(visualRow: number, visualCol: number): Position {
    if (this.spans.length === 0) return { line: 0, column: 0 };

    const row = Math.max(0, Math.min(visualRow, this.spans.length - 1));
    const span = this.spans[row];
    const lineText = this.buffer.getLine(span.logicalLine);

    if (span.visualColumns.length <= 1) {
      return { line: span.logicalLine, column: span.startCharIndex };
    }

    // visualColumns 配列から最も近い文字インデックスを特定
    let closestCharIdx = span.startCharIndex;

    for (let i = 0; i < span.visualColumns.length - 1; i++) {
      const vStart = span.visualColumns[i];
      const vEnd = span.visualColumns[i + 1];
      const mid = (vStart + vEnd) / 2;

      if (visualCol < mid) {
        closestCharIdx = span.startCharIndex + i;
        break;
      }
      closestCharIdx = span.startCharIndex + i + 1;
    }

    return {
      line: span.logicalLine,
      column: Math.min(closestCharIdx, lineText.length),
    };
  }

  /**
   * 論理位置から表示位置（表示行, 表示桁）への変換
   */
  public logicalToVisual(pos: Position): VisualPosition {
    const line = Math.max(0, Math.min(pos.line, this.buffer.getLineCount() - 1));
    const firstSpanIdx = this.logicalToSpanIndex[line] ?? 0;

    let targetSpanIdx = firstSpanIdx;
    while (
      targetSpanIdx < this.spans.length &&
      this.spans[targetSpanIdx].logicalLine === line
    ) {
      const span = this.spans[targetSpanIdx];
      if (pos.column >= span.startCharIndex && pos.column <= span.endCharIndex) {
        const offset = pos.column - span.startCharIndex;
        const vCol = span.visualColumns[offset] ?? 0;
        return { visualLine: targetSpanIdx, visualColumn: vCol };
      }
      targetSpanIdx++;
    }

    // 見つからなければ最初のspan
    return { visualLine: firstSpanIdx, visualColumn: 0 };
  }
}
