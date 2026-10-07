import React, { useState } from 'react';

interface JumpDialogProps {
  isOpen: boolean;
  totalLines: number;
  currentLine: number;
  onClose: () => void;
  onJump: (line: number) => void;
}

export const JumpDialog: React.FC<JumpDialogProps> = ({
  isOpen,
  totalLines,
  currentLine,
  onClose,
  onJump,
}) => {
  const [lineNumber, setLineNumber] = useState(String(currentLine + 1));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseInt(lineNumber, 10);
    if (!isNaN(l) && l >= 1 && l <= totalLines) {
      onJump(l);
      onClose();
    }
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div className="sakura-dialog-window" onClick={(e) => e.stopPropagation()} style={{ width: '300px' }}>
        <div className="sakura-dialog-titlebar">
          <span>指定行へジャンプ</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <form onSubmit={handleSubmit} className="sakura-dialog-body">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>
              行番号 (1 - {totalLines})(L):
            </label>
            <input
              type="number"
              min={1}
              max={totalLines}
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '4px', border: '1px solid #7f9db9' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button type="submit" className="sakura-dialog-btn primary">
              ジャンプ(J)
            </button>
            <button type="button" className="sakura-dialog-btn" onClick={onClose}>
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
