import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void;
}

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  x,
  y,
  items,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 画面端をはみ出さないように調整
  const menuWidth = 190;
  const menuHeight = items.length * 22;
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 4);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 4);

  return (
    <div
      ref={menuRef}
      className="sakura-context-menu"
      style={{
        position: 'fixed',
        top: Math.max(0, adjustedY),
        left: Math.max(0, adjustedX),
        width: `${menuWidth}px`,
        backgroundColor: '#ffffff',
        border: '1px solid #7f9db9',
        boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
        zIndex: 99999,
        padding: '2px',
        fontSize: '12px',
        userSelect: 'none',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, idx) => {
        if (item.separator) {
          return (
            <div
              key={item.id || idx}
              style={{
                height: '1px',
                backgroundColor: '#d0d0d0',
                margin: '3px 2px',
              }}
            />
          );
        }

        return (
          <div
            key={item.id}
            onClick={() => {
              if (!item.disabled && item.action) {
                item.action();
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '3px 8px',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? '#888888' : '#000000',
              backgroundColor: 'transparent',
              borderRadius: '2px',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = '#3399ff';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#000000';
              }
            }}
          >
            {/* アイコン */}
            <div style={{ width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '6px' }}>
              {item.icon || null}
            </div>

            {/* ラベル */}
            <span style={{ flexGrow: 1, whiteSpace: 'nowrap' }}>{item.label}</span>

            {/* ショートカット */}
            {item.shortcut && (
              <span style={{ color: item.disabled ? '#aaaaaa' : '#666666', marginLeft: '12px', fontSize: '11px' }}>
                {item.shortcut}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
