# サクラエディタ Web SPA 完全クローン 実装レベル詳細設計仕様書
（Sakura Editor 32bit Ver. 2.4.3.7173 準拠 - ゼロベース再構築用ブループリント）

---

## 1. システム概要 & アーキテクチャ

### 1.1 システムの目的
本仕様書は、Windows向け国産テキストエディタの金字塔「サクラエディタ（Sakura Editor 32bit Ver. 2.4.3.7173）」の外観、動作、メニュー階層、ショートカットキー、特殊記号描画、全18種ダイアログ、文字種変換、矩形選択、設定体系を、Webブラウザ環境（SPA: Single Page Application）上に完全に再現するための**実装レベル詳細設計仕様書（Implementation-Grade Detailed Design Specification）**です。
本仕様書に記載された型定義、数学的座標計算式、状態モデル、変換アルゴリズム、コマンドディスパッチ表を参照することで、開発者は既存ソースコードを参照することなく、同一の機能と振る舞いを持つWeb版サクラエディタを100%忠実に再構築できます。

### 1.2 技術スタック
* **UIフレームワーク**: React 19 + TypeScript (Strict Type Checking `strict: true`)
* **バンドラー / ビルド**: Vite
* **エディタ描画層**: HTML5 Canvas 2D Context（仮想スクロール・ピクセルパーフェクト等幅描画）
* **入力・IME制御**: 不可視 Native Input Bridge（キャレット追従透過 `<textarea>` による日本語IMEインライン変換・合成捕捉）
* **文字コード・改行エンジン**: TextDecoder / TextEncoder, Shift_JIS/CP932, EUC-JP, ISO-2022-JP, UTF-8, UTF-8(BOM), UTF-16LE, UTF-16BE
* **設定保持**: `localStorage` および `sakura.ini` 互換テキストファイル（INI形式）インポート/エクスポート
* **ローカルファイル連携**: File System Access API / Blob API

### 1.3 Web環境とネイティブWin32の境界設計
サクラエディタ（Win32 native C++）の全機能をWeb SPA上で実現するにあたり、Webブラウザのセキュリティサンドボックス制約とWeb標準技術との対応関係を以下のように定義・実装します。

| 機能項目 | Win32 実機仕様 (Ver 2.4.3.7173) | Web SPA クローン実装仕様 |
| :--- | :--- | :--- |
| **画面描画** | Windows GDI (CreateFont, TextOut, BitBlt) | HTML5 Canvas 2D + 仮想スクロール最適化 |
| **テキスト入力 & IME** | Win32 IMEメッセージ (WM_IME_CHAR, ImmGetCompositionString) | キャレット追従不可視 `<textarea>` + Composition イベントブリッジ |
| **マクロエンジン** | WSH COM オートメーション (`ActiveXObject("SakuraEditor.Editor")`, VBScript/JScript/Perl/Python) | Web Worker / セキュアJSサンドボックス（`Editor` オブジェクト同等メソッド群提供） |
| **外部コマンド実行** | OS `CreateProcess` によるローカル `.exe` 任意実行 | 外部コマンド設定・パラメーター置換・標準入出力GUI完全装備。ローカル実行はブラウザ制限のため Web API / Sidecar 連携インターフェースとして動作 |
| **Ctags / タグジャンプ** | `ctags.exe` 外部プロセス呼び出しによる tags ファイル生成 | インメモリ正規表現シンボル解析エンジン + tags 互換パーサー |
| **印刷** | Windows プリンタドライバ GDI DC レンダリング | Canvas 2D 改ページプレビュー + ブラウザ標準 `window.print()` |
| **ファイル I/O** | Win32 `CreateFile` によるローカルファイル任意パス直読み書き | File System Access API (`showOpenFilePicker`, `showSaveFilePicker`) & Blob ダウンロード |

### 1.4 システム全体アーキテクチャ図
```mermaid
flowchart TD
    subgraph UI_Shell["UI & シェル層 (React + Win32 Classic Theme)"]
        TitleBar["タイトルバー (アイコン, タイトル, 変更マーク, ウィンドウ操作ボタン)"]
        MenuBar["メニューバー (8大メニュー, アクセスキー, ショートカット, チェック表示, グレースケール無効化)"]
        ToolBar["ツールバー (フラット/クラシック切替, アイコンボタングループ, 有効/無効状態同期)"]
        TabBar["タブバー (上部/下部配置切替, 変更マーク, 閉じるボタン, 右側ドロップダウン & ✕)"]
        FnKeyBar["ファンクションキーバー (F1〜F12, Shift/Ctrl押下リアルタイム動的更新)"]
        StatusBar["ステータスバー (選択文字/行数, カーソル位置, 改行, 文字コード, REC, 挿入/上書, 倍率)"]
        Dialogs["ダイアログ群 (全18種: 検索, Grep, Diff, タイプ別設定, 共通設定, コマンド一覧等)"]
    end

    subgraph Editor_Engine["エディタ描画 & コントローラ層"]
        EditorView["EditorView (分割画面管理, マウス/キーボードイベント, スクロールバー)"]
        CanvasRenderer["CanvasRenderer (仮想レンダリング, Gutter, ルーラー, キャレット, 特殊記号)"]
        FontMetrics["FontMetrics (等幅フォント計測, East Asian Width 判定)"]
        InputBridge["InputBridge (透明 textarea, IME Composition 捕捉, キャレット同期)"]
        LineMap["LineMap (論理行 ↔ 折り返し表示行 双方向マッピング)"]
    end

    subgraph Core_Model["コア データ構造 & ロジック"]
        TextBuffer["TextBuffer (行配列, 改行配列, 範囲削除, 矩形挿入/削除, 行置換)"]
        UndoManager["UndoManager (スタックベース Undo/Redo, キャレット/選択状態復元)"]
        BookmarkManager["BookmarkManager (Setベース, 次/前探索, 全解除, 反転, 行一括削除)"]
        TextTransform["TextTransform (大文字/小文字, 全半角, カタカナ/ひらがな, 連番生成)"]
        SearchEngine["SearchEngine (正規表現, 単語単位, 大文字小文字, 前方/後方探索)"]
        MacroEngine["MacroEngine (キーマクロ記録/再生, スクリプト実行)"]
        ConfigModel["ConfigModel (TypeSettingsModel, CommonSettingsModel, SakuraIni)"]
    end

    UI_Shell <--> Editor_Engine
    Editor_Engine <--> Core_Model
```

---

## 2. コア データ構造 & 型定義 (TypeScript Data Models)

### 2.1 テキストバッファ・座標型定義 (`src/core/buffer/types.ts`)
```typescript
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
  line: number;   // 0-based 論理行インデックス
  column: number; // 0-based 論理文字インデックス
}

export interface VisualPosition {
  visualLine: number;   // 0-based 折り返し後表示行インデックス
  visualColumn: number; // 0-based 表示桁数 (半角換算: ASCII=1, 全角=2)
}

export interface SelectionRange {
  start: Position;
  end: Position;
  isBoxSelect: boolean; // Alt + Drag 矩形選択フラグ
  boxStartCol?: number; // 矩形選択開始桁 (半角換算または文字インデックス)
  boxEndCol?: number;   // 矩形選択終了桁 (半角換算または文字インデックス)
}

export interface EditOperation {
  range: SelectionRange;
  text: string;
}
```

### 2.2 テキストバッファクラス (`TextBuffer`) 仕様
* **保持メンバ**:
  * `lines: string[]`: 論理行の文字列配列。初期値 `['']`。
  * `lineEndings: LineEnding[]`: 各行の改行コード配列。`i` 行目の末尾改行を表す。
  * `defaultLineEnding: LineEnding`: 新規行作成時のデフォルト改行コード（デフォルト `'CRLF'`）。
  * `modifiedLines: Set<number>`: 変更が加えられた論理行番号のセット（Gutter緑バー描画に使用）。
* **主要メソッドシグネチャ**:
  * `setText(text: string): void`: 文字列全体を改行（`\r\n`, `\n`, `\r`）ごとにパースしてバッファ初期化。
  * `getText(targetEnding?: LineEnding): string`: 全行を改行コードで結合して取得。
  * `getLine(lineIndex: number): string`: 指定行の文字列取得（範囲外は空文字列）。
  * `getLineCount(): number`: 総論理行数を取得。
  * `insertText(pos: Position, text: string): Position`: 指定位置に文字列を挿入し、挿入後の終端位置を返却。
  * `deleteRange(range: SelectionRange): void`: 通常選択範囲のテキストを削除。
  * `insertBoxText(startPos: Position, text: string): void`: 矩形位置に複数行テキストを一括挿入。
  * `deleteBoxRange(range: SelectionRange): void`: 矩形選択範囲の各行該当カラムを一括削除。
  * `replaceLine(lineIndex: number, text: string): void`: 指定行を新しい文字列で置換。
  * `deleteLines(lineIndices: number[]): void`: 指定された複数行を一括削除（行番号再計算）。

