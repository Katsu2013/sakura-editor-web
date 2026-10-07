import React, { useState } from 'react';
import { FileTreeIcon, BookmarkIcon } from './Icons/SakuraIcons';

export interface FileTreeTabItem {
  id: string;
  title: string;
  isModified: boolean;
}

interface FileTreePanelProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: FileTreeTabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  bookmarkedLines: number[];
  onJumpToLine: (line: number) => void;
}

export const FileTreePanel: React.FC<FileTreePanelProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSelectTab,
  bookmarkedLines,
  onJumpToLine,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'files' | 'bookmarks'>('files');

  if (!isOpen) return null;

  return (
    <div
      style={{
        width: '220px',
        height: '100%',
        backgroundColor: '#f0f0f0',
        borderRight: '1px solid #999999',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* タイトルバー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#3a6ea5',
          color: '#ffffff',
          padding: '2px 6px',
          fontSize: '11px',
          fontWeight: 'bold',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileTreeIcon size={13} />
          <span>ファイルツリー</span>
        </div>
        <span
          style={{ cursor: 'pointer', padding: '0 3px', fontSize: '11px' }}
          onClick={onClose}
          title="閉じる"
        >
          ✕
        </span>
      </div>

      {/* サブタブ切替 (開いているファイル / ブックマーク) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #7f9db9', backgroundColor: '#e4e4e4' }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('files')}
          style={{
            flex: 1,
            padding: '3px 0',
            fontSize: '11px',
            border: 'none',
            borderRight: '1px solid #cccccc',
            backgroundColor: activeSubTab === 'files' ? '#ffffff' : 'transparent',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'files' ? 'bold' : 'normal',
          }}
        >
          文書一覧 ({tabs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('bookmarks')}
          style={{
            flex: 1,
            padding: '3px 0',
            fontSize: '11px',
            border: 'none',
            backgroundColor: activeSubTab === 'bookmarks' ? '#ffffff' : 'transparent',
            cursor: 'pointer',
            fontWeight: activeSubTab === 'bookmarks' ? 'bold' : 'normal',
          }}
        >
          ブックマーク ({bookmarkedLines.length})
        </button>
      </div>

      {/* ツリー・リスト本体 */}
      <div
        style={{
          flexGrow: 1,
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          padding: '4px',
          fontSize: '12px',
        }}
      >
        {activeSubTab === 'files' && (
          <div>
            <div style={{ color: '#475569', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}>
              ▼ 開いている文書
            </div>
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  style={{
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#3399ff' : 'transparent',
                    color: isActive ? '#ffffff' : '#000000',
                    borderRadius: '2px',
                    marginBottom: '1px',
                  }}
                >
                  <span style={{ fontSize: '12px' }}>📄</span>
                  <span style={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tab.title} {tab.isModified ? '*' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {activeSubTab === 'bookmarks' && (
          <div>
            <div style={{ color: '#475569', fontSize: '10px', marginBottom: '4px', fontWeight: 'bold' }}>
              ▼ ブックマーク一覧
            </div>
            {bookmarkedLines.length === 0 ? (
              <div style={{ padding: '8px', color: '#888888', fontSize: '11px', textAlign: 'center' }}>
                ブックマークがありません (F11で追加)
              </div>
            ) : (
              bookmarkedLines.map((line) => (
                <div
                  key={line}
                  onClick={() => onJumpToLine(line + 1)}
                  style={{
                    padding: '3px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    marginBottom: '1px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <BookmarkIcon size={12} />
                  <span style={{ fontWeight: 'bold', minWidth: '36px' }}>{line + 1}行目</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
