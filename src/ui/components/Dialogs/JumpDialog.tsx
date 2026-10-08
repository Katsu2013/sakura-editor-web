import React, { useState, useEffect } from 'react';

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
  const [lineNumber, setLineNumber] = useState<string>(String(currentLine + 1));
  const [isCRLFLine, setIsCRLFLine] = useState<boolean>(true); // 改行単位 vs 折り返し単位
  const [enablePLSQL, setEnablePLSQL] = useState<boolean>(false);
  const [plsqlBaseLine, setPlsqlBaseLine] = useState<number>(1);
  const [selectedPlsqlBlock, setSelectedPlsqlBlock] = useState<string>('1');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLineNumber(String(currentLine + 1));
      setIsHelpOpen(false);
    }
  }, [isOpen, currentLine]);

  if (!isOpen) return null;

  const handleSpinLine = (delta: number) => {
    const currentVal = parseInt(lineNumber, 10) || 1;
    const nextVal = Math.min(Math.max(1, currentVal + delta), totalLines);
    setLineNumber(String(nextVal));
  };

  const handleSpinPlsql = (delta: number) => {
    setPlsqlBaseLine((prev) => Math.min(Math.max(1, prev + delta), totalLines));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const l = parseInt(lineNumber, 10);
    if (isNaN(l) || l < 1) {
      alert('有効な行番号を入力してください。');
      return;
    }

    let targetLine = l;
    if (enablePLSQL) {
      // PL/SQL コンパイルエラー行の計算: (ブロック開始行 - 1) + エラー行番号
      targetLine = Math.max(1, (plsqlBaseLine - 1) + l);
    }

    const clamped = Math.min(Math.max(1, targetLine), totalLines);
    onJump(clamped);
    onClose();
  };

  const plsqlBlocks = [
    { label: '先頭ブロック (1行目)', line: 1 },
    { label: 'PACKAGE BODY (自動検出例: 10行目)', line: 10 },
    { label: 'PROCEDURE / FUNCTION (自動検出例: 25行目)', line: 25 },
  ];

  return (
    <div className="sakura-dialog-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          fontFamily: 'var(--sakura-ui-font)',
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>指定行へジャンプ</span>
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

        <form
          onSubmit={handleSubmit}
          className="sakura-dialog-body"
          style={{ padding: '10px 12px', flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          {/* 上部・左右2ペイン構成: 左側入力フォーム、右側ボタン群 (Win32 IDD_JUMP 忠実再現) */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* 左側コンテンツ */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* 行番号 & 単位選択ラジオ */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                <label style={{ lineHeight: '22px', flexShrink: 0 }}>行番号(N):</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="number"
                    min={1}
                    max={totalLines}
                    value={lineNumber}
                    onChange={(e) => setLineNumber(e.target.value)}
                    autoFocus
                    style={{
                      width: '65px',
                      height: '20px',
                      padding: '2px 4px',
                      border: '1px solid #7f9db9',
                      textAlign: 'right',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1px' }}>
                    <button
                      type="button"
                      onClick={() => handleSpinLine(1)}
                      style={{
                        height: '10px',
                        width: '14px',
                        fontSize: '7px',
                        lineHeight: '8px',
                        padding: 0,
                        border: '1px solid #7f9db9',
                        background: '#ece9d8',
                        cursor: 'pointer',
                      }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSpinLine(-1)}
                      style={{
                        height: '10px',
                        width: '14px',
                        fontSize: '7px',
                        lineHeight: '8px',
                        padding: 0,
                        border: '1px solid #7f9db9',
                        borderTop: 'none',
                        background: '#ece9d8',
                        cursor: 'pointer',
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {/* 改行単位 / 折り返し単位 ラジオボタン */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="lineUnit"
                      checked={!isCRLFLine}
                      disabled={enablePLSQL}
                      onChange={() => setIsCRLFLine(false)}
                    />
                    折り返し単位の行番号(R)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="lineUnit"
                      checked={isCRLFLine}
                      disabled={enablePLSQL}
                      onChange={() => setIsCRLFLine(true)}
                    />
                    改行単位の行番号(W)
                  </label>
                </div>
              </div>

              {/* PL/SQL コンパイルエラー行 グループボックス */}
              <fieldset
                className="win32-groupbox"
                style={{
                  padding: '8px',
                  marginBottom: '6px',
                  boxSizing: 'border-box',
                }}
              >
                <legend>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={enablePLSQL}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEnablePLSQL(checked);
                        if (checked) setIsCRLFLine(true);
                      }}
                    />
                    PL/SQLコンパイルエラー行を処理する(P)
                  </label>
                </legend>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    opacity: enablePLSQL ? 1 : 0.55,
                    pointerEvents: enablePLSQL ? 'auto' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px' }}>テキストの</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="number"
                        min={1}
                        max={totalLines}
                        value={plsqlBaseLine}
                        disabled={!enablePLSQL}
                        onChange={(e) => setPlsqlBaseLine(parseInt(e.target.value, 10) || 1)}
                        style={{
                          width: '50px',
                          height: '20px',
                          padding: '2px 4px',
                          border: '1px solid #7f9db9',
                          textAlign: 'right',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1px' }}>
                        <button
                          type="button"
                          onClick={() => handleSpinPlsql(1)}
                          disabled={!enablePLSQL}
                          style={{
                            height: '10px',
                            width: '14px',
                            fontSize: '7px',
                            lineHeight: '8px',
                            padding: 0,
                            border: '1px solid #7f9db9',
                            background: '#ece9d8',
                            cursor: 'pointer',
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSpinPlsql(-1)}
                          disabled={!enablePLSQL}
                          style={{
                            height: '10px',
                            width: '14px',
                            fontSize: '7px',
                            lineHeight: '8px',
                            padding: 0,
                            border: '1px solid #7f9db9',
                            borderTop: 'none',
                            background: '#ece9d8',
                            cursor: 'pointer',
                          }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px' }}>行目をブロックの1行目とする</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '11px' }}>検出されたPL/SQLパッケージのブロックから選択(S):</label>
                    <select
                      value={selectedPlsqlBlock}
                      disabled={!enablePLSQL}
                      onChange={(e) => {
                        setSelectedPlsqlBlock(e.target.value);
                        setPlsqlBaseLine(parseInt(e.target.value, 10));
                      }}
                      style={{
                        padding: '2px 4px',
                        border: '1px solid #7f9db9',
                        backgroundColor: '#ffffff',
                        fontSize: '11px',
                        width: '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {plsqlBlocks.map((b) => (
                        <option key={b.line} value={b.line}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>
            </div>

            {/* 右側ボタンスタック (IDD_JUMP 準拠) */}
            <div style={{ width: '90px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="submit"
                className="sakura-dialog-btn primary"
                style={{ width: '100%', fontWeight: 'bold' }}
              >
                ジャンプ(J)
              </button>
              <button
                type="button"
                className="sakura-dialog-btn"
                style={{ width: '100%' }}
                onClick={onClose}
              >
                キャンセル(X)
              </button>
              <button
                type="button"
                className="sakura-dialog-btn"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => setIsHelpOpen((prev) => !prev)}
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
              <b>【指定行へジャンプ ヘルプ】</b><br />
              ・<b>行番号</b>: 移動したい行番号（1〜{totalLines}）を指定します。<br />
              ・<b>折り返し単位 / 改行単位</b>: 画面上で折り返された視覚的行を基準にするか、物理的な改行コードを基準にするか選択できます。<br />
              ・<b>PL/SQLコンパイルエラー行</b>: Oracle等のコンパイルエラー行番号を、指定したパッケージ定義の開始行から相対オフセットしてジャンプします。
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