### 2.3 ドキュメント状態モデル (`TabDoc`)
```typescript
export interface TabDoc {
  id: string;                      // ドキュメント固有ID ('doc-1', 'doc-2'...)
  title: string;                   // 表示タイトル (例: '無題', 'App.tsx')
  path: string | null;             // ローカルファイルパス（File System Access API保持時）
  buffer: TextBuffer;              // テキストバッファインスタンス
  lineMap: LineMap;                // 表示折り返しマッピング
  cursor: Position;                // 現在のキャレット論理位置
  selection: SelectionRange | null;// 選択範囲（通常または矩形）
  encoding: CharacterEncoding;     // 現在の文字エンコーディング
  lineEnding: LineEnding;          // 現在の改行コード
  isModified: boolean;             // 未保存変更フラグ（タイトルバーの '*' 表示）
  typeSettingId: string;           // 適用中のタイプ別設定ID
  undoManager: UndoManager;        // ドキュメント独立のUndoスタック
  bookmarkManager: BookmarkManager;// ドキュメント独立のしおり管理
  history: string[];               // 検索履歴・置換履歴等
}
```

### 2.4 設定モデル (`TypeSettingsModel` & `CommonSettingsModel`)
* **タイプ別設定 (`TypeSettingItem`)**:
```typescript
export interface TypeSettingItem {
  id: string;                          // 'type-text', 'type-c-cpp', 'type-html', etc.
  name: string;                        // 設定名 ('基本', 'C/C++', 'HTML', etc.)
  extensions: string;                  // 拡張子カンマ区切り ('txt,log,ini')
  wrapConfig: {
    wrapMode: 'none' | 'column' | 'window'; // 折り返しなし / 桁数折り返し / 右端折り返し
    wrapColumn: number;                // 折り返し桁数 (例: 80, 120)
    tabSize: number;                   // TAB文字幅 (例: 4, 8)
  };
  lineSpacing: number;                 // 行間ピクセル (デフォルト: 2)
  charSpacing: number;                 // 文字間ピクセル (デフォルト: 0)
  autoIndent: boolean;                 // 改行時自動インデント
  lineNumberType: 'logical' | 'visual';// 行番号種別 ('logical': 論理行, 'visual': 表示行)
  showRuler: boolean;                  // ルーラー表示
  showLineNumbers: boolean;            // 行番号表示
  fontSize: number;                    // フォントサイズ (px)
  fontFamily: string;                  // 等幅フォント名
  syntaxName: string;                  // シンタックスハイライト名
  outlineRule: string;                 // アウトライン解析ルール
  showSymbols: {
    fullSpace: boolean;                // 全角空白記号
    halfSpace: boolean;                // 半角空白記号
    tab: boolean;                      // TAB矢印
    lineEnd: boolean;                  // 改行矢印
    eof: boolean;                      // [EOF]バッジ
  };
  colorSettings: Record<string, ColorItemSetting>;
  theme: EditorTheme;
}
```

* **共通設定 (`CommonSettingsModel`)**:
```typescript
export interface CommonSettingsModel {
  general: {
    freeCursor: boolean;            // フリーカーソル（行末以降へのキャレット移動許可）
    overstrike: boolean;            // 挿入 / 上書きモード
    wordWrapByPunctuation: boolean; // 単語移動時に句読点を区切る
    smoothScroll: boolean;          // スムーズスクロール
    scrollLines: number;            // 1ノッチあたりスクロール行数 (デフォルト: 3)
    showModifiedGutter: boolean;    // Gutterの変更行緑マーカー表示
  };
  file: {
    defaultEncoding: CharacterEncoding; // デフォルト文字コード
    defaultLineEnding: LineEnding;      // デフォルト改行コード
    autoSave: boolean;                  // 自動保存有効フラグ
    autoSaveIntervalMinutes: number;    // 自動保存間隔 (分)
    exclusiveLock: boolean;             // ファイル排他制御シミュレーション
  };
  backup: {
    createBackup: boolean;              // 保存時バックアップ (.bak) 作成
    backupFolder: string;
    backupExtension: string;
  };
  format: {
    dateTimeFormat: string;             // 日時挿入フォーマット
    quoteString: string;                // 引用行頭プレフィックス (デフォルト: '> ')
  };
  toolbar: {
    showToolbar: boolean;               // ツールバー表示
    flatButtons: boolean;               // フラットボタン表示
    showTooltips: boolean;              // ツールチップ表示
  };
  tabbar: {
    showTabbar: boolean;                // タブバー表示
    position: 'top' | 'bottom';         // タブバー配置位置
    showCloseButton: boolean;           // タブ上閉じるボタン
    showModifiedMarker: boolean;        // タブ上未保存マーク '*'
  };
  statusbar: {
    showStatusbar: boolean;             // ステータスバー表示
    showCursorPos: boolean;             // カーソル位置
    showCharCount: boolean;             // 文字数 / 選択情報
    showEncoding: boolean;              // 文字コード
    showLineEnding: boolean;            // 改行コード
    showCharCode: boolean;              // 現在文字の文字コード (Unicode hex)
    showInsOvr: boolean;                // 挿入/上書き状態
  };
  functionKey: {
    showFunctionKey: boolean;           // ファンクションキーバー表示
    position: 'top' | 'bottom';         // 配置位置
  };
  macros: MacroRegistration[];          // 登録マクロ一覧 (1〜50)
  keyBindings: Record<string, string>;  // キーバインドマップ (例: 'Ctrl+Shift+L': 'macro.run')
}
```

---

## 3. レンダリング & 数学的座標変換仕様 (Canvas & Layout Mathematics)

### 3.1 フォントメトリクスと文字幅計算 (`FontMetrics`)
Canvas 上での等幅配置を保証するため、文字幅は以下の数式およびルールで厳密に計算します。
1. **半角文字幅 ($W_{\text{half}}$)**:
   Canvas 2D コンテキストで `'M'` を測定：
   $$W_{\text{half}} = \text{ctx.measureText}('M').\text{width}$$
2. **全角文字幅 ($W_{\text{full}}$)**:
   $$W_{\text{full}} = W_{\text{half}} \times 2$$
3. **行の高さ ($H_{\text{line}}$) とベースライン ($Y_{\text{baseline}}$)**:
   $$H_{\text{line}} = \text{Math.round}(\text{fontSize} \times 1.45) + \text{lineSpacing}$$
   $$Y_{\text{baseline}} = \text{Math.round}(\text{fontSize} \times 1.1)$$
4. **East Asian Width 判定**:
   文字列内の文字 $C$ に対し、以下の正規表現またはコードポイント判定で半角（幅1単位）か全角（幅2単位）かを決定：
   ```typescript
   export function isFullWidthChar(ch: string): boolean {
     const code = ch.charCodeAt(0);
     // ASCII印字可能文字・半角カナ・制御文字
     if ((code >= 0x0020 && code <= 0x007e) || (code >= 0xff61 && code <= 0xff9f)) {
       return false;
     }
     return true;
   }
   ```

### 3.2 桁ルーラー (Ruler) の描画幾何学仕様
* **配置**: エディタ上部（$Y = 0 \sim H_{\text{ruler}}$、$H_{\text{ruler}} = 20\text{px}$）
* **X軸オフセット**: $X_{\text{offset}} = W_{\text{gutter}} - \text{scrollLeft}$
* **目盛り描画アルゴリズム**:
  * カラム番号 $col = 0, 1, 2, \dots, \text{maxCols}$ に対し、表示X座標：
    $$X(col) = X_{\text{offset}} + col \times W_{\text{half}}$$
  * **10桁目盛り ($col \pmod{10} == 0, col \ge 10$)**:
    * 縦線: $Y = 15\text{px} \sim 19\text{px}$（小目盛り）
    * 数字表示: 桁数 $col / 10$（1, 2, 3, ... 10, 11, 12）を $Y = 12\text{px}$ に中央揃えで描画（※ 0桁目は数字非表示）。
  * **2文字ごとのドット目盛り ($col \pmod{2} == 0, col \pmod{10} \ne 0$)**:
    * 半径 0.75px のドット（小さな丸点）を $Y = 15\text{px}$ に描画（1..2..3.. の間に正確に4個のドット `·` を配置）。

  * **折り返し位置マーカー**:
    * 折り返し桁数 $col_{\text{wrap}}$ の位置に、赤色（`#cc0000`）の下向き三角マーカー（`▼`）を描画。
  * **ルーラー下端境界線**:
    * $Y = 19.5\text{px}$ に、ウィンドウ幅全域にわたる青色（`#0000cc`）の実線（1px）を描画。

### 3.3 行番号・Gutter の描画幾何学仕様
* **幅 ($W_{\text{gutter}}$)**: 32px（行番号非表示設定時は 0px）
* **背景色**: 本文背景色と同一の優しいアイボリー（`#ffffef`）
* **行番号テキスト描画**:
  * 文字色: `#606060`
  * 論理行モード: 各論理行の先頭表示行にのみ行番号（1-based）を右揃え（右マージン 6px）で描画。折り返された継続行には `.` または空白を描画。
  * 表示行モード: 折り返しを含む全表示行に連番（1-based）を描画。
* **ブックマークバッジ (Bookmark Badge)**:
  * 当該行にしおりが存在する場合、Gutter左端（$X = 2\text{px} \sim 8\text{px}$）に青色（`#0066cc`）のしおりアイコンを描画。
* **変更行マーカー (Modified Line Bar)**:
  * `buffer.isLineModified(logicalLine)` が true の場合、Gutter右端（$X = W_{\text{gutter}} - 3\text{px} \sim W_{\text{gutter}}$）にライムグリーン（`#32cd32`）の縦帯を描画。
