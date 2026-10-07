export interface VisualLineSpan {
  logicalLine: number;
  startCharIndex: number;
  endCharIndex: number;
  visualColumnStart: number;
  visualColumns: number[]; // 各文字の開始visualColumn（半角単位）
  isWrappedLine: boolean; // 2行目以降の折り返し行かどうか
}

export interface WrapConfig {
  wrapMode: 'none' | 'column' | 'window';
  wrapColumn: number; // 例: 80, 120
  tabSize: number;    // 例: 4, 8
}

/**
 * East Asian Width 計算
 * 半角=1, 全角=2
 */
export function getCharWidth(char: string, currentVisualCol: number, tabSize: number): number {
  if (char === '\t') {
    // タブ文字: 次のタブストップまでの桁数
    return tabSize - (currentVisualCol % tabSize);
  }

  const code = char.charCodeAt(0);

  // 半角カナ (U+FF61 - U+FF9F)
  if (code >= 0xff61 && code <= 0xff9f) {
    return 1;
  }

  // ASCII
  if (code >= 0x20 && code <= 0x7e) {
    return 1;
  }

  // 制御文字
  if (code < 0x20) {
    return 1;
  }

  // 全角文字 (CJK Unified Ideographs, Hiragana, Katakana, Fullwidth Forms, etc.)
  return 2;
}

export class LayoutEngine {
  private wrapConfig: WrapConfig;

  constructor(wrapConfig: WrapConfig = { wrapMode: 'column', wrapColumn: 80, tabSize: 4 }) {
    this.wrapConfig = wrapConfig;
  }

  public setConfig(config: Partial<WrapConfig>): void {
    this.wrapConfig = { ...this.wrapConfig, ...config };
  }

  public getConfig(): WrapConfig {
    return this.wrapConfig;
  }

  /**
   * 1つの論理行を折り返し計算し、表示行（VisualLineSpan）のリストを生成する
   */
  public layoutLogicalLine(logicalLineIdx: number, text: string, windowColumns: number = 80): VisualLineSpan[] {
    const { wrapMode, wrapColumn, tabSize } = this.wrapConfig;
    const maxCols = wrapMode === 'none'
      ? Infinity
      : wrapMode === 'window'
        ? Math.max(10, windowColumns)
        : Math.max(10, wrapColumn);

    if (text.length === 0) {
      return [{
        logicalLine: logicalLineIdx,
        startCharIndex: 0,
        endCharIndex: 0,
        visualColumnStart: 0,
        visualColumns: [0],
        isWrappedLine: false,
      }];
    }

    const spans: VisualLineSpan[] = [];
    let currentSpanStart = 0;
    let currentVisualCol = 0;
    let visualColsForSpan: number[] = [];
    let isWrapped = false;

    for (let charIdx = 0; charIdx < text.length; charIdx++) {
      const ch = text[charIdx];
      const w = getCharWidth(ch, currentVisualCol, tabSize);

      // 折り返し判定: 現在の桁 + 文字幅 > 最大桁数 の場合
      if (currentVisualCol + w > maxCols && visualColsForSpan.length > 0) {
        // 折り返し確定
        visualColsForSpan.push(currentVisualCol); // 終端位置
        spans.push({
          logicalLine: logicalLineIdx,
          startCharIndex: currentSpanStart,
          endCharIndex: charIdx,
          visualColumnStart: 0,
          visualColumns: visualColsForSpan,
          isWrappedLine: isWrapped,
        });

        currentSpanStart = charIdx;
        currentVisualCol = 0;
        visualColsForSpan = [];
        isWrapped = true;
      }

      visualColsForSpan.push(currentVisualCol);
      currentVisualCol += getCharWidth(ch, currentVisualCol, tabSize);
    }

    // 残りのスパン
    visualColsForSpan.push(currentVisualCol);
    spans.push({
      logicalLine: logicalLineIdx,
      startCharIndex: currentSpanStart,
      endCharIndex: text.length,
      visualColumnStart: 0,
      visualColumns: visualColsForSpan,
      isWrappedLine: isWrapped,
    });

    return spans;
  }
}
