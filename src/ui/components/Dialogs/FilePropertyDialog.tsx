import React from 'react';
import type { TextBuffer } from '../../../core/buffer/TextBuffer';
import { PropertyIcon } from '../Icons/SakuraIcons';

interface FilePropertyDialogProps {
  isOpen: boolean;
  title: string;
  encoding: string;
  lineEnding: string;
  buffer: TextBuffer;
  onClose: () => void;
}

export const FilePropertyDialog: React.FC<FilePropertyDialogProps> = ({
  isOpen,
  title,
  encoding,
  lineEnding,
  buffer,
  onClose,
}) => {
  if (!isOpen) return null;

  const lineCount = buffer.getLineCount();
  const rawChars = buffer.getRawCharacterCount();
  const text = buffer.getText();
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const byteSize = new Blob([text]).size;

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '420px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sakura-dialog-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <PropertyIcon size={14} />
            <span>ファイルのプロパティ</span>
          </div>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '12px' }}>
          {/* Win32 グループボックス 1: 文書情報 */}
          <fieldset style={{ border: '1px solid #7f9db9', padding: '8px 12px', marginBottom: '12px' }}>
            <legend style={{ fontSize: '12px', padding: '0 4px', color: '#1e3a8a' }}>全般</legend>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#475569', width: '110px', padding: '3px 0' }}>ファイル名:</td>
                  <td style={{ fontWeight: 'bold' }}>{title}</td>
                </tr>
                <tr>
                  <td style={{ color: '#475569', padding: '3px 0' }}>文字コード:</td>
                  <td>{encoding}</td>
                </tr>
                <tr>
                  <td style={{ color: '#475569', padding: '3px 0' }}>改行コード:</td>
                  <td>{lineEnding}</td>
                </tr>
                <tr>
                  <td style={{ color: '#475569', padding: '3px 0' }}>ファイルサイズ:</td>
                  <td>{byteSize.toLocaleString()} バイト ({(byteSize / 1024).toFixed(2)} KB)</td>
                </tr>
              </tbody>
            </table>
          </fieldset>

          {/* Win32 グループボックス 2: カウント情報 */}
          <fieldset style={{ border: '1px solid #7f9db9', padding: '8px 12px', marginBottom: '14px' }}>
            <legend style={{ fontSize: '12px', padding: '0 4px', color: '#1e3a8a' }}>テキスト統計</legend>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ color: '#475569', width: '110px', padding: '3px 0' }}>総行数:</td>
                  <td>{lineCount.toLocaleString()} 行</td>
                </tr>
                <tr>
                  <td style={{ color: '#475569', padding: '3px 0' }}>文字数 (空白含む):</td>
                  <td>{rawChars.toLocaleString()} 文字</td>
                </tr>
                <tr>
                  <td style={{ color: '#475569', padding: '3px 0' }}>文字数 (空白除く):</td>
                  <td>{charsNoSpaces.toLocaleString()} 文字</td>
                </tr>
              </tbody>
            </table>
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="sakura-dialog-btn primary" onClick={onClose} autoFocus>
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