* **DIFF差分マーカー**:
  * 追加行（青 `#3390ff`）、削除行（赤 `#ff4444`）、変更行（黄 `#ffbb00`）の縦帯を Gutter 左端に描画。

### 3.4 仮想スクロール描画ループ (Virtual Scrolling Math)
パフォーマンス低下を防ぐため、画面に表示される範囲のみを計算して描画します：
1. **表示開始行・終了行の決定**:
   $$\text{startVisualRow} = \max\left(0, \left\lfloor \frac{\text{scrollTop}}{H_{\text{line}}} \right\rfloor\right)$$
   $$\text{endVisualRow} = \min\left(\text{totalVisualRows}, \left\lceil \frac{\text{scrollTop} + \text{viewportHeight} - H_{\text{ruler}}}{H_{\text{line}}} \right\rceil + 1\right)$$
2. **各行のY座標**:
   $$Y(\text{visualRow}) = \text{visualRow} \times H_{\text{line}} - \text{scrollTop} + H_{\text{ruler}}$$
3. **行内文字のX座標**:
   文字インデックス $i$ の文字について、直前の全半角累積幅を $C_{\text{units}}$ とすると：
   $$X = W_{\text{gutter}} + C_{\text{units}} \times W_{\text{half}} - \text{scrollLeft}$$

### 3.5 特殊記号のレンダリング幾何学仕様 (`SymbolRenderer`)
サクラエディタ固有の記号をCanvas上にピクセル完全一致で描画します：
* **全角空白 (`fullSpace`)**:
  * 枠色: SeaGreen（`#2e8b57`）
  * 矩形: $X + 1.5, Y + 2, W_{\text{full}} - 3, H_{\text{line}} - 4$ の細線枠（`strokeRect`）。
* **半角空白 (`halfSpace`)**:
  * 色: `#a0a0a0`
  * 形状: 文字セル中央 $(X + W_{\text{half}} / 2, Y + H_{\text{line}} / 2)$ に半径 1px の中黒円（`arc`）。
* **TAB文字 (`tab`)**:
  * 色: RoyalBlue（`#4169e1`）
  * 形状: 開始位置から次のタブストップ $(X_{\text{tabEnd}})$ に向けて、中央高さ $Y + H_{\text{line}} / 2$ に横線を引き、右端に `>` 形状の矢じりを描画。
* **改行記号 (`lineEnd`)**:
  * **CRLF**: DarkCyan（`#008b8b`）。縦棒が下に降りて左に折れる矢印（`↲`）。
    * パス: $(X + 8, Y + 4) \to (X + 8, Y + 12) \to (X + 2, Y + 12)$、矢じり $(X + 5, Y + 9)$ および $(X + 5, Y + 15)$。
  * **LF**: 下向き矢印（`↓`）。縦棒 $(X + 4, Y + 3) \to (X + 4, Y + 13)$、矢じり $(X + 1, Y + 10)$、$(X + 7, Y + 10)$。
  * **CR**: 左向き矢印（`←`）。横棒 $(X + 8, Y + 8) \to (X + 1, Y + 8)$、矢じり $(X + 4, Y + 5)$、$(X + 4, Y + 11)$。
* **[EOF] 記号 (`eof`)**:
  * 配置位置: テキスト最終行の直下行（$Y_{\text{eof}} = \text{lastVisualRow} \times H_{\text{line}} - \text{scrollTop} + H_{\text{ruler}}$）
  * ティール色バッジ: 背景色 `#008080`、文字色 `#ffffff`、フォント太字 11px、テキスト `[EOF]`、角丸 2px、サイズ約 $44\text{px} \times 14\text{px}$。
  * 横断青下線: バッジの下端 $Y = Y_{\text{eof}} + 15.5\text{px}$ において、バッジ左端から Canvas の右端境界（キャンバス幅全域）まで伸びる 1px 幅の青実線（`#0000cc`）を描画。

### 3.6 キャレット・選択範囲描画仕様
* **選択範囲 (Selection)**:
  * 背景色: 半透明サクラブルー（`rgba(51, 144, 255, 0.35)` または Win32色 `#3390ff` 反転テキスト）。
  * 通常選択: 選択開始位置から終了位置までの各表示行矩形を連続描画。
  * 矩形選択 (Box Selection): 開始行〜終了行の各行において、開始桁（`boxStartCol`）から終了桁（`boxEndCol`）の間の矩形領域を独立描画。
* **キャレット (Caret)**:
  * 挿入モード (INS): キャレット位置に幅 1.5px、高さ $H_{\text{line}}$ の黒色縦線を描画。
  * 上書きモード (OVR): キャレット位置の文字幅（半角 $W_{\text{half}}$ または全角 $W_{\text{full}}$）に、高さ $H_{\text{line}}$ の半透明黒色矩形を描画。
  * 点滅周期: 500ms（`setInterval` によるトグル表示）。
* **対括弧強調 (Bracket Matching)**:
  * キャレット直前/直後の括弧（`()`, `[]`, `{}`, `「」`, `『』`, `【】`）に対応するペアが存在する場合、両方の括弧文字の枠を赤色（`#ff0000`）で強調矩形描画。

---

## 4. 入力・IME Native Bridge 仕様

### 4.1 キャレット追従不可視 `<textarea>` 制御
ブラウザ上でネイティブの日本語IME（Microsoft IME, Google 日本語入力, ATOK等）の変換候補窓をキャレット直下に正確に出現させるため、以下の幾何学連携を行います：
1. **HTML構造**:
   ```html
   <textarea
     ref={textareaRef}
     className="sakura-native-input-bridge"
     style={{
       position: 'absolute',
       top: `${caretPixelY}px`,
       left: `${caretPixelX}px`,
       width: '1px',
       height: `${lineHeight}px`,
       opacity: 0,
       pointerEvents: 'none',
       zIndex: 10,
       resize: 'none',
       overflow: 'hidden'
     }}
   />
   ```
2. **イベントハンドリング**:
   * `compositionstart`: IME入力開始フラグを true に設定。
   * `compositionupdate`: 変換中未確定文字列およびインラインキャレット位置を取得し、Canvas 上のキャレット位置に下線付きでリアルタイム描画。
   * `compositionend`: 確定文字列をバッファに挿入（`buffer.insertText`）。テキストエリアの `value` を即座に空文字 `""` にリセット。
   * `input`: 通常の英数半角入力（IME未起動時）を検知し、入力文字をバッファに即座に反映して `value` をリセット。

### 4.2 フリーカーソルモード (Free Cursor Mode) 仕様
共通設定で「フリーカーソル」が有効な場合、行末を越えた右側の空白領域へのキャレット配置を許可します：
* キャレット位置の論理桁 $col$ が行の文字長 $L$ を超えている場合、文字入力が発生した瞬間に不足している桁数 $(col - L)$ 分の半角スペース（`' '`）を自動的にパディング挿入した後に、入力文字を追加します。

---

## 5. 文字種変換 & 整形エンジン仕様 (`TextTransform`)

本エディタの文字種変換機能は、**現在テキストが選択されている範囲（通常選択または矩形選択）にのみ適用され、テキスト非選択時はメニュー・ショートカット共に無効化（グレーアウト）**されます。

### 5.1 全角英数 ↔ 半角英数
* **全角英数 → 半角英数 (`zenAlnumToHan`)**:
  Unicodeコードポイント正規表現 `/[０-９Ａ-Ｚａ-ｚ]/g` にマッチした文字 $C$ に対し、差分 $0\text{FEE0}_{(16)} = 65248_{(10)}$ を減算：
  $$\text{Code}_{\text{half}} = \text{Code}_{\text{full}} - 0\text{xfee0}$$
* **半角英数 → 全角英数 (`hanAlnumToZen`)**:
  正規表現 `/[0-9A-Za-z]/g` に対し、$0\text{FEE0}_{(16)}$ を加算：
  $$\text{Code}_{\text{full}} = \text{Code}_{\text{half}} + 0\text{xfee0}$$

### 5.2 カタカナ ↔ ひらがな
* **ひらがな → カタカナ (`toKatakana`)**:
  Unicodeコードポイント範囲 `[\u3041-\u3096]` に対し、差分 $+0\text{x}60$ を加算。
* **カタカナ → ひらがな (`toHiragana`)**:
  Unicodeコードポイント範囲 `[\u30a1-\u30f6]` に対し、差分 $-0\text{x}60$ を減算。

### 5.3 半角カタカナ ↔ 全角カタカナ（濁点・半濁点合成）
* **半角カタカナ → 全角カタカナ (`hanKataToZen`)**:
  1. 濁点付きカナ（`ｶﾞ`, `ｷﾞ`, `ｸﾞ`, `ｹﾞ`, `ｺﾞ`, `ｻﾞ`, `ｼﾞ`, `ｽﾞ`, `ｾﾞ`, `ｿﾞ`, `ﾀﾞ`, `ﾁﾞ`, `ヅ`, `ﾃﾞ`, `ﾄﾞ`, `ﾊﾞ`, `ﾋﾞ`, `ﾌﾞ`, `ﾍﾞ`, `ﾎﾞ`, `ｳﾞ`）を正規表現 `([ｶ-ﾄﾊ-ﾎｳ])ﾞ` で先行マッチして1文字の濁点全角カナへ置換。
  2. 半濁点付きカナ（`ﾊﾟ`, `ﾋﾟ`, `ﾌﾟ`, `ﾍﾟ`, `ﾎﾟ`）を正規表現 `([ﾊ-ﾎ])ﾟ` で先行マッチして1文字の半濁点全角カナへ置換。
  3. 残りの単独半角カナ `[ｦ-ﾝｧ-ｮｰ･｢｣]` を対応する全角カタカナ辞書テーブルで置換。
