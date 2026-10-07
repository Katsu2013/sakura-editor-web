import React, { useState, useEffect } from 'react';

export interface FunctionKeyItem {
  keyNum: number; // 1..12
  label: string;
  command: string;
}

export interface FunctionKeyBarProps {
  onExecuteCommand: (command: string) => void;
  position?: 'top' | 'bottom';
}

const DEFAULT_F_KEYS: Record<number, { label: string; cmd: string }> = {
  1: { label: 'ヘルプ', cmd: 'about' },
  2: { label: '次マーク', cmd: 'bm-next' },
  3: { label: '次検索', cmd: 'find-next' },
  4: { label: '置換', cmd: 'replace' },
  5: { label: '再描画', cmd: 'redraw' },
  6: { label: '小文字', cmd: 'to-lower' },
  7: { label: '切り取り', cmd: 'cut' },
  8: { label: 'コピー', cmd: 'copy' },
  9: { label: '貼り付け', cmd: 'paste' },
  10: { label: '半角カタ', cmd: 'to-half-kana' },
  11: { label: 'マーク', cmd: 'bm-toggle' },
  12: { label: 'タグジャンプ', cmd: 'tag-jump' },
};

const SHIFT_F_KEYS: Record<number, { label: string; cmd: string }> = {
  1: { label: '目次', cmd: 'help-index' },
  2: { label: '前マーク', cmd: 'bm-prev' },
  3: { label: '前検索', cmd: 'find-prev' },
  4: { label: '再変換', cmd: 'reconvert' },
  5: { label: '空白→TAB', cmd: 'space-to-tab' },
  6: { label: '大文字', cmd: 'to-upper' },
  7: { label: '前差分', cmd: 'diff-prev' },
  8: { label: 'CRLFコピー', cmd: 'copy-crlf' },
  9: { label: '矩形貼付', cmd: 'box-paste' },
  10: { label: '全角ひら', cmd: 'to-full-hira' },
  11: { label: '全解除', cmd: 'bm-clear' },
  12: { label: 'タグバック', cmd: 'tag-jump-back' },
};

const CTRL_F_KEYS: Record<number, { label: string; cmd: string }> = {
  1: { label: '単語補完', cmd: 'word-complete' },
  2: { label: '行頭移動', cmd: 'mv-head' },
  3: { label: 'マーク切替', cmd: 'toggle-search-mark' },
  4: { label: '閉じる', cmd: 'close' },
  5: { label: 'TAB→空白', cmd: 'tab-to-space' },
  6: { label: '小文字', cmd: 'to-lower' },
  7: { label: '大文字', cmd: 'to-upper' },
  8: { label: '全角→半角', cmd: 'to-half' },
  9: { label: '半角→全角', cmd: 'to-kana' },
  10: { label: '全ひら', cmd: 'to-hira' },
  11: { label: '全カタ', cmd: 'to-full-kana' },
  12: { label: '全ひら', cmd: 'to-full-hira' },
};

export const FunctionKeyBar: React.FC<FunctionKeyBarProps> = ({
  onExecuteCommand,
  position = 'bottom',
}) => {
  const [isShift, setIsShift] = useState(false);
  const [isCtrl, setIsCtrl] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShift(true);
      if (e.key === 'Control') setIsCtrl(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShift(false);
      if (e.key === 'Control') setIsCtrl(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const getDef = (fNum: number) => {
    if (isShift) return SHIFT_F_KEYS[fNum] || DEFAULT_F_KEYS[fNum];
    if (isCtrl) return CTRL_F_KEYS[fNum] || DEFAULT_F_KEYS[fNum];
    return DEFAULT_F_KEYS[fNum];
  };

  const isTop = position === 'top';

  return (
    <div
      className="sakura-function-key-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#f0f0f0',
        borderTop: isTop ? 'none' : '1px solid #c0c0c0',
        borderBottom: isTop ? '1px solid #c0c0c0' : 'none',
        height: '24px',
        padding: '1px 2px',
        gap: '2px',
        userSelect: 'none',
        boxSizing: 'border-box',
        overflowX: 'auto',
      }}
    >
      {Array.from({ length: 12 }, (_, i) => i + 1).map((fNum) => {
        const def = getDef(fNum);
        const prefix = isShift ? 'S+' : isCtrl ? 'C+' : '';
        return (
          <button
            key={fNum}
            className="sakura-fn-btn"
            style={{
              flex: '1 1 0',
              minWidth: '58px',
              height: '20px',
              padding: '0 2px',
              fontSize: '11px',
              fontFamily: '"MS UI Gothic", "Segoe UI", sans-serif',
              background: '#e8e8e8',
              border: '1px solid #b0b0b0',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: '#222222',
            }}
            onClick={() => onExecuteCommand(def.cmd)}
            title={`${prefix}F${fNum}: ${def.label}`}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#dcebf8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#e8e8e8')}
            onMouseDown={(e) => (e.currentTarget.style.background = '#b8d6f0')}
            onMouseUp={(e) => (e.currentTarget.style.background = '#dcebf8')}
          >
            <span style={{ fontWeight: 'bold', color: '#003399', marginRight: '3px', fontSize: '10px' }}>
              {prefix}F{fNum}
            </span>
            <span style={{ fontSize: '11px' }}>{def.label}</span>
          </button>
        );
      })}
    </div>
  );
};
