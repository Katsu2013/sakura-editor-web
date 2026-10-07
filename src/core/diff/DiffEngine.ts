export type DiffType = 'unchanged' | 'added' | 'removed' | 'modified';

export interface DiffLine {
  type: DiffType;
  lineA?: number;
  textA?: string;
  lineB?: number;
  textB?: string;
}

export class DiffEngine {
  /**
   * 2つの文字列を行単位で比較し、サクラエディタ風のDiff結果を生成
   */
  public static computeDiff(textA: string, textB: string): DiffLine[] {
    const linesA = textA.split(/\r\n|\r|\n/);
    const linesB = textB.split(/\r\n|\r|\n/);

    const matrix: number[][] = [];
    const n = linesA.length;
    const m = linesB.length;

    for (let i = 0; i <= n; i++) {
      matrix[i] = new Array(m + 1).fill(0);
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (linesA[i] === linesB[j]) {
          matrix[i + 1][j + 1] = matrix[i][j] + 1;
        } else {
          matrix[i + 1][j + 1] = Math.max(matrix[i + 1][j], matrix[i][j + 1]);
        }
      }
    }

    // バックトラック
    const diffResult: DiffLine[] = [];
    let i = n;
    let j = m;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
        diffResult.unshift({
          type: 'unchanged',
          lineA: i,
          textA: linesA[i - 1],
          lineB: j,
          textB: linesB[j - 1],
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        diffResult.unshift({
          type: 'added',
          lineB: j,
          textB: linesB[j - 1],
        });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
        diffResult.unshift({
          type: 'removed',
          lineA: i,
          textA: linesA[i - 1],
        });
        i--;
      }
    }

    return diffResult;
  }
}
