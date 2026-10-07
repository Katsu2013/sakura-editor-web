import React, { useState } from 'react';

interface ExternalToolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (command: string) => void;
}

export const ExternalToolDialog: React.FC<ExternalToolDialogProps> = ({
  isOpen,
  onClose,
  onExecute,
}) => {
  const [command, setCommand] = useState('');
  const [outputConsole, setOutputConsole] = useState('');

  if (!isOpen) return null;

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    try {
      // 安全なコンソール/JS式実行またはシェルコマンドシミュレーション
      let result = '';
      if (command.startsWith('echo ')) {
        result = command.slice(5);
      } else if (command === 'date' || command === 'time') {
        result = new Date().toLocaleString('ja-JP');
      } else {
        // 式の計算評価 (例: 123 * 456, JSON.stringify, etc.)
        const evalResult = new Function(`return (${command})`)();
        result = typeof evalResult === 'object' ? JSON.stringify(evalResult, null, 2) : String(evalResult);
      }
      setOutputConsole(`> ${command}\n${result}\n`);
      onExecute(result);
    } catch (err: any) {
      setOutputConsole(`> ${command}\n[エラー]: ${err.message}\n`);
    }
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px', display: 'flex', flexDirection: 'column' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>外部コマンド実行</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <form onSubmit={handleRun} className="sakura-dialog-body" style={{ padding: '12px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              コマンド / 計算式(&C):
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="例: echo Hello, 256 * 1024, new Date().toISOString()"
              style={{ width: '100%', padding: '4px', border: '1px solid #7f9db9', fontSize: '12px' }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              実行結果 / 標準出力(&O):
            </label>
            <textarea
              readOnly
              value={outputConsole}
              style={{
                width: '100%',
                height: '110px',
                padding: '6px',
                border: '1px solid #7f9db9',
                backgroundColor: '#f8fafc',
                fontFamily: 'Consolas, monospace',
                fontSize: '11px',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="submit" className="sakura-dialog-btn primary">
              実行(&X)
            </button>
            <button type="button" className="sakura-dialog-btn" onClick={onClose}>
              閉じる
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
