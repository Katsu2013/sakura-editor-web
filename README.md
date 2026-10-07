# 🌸 サクラエディタ Web SPA (Sakura Editor for Web)

> **Windows向け定番テキストエディタ「サクラエディタ (Sakura Editor 32bit Ver. 2.4.3.7173)」をモダンWeb技術（React 19 + TypeScript + HTML5 Canvas）で完全クローン・再現したWebアプリケーション。**

[![Version](https://img.shields.io/badge/version-2.4.3.7173-pink.svg)](package.json)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 📖 概要 (Overview)

長年にわたり多くの開発者・執筆者に愛用されてきた国産テキストエディタ「サクラエディタ」の外観・操作性・記号描画・設定体系を、ブラウザ環境（SPA）上で忠実に再現したプロジェクトです。

ピクセルパーフェクトなHTML5 Canvas 2D仮想レンダリングエンジンと、不可視 Native Input Bridge による正確な日本語IMEインライン入力を備え、デスクトップ版と遜色のない快適なタイピングと編集体験を提供します。

---

## ✨ 主な機能 (Key Features)

* **Win32 Classic UI 完全再現**:
  * タイトルバー（未保存マーク `*`、ドキュメントタイトル同期）
  * メニューバー（ファイル〜ヘルプの全8大メニュー、アクセスキー `Alt+キー`、動的グレーアウト、サブメニュー）
  * ツールバー（実機アイコン、クラシック/フラットボタンスタイル切替、有効/無効状態同期）
  * タブバー（上部/下部配置切替、右端ドロップダウン `▼` & タブ終了 `✕`、右クリックコンテキストメニュー）
  * **ファンクションキーバー**（`F1`〜`F12`、`Shift` 押下時 `S+F1..S+F12`、`Ctrl` 押下時 `C+F1..C+F12` の動的ラベル切り替えと直接実行）
  * ステータスバー（選択文字/行数連動、カーソル行・桁ジャンプ、文字コード/改行指定、INS/OVR、REC表示）
* **Canvas 2D 描画エンジン**:
  * 仮想スクロール最適化（数万行のファイルでも高速・低メモリで描画）
  * 桁ルーラー（10桁目盛り数字、5桁中目盛り、1桁ドット、折り返し赤三角マーカー、下端青実線 `#0000cc`）
  * 行番号・Gutter（論理行/表示行切替、青色しおりバッジ、緑色変更行バー、DIFF差分マーカー）
  * **サクラエディタ固有の特殊記号**:
    * 全角空白: SeaGreen枠 `□`（`#2e8b57`）
    * 半角空白: 中黒 `·`
    * TAB: RoyalBlue水平矢印 `────>`（`#4169e1`）
    * 改行: CRLF（DarkCyan `↲`）、LF（`↓`）、CR（`←`）
    * **[EOF] 記号**: ティール色角丸バッジ `[EOF]` ＋ ウィンドウ全幅に伸びる青下線（`#0000cc`）
* **編集 & 文字種変換**:
  * 矩形選択（`Alt`+ドラッグ）、矩形貼り付け（`Shift+F9`）、矩形文字種変換
  * 文字種変換（大文字/小文字、全角/半角、カタカナ/ひらがな、英数全半角などすべて選択範囲限定で適用）
  * CRLF改行でコピー（`Shift+F8`）、折り返し改行付きコピー
  * テキスト整形（TAB↔空白変換、行頭/行末空白削除、空行削除、重複行ユニーク化、行ソート、連番挿入）
* **マルチエンコーディング & 改行コード**:
  * Shift_JIS (CP932), EUC-JP, ISO-2022-JP, UTF-8, UTF-8(BOM付), UTF-16LE, UTF-16BE
  * CRLF (Windows), LF (Unix/macOS), CR (Classic Mac)
* **検索・解析・全18種ダイアログ**:
  * 検索・置換（正規表現、単語単位、大文字小文字、循環検索、該当行全マーク）
  * Grep & Grep置換（ファイル横断検索、結果ツリーダブルクリックジャンプ）
  * DIFF差分比較（タブ間比較、カラーハイライト）
  * アウトライン解析（関数・クラス・見出しツリー抽出）
  * 共通設定（9大タブ）、タイプ別設定（5大タブ）、フォント設定、印刷プレビュー（改ページ計算）
* **画面分割**:
  * 縦2分割、横2分割、4象限分割（Quad Split）、分割解除
* **設定保持 & 互換性**:
  * `localStorage` 自動保存
  * `sakura.ini` 互換テキストインポート / エクスポート

---

## 🛠 技術スタック (Tech Stack)

| レイヤー | 技術 |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Bundler** | [Vite 8](https://vite.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) + Custom Win32 SVG Icons |
| **Encoding** | `encoding-japanese` + Web TextDecoder / TextEncoder |
| **Rendering** | HTML5 Canvas 2D + Custom Virtual Scroller |
| **Input Method** | Transparent Caret-Tracking Input Bridge (`<textarea>`) |

---

## 🚀 クイックスタート (Quick Start)

### 開発サーバー起動
```bash
# 依存パッケージのインストール
npm install

# ローカル開発サーバー起動 (Vite)
npm run dev
```
ブラウザで `http://localhost:5173/` を開きます。

### プロダクションビルド
```bash
# 型チェックと本番ビルド
npm run build

# ビルド成果物のプレビュー
npm run preview
```
成果物は `dist/` ディレクトリに出力されます（相対パス `base: './'` 設定済みのため、GitHub Pages等のサブディレクトリや静的ホスティングへそのままデプロイ可能）。

---

## 📚 ドキュメント & 詳細設計書

本プロジェクトの完全な設計仕様および実装ブループリントは以下のドキュメントを参照してください：

* **[詳細設計仕様書 (docs/sakura_editor_specification.md)](docs/sakura_editor_specification.md)**
  * 全TypeScript型定義・データモデル
  * Canvas座標系・仮想スクロールの数学的計算式
  * IME Native Bridge 連携仕様
  * 文字種変換Unicodeアルゴリズム
  * 全18種ダイアログ仕様 & コマンドIDディスパッチテーブル
  * Win32実機（Ver 2.4.3.7173）完全一致検証マトリクス

---

## 📄 ライセンス (License)

本プロジェクトは [MIT License](LICENSE) のもとで公開されています。
サクラエディタのオリジナル著作権およびリスペクトは、サクラエディタ開発プロジェクト（Sakura-Editor Project）に帰属します。
