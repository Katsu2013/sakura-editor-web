import React, { useState } from 'react';
import { PrintIcon } from '../Icons/SakuraIcons';

interface PageSetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (settings: PageSetupSettings) => void;
}

export interface PageSetupSettings {
  paperSize: string;
  orientation: 'portrait' | 'landscape';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  showLineNumbers: boolean;
  headerText: string;
  footerText: string;
}

export const PageSetupDialog: React.FC<PageSetupDialogProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginTop, setMarginTop] = useState(20);
  const [marginBottom, setMarginBottom] = useState(20);
  const [marginLeft, setMarginLeft] = useState(15);
  const [marginRight, setMarginRight] = useState(15);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [headerText, setHeaderText] = useState('&f');
  const [footerText, setFooterText] = useState('&p / &P ページ');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onApply?.({
      paperSize,
      orientation,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      showLineNumbers,
      headerText,
      footerText,
    });
    onClose();
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sakura-dialog-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PrintIcon size={14} />
            <span>印刷ページ設定</span>
          </div>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <form onSubmit={handleSave} className="sakura-dialog-body" style={{ padding: '12px' }}>
          {/* 用紙・印刷の向き */}
          <fieldset style={{ border: '1px solid #7f9db9', padding: '8px 12px', marginBottom: '10px' }}>
            <legend style={{ fontSize: '12px', padding: '0 4px', color: '#1e3a8a' }}>用紙設定</legend>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px' }}>
                サイズ(Z):
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  style={{ marginLeft: '6px', padding: '2px 6px', border: '1px solid #7f9db9' }}
                >
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="A3">A3 (297 x 420 mm)</option>
                  <option value="B5">B5 (182 x 257 mm)</option>
                  <option value="Letter">Letter (8.5 x 11 in)</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <span>印刷の向き:</span>
                <label>
                  <input
                    type="radio"
                    name="orientation"
                    checked={orientation === 'portrait'}
                    onChange={() => setOrientation('portrait')}
                  />
                  縦(P)
                </label>
                <label>
                  <input
                    type="radio"
                    name="orientation"
                    checked={orientation === 'landscape'}
                    onChange={() => setOrientation('landscape')}
                  />
                  横(L)
                </label>
              </div>
            </div>
          </fieldset>

          {/* 余白設定 */}
          <fieldset style={{ border: '1px solid #7f9db9', padding: '8px 12px', marginBottom: '10px' }}>
            <legend style={{ fontSize: '12px', padding: '0 4px', color: '#1e3a8a' }}>余白 (mm)</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <label>
                上(T):
                <input
                  type="number"
                  value={marginTop}
                  onChange={(e) => setMarginTop(Number(e.target.value))}
                  style={{ width: '60px', marginLeft: '6px', padding: '2px', border: '1px solid #7f9db9' }}
                />
              </label>
              <label>
                下(B):
                <input
                  type="number"
                  value={marginBottom}
                  onChange={(e) => setMarginBottom(Number(e.target.value))}
                  style={{ width: '60px', marginLeft: '6px', padding: '2px', border: '1px solid #7f9db9' }}
                />
              </label>
              <label>
                左(M):
                <input
                  type="number"
                  value={marginLeft}
                  onChange={(e) => setMarginLeft(Number(e.target.value))}
                  style={{ width: '60px', marginLeft: '6px', padding: '2px', border: '1px solid #7f9db9' }}
                />
              </label>
              <label>
                右(R):
                <input
                  type="number"
                  value={marginRight}
                  onChange={(e) => setMarginRight(Number(e.target.value))}
                  style={{ width: '60px', marginLeft: '6px', padding: '2px', border: '1px solid #7f9db9' }}
                />
              </label>
            </div>
          </fieldset>

          {/* ヘッダー・フッター・行番号 */}
          <fieldset style={{ border: '1px solid #7f9db9', padding: '8px 12px', marginBottom: '14px' }}>
            <legend style={{ fontSize: '12px', padding: '0 4px', color: '#1e3a8a' }}>ヘッダー・フッター</legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '80px' }}>ヘッダー:</span>
                <input
                  type="text"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  style={{ flexGrow: 1, padding: '2px 4px', border: '1px solid #7f9db9' }}
                />
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '80px' }}>フッター:</span>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  style={{ flexGrow: 1, padding: '2px 4px', border: '1px solid #7f9db9' }}
                />
              </label>
              <label style={{ marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={showLineNumbers}
                  onChange={(e) => setShowLineNumbers(e.target.checked)}
                />
                行番号を印刷する(N)
              </label>
            </div>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="submit" className="sakura-dialog-btn primary">
              OK
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
