export interface FontMetricsInfo {
  fontFamily: string;
  fontSize: number;
  charWidth: number;      // 半角1文字あたりの横幅 (px)
  fullCharWidth: number;  // 全角1文字あたりの横幅 (px) = charWidth * 2
  lineHeight: number;     // 1行の高さ (px)
  baseline: number;       // ベースライン位置 (px)
}

export class FontMetrics {
  public static getMetrics(fontFamily: string = "'MS Gothic', 'BIZ UDGothic', monospace", fontSize: number = 14): FontMetricsInfo {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return {
        fontFamily,
        fontSize,
        charWidth: fontSize * 0.6,
        fullCharWidth: fontSize * 1.2,
        lineHeight: Math.round(fontSize * 1.4),
        baseline: Math.round(fontSize * 1.1),
      };
    }

    ctx.font = `${fontSize}px ${fontFamily}`;
    // 半角 'M' の幅を基準に測定
    const halfMeasure = ctx.measureText('M');
    // 全角 'あ' の幅を基準に測定
    const fullMeasure = ctx.measureText('あ');

    // ピクセル単位で綺麗にグリッドが揃うよう丸める（必要に応じてMath.roundまたはMath.floor）
    const charWidth = halfMeasure.width;
    const fullCharWidth = fullMeasure.width > charWidth * 1.8 ? fullMeasure.width : charWidth * 2;
    const lineHeight = Math.round(fontSize * 1.45);
    const baseline = Math.round(fontSize * 1.1);

    const metrics: FontMetricsInfo = {
      fontFamily,
      fontSize,
      charWidth,
      fullCharWidth,
      lineHeight,
      baseline,
    };

    return metrics;
  }
}