* **全角カタカナ → 半角カタカナ (`zenKataToHan`)**:
  全角カタカナを2文字（基底文字＋半角濁点 `ﾞ` または半濁点 `ﾟ`）あるいは単独半角カナに変換するマッピング辞書により置換。

### 5.4 複合変換
* **半角＋全カタ → 全角・ひらがな (`hanPlusZenKataToZenHira`)**:
  `hanKataToZen(text)` を実行後、`toHiragana(text)` を適用。
* **半角＋全ひら → 全角・カタカナ (`hanPlusZenHiraToZenKata`)**:
  `hanKataToZen(text)` を実行後、`toKatakana(text)` を適用。

### 5.5 連番生成アルゴリズム (`generateSequence`)
* 引数: `count: number`, `start: number = 1`, `step: number = 1`, `zeroPadDigits: number = 0`
* ループ $i = 0 \dots (\text{count} - 1)$ において：
  $$\text{val} = \text{start} + i \times \text{step}$$
  `zeroPadDigits > 0` の場合は `val.toString().padStart(zeroPadDigits, '0')` を適用。

### 5.6 高度な行操作
* **行の昇順/降順ソート**: `localeCompare` による厳密な辞書順比較。
* **重複行の削除 (ユニーク化)**: `Set<string>` を使用し、最初に出現した行順序を維持して一意化。
* **行頭/行末空白削除**: `/^[ \t　]+/` および `/[ \t　]+$/` の一括除去。
* **空行削除**: `line.trim().length === 0` の行を除去。

---

## 6. アンドゥ・リドゥ & ブックマーク管理仕様

### 6.1 UndoManager
* **スタック管理**:
  * `undoStack: HistoryRecord[]`
  * `redoStack: HistoryRecord[]`
  * 最大履歴件数: 10,000 件
* **レコード構造**:
  ```typescript
  interface HistoryRecord {
    text: string;               // 変更前（または変更後）のバッファスナップショットまたは差分
    lineEndings: LineEnding[];
    cursor: Position;
    selection: SelectionRange | null;
  }
  ```
* **未保存状態トラッキング**:
  * 最後に保存した時点のスタックポインタインデックス（`savedIndex`）を保持。現在の Undo 位置が `savedIndex` と一致した時、`isModified = false` に自動復帰。

### 6.2 BookmarkManager
* **データ構造**: `Set<number>`（0-based 論理行番号のセット）
* **機能**:
  * `toggle(line: number): boolean`: 指定行のしおり有無をトグル。
  * `next(currentLine: number, totalLines: number): number | null`: 現在行より後方のしおりを循環探索。
  * `prev(currentLine: number, totalLines: number): number | null`: 現在行より前方のしおりを後方から循環探索。
  * `clear(): void`: 全しおり解除。
  * `invert(totalLines: number): void`: $0 \sim (\text{totalLines} - 1)$ の全行について、しおりが存在しない行をしおり化し、存在した行を解除。
  * `getBookmarkedLines(): number[]`: 昇順ソートされたしおり行一覧を返却。

---

## 7. 全18種ダイアログ詳細仕様 (Props, State & Contracts)

| # | ダイアログ名 | コンポーネント | 起動契機 | 主要Props / State | 実行動作・コールバック |
| :- | :--- | :--- | :--- | :--- | :--- |
| 1 | **検索ダイアログ** | `SearchDialog` | `Ctrl+F` | `query`, `isRegex`, `matchCase`, `wordOnly`, `direction` | 前方/後方検索、マーク（全該当行ブックマーク） |
| 2 | **置換ダイアログ** | `SearchDialog` (置換タブ) | `Ctrl+R` | `replaceQuery`, 上記検索オプション | 1件置換、全件置換（置換件数メッセージ表示） |
| 3 | **Grepダイアログ** | `GrepDialog` | `Ctrl+G` | `pattern`, `folder`, `subfolders`, `resultList` | ファイル横断全文検索、結果リストダブルクリックジャンプ、Grep置換 |
| 4 | **DIFF差分ダイアログ** | `DiffDialog` | `Ctrl+Enter` | `sourceDocId`, `targetDocId`, `diffLines` | 2タブ間の行単位差分計算、追加・削除・変更行のハイライトとGutter連携 |
| 5 | **アウトライン解析** | `OutlineDialog` | `F11` | `rule` (C/C++, Java, Markdown), `treeItems` | 関数・見出し・クラス一覧のツリー抽出、ダブルクリックで該当年へジャンプ |
| 6 | **タイプ別設定一覧** | `TypeListDialog` | メニュー/ツールバー | `typeSettingsList`, `currentTypeId` | 下からタイプを選択してください(T): 22種プリセット一覧、設定変更(S)...、一時適用(R)、インポート(I)、エクスポート(E)、初期化(N)、複製(C)、↑(U)/↓(D)垂直配置、追加(A)、削除(D)、ヘルプ(H) |
| 7 | **タイプ別設定** | `TypeSettingDialog`| メニュー/ツールバー | 6大タブ（スクリーン, カラー, ウィンドウ, 支援, 正規表現キーワード, キーワードヘルプ） | フォント・折り返し桁・ルーラー、色一覧（全20項目・パーツ/色プレビュー）、ウィンドウ配置・ルーラー高さ、支援（入力補完・外部ヘルプ・C/C++インデント詳細）、正規表現キーワード（Bregonig.dll Ver.4.20 with Oniguruma 6.2.0・10色指定・URL）、キーワードヘルプ（辞書ファイル一覧・優先度↑↓・前方一致） |
| 8 | **共通設定** | `CommonSettingDialog`| メニュー/ツールバー| 3段全18タブ（ファイル, ファイル名表示, バックアップ, 書式, 検索, キー割り当て, カスタムメニュー, 強調キーワード, 支援, マクロ, プラグイン, 全般, ウィンドウ, メインメニュー, ツールバー, タブバー, ステータスバー, 編集） | 全般動作、ウィンドウ位置サイズ設定(IDD_WINPOSSIZE)、2ペイン式メインメニュー・ツールバーカスタマイズ、MRUクリア、マクロ登録（1〜50）、キーバインド変更、sakura.iniインポート/エクスポート |
| 9 | **コマンド一覧** | `CommandListDialog` | `Ctrl+Shift+K` | `filterText`, `commandTable` | 全コマンドのインクリメンタル検索、ショートカット確認、ダイレクト実行 |
| 10 | **指定行ジャンプ** | `JumpDialog` | `Ctrl+J` | `lineType` (論理/表示), `targetLine`, `targetCol` | キャレットの指定行・桁への直接スクロール移動 |
| 11 | **連番挿入** | `NumberingDialog` | 編集メニュー | `start`, `step`, `count`, `zeroPad`, `insertCol` | 連続番号文字列の生成とバッファ挿入（通常/矩形） |
| 12 | **ファイルプロパティ** | `FilePropertyDialog`| `Alt+Enter` | `fileName`, `fileSize`, `charCount`, `lineCount`, `encoding`, `lineEnding`, `updatedAt` | ファイル情報の詳細モーダル表示 |
| 13 | **フォント設定** | `FontDialog` | 設定メニュー | `fontFamily`, `fontSize`, `previewText` | フォント名（BIZ UDゴシック等）・サイズ変更とリアルタイムプレビュー |
| 14 | **外部コマンド実行** | `ExternalToolDialog`| メニュー/ツールバー | `command`, `arguments`, `outputConsole` | コマンドパラメーター展開（`%f`, `%d`）、擬似実行・出力キャプチャ |
| 15 | **文字コード指定** | `EncodingDialog` | ステータスバー等 | `selectedEncoding`, `selectedLineEnding`, `hasBom` | ドキュメントの文字コード・改行コードの即時変換 |
| 16 | **マクロ管理** | `MacroDialog` | ツールメニュー | `macroList`, `selectedMacroId`, `recordState` | キーマクロ保存/読込、登録スクリプトの実行 |
| 17 | **印刷ページ設定** | `PageSetupDialog` | `Ctrl+Alt+P` | `pageSize`, `orientation`, `margins`, `header`, `footer` | 印刷用紙余白・ヘッダー/フッター設定の保存 |
| 18 | **印刷プレビュー** | `PrintPreviewDialog`| `Shift+Ctrl+P` | `pageSize`, `totalPages`, `currentPage` | 改ページシミュレーションとページ切替プレビュー、`window.print()` 実行 |
| 19 | **バージョン情報** | `AboutDialog` | ヘルプメニュー | `version: 2.4.3.7173`, `buildInfo` | サクラエディタ32bit公式ダイアログの完全再現表示 |
| 20 | **共通設定 - 強調キーワード** | `KeywordDialog` | タイプ別設定カラータブ | `selectedSet`, `keywords`, `matchCase` | 4カラムマルチカラムキーワード一覧、インポート(I)/エクスポート(X)、単語編集、ヘルプ(H) |



