import type { TextBuffer } from '../buffer/TextBuffer';
import type { Position } from '../buffer/types';

export interface SearchOptions {
  query: string;
  isRegex: boolean;
  matchCase: boolean;
  matchWholeWord: boolean;
}

export interface SearchMatch {
  line: number;
  startCol: number;
  endCol: number;
  matchedText: string;
}

export interface GrepFileResult {
  fileName: string;
  filePath: string;
  line: number;
  column: number;
  lineText: string;
}

export class SearchEngine {
  /**
   * 現在のバッファ内を前方検索
   */
  public static findNext(
    buffer: TextBuffer,
    options: SearchOptions,
    fromPos: Position
  ): SearchMatch | null {
    if (!options.query) return null;

    const lineCount = buffer.getLineCount();
    const regex = this.buildRegex(options);
    if (!regex) return null;

    // 現在行のカーソル以降を検索
    const currentLine = buffer.getLine(fromPos.line);
    const afterText = currentLine.substring(fromPos.column);
    const mFirst = afterText.match(regex);
    if (mFirst && mFirst.index !== undefined) {
      const matchStart = fromPos.column + mFirst.index;
      return {
        line: fromPos.line,
        startCol: matchStart,
        endCol: matchStart + mFirst[0].length,
        matchedText: mFirst[0],
      };
    }

    // 次の行から文末まで
    for (let l = fromPos.line + 1; l < lineCount; l++) {
      const lineText = buffer.getLine(l);
      const m = lineText.match(regex);
      if (m && m.index !== undefined) {
        return {
          line: l,
          startCol: m.index,
          endCol: m.index + m[0].length,
          matchedText: m[0],
        };
      }
    }

    // ループして先頭行から現在位置まで
    for (let l = 0; l <= fromPos.line; l++) {
      const lineText = buffer.getLine(l);
      const maxCol = l === fromPos.line ? fromPos.column : lineText.length;
      const sub = lineText.substring(0, maxCol);
      const m = sub.match(regex);
      if (m && m.index !== undefined) {
        return {
          line: l,
          startCol: m.index,
          endCol: m.index + m[0].length,
          matchedText: m[0],
        };
      }
    }

    return null;
  }

  /**
   * 後方検索
   */
  public static findPrevious(
    buffer: TextBuffer,
    options: SearchOptions,
    fromPos: Position
  ): SearchMatch | null {
    if (!options.query) return null;
    const regex = this.buildRegex(options, 'g');
    if (!regex) return null;

    const lineCount = buffer.getLineCount();

    // 現在行のカーソル以前
    const currentLine = buffer.getLine(fromPos.line);
    const beforeText = currentLine.substring(0, fromPos.column);
    const matchesBefore = [...beforeText.matchAll(regex)];
    if (matchesBefore.length > 0) {
      const last = matchesBefore[matchesBefore.length - 1];
      if (last.index !== undefined) {
        return {
          line: fromPos.line,
          startCol: last.index,
          endCol: last.index + last[0].length,
          matchedText: last[0],
        };
      }
    }

    // 前の行から先頭まで
    for (let l = fromPos.line - 1; l >= 0; l--) {
      const lineText = buffer.getLine(l);
      const matches = [...lineText.matchAll(regex)];
      if (matches.length > 0) {
        const last = matches[matches.length - 1];
        if (last.index !== undefined) {
          return {
            line: l,
            startCol: last.index,
            endCol: last.index + last[0].length,
            matchedText: last[0],
          };
        }
      }
    }

    // 末尾から現在行までループ
    for (let l = lineCount - 1; l >= fromPos.line; l--) {
      const lineText = buffer.getLine(l);
      const minCol = l === fromPos.line ? fromPos.column : 0;
      const sub = lineText.substring(minCol);
      const matches = [...sub.matchAll(regex)];
      if (matches.length > 0) {
        const last = matches[matches.length - 1];
        if (last.index !== undefined) {
          return {
            line: l,
            startCol: minCol + last.index,
            endCol: minCol + last.index + last[0].length,
            matchedText: last[0],
          };
        }
      }
    }

    return null;
  }

  /**
   * 全マッチの取得（画面ハイライト用）
   */
  public static findAllInLine(
    lineText: string,
    options: SearchOptions
  ): { startCol: number; endCol: number }[] {
    if (!options.query) return [];
    const regex = this.buildRegex(options, 'g');
    if (!regex) return [];

    const results: { startCol: number; endCol: number }[] = [];
    const matches = [...lineText.matchAll(regex)];
    for (const m of matches) {
      if (m.index !== undefined && m[0].length > 0) {
        results.push({
          startCol: m.index,
          endCol: m.index + m[0].length,
        });
      }
    }
    return results;
  }

  /**
   * テキスト全体からマッチ数をカウント
   */
  public static countMatches(text: string, options: SearchOptions): number {
    if (!options.query) return 0;
    const regex = this.buildRegex(options, 'g');
    if (!regex) return 0;
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  private static buildRegex(options: SearchOptions, flags: string = ''): RegExp | null {
    let { query, isRegex, matchCase, matchWholeWord } = options;
    if (!query) return null;

    let flagStr = flags;
    if (!matchCase && !flagStr.includes('i')) {
      flagStr += 'i';
    }

    try {
      let pattern = isRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      return new RegExp(pattern, flagStr);
    } catch {
      return null;
    }
  }
}
