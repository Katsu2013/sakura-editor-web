import React, { useState } from 'react';

interface FontDialogProps {
  isOpen: boolean;
  currentFontFamily: string;
  currentFontSize: number;
  onClose: () => void;
  onApply: (fontFamily: string, fontSize: number) => void;
}

const FONT_FAMILIES = [
  { name: 'ＭＳ ゴシック', value: '"MS Gothic", "ＭＳ ゴシック", monospace' },
  { name: 'ＭＳ 明朝', value: '"MS Mincho", "ＭＳ 明朝", serif' },
  { name: 'MS UI Gothic', value: '"MS UI Gothic", sans-serif' },
  { name: 'メイリオ', value: '"Meiryo", "メイリオ", sans-serif' },
  { name: 'Meiryo UI', value: '"Meiryo UI", sans-serif' },
  { name: '游ゴシック', value: '"Yu Gothic", "游ゴシック", sans-serif' },
  { name: '游明朝', value: '"Yu Mincho", "游明朝", serif' },
  { name: 'Consolas', value: 'Consolas, monospace' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Cascadia Code', value: '"Cascadia Code", monospace' },
];

const FONT_STYLES = ['標準', '太字', '斜体', '太字 斜体'];

const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36];

export const FontDialog: React.FC<FontDialogProps> = ({
  isOpen,
  currentFontFamily,
  currentFontSize,
  onClose,
  onApply,
}) => {
  const initialFont = FONT_FAMILIES.find((f) => f.value === currentFontFamily) || FONT_FAMILIES[0];
  const [selectedFont, setSelectedFont] = useState(initialFont);
  const [selectedStyle, setSelectedStyle] = useState('標準');
  const [selectedSize, setSelectedSize] = useState(currentFontSize || 13);

  if (!isOpen) return null;

  const handleOk = () => {
    onApply(selectedFont.value, selectedSize);
    onClose();
  };

  const isBold = selectedStyle.includes('太字');
  const isItalic = selectedStyle.includes('斜体');

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px', userSelect: 'none' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>フォント</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 3列レイアウト: フォント名, スタイル, サイズ */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* フォント名 */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px' }}>フォント名(F):</label>
              <input
                type="text"
                value={selectedFont.name}
                readOnly
                style={{ height: '22px', padding: '2px 4px', fontSize: '12px', border: '1px solid #7f9db9' }}
              />
              <div
                style={{
                  height: '130px',
                  border: '1px solid #7f9db9',
                  background: '#ffffff',
                  overflowY: 'auto',
                  fontSize: '12px',
                }}
              >
                {FONT_FAMILIES.map((font) => (
                  <div
                    key={font.name}
                    onClick={() => setSelectedFont(font)}
                    style={{
                      padding: '2px 6px',
                      cursor: 'pointer',
                      background: selectedFont.name === font.name ? '#3399ff' : 'transparent',
                      color: selectedFont.name === font.name ? '#ffffff' : '#000000',
                    }}
                  >
                    {font.name}
                  </div>
                ))}
              </div>
            </div>

            {/* スタイル */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px' }}>スタイル(Y):</label>
              <input
                type="text"
                value={selectedStyle}
                readOnly
                style={{ height: '22px', padding: '2px 4px', fontSize: '12px', border: '1px solid #7f9db9' }}
              />
              <div
                style={{
                  height: '130px',
                  border: '1px solid #7f9db9',
                  background: '#ffffff',
                  overflowY: 'auto',
                  fontSize: '12px',
                }}
              >
                {FONT_STYLES.map((style) => (
                  <div
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    style={{
                      padding: '2px 6px',
                      cursor: 'pointer',
                      background: selectedStyle === style ? '#3399ff' : 'transparent',
                      color: selectedStyle === style ? '#ffffff' : '#000000',
                    }}
                  >
                    {style}
                  </div>
                ))}
              </div>
            </div>

            {/* サイズ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px' }}>サイズ(S):</label>
              <input
                type="text"
                value={selectedSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) setSelectedSize(val);
                }}
                style={{ height: '22px', padding: '2px 4px', fontSize: '12px', border: '1px solid #7f9db9' }}
              />
              <div
                style={{
                  height: '130px',
                  border: '1px solid #7f9db9',
                  background: '#ffffff',
                  overflowY: 'auto',
                  fontSize: '12px',
                }}
              >
                {FONT_SIZES.map((size) => (
                  <div
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '2px 6px',
                      cursor: 'pointer',
                      background: selectedSize === size ? '#3399ff' : 'transparent',
                      color: selectedSize === size ? '#ffffff' : '#000000',
                    }}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サンプル領域 */}
          <fieldset style={{ border: '1px solid #999999', borderRadius: '3px', padding: '8px 12px', margin: 0 }}>
            <legend style={{ fontSize: '11px', padding: '0 4px', color: '#333333' }}>サンプル</legend>
            <div
              style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffef',
                border: '1px solid #d0d0d0',
                fontFamily: selectedFont.value,
                fontSize: `${Math.min(24, Math.max(10, selectedSize))}px`,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                color: '#000000',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              AaBbYyZz 日本語 12345
            </div>
          </fieldset>

          {/* 文字セット */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '11px' }}>文字セット(R):</label>
            <select
              style={{ padding: '2px 6px', fontSize: '12px', flexGrow: 1, border: '1px solid #7f9db9' }}
              defaultValue="japanese"
            >
              <option value="japanese">日本語</option>
              <option value="ansi">欧文 (ANSI)</option>
              <option value="unicode">Unicode</option>
            </select>
          </div>

          {/* ボタン */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button className="sakura-dialog-btn primary" onClick={handleOk} style={{ minWidth: '75px' }}>
              OK
            </button>
            <button className="sakura-dialog-btn" onClick={onClose} style={{ minWidth: '75px' }}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
