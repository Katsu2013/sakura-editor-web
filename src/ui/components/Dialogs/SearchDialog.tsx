import React, { useState, useEffect } from 'react';
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

const SEARCH_HISTORY_KEY = 'sakura_search_history';
const REPLACE_HISTORY_KEY = 'sakura_replace_history';

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
  const [notifyNotFound, setNotifyNotFound] = useState(true);
  const [autoClose, setAutoClose] = useState(false);
  const [searchAll, setSearchAll] = useState(true); // 先頭(末尾)から再検索する
  const [consecutiveReplace, setConsecutiveReplace] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<'selected' | 'head' | 'tail' | 'delete'>('selected');
  const [replaceScope, setReplaceScope] = useState<'file' | 'selection'>('file');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [replaceHistory, setReplaceHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const sh = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (sh) setSearchHistory(JSON.parse(sh));
      const rh = localStorage.getItem(REPLACE_HISTORY_KEY);
      if (rh) setReplaceHistory(JSON.parse(rh));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsHelpOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveHistory = (q: string, r?: string) => {
    if (q) {
      const nextSh = [q, ...searchHistory.filter((item) => item !== q)].slice(0, 20);
      setSearchHistory(nextSh);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(nextSh));
      } catch {
        // ignore
      }
    }
    if (r !== undefined && r !== '') {
      const nextRh = [r, ...replaceHistory.filter((item) => item !== r)].slice(0, 20);
      setReplaceHistory(nextRh);
      try {
        localStorage.setItem(REPLACE_HISTORY_KEY, JSON.stringify(nextRh));
      } catch {
        // ignore
      }
    }
  };

  const currentOptions: SearchOptions = {
    query,
    matchCase,
    matchWholeWord,
    isRegex,
  };

  const handleNext = () => {
    if (!query) return;
    saveHistory(query);
    onFindNext(currentOptions);
    if (autoClose) onClose();
  };

  const handlePrev = () => {
    if (!query) return;
    saveHistory(query);
    onFindPrevious(currentOptions);
    if (autoClose) onClose();
  };

  const handleMark = () => {
    if (!query || !onMarkAll) return;
    saveHistory(query);
    onMarkAll(currentOptions);
    if (autoClose) onClose();
  };

  const handleDoReplace = () => {
    if (!query) return;
    saveHistory(query, replaceText);
    onReplace(currentOptions, replaceText);
    if (autoClose) onClose();
  };

  const handleDoReplaceAll = () => {
    if (!query) return;
    saveHistory(query, replaceText);
    onReplaceAll(currentOptions, replaceText);
    if (autoClose) onClose();
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setReplaceText(text);
      }
    } catch {
      alert('クリップボードの読み取り権限がありませんでした。');
    }
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isReplaceMode ? '520px' : '460px',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          fontFamily: "'MS UI Gothic', 'Segoe UI', sans-serif",
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{isReplaceMode ? '置換' : '検索'}</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span
              style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }}
              title="ヘルプ"
              onClick={() => setIsHelpOpen((prev) => !prev)}
            >
              ?
            </span>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} onClick={onClose}>✕</span>
          </div>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '8px 10px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* メイン 2ペイン レイアウト: 左側入力フォーム & オプション、右側ボタンスタック (Win32 完全準拠) */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* 左側領域 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 条件 / 置換前 */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ width: isReplaceMode ? '55px' : '50px', flexShrink: 0 }}>
                  {isReplaceMode ? '置換前(N):' : '条件(N):'}
                </label>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    list="sakura-search-history-list"
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      border: '1px solid #7f9db9',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNext();
                    }}
                  />
                  <datalist id="sakura-search-history-list">
                    {searchHistory.map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* 置換後 (置換モード時) */}
              {isReplaceMode && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ width: '55px', flexShrink: 0 }}>置換後(P):</label>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      list="sakura-replace-history-list"
                      style={{
                        width: '100%',
                        padding: '2px 4px',
                        border: '1px solid #7f9db9',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDoReplace();
                      }}
                    />
                    <datalist id="sakura-replace-history-list">
                      {replaceHistory.map((item, idx) => (
                        <option key={idx} value={item} />
                      ))}
                    </datalist>
                  </div>
                </div>
              )}

              {/* チェックボックス群 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '11px' }}>
                  {isReplaceMode && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="button"
                        value="貼り付け"
                        onClick={handlePasteClipboard}
                        style={{
                          fontSize: '10px',
                          padding: '1px 3px',
                          border: '1px solid #7f9db9',
                          background: '#ece9d8',
                          cursor: 'pointer',
                        }}
                      />
                      クリップボードから貼り付ける(T)
                    </label>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={matchWholeWord}
                      onChange={(e) => setMatchWholeWord(e.target.checked)}
                    />
                    単語単位で探す(W)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={matchCase}
                      onChange={(e) => setMatchCase(e.target.checked)}
                    />
                    英大文字と小文字を区別する(C)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isRegex}
                      onChange={(e) => setIsRegex(e.target.checked)}
                    />
                    正規表現(E)
                  </label>
                  {isReplaceMode && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={consecutiveReplace}
                        onChange={(e) => setConsecutiveReplace(e.target.checked)}
                      />
                      「すべて置換」は置換の繰返し(I)
                    </label>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={notifyNotFound}
                      onChange={(e) => setNotifyNotFound(e.target.checked)}
                    />
                    見つからないときにメッセージを表示(M)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoClose}
                      onChange={(e) => setAutoClose(e.target.checked)}
                    />
                    検索ダイアログを自動的に閉じる(L)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={searchAll}
                      onChange={(e) => setSearchAll(e.target.checked)}
                    />
                    先頭（末尾）から再検索する(Z)
                  </label>
                </div>

                {/* 置換対象 & 範囲 グループボックス (置換モード時) */}
                {isReplaceMode && (
                  <div style={{ width: '130px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <fieldset className="win32-groupbox" style={{ padding: '4px 6px', fontSize: '11px' }}>
                      <legend>置換対象</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="replaceTarget"
                            checked={replaceTarget === 'selected'}
                            onChange={() => setReplaceTarget('selected')}
                          />
                          選択文字(0)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="replaceTarget"
                            checked={replaceTarget === 'head'}
                            onChange={() => setReplaceTarget('head')}
                          />
                          選択始点(1)挿入
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="replaceTarget"
                            checked={replaceTarget === 'tail'}
                            onChange={() => setReplaceTarget('tail')}
                          />
                          選択終点(2)追加
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="replaceTarget"
                            checked={replaceTarget === 'delete'}
                            onChange={() => setReplaceTarget('delete')}
                          />
                          行削除(3)
                        </label>
                      </div>
                    </fieldset>

                    <fieldset className="win32-groupbox" style={{ padding: '4px 6px', fontSize: '11px' }}>
                      <legend>範囲</legend>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="replaceScope"
                            checked={replaceScope === 'selection'}
                            onChange={() => setReplaceScope('selection')}
                          />
                          選択範囲(S)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="replaceScope"
                            checked={replaceScope === 'file'}
                            onChange={() => setReplaceScope('file')}
                          />
                          ファイル全体(O)
                        </label>
                      </div>
                    </fieldset>
                  </div>
                )}
              </div>
            </div>

            {/* 右側ボタンスタック (Win32 IDD_FIND / IDD_REPLACE 完全準拠) */}
            <div style={{ width: '95px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={handlePrev}
                style={{ width: '100%' }}
              >
                上検索(U)
              </button>
              <button
                type="button"
                className="sakura-dialog-btn primary"
                onClick={handleNext}
                style={{ width: '100%', fontWeight: 'bold' }}
              >
                下検索(D)
              </button>
              {onMarkAll && (
                <button
                  type="button"
                  className="sakura-dialog-btn"
                  onClick={handleMark}
                  style={{ width: '100%' }}
                >
                  該当行マーク(B)
                </button>
              )}
              {isReplaceMode && (
                <>
                  <button
                    type="button"
                    className="sakura-dialog-btn"
                    onClick={handleDoReplace}
                    style={{ width: '100%' }}
                  >
                    置換(R)
                  </button>
                  <button
                    type="button"
                    className="sakura-dialog-btn"
                    onClick={handleDoReplaceAll}
                    style={{ width: '100%' }}
                  >
                    すべて置換(A)
                  </button>
                </>
              )}
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={onClose}
                style={{ width: '100%', marginTop: '6px' }}
              >
                キャンセル(X)
              </button>
              <button
                type="button"
                className="sakura-dialog-btn"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                style={{ width: '100%', marginTop: 'auto' }}
              >
                ヘルプ(H)
              </button>
            </div>
          </div>

          {/* ヘルプモーダル */}
          {isHelpOpen && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: '#ffffef',
                border: '1px solid #d0d090',
                borderRadius: '2px',
                fontSize: '11px',
                lineHeight: '1.5',
              }}
            >
              <b>【{isReplaceMode ? '置換' : '検索'}機能ヘルプ】</b><br />
              ・<b>上検索(U) / 下検索(D)</b>: カーソル位置から文書の前方または後方に向かって検索します。<br />
              ・<b>該当行マーク(B)</b>: 条件に一致する全行にブックマークを設定します。<br />
              ・<b>正規表現(E)</b>: JavaScript正規表現エンジンにより高度なパターン検索・キャプチャ置換に対応します。<br />
              {isReplaceMode && (
                <>
                  ・<b>すべて置換(A)</b>: ファイル全体または選択範囲の一致箇所を一括で置換します。<br />
                  ・<b>クリップボードから貼り付ける(T)</b>: クリップボードのテキストを置換後に入力します。<br />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
