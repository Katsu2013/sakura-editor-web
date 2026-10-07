import React, { useState } from 'react';
import { TextTransform } from '../../../core/transform/TextTransform';

interface NumberingDialogProps {
  isOpen: boolean;
  selectedLineCount: number;
  onClose: () => void;
  onInsert: (sequence: string[]) => void;
}

export const NumberingDialog: React.FC<NumberingDialogProps> = ({
  isOpen,
  selectedLineCount,
  onClose,
  onInsert,
}) => {
  const [startNum, setStartNum] = useState(1);
  const [stepNum, setStepNum] = useState(1);
  const [count, setCount] = useState(Math.max(1, selectedLineCount));
  const [zeroPad, setZeroPad] = useState(0);

  if (!isOpen) return null;

  const handleApply = () => {
    const seq = TextTransform.generateSequence(count, startNum, stepNum, zeroPad);
    onInsert(seq);
    onClose();
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div className="sakura-dialog-window" onClick={(e) => e.stopPropagation()} style={{ width: '340px' }}>
        <div className="sakura-dialog-titlebar">
          <span>連番挿入</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body">
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '8px', marginBottom: '12px' }}>
            <label>初期値(&S):</label>
            <input
              type="number"
              value={startNum}
              onChange={(e) => setStartNum(parseInt(e.target.value, 10) || 1)}
              style={{ padding: '2px 4px' }}
            />

            <label>増分(&I):</label>
            <input
              type="number"
              value={stepNum}
              onChange={(e) => setStepNum(parseInt(e.target.value, 10) || 1)}
              style={{ padding: '2px 4px' }}
            />

            <label>個数(&C):</label>
            <input
              type="number"
              min={1}
              max={10000}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
              style={{ padding: '2px 4px' }}
            />

            <label>桁揃え(0埋め):</label>
            <select
              value={zeroPad}
              onChange={(e) => setZeroPad(parseInt(e.target.value, 10))}
              style={{ padding: '2px 4px' }}
            >
              <option value={0}>揃えない (1, 2, ...)</option>
              <option value={2}>2桁 (01, 02, ...)</option>
              <option value={3}>3桁 (001, 002, ...)</option>
              <option value={4}>4桁 (0001, 0002, ...)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button className="sakura-dialog-btn primary" onClick={handleApply}>
              挿入(&O)
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
