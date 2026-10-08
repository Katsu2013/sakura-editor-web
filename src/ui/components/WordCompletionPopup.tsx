import React, { useEffect, useRef, useState } from 'react';

export interface CompletionCandidate {
  word: string;
  isKeyword: boolean;
}

interface WordCompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (word: string) => void;
  anchorPos: { x: number; y: number };
  prefix: string;
  candidates: CompletionCandidate[];
}

export const WordCompletionPopup: React.FC<WordCompletionPopupProps> = ({
  isOpen,
  onClose,
  onSelect,
  anchorPos,
  prefix,
  candidates,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [prefix, candidates]);

  // キーボード操作
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, candidates.length));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + candidates.length) % Math.max(1, candidates.length));
        return;
      }

      if (e.key === 'PageDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.min(candidates.length - 1, prev + 8));
        return;
      }

      if (e.key === 'PageUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.max(0, prev - 8));
        return;
      }

      if (e.key === 'Enter' || e.key === 'Tab') {
        if (candidates.length > 0 && selectedIndex >= 0 && selectedIndex < candidates.length) {
          e.preventDefault();
          e.stopPropagation();
          onSelect(candidates[selectedIndex].word);
        }
        return;
      }

      // 1〜9 の数字キーで直接選択 (サクラエディタ仕様)
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < candidates.length) {
          e.preventDefault();
          e.stopPropagation();
          onSelect(candidates[idx].word);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, candidates, selectedIndex, onClose, onSelect]);

  // 選択項目が画面外に出たときの自動スクロール
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen || candidates.length === 0) return null;

  // 画面端からはみ出さないよう座標調整
  const top = Math.min(window.innerHeight - 240, Math.max(10, anchorPos.y));
  const left = Math.min(window.innerWidth - 220, Math.max(10, anchorPos.x));

  return (
    <div
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: '210px',
        backgroundColor: '#ffffef',
        border: '2px solid #808080',
        boxShadow: '3px 3px 8px rgba(0,0,0,0.3)',
        zIndex: 9999,
        fontFamily: 'var(--sakura-ui-font)',
        fontSize: '12px',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* タイトルヘッダー */}
      <div
        style={{
          backgroundColor: '#000080',
          color: '#ffffff',
          padding: '2px 5px',
          fontSize: '11px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>単語補完 ({candidates.length}件)</span>
        <span
          onClick={onClose}
          style={{ cursor: 'pointer', padding: '0 2px', fontSize: '10px' }}
        >
          ✕
        </span>
      </div>

      {/* 候補リスト */}
      <div
        ref={listRef}
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          backgroundColor: '#ffffef',
          outline: 'none',
        }}
      >
        {candidates.map((cand, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={`${cand.word}-${idx}`}
              onClick={() => onSelect(cand.word)}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px 6px',
                height: '20px',
                lineHeight: '20px',
                cursor: 'pointer',
                backgroundColor: isSelected ? '#000080' : 'transparent',
                color: isSelected ? '#ffffff' : '#000000',
              }}
            >
              {/* 番号バッジ (1〜9) */}
              <span
                style={{
                  width: '14px',
                  fontSize: '10px',
                  color: isSelected ? '#93c5fd' : '#808080',
                  marginRight: '4px',
                }}
              >
                {idx < 9 ? `${idx + 1}.` : '  '}
              </span>

              {/* 単語テキスト */}
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: cand.isKeyword ? 'bold' : 'normal',
                }}
              >
                {cand.word}
              </span>

              {/* 種類インジケータ */}
              <span
                style={{
                  fontSize: '10px',
                  color: isSelected ? '#cbd5e1' : '#94a3b8',
                  marginLeft: '4px',
                }}
              >
                {cand.isKeyword ? '[予約語]' : '[本文]'}
              </span>
            </div>
          );
        })}
      </div>

      {/* フッター操作ガイド */}
      <div
        style={{
          backgroundColor: '#f0f0f0',
          borderTop: '1px solid #d4d0c8',
          padding: '2px 4px',
          fontSize: '10px',
          color: '#555555',
          textAlign: 'right',
        }}
      >
        Enter/Tab: 決定 | Esc: 取消
      </div>
    </div>
  );
};
