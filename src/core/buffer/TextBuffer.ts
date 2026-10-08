import type { LineEnding, Position, SelectionRange } from './types';

export interface LineChangeState {
  modified: boolean;
  saved: boolean;
}

export class TextBuffer {
  private lines: string[] = [''];
  private lineEndings: LineEnding[] = [];
  private defaultLineEnding: LineEnding = 'CRLF';
  private modifiedLines: Set<number> = new Set();
  private version: number = 0;

  constructor(initialText: string = '', defaultLineEnding: LineEnding = 'CRLF') {
    this.defaultLineEnding = defaultLineEnding;
    this.setText(initialText);
  }

  public getVersion(): number {
    return this.version;
  }

  public setText(text: string): void {
    this.version++;
    this.modifiedLines.clear();

    // 改行コード（CRLF, LF, CR）の検出と行分割
    const lines: string[] = [];
    const endings: LineEnding[] = [];
    let currentLine = '';
    let i = 0;
    const len = text.length;

    while (i < len) {
      const ch = text[i];
      if (ch === '\r') {
        if (i + 1 < len && text[i + 1] === '\n') {
          lines.push(currentLine);
          endings.push('CRLF');
          currentLine = '';
          i += 2;
        } else {
          lines.push(currentLine);
          endings.push('CR');
          currentLine = '';
          i += 1;
        }
      } else if (ch === '\n') {
        lines.push(currentLine);
        endings.push('LF');
        currentLine = '';
        i += 1;
      } else {
        currentLine += ch;
        i += 1;
      }
    }
    lines.push(currentLine);

    this.lines = lines;
    this.lineEndings = endings;
  }

  public getText(targetEnding?: LineEnding): string {
    const endingStr = (end: LineEnding) => {
      switch (end) {
        case 'CRLF': return '\r\n';
        case 'LF': return '\n';
        case 'CR': return '\r';
      }
    };

    let result = '';
    for (let i = 0; i < this.lines.length; i++) {
      result += this.lines[i];
      if (i < this.lines.length - 1) {
        const end = targetEnding || this.lineEndings[i] || this.defaultLineEnding;
        result += endingStr(end);
      }
    }
    return result;
  }

  public getLineCount(): number {
    return this.lines.length;
  }

  public getLine(lineNumber: number): string {
    if (lineNumber < 0 || lineNumber >= this.lines.length) return '';
    return this.lines[lineNumber];
  }

  public getLineEnding(lineNumber: number): LineEnding {
    if (lineNumber < 0 || lineNumber >= this.lineEndings.length) {
      return this.defaultLineEnding;
    }
    return this.lineEndings[lineNumber];
  }

  public setLineEnding(lineNumber: number, ending: LineEnding): void {
    if (lineNumber >= 0 && lineNumber < this.lineEndings.length) {
      this.lineEndings[lineNumber] = ending;
    }
  }

  public setDefaultLineEnding(ending: LineEnding): void {
    this.defaultLineEnding = ending;
  }

  public convertAllLineEndings(targetEnding: LineEnding): void {
    for (let i = 0; i < this.lineEndings.length; i++) {
      this.lineEndings[i] = targetEnding;
    }
    this.defaultLineEnding = targetEnding;
  }

  public isLineModified(lineNumber: number): boolean {
    return this.modifiedLines.has(lineNumber);
  }

  public clearModifiedStatus(): void {
    this.modifiedLines.clear();
  }

  /**
   * 単純テキスト挿入
   */
  public insert(pos: Position, text: string): Position {
    let lineIdx = Math.max(0, Math.min(pos.line, this.lines.length - 1));
    const currentLine = this.lines[lineIdx] || '';
    const colIdx = Math.max(0, Math.min(pos.column, currentLine.length));

    const before = currentLine.substring(0, colIdx);
    const after = currentLine.substring(colIdx);

    // テキストを行分割（正規表現）
    const insertLines = text.split(/\r\n|\r|\n/);

    this.version++;
    this.modifiedLines.add(lineIdx);

    if (insertLines.length === 1) {
      // 単一行の挿入
      this.lines[lineIdx] = before + insertLines[0] + after;
      return { line: lineIdx, column: colIdx + insertLines[0].length };
    }

    // 複数行にまたがる挿入
    const firstLine = before + insertLines[0];
    const lastLine = insertLines[insertLines.length - 1] + after;
    const middleLines = insertLines.slice(1, -1);

    const newLines = [firstLine, ...middleLines, lastLine];
    const endingsToInsert: LineEnding[] = [];
    for (let k = 0; k < insertLines.length - 1; k++) {
      endingsToInsert.push(this.defaultLineEnding);
    }

    this.lines.splice(lineIdx, 1, ...newLines);
    this.lineEndings.splice(lineIdx, 0, ...endingsToInsert);

    for (let k = 0; k < newLines.length; k++) {
      this.modifiedLines.add(lineIdx + k);
    }

    const endLine = lineIdx + insertLines.length - 1;
    const endCol = insertLines[insertLines.length - 1].length;
    return { line: endLine, column: endCol };
  }

