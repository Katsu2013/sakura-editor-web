import React, { useState, useEffect, useRef } from 'react';

export interface MenuAction {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  icon?: string | React.ReactNode;
  checked?: boolean;
  children?: MenuAction[];
  action?: () => void;
}

export interface MenuGroup {
  title: string;
  accessKey: string;
  items: MenuAction[];
}

interface MenuBarProps {
  groups: MenuGroup[];
}

interface DropdownItemProps {
  item: MenuAction;
  onItemClick: (action?: () => void) => void;
}

const MenuItemRow: React.FC<DropdownItemProps> = ({ item, onItemClick }) => {
  const [isSubOpen, setIsSubOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  if (item.separator) {
    return <div className="sakura-dropdown-separator" />;
  }

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      ref={rowRef}
      className={`sakura-dropdown-item ${item.disabled ? 'disabled' : ''}`}
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsSubOpen(true)}
      onMouseLeave={() => setIsSubOpen(false)}
      onClick={(e) => {
        if (hasChildren) {
          e.stopPropagation();
          return;
        }
        if (!item.disabled && item.action) {
          onItemClick(item.action);
        }
      }}
    >
      {/* アイコンまたはチェックマーク */}
      <div style={{ width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '6px' }}>
        {item.checked ? (
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'inherit' }}>✓</span>
        ) : typeof item.icon === 'string' ? (
          <span style={{ fontSize: '13px' }}>{item.icon}</span>
        ) : (
          item.icon || null
        )}
      </div>

      {/* ラベル */}
      <span style={{ flexGrow: 1, whiteSpace: 'nowrap' }}>{item.label}</span>

      {/* ショートカット or サブメニュー矢印 */}
      {hasChildren ? (
        <span style={{ marginLeft: '16px', fontSize: '9px', color: 'inherit', opacity: 0.75 }}>▶</span>
      ) : item.shortcut ? (
        <span style={{ color: 'inherit', opacity: 0.7, marginLeft: '24px', fontSize: '11px', whiteSpace: 'nowrap' }}>
          {item.shortcut}
        </span>
      ) : null}

      {/* サブメニュー */}
      {hasChildren && isSubOpen && (
        <div
          className="sakura-dropdown"
          style={{
            position: 'absolute',
            top: -2,
            left: '100%',
            minWidth: '200px',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.25)',
            zIndex: 300,
          }}
        >
          {item.children!.map((child, cIdx) => (
            <MenuItemRow key={child.id || cIdx} item={child} onItemClick={onItemClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export const MenuBar: React.FC<MenuBarProps> = ({ groups }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (action?: () => void) => {
    if (action) action();
    setOpenIndex(null);
  };

  return (
    <div className="sakura-menu-bar" ref={menuBarRef}>
      {groups.map((group, idx) => (
        <div key={group.title} style={{ position: 'relative' }}>
          <div
            className={`sakura-menu-item ${openIndex === idx ? 'active' : ''}`}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            onMouseEnter={() => {
              if (openIndex !== null) setOpenIndex(idx);
            }}
          >
            {group.title}(<u>{group.accessKey}</u>)
          </div>

          {openIndex === idx && (
            <div className="sakura-dropdown" style={{ minWidth: '220px' }}>
              {group.items.map((item, itemIdx) => (
                <MenuItemRow
                  key={item.id || itemIdx}
                  item={item}
                  onItemClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
