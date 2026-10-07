import React, { useState, useMemo } from 'react';
import type { TextBuffer } from '../../../core/buffer/TextBuffer';
import { OutlineIcon } from '../Icons/SakuraIcons';

export interface OutlineItem {
  line: number;
  level: number;
  text: string;
  kind: 'header' | 'function' | 'class' | 'struct' | 'topic';
}

interface OutlineDialogProps {
  isOpen: boolean;
  buffer: TextBuffer;
  syntaxName: string;
  outlineRule: string;
  onClose: () => void;
  onJumpToLine: (lineNumber: number) => void;
}

export const OutlineDialog: React.FC<OutlineDialogProps> = ({
  isOpen,
  buffer,
  syntaxName,
  onClose,
  onJumpToLine,
}) => {
  const [filterText, setFilterText] = useState('');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // ドキュメント内容の解析
  const items = useMemo<OutlineItem[]>(() => {
    if (!isOpen) return [];
    const result: OutlineItem[] = [];
    const lineCount = buffer.getLineCount();

    for (let i = 0; i < lineCount; i++) {
      const line = buffer.getLine(i);
      const trimmed = line.trim();
      if (!trimmed) continue;

      // 1. Markdown 見出し
      if (trimmed.startsWith('#')) {
        const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          result.push({
            line: i + 1,
            level: match[1].length,
            text: match[2],
            kind: 'header',
          });
          continue;
        }
      }

      // 2. Python (class, def)
      if (syntaxName === 'Python' || trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
        const pyMatch = line.match(/^(\s*)(def|class)\s+([a-zA-Z0-9_]+)/);
        if (pyMatch) {
          const indent = Math.floor(pyMatch[1].length / 4) + 1;
          result.push({
            line: i + 1,
            level: indent,
            text: `${pyMatch[2]} ${pyMatch[3]}()`,
            kind: pyMatch[2] === 'class' ? 'class' : 'function',
          });
          continue;
        }
      }

      // 3. C / C++ / Java (class, struct, 関数)
      if (syntaxName === 'C/C++') {
        const cClassMatch = trimmed.match(/^(class|struct)\s+([a-zA-Z0-9_]+)/);
        if (cClassMatch) {
          result.push({
            line: i + 1,
            level: 1,
            text: `${cClassMatch[1]} ${cClassMatch[2]}`,
            kind: cClassMatch[1] === 'class' ? 'class' : 'struct',
          });
          continue;
        }
        const cFuncMatch = trimmed.match(/^([a-zA-Z0-9_&*:\s]+)\s+([a-zA-Z0-9_]+)\s*\((.*)\)\s*(const)?\s*\{?$/);
        if (cFuncMatch && !trimmed.startsWith('if') && !trimmed.startsWith('while') && !trimmed.startsWith('for')) {
          result.push({
            line: i + 1,
            level: 2,
            text: `${cFuncMatch[2]}()`,
            kind: 'function',
          });
          continue;
        }
      }

      // 4. JS / TS (function, class, const xxx = () =>)
      if (syntaxName === 'JavaScript/TypeScript') {
        const jsFuncMatch = trimmed.match(/^(export\s+)?(async\s+)?function\s+([a-zA-Z0-9_]+)/);
        if (jsFuncMatch) {
          result.push({
            line: i + 1,
            level: 1,
            text: `function ${jsFuncMatch[3]}()`,
            kind: 'function',
          });
          continue;
        }
        const jsConstMatch = trimmed.match(/^(export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(\(?[^=]*\)?\s*=>|function)/);
        if (jsConstMatch) {
          result.push({
            line: i + 1,
            level: 1,
            text: `${jsConstMatch[2]}()`,
            kind: 'function',
          });
          continue;
        }
        const jsClassMatch = trimmed.match(/^(export\s+)?class\s+([a-zA-Z0-9_]+)/);
        if (jsClassMatch) {
          result.push({
            line: i + 1,
            level: 1,
            text: `class ${jsClassMatch[2]}`,
            kind: 'class',
          });
          continue;
        }
      }

      // 5. テキスト文書トピック記号 (■, ◆, ●, 【】, 第X章, 1., 1.1)
      const topicMatch = trimmed.match(/^([■◆★●▼▲・]|\d+[\.\．]|\【[^\】]+\】|第[0-9一二三四五六七八九十]+[章節])\s*(.*)$/);
      if (topicMatch) {
        result.push({
          line: i + 1,
          level: 1,
          text: trimmed,
          kind: 'topic',
        });
      }
    }

    return result;
  }, [isOpen, buffer, syntaxName]);

  const filteredItems = useMemo(() => {
    if (!filterText) return items;
    const lower = filterText.toLowerCase();
    return items.filter((item) => item.text.toLowerCase().includes(lower));
  }, [items, filterText]);

  if (!isOpen) return null;

  const handleJump = (item: OutlineItem) => {
    onJumpToLine(item.line);
    onClose();
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '460px', height: '480px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sakura-dialog-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <OutlineIcon size={14} />
            <span>アウトライン解析 ({syntaxName || 'テキスト'})</span>
          </div>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '8px' }}>
          {/* 検索・絞り込みフィルター */}
          <div style={{ marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px' }}>絞り込み:</span>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="見出し・関数名でフィルター..."
              style={{ flexGrow: 1, padding: '3px 6px', border: '1px solid #7f9db9', fontSize: '12px' }}
              autoFocus
            />
          </div>

          {/* 解析結果リストボックス */}
          <div
            style={{
              flexGrow: 1,
              backgroundColor: '#ffffff',
              border: '2px inset #d0d0d0',
              overflowY: 'auto',
              fontFamily: 'Segoe UI, Meiryo, sans-serif',
              fontSize: '12px',
            }}
          >
            {filteredItems.length === 0 ? (
              <div style={{ padding: '16px', color: '#666666', textAlign: 'center' }}>
                アウトライン項目が見つかりませんでした。
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = selectedIdx === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIdx(idx)}
                    onDoubleClick={() => handleJump(item)}
                    style={{
                      padding: '3px 6px',
                      paddingLeft: `${Math.max(6, item.level * 16)}px`,
                      backgroundColor: isSelected ? '#3399ff' : 'transparent',
                      color: isSelected ? '#ffffff' : '#000000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: isSelected ? '#e0f2fe' : '#64748b', fontSize: '10px', minWidth: '34px' }}>
                      {item.line}行:
                    </span>
                    <span style={{ fontWeight: item.level === 1 ? 'bold' : 'normal' }}>
                      {item.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* ボタングループ */}
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              項目数: {filteredItems.length} 件 (ダブルクリックで即時ジャンプ)
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="sakura-dialog-btn primary"
                disabled={selectedIdx === null || !filteredItems[selectedIdx]}
                onClick={() => {
                  if (selectedIdx !== null && filteredItems[selectedIdx]) {
                    handleJump(filteredItems[selectedIdx]);
                  }
                }}
              >
                ジャンプ(J)
              </button>
              <button type="button" className="sakura-dialog-btn" onClick={onClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
