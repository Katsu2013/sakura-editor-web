export type LineEnding = 'CRLF' | 'LF' | 'CR';

export type CharacterEncoding =
  | 'UTF-8'
  | 'UTF-8-BOM'
  | 'Shift_JIS'
  | 'EUC-JP'
  | 'ISO-2022-JP'
  | 'UTF-16LE'
  | 'UTF-16BE';

export interface Position {
  line: number; // 0-based logical line
  column: number; // 0-based logical column (character index in line)
}

export interface VisualPosition {
  visualLine: number; // 0-based display row (after wrapping)
  visualColumn: number; // 0-based visual column (half-width units: 1 for ASCII, 2 for full-width)
}

export interface SelectionRange {
  start: Position;
  end: Position;
  isBoxSelect: boolean; // Alt + Drag 矩形選択フラグ
  boxStartCol?: number; // 矩形選択開始桁
  boxEndCol?: number;   // 矩形選択終了桁
}

export interface EditOperation {
  range: SelectionRange;
  text: string;
}
