import React, { useState, useMemo } from 'react';

export interface CommandItem {
  id: string;
  category: string;
  name: string;
  shortcut: string;
  description: string;
}

export const ALL_COMMANDS: CommandItem[] = [
  // ファイル
  { id: 'new', category: 'ファイル', name: '新規作成', shortcut: 'Ctrl+N', description: '新しい文書を作成します。' },
  { id: 'new-win', category: 'ファイル', name: '新規ウインドウを開く', shortcut: '', description: '新しいサクラエディタのウィンドウを開きます。' },
  { id: 'open', category: 'ファイル', name: '開く', shortcut: 'Ctrl+O', description: '既存のファイルを開きます。' },
  { id: 'save', category: 'ファイル', name: '上書き保存', shortcut: 'Ctrl+S', description: '現在のファイルを上書き保存します。' },
  { id: 'save-as', category: 'ファイル', name: '名前を付けて保存', shortcut: 'Shift+Ctrl+S', description: '別名でファイルを保存します。' },
  { id: 'save-all', category: 'ファイル', name: 'すべて上書き保存', shortcut: '', description: '開いているすべての変更を保存します。' },
  { id: 'save-close', category: 'ファイル', name: '保存して閉じる', shortcut: '', description: 'ファイルを保存してウィンドウを閉じます。' },
  { id: 'close', category: 'ファイル', name: '閉じる', shortcut: 'Ctrl+F4', description: '現在の文書を閉じます。' },
  { id: 'close-untitled', category: 'ファイル', name: '閉じて(無題)', shortcut: '', description: '現在の文書を閉じて新規無題ファイルを開きます。' },
  { id: 'close-open', category: 'ファイル', name: '閉じて開く', shortcut: 'Shift+Ctrl+F4', description: '文書を閉じて新しいファイルを開きます。' },
  { id: 'print', category: 'ファイル', name: '印刷', shortcut: 'Ctrl+P', description: '現在の文書を印刷します。' },
  { id: 'print-prev', category: 'ファイル', name: '印刷プレビュー', shortcut: 'Shift+Ctrl+P', description: '印刷イメージを画面で確認します。' },
  { id: 'print-setup', category: 'ファイル', name: '印刷ページ設定', shortcut: 'Ctrl+Alt+P', description: '印刷時の用紙サイズや余白を設定します。' },
  { id: 'prop', category: 'ファイル', name: 'ファイルのプロパティ', shortcut: 'Alt+Enter', description: 'ファイル情報、文字コード、行数等を表示します。' },
  { id: 'browse', category: 'ファイル', name: 'ブラウズ', shortcut: 'Ctrl+B', description: '既定のブラウザで現在のファイルを開きます。' },
  { id: 'exit-all-edit', category: 'ファイル', name: '編集の全終了', shortcut: 'Shift+Alt+F4', description: 'すべての編集を終了します。' },
  { id: 'exit-app', category: 'ファイル', name: 'サクラエディタの全終了', shortcut: 'Ctrl+Alt+F4', description: 'サクラエディタを終了します。' },

  // 編集
  { id: 'undo', category: '編集', name: '元に戻す', shortcut: 'Ctrl+Z', description: '直前の編集操作を取り消します。' },
  { id: 'redo', category: '編集', name: 'やり直し', shortcut: 'Ctrl+Y', description: '取り消した操作をやり直します。' },
  { id: 'cut', category: '編集', name: '切り取り', shortcut: 'Ctrl+X / F7', description: '選択範囲をクリップボードに切り取ります。' },
  { id: 'copy', category: '編集', name: 'コピー', shortcut: 'Ctrl+C / F8', description: '選択範囲をクリップボードにコピーします。' },
  { id: 'paste', category: '編集', name: '貼り付け', shortcut: 'Ctrl+V / F9', description: 'クリップボードの内容を貼り付けます。' },
  { id: 'del', category: '編集', name: '削除', shortcut: 'Delete', description: '選択範囲またはカーソル右の文字を削除します。' },
  { id: 'select-all', category: '編集', name: 'すべて選択', shortcut: 'Ctrl+A', description: '文書内のすべてのテキストを選択します。' },
  { id: 'reconvert', category: '編集', name: '再変換', shortcut: '', description: '選択語句の大文字小文字や全角半角を再変換します。' },
  { id: 'copy-crlf', category: '編集', name: 'CRLF改行でコピー', shortcut: 'Shift+F8', description: '改行コードを強制的にCRLFにしてコピーします。' },
  { id: 'copy-wrap-nl', category: '編集', name: '折り返し位置に改行をつけてコピー', shortcut: '', description: '画面の折り返し位置に改行を挿入してコピーします。' },
  { id: 'box-paste', category: '編集', name: '矩形貼り付け', shortcut: 'Shift+F9', description: 'クリップボードの内容を矩形ブロックとして貼り付けます。' },
  { id: 'word-complete', category: '編集', name: '単語補完', shortcut: 'Ctrl+Space', description: '本文内の単語や言語予約語から補完候補を表示します。' },
  { id: 'ins-datetime', category: '編集', name: '現在日時を挿入', shortcut: '', description: '現在の日時文字列をカーソル位置に挿入します。' },
  { id: 'ins-num', category: '編集', name: '連番挿入', shortcut: '', description: '開始番号から指定間隔で連番を挿入します。' },
  { id: 'ins-quote', category: '編集', name: '引用符を付加', shortcut: '', description: '選択行の各行頭に引用符（> ）を付加します。' },
  { id: 'ins-filename', category: '編集', name: 'ファイル名を挿入', shortcut: '', description: '現在のファイル名をカーソル位置に挿入します。' },
  { id: 'dup-line', category: '編集', name: '行の二重化', shortcut: 'Ctrl+D', description: '現在行を複製して次の行に挿入します。' },
  { id: 'del-line', category: '編集', name: '行の削除', shortcut: '', description: '現在行を行ごと削除します。' },
  { id: 'trim-head', category: '編集', name: '行頭の空白削除', shortcut: '', description: '選択行の行頭の空白を取り除きます。' },
  { id: 'trim-tail', category: '編集', name: '行末の空白削除', shortcut: '', description: '選択行の行末の空白を取り除きます。' },
  { id: 'remove-empty', category: '編集', name: '空行の削除', shortcut: '', description: '文書内の空行をすべて削除します。' },
  { id: 'remove-dup', category: '編集', name: '重複行の削除 (ユニーク)', shortcut: '', description: '重複している行を取り除きます。' },
  { id: 'sort-asc', category: '編集', name: '行の昇順ソート', shortcut: '', description: '選択行を辞書順で昇順に並べ替えます。' },
  { id: 'sort-desc', category: '編集', name: '行の降順ソート', shortcut: '', description: '選択行を辞書順で降順に並べ替えます。' },
  { id: 'indent-right', category: '編集', name: '行インデント (字下げ)', shortcut: '', description: '選択行の行頭にタブ幅の空白を挿入します。' },
  { id: 'indent-left', category: '編集', name: '行逆インデント (字上げ)', shortcut: '', description: '選択行の行頭のタブや空白を削除します。' },

  // 変換
  { id: 'to-lower', category: '変換', name: '小文字に変換', shortcut: 'Ctrl+F6', description: '選択範囲の英字を小文字に変換します。' },
  { id: 'to-upper', category: '変換', name: '大文字に変換', shortcut: 'Ctrl+F7', description: '選択範囲の英字を大文字に変換します。' },
  { id: 'to-half', category: '変換', name: '全角→半角', shortcut: 'Ctrl+F8', description: '全角文字を半角文字に変換します。' },
  { id: 'to-kana', category: '変換', name: '半角カタカナ→全角カタカナ', shortcut: 'Ctrl+F9', description: '半角カナを全角カタカナに変換します。' },
  { id: 'to-hira', category: '変換', name: '半角カタカナ→全角ひらがな', shortcut: 'Ctrl+F10', description: '半角カナを全角ひらがなに変換します。' },
  { id: 'tab-to-space', category: '変換', name: 'TAB→空白', shortcut: 'Ctrl+Alt+F5', description: 'タブ文字を指定タブ幅の半角空白に変換します。' },
  { id: 'space-to-tab', category: '変換', name: '空白→TAB', shortcut: 'Shift+Ctrl+Alt+F5', description: '連続する半角空白をタブ文字に変換します。' },
  { id: 'code-change', category: '変換', name: '文字コード・改行指定', shortcut: '', description: '文字コードや改行コードを指定して再変換します。' },

  // 検索
  { id: 'find', category: '検索', name: '検索', shortcut: 'Ctrl+F', description: '指定文字列を検索します。' },
  { id: 'find-next', category: '検索', name: '次を検索', shortcut: 'F3', description: '次のマッチ位置を検索します。' },
  { id: 'find-prev', category: '検索', name: '前を検索', shortcut: 'Shift+F3', description: '前のマッチ位置を検索します。' },
  { id: 'replace', category: '検索', name: '置換', shortcut: 'Ctrl+R', description: '指定文字列を別の文字列に置換します。' },
  { id: 'toggle-search-mark', category: '検索', name: '検索マークの切替え', shortcut: 'Ctrl+F3', description: '検索文字列の強調ハイライト表示を切り替えます。' },
  { id: 'search-start-pos', category: '検索', name: '検索開始位置へ戻る', shortcut: 'Shift+Ctrl+F3', description: '検索を実行する直前のカーソル位置に戻ります。' },
  { id: 'inc-search', category: '検索', name: 'インクリメンタルサーチ', shortcut: 'Ctrl+I', description: '入力した文字をリアルタイムに即座に検索します。' },
  { id: 'bm-toggle', category: '検索', name: 'ブックマーク設定・解除', shortcut: 'F11', description: '現在行のブックマークを設定または解除します。' },
  { id: 'bm-next', category: '検索', name: '次のブックマーク', shortcut: 'F2', description: '次のブックマーク行へジャンプします。' },
  { id: 'bm-prev', category: '検索', name: '前のブックマーク', shortcut: 'Shift+F2', description: '前のブックマーク行へジャンプします。' },
  { id: 'bm-clear', category: '検索', name: '全ブックマーク解除', shortcut: '', description: '設定されているすべてのブックマークを解除します。' },
  { id: 'bm-extract', category: '検索', name: 'ブックマーク行の抽出', shortcut: '', description: 'ブックマークされた行を抽出して新規文書にまとめます。' },
  { id: 'grep', category: '検索', name: 'Grep検索', shortcut: 'Ctrl+G', description: '複数のファイルから一括でテキストを検索します。' },
  { id: 'jump', category: '検索', name: '指定行へジャンプ', shortcut: 'Ctrl+J', description: '指定した行番号にカーソルを移動します。' },
  { id: 'outline', category: '検索', name: 'アウトライン解析', shortcut: 'F11', description: '関数や見出しの階層構造ツリーを表示します。' },
  { id: 'file-tree', category: '検索', name: 'ファイルツリー', shortcut: '', description: '左側のファイル・ブックマークツリーを表示/非表示にします。' },
  { id: 'tag-jump', category: '検索', name: 'タグジャンプ', shortcut: 'F12', description: 'カーソル位置のシンボル定義元へジャンプします。' },
  { id: 'tag-jump-back', category: '検索', name: 'タグジャンプバック', shortcut: 'Shift+F12', description: 'タグジャンプ前の位置へ復帰します。' },
  { id: 'tag-file-create', category: '検索', name: 'タグファイルの作成', shortcut: '', description: 'シンボル定義のtagsファイルを生成します。' },
  { id: 'toggle-header', category: '検索', name: '同名のヘッダー/ソースを開く', shortcut: 'Shift+Ctrl+C', description: 'C/C++の.c/.cppと.hを相互に切り替えます。' },
  { id: 'diff-cmp', category: '検索', name: 'ファイル内容比較 (DIFF)', shortcut: 'Ctrl+Enter', description: '別ファイルや別タブとの差分を比較します。' },
  { id: 'diff-next', category: '検索', name: '次の差分へ', shortcut: 'F7', description: '次の差分行へジャンプします。' },
  { id: 'diff-prev', category: '検索', name: '前の差分へ', shortcut: 'Shift+F7', description: '前の差分行へジャンプします。' },
  { id: 'diff-clear', category: '検索', name: '差分表示の全解除', shortcut: '', description: 'エディタ上の差分マーク表示をクリアします。' },
  { id: 'match-bracket', category: '検索', name: '対括弧の検索', shortcut: 'Ctrl+[', description: 'カーソル位置に対応する括弧の位置へジャンプします。' },

  // ツール
  { id: 'macro-rec', category: 'ツール', name: 'キーマクロ記録の開始/終了', shortcut: 'Ctrl+Shift+M', description: 'キーボード操作のマクロ記録を開始・停止します。' },
  { id: 'macro-play', category: 'ツール', name: 'キーマクロの実行', shortcut: 'Ctrl+Shift+L', description: '記録したキーマクロを再生実行します。' },
  { id: 'macro-manage', category: 'ツール', name: 'マクロの実行・管理', shortcut: '', description: 'マクロの保存・読み込み・編集を行います。' },
  { id: 'macro-register', category: 'ツール', name: 'マクロ登録', shortcut: '', description: '共通設定のマクロタブを開き、マクロキーやファイルを登録します。' },
  { id: 'external-tool', category: 'ツール', name: '外部コマンド実行', shortcut: '', description: '外部プログラムを呼び出して結果を挿入します。' },

  // 設定
  { id: 'type-list', category: '設定', name: 'タイプ別設定一覧', shortcut: '', description: '各言語・ファイルタイプごとの設定一覧を表示します。' },
  { id: 'type-settings', category: '設定', name: 'タイプ別設定', shortcut: '', description: '現在のファイルタイプのフォント、カラー、ルールを設定します。' },
  { id: 'color-settings', category: '設定', name: 'カラー設定', shortcut: '', description: 'タイプ別設定のカラータブを開き、各要素の文字色・背景色を設定します。' },
  { id: 'common-settings', category: '設定', name: '共通設定', shortcut: '', description: 'エディタ全体の共通動作・表示・ツールバーを設定します。' },
  { id: 'font-dialog', category: '設定', name: 'フォント設定', shortcut: '', description: 'フォントファミリーおよびフォントサイズを設定します。' },
  { id: 'export-ini', category: '設定', name: '設定エクスポート (sakura.ini)', shortcut: '', description: '現在の全設定をsakura.iniファイルとして保存します。' },
  { id: 'import-ini', category: '設定', name: '設定インポート (sakura.ini)', shortcut: '', description: 'sakura.ini設定ファイルを読み込みます。' },

  // ウィンドウ
  { id: 'split-v', category: 'ウィンドウ', name: '縦に分割', shortcut: '', description: '画面を左右の2画面に分割します。' },
  { id: 'split-h', category: 'ウィンドウ', name: '横に分割', shortcut: '', description: '画面を上下の2画面に分割します。' },
  { id: 'split-quad', category: 'ウィンドウ', name: '4分割', shortcut: '', description: '画面を2×2の4つのビューに分割します。' },
  { id: 'split-clear', category: 'ウィンドウ', name: '分割解除', shortcut: '', description: '画面分割を解除して1画面に戻します。' },
  { id: 'next-tab', category: 'ウィンドウ', name: '次のタブ', shortcut: 'Ctrl+Tab', description: '次のファイルタブに切り替えます。' },
  { id: 'prev-tab', category: 'ウィンドウ', name: '前のタブ', shortcut: 'Shift+Ctrl+Tab', description: '前のファイルタブに切り替えます。' },

  // ヘルプ
  { id: 'command-list', category: 'ヘルプ', name: 'コマンド一覧', shortcut: 'Ctrl+Shift+K', description: 'エディタの全コマンド一覧を表示し、直接実行します。' },
  { id: 'about', category: 'ヘルプ', name: 'サクラエディタについて', shortcut: '', description: 'バージョン情報とライセンスを表示します。' },
];

