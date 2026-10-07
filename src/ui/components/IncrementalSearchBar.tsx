import React, { useEffect, useRef } from 'react';
import { IncSearchIcon, FindNextIcon, FindPrevIcon, CloseIcon } from './Icons/SakuraIcons';

interface IncrementalSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onChangeQuery: (q: string) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  matchCase: boolean;
  onChangeMatchCase: (val: boolean) => void;
  isRegex: boolean;
  onChangeIsRegex: (val: boolean) => void;
  matchCount?: number;
}

export const IncrementalSearchBar: React.FC<IncrementalSearchBarProps> = ({
  isOpen,
  onClose,
  query,
  onChangeQuery,
  onFindNext,
  onFindPrev,
  matchCase,
  onChangeMatchCase,
  isRegex,
  onChangeIsRegex,
  matchCount = 0,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onFindPrev();
      } else {
        onFindNext();
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '3px 8px',
        backgroundColor: '#ece9d8',
        borderTop: '1px solid #716f64',
        borderBottom: '1px solid #ffffff',
        gap: '8px',
        fontFamily: '"MS UI Gothic", "Meiryo", sans-serif',
        fontSize: '12px',
        userSelect: 'none',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
        <IncSearchIcon size={14} />
        <span>インクリメンタルサーチ:</span>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="検索文字列を入力..."
        style={{
          width: '200px',
          padding: '2px 4px',
          fontSize: '12px',
          border: '1px solid #7f9db9',
          backgroundColor: '#ffffff',
          color: '#000000',
        }}
      />

      <button
        onClick={onFindPrev}
        className="sakura-btn"
        style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '1px 5px' }}
        title="前を検索 (Shift+Enter)"
      >
        <FindPrevIcon size={12} />
        前へ(P)
      </button>

      <button
        onClick={onFindNext}
        className="sakura-btn"
        style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '1px 5px' }}
        title="次を検索 (Enter)"
      >
        <FindNextIcon size={12} />
        次へ(N)
      </button>

      <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontSize: '11px' }}>
        <input
          type="checkbox"
          checked={matchCase}
          onChange={(e) => onChangeMatchCase(e.target.checked)}
        />
        大文字/小文字を区別(C)
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer', fontSize: '11px' }}>
        <input
          type="checkbox"
          checked={isRegex}
          onChange={(e) => onChangeIsRegex(e.target.checked)}
        />
        正規表現(X)
      </label>

      {/* 件数表示 */}
      <div style={{ marginLeft: '6px', fontSize: '11px' }}>
        {query ? (
          matchCount > 0 ? (
            <span style={{ color: '#005500', fontWeight: 'bold' }}>{matchCount} 件見つかりました</span>
          ) : (
            <span style={{ color: '#cc0000', fontWeight: 'bold' }}>見つかりませんでした</span>
          )
        ) : null}
      </div>

      <div style={{ flex: 1 }} />

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          color: '#444444',
        }}
        title="閉じる (Esc)"
      >
        <CloseIcon size={12} />
      </button>
    </div>
  );
};