  /**
   * 範囲削除
   */
  public deleteRange(range: SelectionRange): { deletedText: string; newPos: Position } {
    this.version++;
    let { start, end } = range;
    if (start.line > end.line || (start.line === end.line && start.column > end.column)) {
      const temp = start;
      start = end;
      end = temp;
    }

    const startLine = Math.max(0, Math.min(start.line, this.lines.length - 1));
    const endLine = Math.max(0, Math.min(end.line, this.lines.length - 1));

    const startText = this.lines[startLine];
    const endText = this.lines[endLine];

    const startCol = Math.max(0, Math.min(start.column, startText.length));
    const endCol = Math.max(0, Math.min(end.column, endText.length));

    let deletedText = '';

    if (startLine === endLine) {
      deletedText = startText.substring(startCol, endCol);
      this.lines[startLine] = startText.substring(0, startCol) + startText.substring(endCol);
      this.modifiedLines.add(startLine);
    } else {
      const parts: string[] = [];
      parts.push(startText.substring(startCol));
      for (let i = startLine + 1; i < endLine; i++) {
        parts.push(this.lines[i]);
      }
      parts.push(endText.substring(0, endCol));
      deletedText = parts.join('\n');

      const remainingLine = startText.substring(0, startCol) + endText.substring(endCol);
      const deleteCount = endLine - startLine + 1;

      this.lines.splice(startLine, deleteCount, remainingLine);
      this.lineEndings.splice(startLine, endLine - startLine);

      this.modifiedLines.add(startLine);
    }

    return {
      deletedText,
      newPos: { line: startLine, column: startCol },
    };
  }

  /**
   * 矩形削除 (Box Delete)
   */
  public deleteBox(startLine: number, endLine: number, startCol: number, endCol: number): string {
    this.version++;
    const sLine = Math.min(startLine, endLine);
    const eLine = Math.max(startLine, endLine);
    const sCol = Math.min(startCol, endCol);
    const eCol = Math.max(startCol, endCol);

    const deletedLines: string[] = [];

    for (let l = sLine; l <= eLine; l++) {
      if (l >= this.lines.length) break;
      const text = this.lines[l];
      const left = text.substring(0, Math.min(sCol, text.length));
      const mid = text.substring(Math.min(sCol, text.length), Math.min(eCol, text.length));
      const right = text.substring(Math.min(eCol, text.length));

      deletedLines.push(mid);
      this.lines[l] = left + right;
      this.modifiedLines.add(l);
    }

    return deletedLines.join('\n');
  }

  /**
   * 矩形挿入 (Box Insert)
   */
  public insertBox(startLine: number, endLine: number, col: number, textLines: string[]): void {
    this.version++;
    const sLine = Math.min(startLine, endLine);
    const eLine = Math.max(startLine, endLine);

    for (let i = 0; i <= eLine - sLine; i++) {
      const l = sLine + i;
      if (l >= this.lines.length) break;
      const insertStr = textLines[i % textLines.length] || '';
      const text = this.lines[l];
      const padded = text.padEnd(col, ' ');
      const left = padded.substring(0, col);
      const right = padded.substring(col);
      this.lines[l] = left + insertStr + right;
      this.modifiedLines.add(l);
    }
  }

  public replaceLine(lineNumber: number, text: string): void {
    if (lineNumber >= 0 && lineNumber < this.lines.length) {
      this.version++;
      this.lines[lineNumber] = text;
      this.modifiedLines.add(lineNumber);
    }
  }

  public deleteLines(lineIndices: number[]): void {
    if (lineIndices.length === 0) return;
    this.version++;
    const toDelete = new Set(lineIndices);
    const newLines: string[] = [];
    const newEndings: LineEnding[] = [];
    for (let i = 0; i < this.lines.length; i++) {
      if (!toDelete.has(i)) {
        newLines.push(this.lines[i]);
        if (i < this.lineEndings.length) {
          newEndings.push(this.lineEndings[i]);
        }
      }
    }
    if (newLines.length === 0) {
      newLines.push('');
    }
    this.lines = newLines;
    this.lineEndings = newEndings;
    this.modifiedLines.clear();
    this.modifiedLines.add(0);
  }

  public getRawCharacterCount(): number {
    let count = 0;
    for (const l of this.lines) {
      count += l.length;
    }
    return count;
  }

  /**
   * 選択範囲のテキストを取得 (矩形選択対応)
   */
  public getTextInRange(range: SelectionRange): string {
    let { start, end } = range;
    if (start.line > end.line || (start.line === end.line && start.column > end.column)) {
      const temp = start;
      start = end;
      end = temp;
    }

    if (range.isBoxSelect && range.boxStartCol !== undefined && range.boxEndCol !== undefined) {
      const sLine = Math.min(start.line, end.line);
      const eLine = Math.max(start.line, end.line);
      const sCol = Math.min(range.boxStartCol, range.boxEndCol);
      const eCol = Math.max(range.boxStartCol, range.boxEndCol);
      const lines: string[] = [];
      for (let l = sLine; l <= eLine; l++) {
        if (l < this.lines.length) {
          const text = this.lines[l];
          lines.push(text.substring(sCol, eCol));
        }
      }
      return lines.join('\r\n');
    }

    const startLine = Math.max(0, Math.min(start.line, this.lines.length - 1));
    const endLine = Math.max(0, Math.min(end.line, this.lines.length - 1));

    if (startLine === endLine) {
      const text = this.lines[startLine] || '';
      return text.substring(start.column, end.column);
    }

    const parts: string[] = [];
    parts.push((this.lines[startLine] || '').substring(start.column));
    for (let l = startLine + 1; l < endLine; l++) {
      parts.push(this.lines[l] || '');
    }
    parts.push((this.lines[endLine] || '').substring(0, end.column));
    return parts.join(this.defaultLineEnding === 'LF' ? '\n' : '\r\n');
  }
}
