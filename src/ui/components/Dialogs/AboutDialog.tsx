import React from 'react';

interface AboutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div className="sakura-dialog-window" onClick={(e) => e.stopPropagation()} style={{ width: '400px' }}>
        <div className="sakura-dialog-titlebar">
          <span>サクラエディタ Web SPA について</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🌸</div>
          <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
            サクラエディタ for Web (SPA Clone)
          </div>
          <div style={{ color: '#555555', marginBottom: '12px' }}>
            Version 2.4.2 (Web Edition)
          </div>

          <div
            style={{
              textAlign: 'left',
              fontSize: '11px',
              color: '#333333',
              border: '1px solid #d0d0d0',
              padding: '8px',
              background: '#ffffff',
              marginBottom: '14px',
              lineHeight: '1.5',
            }}
          >
            <div>・高速 Canvas 仮想スクロール描画エンジン</div>
            <div>・日本語文字コード (Shift_JIS, EUC-JP, UTF-8) 相互変換</div>
            <div>・全角空白 (□)、タブ (─→)、改行記号 (↵/↓)、[EOF] 記号の忠実再現</div>
            <div>・Alt+ドラッグによる矩形選択・矩形編集対応</div>
            <div>・File System Access API による直接ファイル保存 & Grep検索</div>
          </div>

          <button className="sakura-dialog-btn primary" onClick={onClose} style={{ minWidth: '90px' }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
