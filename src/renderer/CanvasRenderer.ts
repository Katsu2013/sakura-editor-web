import type { TextBuffer } from '../core/buffer/TextBuffer';
import type { LineMap } from '../core/layout/LineMap';
import type { Position, SelectionRange } from '../core/buffer/types';
import type { FontMetricsInfo } from './FontMetrics';
import type { BookmarkManager } from '../core/navigation/BookmarkManager';
import { SymbolRenderer } from './symbols';
import { SyntaxHighlighter, type SyntaxRule } from '../core/syntax/SyntaxHighlighter';
import { SearchEngine, type SearchOptions } from '../core/search/SearchEngine';

export interface ViewportState {
  scrollTop: number;
  scrollLeft: number;
  width: number;
  height: number;
}

export interface EditorTheme {
  background: string;
  textColor: string;
  gutterBackground: string;
  gutterTextColor: string;
  gutterModifiedColor: string;
  selectionColor: string;
  cursorColor: string;
  currentLineColor: string;
  rulerBackground: string;
  rulerTextColor: string;
  rulerMarkerColor: string;
  keywordColor: string;
  commentColor: string;
  stringColor: string;
  numberColor: string;
  urlColor: string;
}

export const classicSakuraTheme: EditorTheme = {
  background: '#ffffef',        // サクラエディタ標準の優しいアイボリー色
  textColor: '#000000',
  gutterBackground: '#ffffef',  // サクラエディタ標準：行番号背景は本文と同一色
  gutterTextColor: '#606060',
  gutterModifiedColor: '#32cd32', // ライムグリーン（変更行マーク）
  selectionColor: '#3390ff',     // サクラエディタ標準ブルー
  cursorColor: '#000000',
  currentLineColor: '#f7faff',   // 現在行の薄いハイライト
  rulerBackground: '#ffffef',   // サクラエディタ標準：ルーラー背景は本文と同一色
  rulerTextColor: '#303030',
  rulerMarkerColor: '#cc0000',   // 折り返し位置の赤三角マーカー
  keywordColor: '#0000ff',       // 青
  commentColor: '#008000',       // 緑
  stringColor: '#a52a2a',        // 茶
  numberColor: '#800080',        // 紫
  urlColor: '#0000ee',           // URLリンク青
};

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private theme: EditorTheme = classicSakuraTheme;
  private gutterWidth: number = 32; // 行番号エリアの幅 (サクラエディタ準拠)
  private rulerHeight: number = 20; // 桁ルーラーの高さ

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Cannot get canvas 2d context');
    this.ctx = context;
  }

  public setTheme(theme: Partial<EditorTheme>): void {
    this.theme = { ...this.theme, ...theme };
  }

  public getGutterWidth(showLineNumbers: boolean = true): number {
    return showLineNumbers ? this.gutterWidth : 0;
  }

  public getRulerHeight(showRuler: boolean = true): number {
    return showRuler ? this.rulerHeight : 0;
  }

  /**
   * 画面全体を描画（仮想スクロール最適化）
   */
  public render(
    buffer: TextBuffer,
    lineMap: LineMap,
    metrics: FontMetricsInfo,
    viewport: ViewportState,
    cursor: Position,
    selection: SelectionRange | null,
    syntaxRule?: SyntaxRule,
    _searchOptions?: SearchOptions,
    wrapColumn: number = 80,
    imeComposition?: { text: string; cursor: number } | null,
    showSymbols: { fullSpace: boolean; halfSpace: boolean; tab: boolean; lineEnd: boolean; eof: boolean } = {
      fullSpace: true,
      halfSpace: false,
      tab: true,
      lineEnd: true,
      eof: true,
    },
    bookmarkManager?: BookmarkManager,
    matchingBracket?: Position | null,
    searchHighlight?: { query: string; isRegex: boolean; matchCase: boolean } | null,
    windowSettings: {
      showRuler: boolean;
      showLineNumbers: boolean;
      lineNumberType: 'logical' | 'visual';
      lineSpacing: number;
      showModifiedGutter?: boolean;
    } = {
      showRuler: true,
      showLineNumbers: true,
      lineNumberType: 'logical',
      lineSpacing: 2,
      showModifiedGutter: true,
    },
    diffMarks?: Map<number, 'add' | 'del' | 'mod'>
  ): void {
    const { ctx, theme } = this;
    const { width, height, scrollTop, scrollLeft } = viewport;
    const { charWidth, fullCharWidth, baseline, fontFamily, fontSize } = metrics;
    const lineHeight = metrics.lineHeight + (windowSettings.lineSpacing || 0);
    const gutterWidth = windowSettings.showLineNumbers ? this.gutterWidth : 0;
    const rulerHeight = windowSettings.showRuler ? this.rulerHeight : 0;

    // Retina / 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. エディタ全体背景クリア
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    // 可視表示行の計算
    const firstVisualRow = Math.max(0, Math.floor(scrollTop / lineHeight));
    const visibleRowCount = Math.ceil((height - rulerHeight) / lineHeight) + 1;
    const lastVisualRow = Math.min(lineMap.getVisualLineCount() - 1, firstVisualRow + visibleRowCount);

    // テキスト領域のクリッピング
    const textAreaX = gutterWidth;
    const textAreaY = rulerHeight;
    const textAreaWidth = width - gutterWidth;
    const textAreaHeight = height - rulerHeight;

    // 2. 現在行ハイライト
    const cursorVisual = lineMap.logicalToVisual(cursor);
    if (cursorVisual.visualLine >= firstVisualRow && cursorVisual.visualLine <= lastVisualRow) {
      const curY = textAreaY + (cursorVisual.visualLine * lineHeight - scrollTop);
      ctx.fillStyle = theme.currentLineColor;
      ctx.fillRect(textAreaX, curY, textAreaWidth, lineHeight);
    }

    // 3. 選択範囲ハイライト描画
    if (selection) {
      ctx.save();
      ctx.fillStyle = theme.selectionColor;
      ctx.globalAlpha = 0.35;

      if (selection.isBoxSelect && selection.boxStartCol !== undefined && selection.boxEndCol !== undefined) {
        // 矩形選択 (Alt + Drag)
        const sLine = Math.min(selection.start.line, selection.end.line);
        const eLine = Math.max(selection.start.line, selection.end.line);
        const sCol = Math.min(selection.boxStartCol, selection.boxEndCol);
        const eCol = Math.max(selection.boxStartCol, selection.boxEndCol);

        for (let row = firstVisualRow; row <= lastVisualRow; row++) {
          const span = lineMap.getSpan(row);
          if (!span || span.logicalLine < sLine || span.logicalLine > eLine) continue;

          const rowY = textAreaY + (row * lineHeight - scrollTop);
          const boxX1 = textAreaX + (sCol * charWidth - scrollLeft);
          const boxX2 = textAreaX + (eCol * charWidth - scrollLeft);
          ctx.fillRect(boxX1, rowY, Math.max(2, boxX2 - boxX1), lineHeight);
        }
      } else {
        // 通常の連続選択
        let sPos = selection.start;
        let ePos = selection.end;
        if (sPos.line > ePos.line || (sPos.line === ePos.line && sPos.column > ePos.column)) {
          const t = sPos; sPos = ePos; ePos = t;
        }

        const sVisual = lineMap.logicalToVisual(sPos);
        const eVisual = lineMap.logicalToVisual(ePos);

        for (let r = Math.max(firstVisualRow, sVisual.visualLine); r <= Math.min(lastVisualRow, eVisual.visualLine); r++) {
          const rowY = textAreaY + (r * lineHeight - scrollTop);
          const span = lineMap.getSpan(r);
          if (!span) continue;

          let startXCol = 0;
          let endXCol = span.visualColumns[span.visualColumns.length - 1] || 0;

          if (r === sVisual.visualLine) {
            startXCol = sVisual.visualColumn;
          }
          if (r === eVisual.visualLine) {
            endXCol = eVisual.visualColumn;
          }

          const rx = textAreaX + (startXCol * charWidth - scrollLeft);
          const rw = Math.max(4, (endXCol - startXCol) * charWidth);
          ctx.fillRect(rx, rowY, rw, lineHeight);
        }
      }
      ctx.restore();
    }

    // 3.5 検索マッチの常時ハイライト (サクラエディタの検索マーク)
    if (searchHighlight && searchHighlight.query) {
      ctx.save();
      ctx.fillStyle = '#ffff55';
      ctx.globalAlpha = 0.55;
      for (let r = firstVisualRow; r <= lastVisualRow; r++) {
        const span = lineMap.getSpan(r);
        if (!span) continue;
        const lineText = buffer.getLine(span.logicalLine);
        const sub = lineText.substring(span.startCharIndex, span.endCharIndex);
        const matches = SearchEngine.findAllInLine(sub, {
          query: searchHighlight.query,
          isRegex: searchHighlight.isRegex,
          matchCase: searchHighlight.matchCase,
          matchWholeWord: false,
        });
        const rowY = textAreaY + (r * lineHeight - scrollTop);
        for (const m of matches) {
          const vColStart = span.visualColumns[m.startCol] || 0;
          const vColEnd = span.visualColumns[m.endCol] || (vColStart + (m.endCol - m.startCol));
          const sx = textAreaX + (vColStart * charWidth - scrollLeft);
          const sw = Math.max(4, (vColEnd - vColStart) * charWidth);
          ctx.fillRect(sx, rowY, sw, lineHeight);
        }
      }
      ctx.restore();
    }

    // 4. テキスト & 構文ハイライト & 特殊記号描画
    ctx.save();
    ctx.beginPath();
    ctx.rect(textAreaX, textAreaY, textAreaWidth, textAreaHeight);
    ctx.clip(); // テキスト領域内のみ描画

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'alphabetic';

    for (let r = firstVisualRow; r <= lastVisualRow; r++) {
      const span = lineMap.getSpan(r);
      if (!span) continue;

      const rowY = textAreaY + (r * lineHeight - scrollTop);
      const lineText = buffer.getLine(span.logicalLine);
      const subText = lineText.substring(span.startCharIndex, span.endCharIndex);
      const tokens = SyntaxHighlighter.tokenizeLine(subText, syntaxRule);

      // 各文字を描画
      let charOffsetInSpan = 0;
      for (const token of tokens) {
        let tokenColor = theme.textColor;
        switch (token.type) {
          case 'keyword': tokenColor = theme.keywordColor; break;
          case 'comment': tokenColor = theme.commentColor; break;
          case 'string': tokenColor = theme.stringColor; break;
          case 'number': tokenColor = theme.numberColor; break;
          case 'url': tokenColor = theme.urlColor || '#0000ee'; break;
        }

        const tokenStartOffset = charOffsetInSpan;
        for (let ci = token.start; ci < token.end; ci++) {
          const char = subText[ci];
          const vCol = span.visualColumns[charOffsetInSpan] || 0;
          const nextVCol = span.visualColumns[charOffsetInSpan + 1] || (vCol + 1);
          const charX = textAreaX + (vCol * charWidth - scrollLeft);

          // 全角空白記号
          if (char === '\u3000' && showSymbols.fullSpace) {
            SymbolRenderer.drawFullWidthSpace(ctx, charX, rowY, fullCharWidth, lineHeight);
          }
          // 半角空白記号
          else if (char === ' ' && showSymbols.halfSpace) {
            SymbolRenderer.drawHalfWidthSpace(ctx, charX, rowY, charWidth, lineHeight);
          }
          // タブ記号
          else if (char === '\t' && showSymbols.tab) {
            const nextX = textAreaX + (nextVCol * charWidth - scrollLeft);
            SymbolRenderer.drawTab(ctx, charX, nextX, rowY, lineHeight);
          }
          // 通常文字
          else if (char !== ' ' && char !== '\t' && char !== '\u3000') {
            ctx.fillStyle = tokenColor;
            ctx.fillText(char, charX, rowY + baseline);
          }

          charOffsetInSpan++;
        }

        // URLトークンの下線描画 (サクラエディタ標準)
        if (token.type === 'url') {
          const uStartVCol = span.visualColumns[tokenStartOffset] || 0;
          const uEndVCol = span.visualColumns[charOffsetInSpan] || (uStartVCol + (token.end - token.start));
          const ux1 = textAreaX + (uStartVCol * charWidth - scrollLeft);
          const ux2 = textAreaX + (uEndVCol * charWidth - scrollLeft);
          ctx.strokeStyle = theme.urlColor || '#0000ee';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ux1, rowY + baseline + 1.5);
          ctx.lineTo(ux2, rowY + baseline + 1.5);
          ctx.stroke();
        }
      }

      // 改行記号 (論理行の最後の表示行の場合)
      if (span.endCharIndex >= lineText.length && showSymbols.lineEnd) {
        const lastVCol = span.visualColumns[span.visualColumns.length - 1] || 0;
        const lineEndX = textAreaX + (lastVCol * charWidth - scrollLeft);
        const ending = buffer.getLineEnding(span.logicalLine);
        SymbolRenderer.drawLineEnding(ctx, ending, lineEndX, rowY, charWidth, lineHeight);
      }
    }

    // 5. [EOF] マーク描画
    if (showSymbols.eof) {
      const totalVisualRows = lineMap.getVisualLineCount();
      const eofRow = totalVisualRows;
      const eofY = textAreaY + (eofRow * lineHeight - scrollTop);
      if (eofY < height) {
        SymbolRenderer.drawEof(ctx, textAreaX - scrollLeft, eofY, fontSize, lineHeight, width);
      }
    }

    // 6. IME未確定文字列（インライン変換）の描画
    if (imeComposition && imeComposition.text) {
      const cVisual = lineMap.logicalToVisual(cursor);
      const imeX = textAreaX + (cVisual.visualColumn * charWidth - scrollLeft);
      const imeY = textAreaY + (cVisual.visualLine * lineHeight - scrollTop);

      ctx.fillStyle = '#ffffcc'; // 薄い黄色背景
      const imeWidth = imeComposition.text.length * charWidth * 1.5;
      ctx.fillRect(imeX, imeY, imeWidth, lineHeight);

      // 下線
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(imeX, imeY + lineHeight - 2);
      ctx.lineTo(imeX + imeWidth, imeY + lineHeight - 2);
      ctx.stroke();

      // 未確定テキスト
      ctx.fillStyle = '#000000';
      ctx.fillText(imeComposition.text, imeX, imeY + baseline);
    }

    // 6.5 対括弧ハイライト描画 (Bracket Matching)
    if (matchingBracket) {
      const mbVisual = lineMap.logicalToVisual(matchingBracket);
      if (mbVisual.visualLine >= firstVisualRow && mbVisual.visualLine <= lastVisualRow) {
        const mbX = textAreaX + (mbVisual.visualColumn * charWidth - scrollLeft);
        const mbY = textAreaY + (mbVisual.visualLine * lineHeight - scrollTop);
        ctx.save();
        ctx.strokeStyle = '#3399ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mbX - 0.5, mbY + 1.5, charWidth + 1, lineHeight - 3);
        ctx.restore();
      }
    }
    const curVisual = lineMap.logicalToVisual(cursor);
    const curX = textAreaX + (curVisual.visualColumn * charWidth - scrollLeft);
    const curY = textAreaY + (curVisual.visualLine * lineHeight - scrollTop);

    if (curY >= textAreaY - lineHeight && curY <= height) {
      ctx.fillStyle = theme.cursorColor;
      // 縦線キャレット（サクラエディタ標準）
      ctx.fillRect(Math.floor(curX), curY, 2, lineHeight);
    }

    ctx.restore(); // クリップ解除

    // 8. 左側 行番号エリア (Gutter) 描画
    if (windowSettings.showLineNumbers && gutterWidth > 0) {
      // サクラエディタ標準: 本文と同一のアイボリー背景（不自然な灰色の余白を完全解消）
      ctx.fillStyle = theme.gutterBackground || theme.background;
      ctx.fillRect(0, rulerHeight, gutterWidth, height - rulerHeight);

      // Gutter 右端の繊細なガイド境界線
      ctx.strokeStyle = '#e0dcd0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gutterWidth - 0.5, rulerHeight);
      ctx.lineTo(gutterWidth - 0.5, height);
      ctx.stroke();

      ctx.font = `${fontSize * 0.9}px ${fontFamily}`;
      ctx.textAlign = 'right';

      for (let r = firstVisualRow; r <= lastVisualRow; r++) {
        const span = lineMap.getSpan(r);
        if (!span) continue;

        const rowY = textAreaY + (r * lineHeight - scrollTop);

        // 未保存変更マーク (サクラエディタ特有の緑縦ライン)
        if ((windowSettings.showModifiedGutter ?? true) && buffer.isLineModified(span.logicalLine)) {
          ctx.fillStyle = theme.gutterModifiedColor;
          ctx.fillRect(gutterWidth - 3, rowY, 2, lineHeight);
        }

        // DIFF 差分マーク (+:追加, -:削除, ~:変更)
        if (!span.isWrappedLine && diffMarks && diffMarks.has(span.logicalLine)) {
          const markType = diffMarks.get(span.logicalLine);
          ctx.save();
          if (markType === 'add') {
            ctx.fillStyle = '#16a34a';
            ctx.fillRect(2, rowY + 2, 9, lineHeight - 4);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('+', 4, rowY + baseline);
          } else if (markType === 'del') {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(2, rowY + 2, 9, lineHeight - 4);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('-', 5, rowY + baseline);
          } else {
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(2, rowY + 2, 9, lineHeight - 4);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('~', 4, rowY + baseline);
          }
          ctx.restore();
        }

        // ブックマーク青丸記号 (サクラエディタ標準)
        if (!span.isWrappedLine && bookmarkManager?.isBookmarked(span.logicalLine)) {
          ctx.save();
          ctx.fillStyle = '#0066cc';
          ctx.beginPath();
          ctx.arc(6, rowY + lineHeight / 2, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 行番号 (サクラエディタ標準カラー)
        const lineNumToDisplay = windowSettings.lineNumberType === 'visual'
          ? (r + 1)
          : (span.logicalLine + 1);

        if (windowSettings.lineNumberType === 'visual' || !span.isWrappedLine) {
          ctx.fillStyle = theme.gutterTextColor;
          ctx.fillText(String(lineNumToDisplay), gutterWidth - 5, rowY + baseline);
        } else {
          ctx.fillStyle = '#a0a0a0';
          ctx.fillText('·', gutterWidth - 6, rowY + baseline);
        }
      }
      ctx.textAlign = 'left';
    }

    // 9. 上部 桁ルーラー (Ruler) 描画
    if (windowSettings.showRuler && rulerHeight > 0) {
      this.renderRuler(metrics, viewport, wrapColumn);
    }
  }

  /**
   * サクラエディタ特有の桁ルーラー描画 (青線・ドット目盛り・0..1..2..3再現)
   */
  private renderRuler(metrics: FontMetricsInfo, viewport: ViewportState, wrapColumn: number): void {
    const { ctx, theme, gutterWidth, rulerHeight } = this;
    const { width, scrollLeft } = viewport;
    const { charWidth } = metrics;

    // ルーラー背景 (本文と同一のアイボリー背景)
    ctx.fillStyle = theme.rulerBackground || theme.background;
    ctx.fillRect(0, 0, width, rulerHeight);

    // ルーラー下境界線 (サクラエディタ特有の鮮明な青ライン)
    ctx.strokeStyle = '#0000cc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, rulerHeight - 0.5);
    ctx.lineTo(width, rulerHeight - 0.5);
    ctx.stroke();

    // 桁目盛り
    ctx.save();
    ctx.beginPath();
    ctx.rect(gutterWidth, 0, width - gutterWidth, rulerHeight);
    ctx.clip();

    ctx.font = '9px "MS UI Gothic", monospace, sans-serif';
    ctx.fillStyle = theme.rulerTextColor;
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1;

    const startCol = Math.max(1, Math.floor(scrollLeft / charWidth));
    const endCol = startCol + Math.ceil((width - gutterWidth) / charWidth) + 5;

    for (let c = startCol; c <= endCol; c++) {
      const colX = gutterWidth + (c * charWidth - scrollLeft);

      if (c % 10 === 0) {
        // 10桁ごとの目盛り線と数字 (1, 2, 3, ... 9, 10, 11, 12) ※ 0桁目は表示しない
        ctx.beginPath();
        ctx.moveTo(colX - charWidth / 2 + 0.5, rulerHeight - 5);
        ctx.lineTo(colX - charWidth / 2 + 0.5, rulerHeight - 1);
        ctx.stroke();

        const numText = String(c / 10);
        ctx.fillText(numText, colX - charWidth / 2 - (numText.length > 1 ? 4 : 2), rulerHeight - 8);
      } else if (c % 2 === 0) {
        // 2文字ごとのドット目盛り (1..2..3.. の間の4つのドット)
        ctx.fillStyle = '#606060';
        ctx.fillRect(colX - charWidth / 2, rulerHeight - 5, 1.2, 1.2);
      }
    }

    // 折り返し桁の赤い下三角マーカー (▼)
    if (wrapColumn > 0) {
      const wrapX = gutterWidth + (wrapColumn * charWidth - scrollLeft);
      ctx.fillStyle = theme.rulerMarkerColor;
      ctx.beginPath();
      ctx.moveTo(wrapX - 4, 1);
      ctx.lineTo(wrapX + 4, 1);
      ctx.lineTo(wrapX, 7);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
