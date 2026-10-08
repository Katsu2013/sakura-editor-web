import React, { useRef, useEffect } from 'react';
import type { TextBuffer } from '../../core/buffer/TextBuffer';
import type { Position } from '../../core/buffer/types';

interface MiniMapPanelProps {
  buffer: TextBuffer;
  cursor: Position;
  onNavigate: (line: number) => void;
}

export const MiniMapPanel: React.FC<MiniMapPanelProps> = ({
  buffer,
  cursor,
  onNavigate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalLines = buffer.getLineCount();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 背景描画
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // 行描画 (縮小表示)
    const lineHeight = Math.max(1, Math.min(3, height / Math.max(totalLines, 1)));
    const maxVisibleLines = Math.floor(height / lineHeight);
    const step = Math.max(1, Math.ceil(totalLines / maxVisibleLines));

    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < totalLines; i += step) {
      const line = buffer.getLine(i);
      if (!line || !line.trim()) continue;

      const y = (i / totalLines) * height;
      const lineWidth = Math.min(width - 8, Math.max(4, line.length * 1.2));
      ctx.fillRect(4, y, lineWidth, Math.max(1, lineHeight - 0.5));
    }

    // カーソル位置インジケーター (赤いライン + 半透明ボックス)
    const cursorY = (cursor.line / Math.max(totalLines, 1)) * height;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fillRect(0, Math.max(0, cursorY - 12), width, 24);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, Math.max(0, cursorY - 12), width, 24);

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(0, cursorY, width, 1.5);
  }, [buffer, cursor, totalLines]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const targetLine = Math.floor((clickY / rect.height) * totalLines);
    onNavigate(Math.max(0, Math.min(totalLines - 1, targetLine)));
  };

  return (
    <div
      style={{
        width: '64px',
        borderLeft: '1px solid #cbd5e1',
        backgroundColor: '#f8fafc',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        width={64}
        height={600}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          display: 'block',
        }}
      />
    </div>
  );
};