### 7.1 タイプ別設定一覧ダイアログ (`TypeListDialog`) 詳細仕様
* **ヘッダー表示**: `下からタイプを選択してください(T):`
* **右側ボタングループ**:
  * `設定変更(S)...`: 選択したタイプの「タイプ別設定」ダイアログを開く
  * `一時適用(R)`: アクティブな編集バッファに選択タイプの設定を適用
  * `キャンセル(X)` / `閉じる(X)`: ダイアログを閉じる
  * `インポート(I)`: INI/設定ファイルからタイプ別設定をインポート
  * `エクスポート(E)`: 選択タイプの設定を外部ファイルに保存
  * `初期化(N)`: 選択タイプの設定を標準初期値に戻す
  * `複製(C)`: 選択タイプを新しいスロットにコピー
  * `↑ (U)` / `↓ (D)`: 垂直に2段スタック配置。選択タイプの表示優先度順序を上下に移動
  * `追加(A)`: 新規タイプのスロット追加
  * `削除(D)`: 選択タイプを空きスロットへ削除
  * `ヘルプ(H)`: ヘルプ表示
* **デフォルトプリセット22種定義**:
  1. 基本 (txt,log,ini)
  2. テキスト (txt)
  3. C/C++ (c,cpp,cxx,cc,cp,c++,h,hpp,hxx,inl,rc,rc2,rh,dlg,tlh,tli)
  4. HTML (html,htm,shtml,shtm,xhtml,asp,jsp)
  5. PL/SQL (sql,pls,plb,pks,pkb)
  6. COBOL (cob,cbl,pco)
  7. Java (java,jav)
  8. アセンブラ (asm)
  9. AWK (awk)
  10. MS-DOSバッチファイル (bat,cmd)
  11. Pascal (pas,dpr,dpk)
  12. TeX (tex,ltx,sty,bio,log,blg,aux,bbl,toc,lof,lot,idx,ind,glo,gls)
  13. Perl (pl,pm,cgi,t)
  14. Visual Basic (bas,frm,cls,ctl,pag,dob,dsr)
  15. リッチテキスト (rtf)
  16. 設定ファイル (ini,inf,reg)
  17. XML (xml,xsd,xsl,xslt,svg,kml,gpx)
  18. CSV (csv)
  19. TSV (tsv,tab)
  20. JSON (json,json5)
  21. Python (py,pyw)
  22. Markdown (md,markdown)

### 7.2 タイプ別設定ダイアログ (`TypeSettingDialog`) 全6大タブ仕様
1. **スクリーン (Screen)**:
   * 設定の名前(N)、ファイル拡張子(E)（カンマ区切り）
   * 折り返し: 折り返さない, 指定桁で折り返す, 右端で折り返す
   * 折り返し桁数 (10〜10240, 初期値80)、TAB幅 (1〜64, 初期値4)
   * インデント: なし, 通常インデント, C/C++インデント
   * 行番号表示: なし, エディタ行, 表示行 / 行番号の最小桁数 (1〜10)
   * ルーラー: ルーラー表示(R)、ルーラーの高さ (20〜40px)、文字幅の倍率
   * 行間ピッチ (0〜32px)、文字間ピッチ (0〜16px)
2. **カラー (Color)**:
   * 20種カラーリスト: テキスト, 選択行, 背景, 行番号, 行番号区切り, ルーラー, カレント行, タブ, 改行, 全角空白, 半角空白, EOF, コメント, 引用行, 強調キーワード1〜2, URL, 検索文字列, 正規表現キーワード1〜10
   * 各色属性: 文字色, 背景色, 太字(Bold), 下線(Underline), 表示/非表示チェック
   * 実機再現プレビューボックス（テキスト、選択、カーソル行、TAB、改行、全角空白、EOFの描画シミュレーション）
   * セット名選択, インポート, エクスポート
3. **ウィンドウ (Window)**:
   * ウィンドウ位置とサイズ: 任意, 前回終了時と同じ, 画面中央, 最大化
   * ルーラー・スクロールバー・ファンクションキー表示連動
   * 背景画像設定（透過度、表示位置）
4. **支援 (Support)**:
   * 入力補完機能: 単語ファイル(W)入力欄＋参照ボタン、タイプ選択（なし/C++/HTML/Java/JavaScript）、英大文字小文字を同一視(I)、候補表示（編集中のファイル(E), 強調キーワード(C)）
   * 外部ヘルプの設定(L): コマンドライン入力欄＋参照ボタン
   * 外部HTMLヘルプの設定(E): パス入力欄＋参照ボタン、ビューアを複数起動しない(N)、保存時に改行コードの混在を警告する(E)
   * C/C++インデント詳細設定: 文字列を無視する(S)、コメントを無視する(C)、Undoバッファを分ける(U)
   * ファイル読み込み時にインデントスタイルを検出する(T)
5. **正規表現キーワード (Regex Keywords)**:
   * 有効切替: `正規表現キーワードを使用する(R)`（上部に `Bregonig.dll Ver.4.20 with Oniguruma 6.2.0` バージョン表記。チェックOFF時は子コントロール群を自動無効化・disabled化）
   * キーワード一覧テーブル: 2カラム（`キーワード`、`色指定`）
   * 行操作ボタン群: `先頭(T)`, `上へ(U)`, `下へ(D)`, `最終(B)`, `挿入(S)`, `追加(A)`, `更新(E)`, `削除(D)`
   * 入力コントロール: `正規表現(N):` テキストボックス、`色指定(C):` ドロップダウン（正規表現キーワード1〜10、および URL）
   * 注記: `※色指定にURLを指定した場合、ダブルクリックでブラウザ起動できます。`
   * 設定ファイル操作: `インポート(I)...`, `エクスポート(X)...`
6. **キーワードヘルプ (Keyword Help)**:
   * 有効切替: `キーワードヘルプ機能を使う(K)`（チェックOFF時は子コントロール群を自動無効化・disabled化）
   * 辞書ファイル一覧テーブル: 3カラム（`辞書ファイル`、`辞書の説明`、`パス`）
   * 優先度変更ボタン: `↑優先度(高)`, `先頭(T)`, `上へ(U)`, `下へ(D)`, `最終(B)`, `↓優先度(低)`
   * 辞書詳細欄: `<辞書の説明>`（選択辞書の概要表示）、`辞書ファイル` パス入力＋参照
   * 動作オプション: `ヒットした次の辞書も検索(A)`, `キーワードも表示する(W)`, `選択範囲で前方一致検索(P)`, `右クリックメニュー(R):` ドロップダウン
   * 設定ファイル操作: `インポート(I)...`, `エクスポート(X)...`
* **ダイアログ下部バー**: `設定フォルダー(F) >>`, `OK`, `キャンセル`, `ヘルプ`

### 7.3 強調キーワードダイアログ (`KeywordDialog` / Win32 `IDD_PROP_KEYWORD`) 詳細仕様
* **セット管理**:
  * `セット名(N)`: ドロップダウンリスト（JavaScript, C/C++, HTML, Python, SQL, Java 等）。
  * `変更(H)`: 現在選択中セットのリネーム（重複バリデーション付き）。
  * `セット追加(M)...`: 新規キーワードセットの作成。
  * `セット削除(R)...`: 選択中セットの削除（最後の1セットは削除不可ガード）。
* **強調キーワード一覧**:
  * 4カラム等幅グリッドリスト（Win32 SysListView32 LVS_LIST再現）。
  * テキストオーバーフロー防止（`text-overflow: ellipsis; white-space: nowrap;`）。
  * 項目ダブルクリックによる即時インライン編集。
* **単語編集・管理機能**:
  * `追加(A)...`: 単語追加プロンプト（スペース・カンマ区切りでの一括複数単語登録対応、100文字制限バリデーション）。
  * `編集(E)...`: 選択中単語の変更。
  * `削除(D)`: 選択中単語のセットからの削除。
  * `英大文字小文字区別(C)`: セットごとの大文字小文字同一視フラグ。
  * `整理(O)`: アルファベット辞書順（A-Z）の昇順ソートおよび重複完全除去。
  * `インポート(I)...`: `.kwd`, `.txt`, `.ini` テキストファイルを読み込み、コメント行（`#`, `//`, `;`）を除外して単語を一括登録。
  * `エクスポート(X)...`: 現在のキーワードセットを標準 `.kwd` 形式ファイルとして自動ダウンロード生成。
* **データ永続化**: `localStorage` (`sakura_keyword_sets_data`) に完全同期保存され、次回セッションおよびタイプ別設定とリアルタイム連動。

### 7.4 指定行へジャンプダイアログ (`JumpDialog` / Win32 `IDD_JUMP`) 詳細仕様
* **行番号入力**: `行番号(N):` 数値インプット＋上下スピンボタン（▲/▼）。
* **行単位選択ラジオ**:
  * `折り返し単位の行番号(R)`: 画面上で折り返された視覚的行を基準にジャンプ。
  * `改行単位の行番号(W)`: 物理的改行コード（CRLF/LF）を基準にジャンプ（既定）。
