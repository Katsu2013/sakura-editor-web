import React, { useState } from 'react';
import type { CharacterEncoding, LineEnding } from '../../../core/buffer/types';

interface EncodingDialogProps {
  isOpen: boolean;
  currentEncoding: CharacterEncoding;
  currentLineEnding: LineEnding;
  onClose: () => void;
  onApply: (encoding: CharacterEncoding, lineEnding: LineEnding) => void;
}

export const EncodingDialog: React.FC<EncodingDialogProps> = ({
  isOpen,
  currentEncoding,
  currentLineEnding,
  onClose,
  onApply,
}) => {
  const [selectedEncoding, setSelectedEncoding] = useState<CharacterEncoding>(currentEncoding);
  const [selectedLineEnding, setSelectedLineEnding] = useState<LineEnding>(currentLineEnding);

  if (!isOpen) return null;

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div className="sakura-dialog-window" onClick={(e) => e.stopPropagation()} style={{ width: '380px' }}>
        <div className="sakura-dialog-titlebar">
          <span>文字コード・改行コードの指定</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body">
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              文字コード(C):
            </label>
            <select
              value={selectedEncoding}
              onChange={(e) => setSelectedEncoding(e.target.value as CharacterEncoding)}
              style={{ width: '100%', padding: '4px' }}
            >
              <option value="Shift_JIS">Shift_JIS (CP932 / Windows-31J)</option>
              <option value="UTF-8">UTF-8</option>
              <option value="UTF-8-BOM">UTF-8 (BOM付)</option>
              <option value="EUC-JP">EUC-JP</option>
              <option value="ISO-2022-JP">JIS (ISO-2022-JP)</option>
              <option value="UTF-16LE">Unicode (UTF-16LE)</option>
              <option value="UTF-16BE">Unicode (UTF-16BE)</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              改行コード(L):
            </label>
            <select
              value={selectedLineEnding}
              onChange={(e) => setSelectedLineEnding(e.target.value as LineEnding)}
              style={{ width: '100%', padding: '4px' }}
            >
              <option value="CRLF">CRLF (Windows標準 \r\n)</option>
              <option value="LF">LF (Unix / macOS標準 \n)</option>
              <option value="CR">CR (Classic Mac \r)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button
              className="sakura-dialog-btn primary"
              onClick={() => {
                onApply(selectedEncoding, selectedLineEnding);
                onClose();
              }}
            >
              変更適用
            </button>
            <button className="sakura-dialog-btn" onClick={onClose}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
