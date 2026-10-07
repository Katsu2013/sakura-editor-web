import type { Position } from '../buffer/types';
import type { TextBuffer } from '../buffer/TextBuffer';

export class BookmarkManager {
  private bookmarks: Set<number> = new Set();

  public toggle(line: number): boolean {
    if (this.bookmarks.has(line)) {
      this.bookmarks.delete(line);
      return false;
    } else {
      this.bookmarks.add(line);
      return true;
    }
  }

  public isBookmarked(line: number): boolean {
    return this.bookmarks.has(line);
  }

  public getNext(currentLine: number, totalLines: number): number | null {
    if (this.bookmarks.size === 0) return null;
    const sorted = Array.from(this.bookmarks).sort((a, b) => a - b);
    for (const line of sorted) {
      if (line > currentLine && line < totalLines) {
        return line;
      }
    }
    // ループして先頭のブックマーク
    return sorted[0];
  }

  public getPrev(currentLine: number): number | null {
    if (this.bookmarks.size === 0) return null;
    const sorted = Array.from(this.bookmarks).sort((a, b) => b - a);
    for (const line of sorted) {
      if (line < currentLine) {
        return line;
      }
    }
    // ループして末尾のブックマーク
    return sorted[0];
  }

  public clearAll(): void {
    this.bookmarks.clear();
  }

  public getBookmarkedLines(): number[] {
    return Array.from(this.bookmarks).sort((a, b) => a - b);
  }

  public invert(totalLines: number): void {
    const newBookmarks = new Set<number>();
    for (let i = 0; i < totalLines; i++) {
      if (!this.bookmarks.has(i)) {
        newBookmarks.add(i);
      }
    }
    this.bookmarks = newBookmarks;
  }
}

export class BracketMatcher {
  private static BRACKET_PAIRS: Record<string, string> = {
    '(': ')',
    ')': '(',
    '[': ']',
    ']': '[',
    '{': '}',
    '}': '{',
    '「': '」',
    '」': '「',
    '『': '』',
    '』': '『',
    '【': '】',
    '】': '【',
    '<': '>',
    '>': '<',
  };

  private static OPENING_BRACKETS = new Set(['(', '[', '{', '「', '『', '【', '<']);

  public static findMatchingBracket(buffer: TextBuffer, pos: Position): Position | null {
    const lineText = buffer.getLine(pos.line);
    const ch = lineText[pos.column];
    if (!ch || !this.BRACKET_PAIRS[ch]) return null;

    const targetCh = this.BRACKET_PAIRS[ch];
    const isForward = this.OPENING_BRACKETS.has(ch);
    const totalLines = buffer.getLineCount();

    let depth = 0;

    if (isForward) {
      // 前方探索
      for (let l = pos.line; l < totalLines; l++) {
        const text = buffer.getLine(l);
        const startC = l === pos.line ? pos.column : 0;
        for (let c = startC; c < text.length; c++) {
          if (text[c] === ch) {
            depth++;
          } else if (text[c] === targetCh) {
            depth--;
            if (depth === 0) {
              return { line: l, column: c };
            }
          }
        }
      }
    } else {
      // 後方探索
      for (let l = pos.line; l >= 0; l--) {
        const text = buffer.getLine(l);
        const startC = l === pos.line ? pos.column : text.length - 1;
        for (let c = startC; c >= 0; c--) {
          if (text[c] === ch) {
            depth++;
          } else if (text[c] === targetCh) {
            depth--;
            if (depth === 0) {
              return { line: l, column: c };
            }
          }
        }
      }
    }

    return null;
  }
}