interface CommandListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (commandId: string) => void;
}

export const CommandListDialog: React.FC<CommandListDialogProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [filterText, setFilterText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const categories = ['すべて', 'ファイル', '編集', '変換', '検索', 'ツール', '設定', 'ウィンドウ', 'ヘルプ'];

  const filteredCommands = useMemo(() => {
    return ALL_COMMANDS.filter((cmd) => {
      const matchCat = selectedCategory === 'すべて' || cmd.category === selectedCategory;
      if (!matchCat) return false;
      if (!filterText) return true;
      const lower = filterText.toLowerCase();
      return (
        cmd.name.toLowerCase().includes(lower) ||
        cmd.id.toLowerCase().includes(lower) ||
        cmd.shortcut.toLowerCase().includes(lower) ||
        cmd.description.toLowerCase().includes(lower)
      );
    });
  }, [selectedCategory, filterText]);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (filteredCommands.length > 0 && selectedIndex < filteredCommands.length) {
      const cmd = filteredCommands[selectedIndex];
      onClose();
      onExecuteCommand(cmd.id);
    }
  };

  const selectedCommand = filteredCommands[selectedIndex];

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '660px', height: '480px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>コマンド一覧</span>
          <button className="sakura-dialog-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '8px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* 上部フィルター & 分類セレクタ */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '12px' }}>絞り込み(F):</span>
              <input
                type="text"
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="機能名・ショートカットキーを入力..."
                style={{
                  flex: 1,
                  padding: '3px 6px',
                  fontSize: '12px',
                  border: '1px solid #7f9db9',
                  backgroundColor: '#ffffff',
                }}
                autoFocus
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  style={{ padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px' }}>分類:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedIndex(0);
                }}
                style={{
                  padding: '3px 6px',
                  fontSize: '12px',
                  border: '1px solid #7f9db9',
                  backgroundColor: '#ffffff',
                }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* コマンド一覧テーブル */}
          <div
            style={{
              flex: 1,
              border: '2px inset #ffffff',
              backgroundColor: '#ffffff',
              overflowY: 'auto',
              fontFamily: '"MS UI Gothic", "Meiryo", sans-serif',
              fontSize: '12px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#ece9d8', borderBottom: '1px solid #a0a0a0', textAlign: 'left', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '4px 8px', width: '80px', borderRight: '1px solid #d4d0c8' }}>分類</th>
                  <th style={{ padding: '4px 8px', borderRight: '1px solid #d4d0c8' }}>機能名</th>
                  <th style={{ padding: '4px 8px', width: '130px', borderRight: '1px solid #d4d0c8' }}>ショートカット</th>
                  <th style={{ padding: '4px 8px', width: '110px' }}>コマンドID</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommands.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: '#808080' }}>
                      該当するコマンドが見つかりません。
                    </td>
                  </tr>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <tr
                        key={cmd.id}
                        onClick={() => setSelectedIndex(idx)}
                        onDoubleClick={handleExecute}
                        style={{
                          backgroundColor: isSelected ? '#000080' : idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#000000',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <td style={{ padding: '3px 8px', borderRight: '1px solid #f0f0f0' }}>{cmd.category}</td>
                        <td style={{ padding: '3px 8px', borderRight: '1px solid #f0f0f0', fontWeight: 'bold' }}>{cmd.name}</td>
                        <td style={{ padding: '3px 8px', borderRight: '1px solid #f0f0f0', color: isSelected ? '#ffffff' : '#0000aa' }}>{cmd.shortcut}</td>
                        <td style={{ padding: '3px 8px', color: isSelected ? '#dbeafe' : '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>{cmd.id}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 説明パネル */}
          <div
            style={{
              padding: '6px 8px',
              backgroundColor: '#ffffef',
              border: '1px solid #d4d0c8',
              fontSize: '11px',
              color: '#333333',
              minHeight: '28px',
            }}
          >
            {selectedCommand ? (
              <span><strong>{selectedCommand.name}</strong>: {selectedCommand.description}</span>
            ) : (
              <span>コマンドを選択してください。</span>
            )}
          </div>

          {/* ダイアログボタン群 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={handleExecute}
              className="sakura-btn"
              disabled={filteredCommands.length === 0}
              style={{ fontWeight: 'bold', minWidth: '80px' }}
            >
              実行(E)
            </button>
            <button onClick={onClose} className="sakura-btn" style={{ minWidth: '80px' }}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
