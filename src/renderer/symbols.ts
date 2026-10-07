import type { LineEnding } from '../core/buffer/types';

export interface SymbolColorConfig {
  fullSpaceColor: string; // 全角空白の色 (例: #228b22 または #66aa66)
  halfSpaceColor: string; // 半角空白の色
  tabColor: string;       // タブ記号の色 (例: #1e90ff または #888888)
  lineEndColor: string;   // 改行記号の色 (例: #008080 または #4682b4)
  eofColor: string;       // EOF記号の色 (例: #cc0000 または #0000aa)
}

export const defaultSymbolColors: SymbolColorConfig = {
  fullSpaceColor: '#2e8b57', // SeaGreen
  halfSpaceColor: '#a0a0a0',
  tabColor: '#4169e1',       // RoyalBlue
  lineEndColor: '#008b8b',   // DarkCyan
  eofColor: '#00008b',       // DarkBlue
};

export class SymbolRenderer {
  /**
   * 全角空白の「四角記号 (□)」を描画
   */
  public static drawFullWidthSpace(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    fullCharWidth: number,
    lineHeight: number,
    color: string = defaultSymbolColors.fullSpaceColor
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const padX = fullCharWidth * 0.15;
    const padY = lineHeight * 0.22;
    const w = fullCharWidth - padX * 2;
    const h = lineHeight - padY * 2;

    ctx.strokeRect(Math.floor(x + padX) + 0.5, Math.floor(y + padY) + 0.5, Math.floor(w), Math.floor(h));
    ctx.restore();
  }

  /**
   * 半角空白の記号を描画 (薄い中黒または下線)
   */
  public static drawHalfWidthSpace(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    charWidth: number,
    lineHeight: number,
    color: string = defaultSymbolColors.halfSpaceColor
  ): void {
    ctx.save();
    ctx.fillStyle = color;
    // 小さな中黒
    const cx = x + charWidth / 2;
    const cy = y + lineHeight / 2;
    ctx.fillRect(Math.floor(cx) - 0.5, Math.floor(cy) - 0.5, 1.5, 1.5);
    ctx.restore();
  }

  /**
   * タブ文字記号（右矢印 ───>）を描画
   */
  public static drawTab(
    ctx: CanvasRenderingContext2D,
    startX: number,
    endX: number,
    y: number,
    lineHeight: number,
    color: string = defaultSymbolColors.tabColor
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;

    const midY = Math.floor(y + lineHeight / 2) + 0.5;
    const fromX = Math.floor(startX + 2);
    const toX = Math.floor(endX - 3);

    if (toX > fromX) {
      // 水平線
      ctx.beginPath();
      ctx.moveTo(fromX, midY);
      ctx.lineTo(toX, midY);
      ctx.stroke();

      // 矢印の先端 (>)
      const arrowSize = 3;
      ctx.beginPath();
      ctx.moveTo(toX - arrowSize, midY - arrowSize);
      ctx.lineTo(toX, midY);
      ctx.lineTo(toX - arrowSize, midY + arrowSize);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 改行コード記号（CRLF, LF, CR）を描画
   * サクラエディタ特有のアイコニックな矢印
   */
  public static drawLineEnding(
    ctx: CanvasRenderingContext2D,
    ending: LineEnding,
    x: number,
    y: number,
    charWidth: number,
    lineHeight: number,
    color: string = defaultSymbolColors.lineEndColor
  ): void {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.2;

    const topY = Math.floor(y + lineHeight * 0.25) + 0.5;
    const botY = Math.floor(y + lineHeight * 0.75) + 0.5;
    const midY = Math.floor(y + lineHeight * 0.5) + 0.5;
    const startX = Math.floor(x + charWidth * 0.8) + 0.5;
    const endX = Math.floor(x + charWidth * 0.15) + 0.5;

    ctx.beginPath();

    if (ending === 'CRLF') {
      // 下に降りて左へ曲がる矢印 (↵)
      ctx.moveTo(startX, topY);
      ctx.lineTo(startX, botY);
      ctx.lineTo(endX, botY);
      ctx.stroke();

      // 先端
      ctx.beginPath();
      ctx.moveTo(endX + 3, botY - 3);
      ctx.lineTo(endX, botY);
      ctx.lineTo(endX + 3, botY + 3);
      ctx.stroke();
    } else if (ending === 'LF') {
      // 真下向き矢印 (↓)
      const midX = Math.floor(x + charWidth * 0.5) + 0.5;
      ctx.moveTo(midX, topY);
      ctx.lineTo(midX, botY);
      ctx.stroke();

      // 先端
      ctx.beginPath();
      ctx.moveTo(midX - 3, botY - 3);
      ctx.lineTo(midX, botY);
      ctx.lineTo(midX + 3, botY - 3);
      ctx.stroke();
    } else {
      // CR: 左向き矢印 (←)
      ctx.moveTo(startX, midY);
      ctx.lineTo(endX, midY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(endX + 3, midY - 3);
      ctx.lineTo(endX, midY);
      ctx.lineTo(endX + 3, midY + 3);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * [EOF] 記号を描画 (サクラエディタ特有のティール背景ボックスと右端まで伸びる青実線)
   */
  public static drawEof(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    fontSize: number,
    lineHeight: number,
    totalWidth?: number
  ): void {
    ctx.save();
    const text = '[EOF]';
    ctx.font = `bold ${Math.max(10, Math.floor(fontSize * 0.82))}px 'MS Gothic', 'MS UI Gothic', monospace, sans-serif`;
    const textWidth = ctx.measureText(text).width + 6;

    // 1. ティール/シアン背景ボックス (サクラエディタ標準)
    ctx.fillStyle = '#008080';
    ctx.fillRect(Math.floor(x), Math.floor(y + 2), textWidth, lineHeight - 4);

    // 2. 白文字
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, Math.floor(x + 3), Math.floor(y + lineHeight * 0.72));

    // 3. サクラエディタ特有のウィンドウ右端まで伸びるEOF青実線
    if (totalWidth && totalWidth > x) {
      ctx.strokeStyle = '#0000cc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, Math.floor(y + lineHeight) - 0.5);
      ctx.lineTo(totalWidth, Math.floor(y + lineHeight) - 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }
}
