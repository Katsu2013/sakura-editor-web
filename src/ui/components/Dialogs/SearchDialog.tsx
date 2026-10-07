import React, { useState } from 'react';
import type { SearchOptions } from '../../../core/search/SearchEngine';

interface SearchDialogProps {
  isOpen: boolean;
  isReplaceMode: boolean;
  onClose: () => void;
  onFindNext: (options: SearchOptions) => void;
  onFindPrevious: (options: SearchOptions) => void;
  onReplace: (options: SearchOptions, replaceText: string) => void;
  onReplaceAll: (options: SearchOptions, replaceText: string) => void;
  onMarkAll?: (options: SearchOptions) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  isOpen,
  isReplaceMode,
  onClose,
  onFindNext,
  onFindPrevious,
  onReplace,
  onReplaceAll,
  onMarkAll,
}) => {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);

  if (!isOpen) return null;

  const currentOptions: SearchOptions = {
    query,
    matchCase,
    matchWholeWord,
    isRegex,
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div className="sakura-dialog-window" onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
        <div className="sakura-dialog-titlebar">
          <span>{isReplaceMode ? '置換' : '検索'}</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '10px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '90px', fontSize: '12px' }}>条件(N):</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{ flexGrow: 1, padding: '3px 6px', border: '1px solid #7f9db9', fontSize: '12px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onFindNext(currentOptions);
                }
              }}
            />
          </div>

          {isReplaceMode && (
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '90px', fontSize: '12px' }}>置換後(P):</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                style={{ flexGrow: 1, padding: '3px 6px', border: '1px solid #7f9db9', fontSize: '12px' }}
              />
            </div>
          )}

          <fieldset style={{ margin: '8px 0', padding: '8px 10px', border: '1px solid #d0d0d0', fontSize: '12px' }}>
            <legend style={{ color: '#1e3a8a' }}>オプション</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                />
                <span style={{ marginLeft: '4px' }}>大文字/小文字区別(C)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={matchWholeWord}
                  onChange={(e) => setMatchWholeWord(e.target.checked)}
                />
                <span style={{ marginLeft: '4px' }}>単語単位で探す(W)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={isRegex}
                  onChange={(e) => setIsRegex(e.target.checked)}
                />
                <span style={{ marginLeft: '4px' }}>正規表現(E)</span>
              </label>
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            <button
              type="button"
              className="sakura-dialog-btn primary"
              onClick={() => onFindNext(currentOptions)}
            >
              次を検索(D)
            </button>
            <button
              type="button"
              className="sakura-dialog-btn"
              onClick={() => onFindPrevious(currentOptions)}
            >
              前を検索(U)
            </button>
            {onMarkAll && (
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={() => onMarkAll(currentOptions)}
                title="該当行すべてにブックマークを設定"
              >
                該当行マーク(M)
              </button>
            )}
            {isReplaceMode && (
              <>
                <button
                  type="button"
                  className="sakura-dialog-btn"
                  onClick={() => onReplace(currentOptions, replaceText)}
                >
                  置換(R)
                </button>
                <button
                  type="button"
                  className="sakura-dialog-btn"
                  onClick={() => onReplaceAll(currentOptions, replaceText)}
                >
                  全置換(A)
                </button>
              </>
            )}
            <button type="button" className="sakura-dialog-btn" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