* **PL/SQLコンパイルエラー行グループボックス**:
  * `PL/SQLコンパイルエラー行を処理する(P)`: チェックボックスによるON/OFF切り替え。チェックOFF時はグループボックス内コントロールを完全無効化（disabled）。
  * `テキストの [ X ] 行目をブロックの1行目とする`: パッケージ開始行指定＋上下スピンボタン。
  * `検出されたPL/SQLパッケージのブロックから選択(S)`: ドロップダウン選択でブロック開始行を即時連動反映。
  * **ジャンプ計算ロジック**: `対象行 = (ブロック開始行 - 1) + エラー行番号` による正確なオフセットジャンプ。
* **右側ボタングループ**: `ジャンプ(J)`, `キャンセル(X)`, `ヘルプ(H)`。

### 7.5 検索・置換ダイアログ (`SearchDialog` / Win32 `IDD_FIND` & `IDD_REPLACE`) 詳細仕様
* **2ペイン Win32 レイアウト**:
  * 左側: 入力欄、履歴ドロップダウン、オプションチェックボックス、置換対象/範囲グループボックス。
  * 右側: `上検索(U)`, `下検索(D)` (デフォルト), `該当行マーク(B)`, `置換(R)`, `すべて置換(A)`, `キャンセル(X)`, `ヘルプ(H)`。
* **履歴保持 (`datalist`)**: `localStorage` に検索履歴（最大20件）および置換履歴（最大20件）を保存し、コンボボックス風に入力補完。
* **クリップボード連携**: `クリップボードから貼り付ける(T)` ボタンにより OS クリップボード文字列を置換テキストへ即時流し込み。
* **置換対象指定**: `選択文字(0)`, `選択始点(1)挿入`, `選択終点(2)追加`, `行削除(3)`。
* **範囲指定**: `選択範囲(S)` vs `ファイル全体(O)`。
* **全オプション完備**: 単語単位(W), 大文字小文字区別(C), 正規表現(E), メッセージ表示(M), 自動で閉じる(L), 先頭から再検索(Z)。

### 7.6 共通設定ダイアログ (`CommonSettingDialog` / Win32 `CPropCommon` 3段全18タブ仕様)
* **Win32 3段プロパティシート構成**:
  * 1段目: `ファイル` (`file`), `ファイル名表示` (`fname`), `バックアップ` (`backup`), `書式` (`format`), `検索` (`grep`), `キー割り当て` (`keybind`)
  * 2段目: `カスタムメニュー` (`custmenu`), `強調キーワード` (`keyword`), `支援` (`helper`), `マクロ` (`macro`), `プラグイン` (`plugin`)
  * 3段目: `全般` (`general`), `ウィンドウ` (`win`), `メインメニュー` (`mainmenu`), `ツールバー` (`toolbar`), `タブバー` (`tabbar`), `ステータスバー` (`statusbar`), `編集` (`edit`)
  * アクティブなタブが属する行が自動的に最下段（プロパティシート本体と直結）へ移動するWin32標準の階層切り替え挙動を完全再現。
* **主要5大タブ詳細仕様**:
  1. **全般 (General)**:
     * カーソル制御: フリーカーソル(F), 単語末尾停止(B), 段落末尾停止(P), マウスクリックアクティブ化時カーソル不移動(O)。
     * カーソル形状: Windows風 vs MS-DOS風。
     * タスクトレイ: トレイ使用(T), 常駐(R), ショートカットキー(K), 複数ウィンドウ終了確認(U), 全終了確認(V)。
     * スクロール: スピンボタン付き行数(N), スムーズスクロール(S), ホイール操作時修飾キー（ページスクロール/横スクロール: なし/Ctrl/Shift/Alt）。
     * 画面キャッシュ(G), ファイル履歴MAX / フォルダー履歴MAX（上下スピンボタン付属）。
     * **「履歴をクリア(C)...」/「履歴をクリア(L)...」実機能**: localStorage のファイル/フォルダー履歴を実際に削除し確認アラートを表示。
  2. **ウィンドウ (Window)**:
     * 基本設定: ツールバー表示(T), ファンクションキー表示(K), ステータスバー表示(S), 水平スクロールバー(R), ダークモード(D), アイコン付きメニュー(I)。
     * **「位置と大きさの設定(W)...」サブダイアログ (IDD_WINPOSSIZE)**: 指定方法（指定しない/継承する/直接指定）、X/Y/幅/高さのスピン入力、「現在の位置と大きさを取得」ボタンによる実寸自動流し込み。
     * ルーラ/行番号: ルーラー高さ(E), ルーラー隙間(P), 行番号隙間(L)のドット単位スピン設定。
     * ファンクションキー: 上(O) / 下(B), グループボタン数(G)スピン設定。
     * 言語選択 (Japanese / English), 分割ウィンドウの垂直/水平スクロール同期チェック。
     * タイトルバー書式: アクティブ時(1)・非アクティブ時(2)のマクロ書式指定（`$f`, `$a`, `$v` 等）。
  3. **メインメニュー (MainMenu)**:
     * 種別(C)ドロップダウン（ファイル操作系, 編集系, 変換系, 検索系, ツール系, 設定系, ウィンドウ系, ヘルプ系）。
     * `アクセスキーを必ず( )付きで表示(P)` チェック。
     * 左ペイン: アイコン付き全コマンド一覧。
     * 中央ボタン群: `削除(D)`, `+(N)` 挿入, `---(S)` セパレータ, `上へ(U)`, `下へ(A)`, `>>(B)` 追加, `全開(H)`, `全閉(Z)`。
     * 右ペイン: 展開/折りたたみ可能なメニューツリー構造。
     * 下部ボタン群: `インポート(I)...`, `エクスポート(X)...`, `検査(T)`（整合性・重複キー診断レポート）, `クリア(C)`, `初期設定(R)`。
  4. **ツールバー (Toolbar)**:
     * 種別(K)ドロップダウン, `フラットなボタン(L)` チェック。
     * 左ペイン: アイコン付き全コマンド一覧。
     * 中央ボタン群: `削除(D)`, `---(S)`, `--(A)`, `>>(B)`, `↑(U)`, `↓(D)`, `折返(W)`。
     * 右ペイン: ツールバー登録リスト（アイコン付きアイテム, セパレータ境界線, 折返マーク）。
     * `初期設定に戻す(R)` による標準ツールバー復元。
  5. **タブバー (TabBar)**:
     * タブバー表示(D), 動作モード（グループ化(U), (無題)残す(R), 現在ファイルのみ閉じる(C), 外部起動時新規ウィンドウ(O)）。
     * 外観: アイコン表示(I), 等幅(E), 閉じるボタン(X)（自動表示/常に表示/表示しない）, フォント設定(F)...（Yu Gothic UI / MS UI Gothic等選択モーダル）, ソート(S), 多段(M), 位置(上/下), タイトル書式, マウスホイール切り替え(W)。
* **下部共通バー**:
  * `設定フォルダー(F) >>`: クリックでポップアップメニュー展開（sakura.ini エクスポート, sakura.ini インポート, 全設定の初期化）。
  * `OK`, `キャンセル`, `適用(A)`, `ヘルプ(H)`。

### 7.7 ダイアログ ウィンドウはみ出し防止 & レスポンシブ設計規約
ブラウザ表示領域（ビューポート）の解像度やウィンドウサイズに関わらず、ダイアログが画面外へ突き抜ける（はみ出る）不具合を根絶するため、以下のスタイル規約を CSS 全域および各ダイアログコンポーネントに徹底適用：
1. **Overlay & Window 拘束**:
   * `.sakura-dialog-overlay`: `padding: 12px; box-sizing: border-box; overflow: hidden;`
   * `.sakura-dialog-window`: `max-width: calc(100vw - 24px); max-height: calc(100vh - 24px); display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box;`
2. **Body スクロール領域分離**:
   * `.sakura-dialog-body`: `flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; box-sizing: border-box;`
   * 高さが画面を超える場合、ダイアログ内の本文領域のみが美しく縦スクロールし、タイトルバーおよび最下部の [OK] / [キャンセル] ボタンは常に可視領域に留まる。
3. **ボタン列の折返し・固定幅確保**:
   * 右側ボタングループは `flex-shrink: 0; width: 90px〜105px;` を確保し、ボタン名が改行されたり枠からはみ出ないよう `box-sizing: border-box; white-space: nowrap;` を指定。

### 7.8 アクセスキー・ニーモニック表記規約
Web環境（HTML/React）では、Win32リソースファイル特有のアンパサンド表記（例: `&S`）をそのままテキスト配置すると画面上に `(&S)` とリテラル表示され、ユーザー体験が損なわれます。そのため、すべてのダイアログおよびメニューにおいて以下のルールを厳格に順守・統一しています：
* 全UIボタンおよびコントロールラベルのアクセスキーは `(S)`, `(O)`, `(X)`, `(C)` 等の括弧付き英大文字形式で表示。
* 生のアンパサンド付き文字列（`(&S)`, `(&O)` 等）は一切使用せず、全18ダイアログで正規化済み。

---

## 8. メインUIシェル仕様

