import React, { useState } from 'react';
import { DiffEngine, type DiffLine } from '../../../core/diff/DiffEngine';

interface DiffDialogProps {
  isOpen: boolean;
  currentTitle: string;
  currentText: string;
  otherTabs: { id: string; title: string; text: string }[];
  onClose: () => void;
  onJumpToLine?: (line: number) => void;
  onApplyDiffMarks?: (marks: Map<number, 'add' | 'del' | 'mod'>) => void;
}

export const DiffDialog: React.FC<DiffDialogProps> = ({
  isOpen,
  currentTitle,
  currentText,
  otherTabs,
  onClose,
  onJumpToLine,
  onApplyDiffMarks,
}) => {
  const [selectedTargetTabId, setSelectedTargetTabId] = useState<string>(
    otherTabs[0]?.id || ''
  );
  const [diffResults, setDiffResults] = useState<DiffLine[] | null>(null);

  if (!isOpen) return null;

  const handleRunDiff = () => {
    const targetDoc = otherTabs.find((t) => t.id === selectedTargetTabId);
    if (!targetDoc) return;
    const result = DiffEngine.computeDiff(currentText, targetDoc.text);
    setDiffResults(result);
  };

  const handleApplyMarks = () => {
    if (!diffResults || !onApplyDiffMarks) return;
    const marks = new Map<number, 'add' | 'del' | 'mod'>();
    diffResults.forEach((dl) => {
      if (dl.lineA !== undefined && dl.lineA > 0) {
        const lineIdx = dl.lineA - 1;
        if (dl.type === 'added') marks.set(lineIdx, 'add');
        else if (dl.type === 'removed') marks.set(lineIdx, 'del');
        else if (dl.type === 'modified') marks.set(lineIdx, 'mod');
      }
    });
    onApplyDiffMarks(marks);
    onClose();
  };

  const targetTitle = otherTabs.find((t) => t.id === selectedTargetTabId)?.title || '比較対象なし';

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '680px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>差分表示 (Diff)</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontWeight: 'bold' }}>比較対象タブ:</label>
            <select
              value={selectedTargetTabId}
              onChange={(e) => setSelectedTargetTabId(e.target.value)}
              style={{ flexGrow: 1, padding: '3px' }}
            >
              {otherTabs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <button className="sakura-dialog-btn primary" onClick={handleRunDiff}>
              比較実行(&C)
            </button>
          </div>

          <div style={{ fontSize: '11px', color: '#555555' }}>
            基準: <strong>{currentTitle}</strong> ↔ 比較先: <strong>{targetTitle}</strong>
          </div>

          {/* 差分ビュー */}
          <div
            style={{
              height: '320px',
              border: '1px solid #999999',
              background: '#ffffff',
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            {diffResults === null ? (
              <div style={{ padding: '16px', color: '#888888', textAlign: 'center' }}>
                比較対象を選択して「比較実行」ボタンをクリックしてください。
              </div>
            ) : (
              diffResults.map((dl, idx) => {
                let bgColor = '#ffffff';
                let sign = '  ';
                let textColor = '#000000';

                if (dl.type === 'added') {
                  bgColor = '#e6ffec';
                  sign = '+ ';
                  textColor = '#008000';
                } else if (dl.type === 'removed') {
                  bgColor = '#ffebe9';
                  sign = '- ';
                  textColor = '#cc0000';
                }

                return (
                  <div
                    key={idx}
                    style={{
                      background: bgColor,
                      color: textColor,
                      padding: '2px 6px',
                      borderBottom: '1px solid #f0f0f0',
                      whiteSpace: 'pre',
                      display: 'flex',
                      cursor: dl.lineA ? 'pointer' : 'default',
                    }}
                    onDoubleClick={() => {
                      if (dl.lineA && onJumpToLine) {
                        onJumpToLine(dl.lineA);
                        onClose();
                      }
                    }}
                    title={dl.lineA ? `${dl.lineA}行目へジャンプ` : undefined}
                  >
                    <span style={{ width: '45px', color: '#888888', flexShrink: 0 }}>
                      {dl.lineA ? `${dl.lineA}:` : '   '}
                    </span>
                    <span style={{ fontWeight: 'bold', width: '20px', flexShrink: 0 }}>{sign}</span>
                    <span style={{ flexGrow: 1 }}>{dl.textA ?? dl.textB ?? ''}</span>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
            {diffResults && (
              <button
                className="sakura-dialog-btn primary"
                onClick={handleApplyMarks}
                style={{ fontWeight: 'bold' }}
              >
                差分マークをエディタに反映(&A)
              </button>
            )}
            <button className="sakura-dialog-btn" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
