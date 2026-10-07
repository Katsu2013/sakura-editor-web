import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { CloseIcon, SaveIcon, CopyIcon } from './Icons/SakuraIcons';

export interface TabItem {
  id: string;
  title: string;
  isModified: boolean;
  filePath?: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCloseOtherTabs?: (keepId: string) => void;
  onCloseAllTabs?: () => void;
  onSaveTab?: (id: string) => void;
  onNewTab: () => void;
  showCloseButton?: boolean;
  showModifiedMarker?: boolean;
  position?: 'top' | 'bottom';
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onSaveTab,
  onNewTab,
  showCloseButton = true,
  showModifiedMarker = true,
  position = 'top',
}) => {
  const [isTabMenuOpen, setIsTabMenuOpen] = useState(false);
  const [tabContextMenu, setTabContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  const contextMenuItems: ContextMenuItem[] = tabContextMenu
    ? [
        {
          id: 'tcm-close',
          label: '閉じる(C)',
          shortcut: 'Ctrl+F4',
          icon: <CloseIcon size={14} />,
          action: () => onCloseTab(tabContextMenu.tabId),
        },
        {
          id: 'tcm-close-other',
          label: '他のタブをすべて閉じる(O)',
          action: () => onCloseOtherTabs?.(tabContextMenu.tabId),
          disabled: tabs.length <= 1,
        },
        {
          id: 'tcm-close-all',
          label: 'すべてのタブを閉じる(A)',
          action: () => onCloseAllTabs?.(),
        },
        { id: 'tcm-sep1', label: '', separator: true },
        {
          id: 'tcm-save',
          label: '上書き保存(S)',
          shortcut: 'Ctrl+S',
          icon: <SaveIcon size={14} />,
          action: () => onSaveTab?.(tabContextMenu.tabId),
        },
        { id: 'tcm-sep2', label: '', separator: true },
        {
          id: 'tcm-copy-name',
          label: 'ファイル名をコピー',
          icon: <CopyIcon size={14} />,
          action: () => {
            const target = tabs.find((t) => t.id === tabContextMenu.tabId);
            if (target) navigator.clipboard.writeText(target.title);
          },
        },
      ]
    : [];

  const isBottom = position === 'bottom';

  return (
    <div
      className="sakura-tabbar"
      style={{
        display: 'flex',
        alignItems: isBottom ? 'flex-start' : 'flex-end',
        justifyContent: 'space-between',
        background: '#e8e8e8',
        borderTop: isBottom ? '1px solid #b0b0b0' : 'none',
        borderBottom: isBottom ? 'none' : '1px solid #b0b0b0',
        padding: isBottom ? '0 4px 2px 4px' : '2px 4px 0 4px',
        position: 'relative',
        height: '26px',
        boxSizing: 'border-box',
      }}
    >
      {/* 左側: タブ一覧 */}
      <div style={{ display: 'flex', alignItems: isBottom ? 'flex-start' : 'flex-end', overflowX: 'auto', flexGrow: 1 }}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const marker = (tab.isModified && showModifiedMarker) ? ' *' : '';
          return (
            <div
              key={tab.id}
              className={`sakura-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                setTabContextMenu({
                  isOpen: true,
                  x: e.clientX,
                  y: e.clientY,
                  tabId: tab.id,
                });
              }}
              title={tab.filePath || tab.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px 8px',
                background: isActive ? '#ffffef' : '#e0e0e0',
                border: '1px solid #b0b0b0',
                borderTop: isBottom && isActive ? '1px solid #ffffef' : '1px solid #b0b0b0',
                borderBottom: !isBottom && isActive ? '1px solid #ffffef' : '1px solid #b0b0b0',
                borderTopLeftRadius: isBottom ? '0px' : '3px',
                borderTopRightRadius: isBottom ? '0px' : '3px',
                borderBottomLeftRadius: isBottom ? '3px' : '0px',
                borderBottomRightRadius: isBottom ? '3px' : '0px',
                marginRight: '2px',
                marginBottom: !isBottom && isActive ? '-1px' : '0px',
                marginTop: isBottom && isActive ? '-1px' : '0px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: isActive ? 'bold' : 'normal',
                color: '#000000',
                height: isActive ? '23px' : '21px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                zIndex: isActive ? 2 : 1,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tab.title}{marker}
              </span>
            </div>
          );
        })}
      </div>

      {/* 右側: タブ一覧メニューボタン & アクティブタブ閉じるボタン (サクラエディタ標準) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: isBottom ? '0px' : '2px', marginTop: isBottom ? '2px' : '0px', position: 'relative' }}>
        <button
          title="タブ一覧"
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444444',
            borderRadius: '2px',
          }}
          onClick={() => setIsTabMenuOpen(!isTabMenuOpen)}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#d8d8d8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <ChevronDown size={13} />
        </button>

        {showCloseButton && (
          <button
            title="閉じる (Ctrl+F4)"
            style={{
              background: 'transparent',
              border: '1px solid transparent',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#444444',
              borderRadius: '2px',
            }}
            onClick={() => onCloseTab(activeTabId)}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ffcccc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={13} />
          </button>
        )}

        {/* タブ一覧ドロップダウン */}
        {isTabMenuOpen && (
          <div
            className="sakura-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              minWidth: '160px',
              zIndex: 300,
              background: '#ffffff',
              border: '1px solid #808080',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {tabs.map((tab, idx) => (
              <div
                key={tab.id}
                className={`sakura-dropdown-item ${tab.id === activeTabId ? 'active' : ''}`}
                style={{ padding: '3px 12px', fontSize: '11px', cursor: 'pointer' }}
                onClick={() => {
                  onSelectTab(tab.id);
                  setIsTabMenuOpen(false);
                }}
              >
                <span>{idx + 1}: {tab.title}{tab.isModified ? ' *' : ''}</span>
              </div>
            ))}
            <div className="sakura-dropdown-separator" />
            <div
              className="sakura-dropdown-item"
              style={{ padding: '3px 12px', fontSize: '11px', cursor: 'pointer' }}
              onClick={() => {
                onNewTab();
                setIsTabMenuOpen(false);
              }}
            >
              <span>+ 新しいタブ</span>
            </div>
          </div>
        )}
      </div>

      {/* タブ用右クリックメニュー */}
      {tabContextMenu && (
        <ContextMenu
          isOpen={tabContextMenu.isOpen}
          x={tabContextMenu.x}
          y={tabContextMenu.y}
          items={contextMenuItems}
          onClose={() => setTabContextMenu(null)}
        />
      )}
    </div>
  );
};
