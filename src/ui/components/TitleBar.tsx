import React from 'react';
import { SakuraAppIcon } from './Icons/SakuraIcons';

interface TitleBarProps {
  title: string;
  isModified?: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ title, isModified }) => {
  const displayTitle = `${title}${isModified ? ' *' : ''} - サクラエディタ32bit 2.4.3.7173`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '28px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d0d0d0',
        padding: '0 4px 0 8px',
        userSelect: 'none',
        fontSize: '12px',
        color: '#000000',
        fontFamily: "'Segoe UI', 'MS UI Gothic', sans-serif",
      }}
    >
      {/* 左側: アイコン & タイトル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
        <SakuraAppIcon size={16} />
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '12px',
          }}
        >
          {displayTitle}
        </span>
      </div>

      {/* 右側: 最小化 / 最大化 / 閉じる ボタン */}
      <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
        <button
          title="最小化"
          style={{
            width: '42px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: '#333333',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e5e5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          ─
        </button>
        <button
          title="最大化"
          style={{
            width: '42px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            color: '#333333',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e5e5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          □
        </button>
        <button
          title="閉じる"
          style={{
            width: '42px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#333333',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e81123';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#333333';
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
