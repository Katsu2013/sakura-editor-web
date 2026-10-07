import React, { useState } from 'react';

interface MacroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (scriptText: string) => void;
  lastRecordedScript: string;
}

export const MacroDialog: React.FC<MacroDialogProps> = ({
  isOpen,
  onClose,
  onExecute,
  lastRecordedScript,
}) => {
  const [script, setScript] = useState(
    lastRecordedScript ||
      `// サクラエディタ マクロ例\nEditor.InsText("【サクラエディタマクロ実行】\\n");\nEditor.BookmarkSet();\nEditor.Down();`
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScript(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'macro.mac';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div className="sakura-dialog-window" onClick={(e) => e.stopPropagation()} style={{ width: '520px' }}>
        <div className="sakura-dialog-titlebar">
          <span>マクロの実行・管理</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontWeight: 'bold' }}>マクロスクリプト (.mac / .js):</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <label className="sakura-dialog-btn" style={{ cursor: 'pointer', textAlign: 'center' }}>
                ファイルを開く...
                <input
                  type="file"
                  accept=".mac,.js,.txt"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
              <button className="sakura-dialog-btn" onClick={handleDownload}>
                保存...
              </button>
            </div>
          </div>

          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            style={{
              width: '100%',
              height: '180px',
              fontFamily: 'monospace',
              fontSize: '12px',
              padding: '6px',
              boxSizing: 'border-box',
              border: '1px solid #7f9db9',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
            <button
              className="sakura-dialog-btn primary"
              onClick={() => {
                onExecute(script);
                onClose();
              }}
            >
              実行(E)
            </button>
            <button className="sakura-dialog-btn" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