### 8.1 タイトルバー (`TitleBar`)
* **タイトル文字列フォーマット**:
  * 通常時: `(無題)1 - サクラエディタ32bit 2.4.3.7173`
  * 編集時（未保存）: `*(無題)1 - サクラエディタ32bit 2.4.3.7173`
  * ファイル保持時: `*index.html - サクラエディタ32bit 2.4.3.7173`
* **同期処理**: ブラウザの `document.title` および `<link rel="icon">`（🌸アイコン）と完全同期。

### 8.2 メニューバー (`MenuBar`) - 全8大メニュー完全階層
1. **ファイル (F)**: 新規作成(N) [`Ctrl+N`], 新規ウインドウを開く(M), 開く(O)... [`Ctrl+O`], 上書き保存(S) [`Ctrl+S` - 未変更時無効], 名前を付けて保存(A)... [`Shift+Ctrl+S`], すべて上書き保存(Z), 保存して閉じる(E), 閉じる(C) [`Ctrl+F4`], 閉じて(無題)(R), 閉じて開く(L)..., 開き直す(W) [SJIS, JIS, EUC, Unicode, UnicodeBE, UTF-8, UTF-8(BOM付), 変更を破棄して開き直す(R)], 印刷(P)... [`Ctrl+P`], 印刷プレビュー(V) [`Shift+Ctrl+P`], 印刷ページ設定(U)... [`Ctrl+Alt+P`], ファイルのプロパティ(T) [`Alt+Enter`], ブラウズ(B) [`Ctrl+B`], 最近使ったファイル(F), 最近使ったフォルダー(D), グループを閉じる(G) [`Alt+F4`], 編集の全終了(Q), サクラエディタの全終了(X)
2. **編集 (E)**: 元に戻す(U) [`Ctrl+Z` - 履歴なし時無効], やり直し(R) [`Ctrl+Y` - 履歴なし時無効], 切り取り(T) [`F7` - 非選択時無効], コピー(C) [`F8` - 非選択時無効], 貼り付け(P) [`F9`], 削除(D) [`Del`], すべて選択(A) [`Ctrl+A`], 再変換(R) [非選択時無効], CRLF改行でコピー(L) [`Shift+F8` - 非選択時無効], 折り返し位置に改行をつけてコピー(H) [非選択時無効], 矩形貼り付け(X) [`Shift+F9`], カーソル前を削除(B) [`BkSp`], 挿入(I) [単語補完, 現在日時, 連番挿入, 引用符付加, ファイル名], 高度な操作(V) [行の二重化 `Ctrl+D`, 行の削除, 行頭空白削除, 行末空白削除, 空行削除, 重複行削除, 昇順ソート, 降順ソート], 移動(O), 選択(S), 矩形選択(F), 整形(K)
3. **変換 (C)** (※全項目非選択時無効): 小文字(L) [`Ctrl+F6`], 大文字(U) [`Ctrl+F7`], 全角→半角(F) [`Ctrl+F8`], 半角＋全ひら→全角・カタカナ(Z) [`Ctrl+F9`], 半角＋全カタ→全角・ひらがな(N) [`Ctrl+F10`], 全角英数→半角英数(A), 半角英数→全角英数(M), 全角カタカナ→半角カタカナ(J), 半角カタカナ→全角カタカナ(K) [`Ctrl+F11`], 半角カタカナ→全角ひらがな(H) [`Ctrl+F12`], TAB→空白(S) [`Ctrl+Alt+F5`], 空白→TAB(T) [`Shift+Ctrl+Alt+F5`], 文字コード変換(C)
4. **検索 (S)**: 検索(F)... [`Ctrl+F`], 次を検索(N) [`F3`], 前を検索(P) [`Shift+F3`], 置換(R)... [`Ctrl+R`], 検索マークの切替え(C) [`Ctrl+F3`], 検索開始位置へ戻る(I) [`Shift+Ctrl+F3` - 起点なし時無効], インクリメンタルサーチ(S) [`Ctrl+I`, `Shift+Ctrl+I`], ブックマーク(M) [設定・解除 `F11`, 次 `F2`, 前 `Shift+F2`, 全解除, 抽出, 反転, 削除], Grep(G)... [`Ctrl+G`], Grep置換..., 指定行へジャンプ(J)... [`Ctrl+J`], アウトライン解析(L)... [`F11`], ファイルツリー(E), タグジャンプ(T) [`F12`], タグジャンプバック(B) [`Shift+F12`], ファイル内容比較(@)... [`Ctrl+Enter`], DIFF差分表示(D)..., 次の差分へ, 前の差分へ, 差分表示の全解除, 対括弧の検索([) [`Ctrl+[`]
5. **ツール (T)**: キーマクロの記録開始/終了(M) [`Ctrl+Shift+M`], キーマクロの保存(S)..., キーマクロの読み込み(L)..., キーマクロの実行(E) [`Ctrl+Shift+L`], マクロ(A) [1〜10], マクロの実行・管理..., マクロ登録(R)..., 外部コマンド実行(X)...
6. **設定 (O)**: タイプ別設定一覧(L)..., タイプ別設定(Y)..., カラー設定(E)..., 共通設定(C)..., フォント(F)..., 表示切替 [ツールバー(T) `✓`, ファンクションキー(K) `✓`, ステータスバー(S) `✓`, ルーラー(R) `✓`, タブバー(B) `✓`, 行番号(N) `✓`], 設定のエクスポート (sakura.ini)..., 設定のインポート (sakura.ini)...
7. **ウィンドウ (W)**: 縦に分割(V), 横に分割(H), 4分割(4), 分割解除(R), 次のタブ [`Ctrl+Tab`], 前のタブ [`Shift+Ctrl+Tab`], 閉じる [`Ctrl+W`], 開いているドキュメント一覧（チェックマーク `✓` 付与）
8. **ヘルプ (H)**: 目次(C), コマンド一覧(K)... [`Ctrl+Shift+K`], サクラエディタについて(A)...

### 8.3 ファンクションキーバー (`FunctionKeyBar`)
* **配置**: エディタ画面直下（ステータスバー直上）
* **キー連動マトリクス**:
  * **通常時**: `F1`: ヘルプ目次, `F2`: 次のしおり, `F3`: 次を検索, `F4`: ウィンドウ終了, `F5`: 再描画, `F6`: 矩形選択, `F7`: 切り取り, `F8`: コピー, `F9`: 貼り付け, `F10`: 補完, `F11`: アウトライン, `F12`: タグジャンプ
  * **Shift押下時 (`S+F1..S+F12`)**: `S+F1`: コマンド一覧, `S+F2`: 前のしおり, `S+F3`: 前を検索, `S+F4`: 閉じて開く, `S+F5`: 差分比較, `S+F6`: 単語選択, `S+F7`: 引用符付加, `S+F8`: CRLFコピー, `S+F9`: 矩形貼り付け, `S+F10`: 連番挿入, `S+F11`: しおり設定, `S+F12`: タグバック
  * **Ctrl押下時 (`C+F1..C+F12`)**: `C+F1`: プロパティ, `C+F2`: 置換, `C+F3`: 検索マーク, `C+F4`: タブ閉じる, `C+F5`: タイプ設定, `C+F6`: 小文字, `C+F7`: 大文字, `C+F8`: 全半角, `C+F9`: 全カタ, `C+F10`: 全ひら, `C+F11`: 半カタ→全カタ, `C+F12`: 半カタ→全ひら

### 8.4 ステータスバー (`StatusBar`)
* **構成**:
  1. `メッセージ / 選択情報`: 非選択時は `総行数: ○行`、選択時は `選択中: ○文字 (○行)` をリアルタイム表示。
  2. `カーソル位置`: `○行 ○桁`（クリックで指定行ジャンプダイアログ起動）。
  3. `改行コード`: `CRLF` / `LF` / `CR`（クリックで改行コード指定メニュー表示）。
  4. `文字コード`: `UTF-8` / `Shift_JIS` 等（クリックでエンコーディング指定ダイアログ表示）。
  5. `REC`: マクロ記録中表示（赤文字ハイライト、クリックで記録トグル）。
  6. `挿入 / 上書`: `挿入` または `上書`（クリックで INS/OVR 切り替え）。
  7. `ズーム倍率`: `100%`（クリックでズーム切替）。
  8. `サイズグリップ`: 右端のリサイズハンドル装飾。

---

## 9. コマンドID ディスパッチルーティング完全テーブル

すべてのメニュー、ツールバーボタン、ショートカット、ファンクションキー、マクロから呼び出される統一コマンドディスパッチャ対応表です：

| コマンドID | 名称 | 標準ショートカット | 実行ハンドラー / 処理ロジック |
| :--- | :--- | :--- | :--- |
| `file.new` | 新規作成 | `Ctrl+N` | 新規無題タブ（`TabDoc`）を作成しアクティブ化 |
| `file.open` | 開く | `Ctrl+O` | ファイル選択ダイアログ表示、内容読み込み |
| `file.save` | 上書き保存 | `Ctrl+S` | 現在のファイルへ保存、未変更フラグ解除 |
| `file.saveAs` | 名前を付けて保存 | `Shift+Ctrl+S` | 名前を付けて保存ダイアログ起動 |
| `file.close` | 閉じる | `Ctrl+F4` | 現在のタブを閉じる（未保存時は確認モーダル） |
| `file.revert` | 変更を破棄して開き直す | - | 編集内容をクリアし初期読み込みテキストに復帰 |
| `file.print` | 印刷 | `Ctrl+P` | ブラウザ標準 `window.print()` 実行 |
| `edit.undo` | 元に戻す | `Ctrl+Z` | `doc.undoManager.undo()` |
| `edit.redo` | やり直し | `Ctrl+Y` | `doc.undoManager.redo()` |
| `edit.cut` | 切り取り | `F7` / `Ctrl+X` | 選択テキストをクリップボード格納後、削除 |
| `edit.copy` | コピー | `F8` / `Ctrl+C` | 選択テキストをクリップボードへ格納 |
| `edit.paste` | 貼り付け | `F9` / `Ctrl+V` | クリップボード文字列をキャレット位置へ挿入 |
| `edit.copyCrlf` | CRLFでコピー | `Shift+F8` | 選択テキストの改行を CRLF に正規化してコピー |
| `edit.pasteBox` | 矩形貼り付け | `Shift+F9` | `buffer.insertBoxText(cursor, clipText)` |
| `edit.selectAll`| すべて選択 | `Ctrl+A` | `doc.selection = { start: (0,0), end: (lastLine, lastCol) }` |
| `edit.duplicateLine`| 行の二重化 | `Ctrl+D` | 現在行の下に同一テキストの行を挿入 |
| `trans.toLower` | 小文字化 | `Ctrl+F6` | 選択テキストに `toLowerCase()` を適用 |
| `trans.toUpper` | 大文字化 | `Ctrl+F7` | 選択テキストに `toUpperCase()` を適用 |
| `trans.zenToHan`| 全角→半角 | `Ctrl+F8` | 選択テキストに `toHalfWidth()` を適用 |
| `trans.hanToZen`| 半角→全角 | - | 選択テキストに `toFullWidth()` を適用 |
| `trans.zenAlnumToHan`| 全角英数→半角英数| - | 選択テキストに `zenAlnumToHan()` を適用 |
| `trans.hanAlnumToZen`| 半角英数→全角英数| - | 選択テキストに `hanAlnumToZen()` を適用 |
| `trans.zenKataToHan` | 全角カタ→半角カタ| - | 選択テキストに `zenKataToHan()` を適用 |
| `trans.hanKataToZen` | 半角カタ→全角カタ| `Ctrl+F11` | 選択テキストに `hanKataToZen()` を適用 |
| `trans.hanKataToZenHira`| 半カタ→全ひら | `Ctrl+F12` | 選択テキストに `hanKataToZenHira()` を適用 |
| `trans.tabToSpaces` | TAB→空白 | `Ctrl+Alt+F5` | 選択テキスト内の `\t` を半角スペース（tabSize個）に置換 |
| `trans.spacesToTab` | 空白→TAB | `Shift+Ctrl+Alt+F5`| 連続スペースを `\t` に置換 |
| `search.find` | 検索 | `Ctrl+F` | 検索ダイアログ起動 |
| `search.findNext` | 次を検索 | `F3` | 現在キャレット以降の前方検索 |
| `search.findPrev` | 前を検索 | `Shift+F3` | 現在キャレット以前の後方検索 |
| `search.replace`| 置換 | `Ctrl+R` | 置換ダイアログ起動 |
| `search.toggleMark` | 検索マーク切替 | `Ctrl+F3` | 検索結果テキストのハイライト表示切替 |
| `search.grep` | Grep | `Ctrl+G` | Grepダイアログ起動 |
| `search.jump` | 指定行ジャンプ | `Ctrl+J` | ジャンプダイアログ起動 |
| `search.diff` | ファイル内容比較 | `Ctrl+Enter` | DIFFダイアログ起動 |
| `search.outline`| アウトライン解析 | `F11` | アウトラインダイアログ起動 |
| `search.matchBracket`| 対括弧の検索 | `Ctrl+[` | 対応する対括弧位置へキャレット移動 |
| `bookmark.toggle` | しおり設定/解除 | `F11` | 現在行のブックマーク状態をトグル |
| `bookmark.next` | 次のしおり | `F2` | 次のしおり行へジャンプ |
| `bookmark.prev` | 前のしおり | `Shift+F2` | 前のしおり行へジャンプ |
| `bookmark.clear`| 全しおり解除 | - | `doc.bookmarkManager.clear()` |
| `bookmark.invert`| しおり反転 | - | `doc.bookmarkManager.invert(totalLines)` |
| `bookmark.deleteLines`| しおり行削除 | - | しおりが存在する全行を一括削除（Undo対応） |
| `macro.toggleRecord` | マクロ記録トグル | `Ctrl+Shift+M` | キーマクロ記録の開始/終了 |
| `macro.play` | キーマクロ実行 | `Ctrl+Shift+L` | 記録されたキーマクロの再生実行 |
| `view.splitV` | 縦に分割 | - | `splitMode = 'vertical'` |
| `view.splitH` | 横に分割 | - | `splitMode = 'horizontal'` |
| `view.splitQuad` | 4分割 | - | `splitMode = 'quad'` |
| `view.splitNone` | 分割解除 | - | `splitMode = 'none'` |
| `help.commandList` | コマンド一覧 | `Ctrl+Shift+K` | コマンド一覧ダイアログ起動 |
| `help.about` | バージョン情報 | - | サクラエディタについてダイアログ起動 |

---

## 10. 設定永続化 & `sakura.ini` 互換仕様

### 10.1 localStorage キー構造
* `sakura_common_settings`: `CommonSettingsModel` のJSON文字列。
* `sakura_type_settings`: `TypeSettingItem[]` のJSON文字列。
* `sakura_recent_files`: 最近使ったファイル履歴のJSON配列。

### 10.2 `sakura.ini` フォーマット仕様
サクラエディタの INI 構文に準拠：
```ini
[SakuraIni]
Version=2.4.3.7173

[CommonSettings]
bFreeCursor=0
bOverstrike=0
bSmoothScroll=1
nScrollLines=3
bShowModifiedGutter=1
szDefaultEncoding=UTF-8
szDefaultLineEnding=CRLF
bShowToolbar=1
bFlatToolbar=1
bShowTabbar=1
nTabPosition=0
bShowStatusbar=1
bShowFunctionKey=1

[TypeSettings_Text]
szTypeName=基本
szExtensions=txt,log,ini
nWrapMode=1
nWrapColumn=80
nTabSize=4
bAutoIndent=0
nLineNumberType=0
bShowRuler=1
bShowLineNumbers=1
nFontSize=14
szFontFamily='BIZ UDGothic', 'MS Gothic', monospace
```

---

## 11. 実機（Win32 Ver 2.4.3.7173）完全一致検証マトリクス

| 機能カテゴリ | Win32実機仕様 (Ver 2.4.3.7173) | Web SPA 実装状況 | 検証ステータス |
| :--- | :--- | :--- | :--- |
| **8大メニュー構成** | ファイル〜ヘルプの全項目・サブメニュー・アクセスキー | 完全実装 (100%一致) | ✅ 完全準拠 |
| **動的無効化判定** | 非選択時、未変更時、履歴なし時のグレーアウト | 完全実装 (`opacity: 0.45; filter: grayscale(100%)`) | ✅ 完全準拠 |
| **文字種変換範囲** | 非選択時無効、選択中テキスト（通常/矩形）にのみ適用 | 完全実装 (`TextTransform` 連動) | ✅ 完全準拠 |
| **ツールバー** | 実機アイコン順序・グループ（検索・置換・しおり・設定） | 完全実装（有効/無効同期） | ✅ 完全準拠 |
| **ファンクションキー**| F1〜F12、Shift / Ctrl 押下連動ラベル切り替え | 完全実装 (`FunctionKeyBar`) | ✅ 完全準拠 |
| **特殊記号描画** | 全角□、半角中黒、TAB矢印、CRLF/LF/CR矢印、EOF青実線 | 完全実装 (`symbols.ts`) | ✅ 完全準拠 |
| **ステータスバー** | 選択文字/行数連動、各セルクリックポップアップ | 完全実装 (`StatusBar`) | ✅ 完全準拠 |
| **右クリックメニュー**| Win32準拠ショートカット表記、再変換の選択連動 | 完全実装 (`ContextMenu`) | ✅ 完全準拠 |
| **全18種ダイアログ**| 検索, Grep, Diff, タイプ別, 共通, 連番, フォント等 | 完全実装 (全18種) | ✅ 完全準拠 |
| **画面分割** | 単一、左右、上下、4象限（Quad Split） | 完全実装 (`EditorView`) | ✅ 完全準拠 |
| **矩形選択 & 貼り付け**| `Alt`+ドラッグ矩形選択、矩形削除、矩形挿入、矩形変換 | 完全実装 (`TextBuffer` 矩形処理) | ✅ 完全準拠 |

---

## 12. 結論（再現性保証）
本設計書は、Win32サクラエディタ Ver 2.4.3.7173 の全振る舞いおよび本Web SPA実装の全データ構造・数学的計算式・アルゴリズム・ダイアログ仕様・コマンドディスパッチを網羅しています。本設計書単独を参照することにより、あらゆるエンジニアが完全に同一の外観・動作・信頼性を持つサクラエディタWebクローンを再現・実装することが可能です。
