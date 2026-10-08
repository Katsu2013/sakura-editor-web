import React, { useState, useEffect } from 'react';

export interface HistoryItem {
  id: string;
  text: string;
  isFavorite: boolean;
  date?: string;
}

interface HistoryManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recentFiles: string[];
  onOpenFile?: (path: string) => void;
}

export const HistoryManagementDialog: React.FC<HistoryManagementDialogProps> = ({
  isOpen,
  onClose,
  recentFiles,
  onOpenFile,
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'folders' | 'search' | 'replace'>('files');

  // 履歴データ管理 (localStorage 連携)
  const [fileList, setFileList] = useState<HistoryItem[]>([]);
  const [folderList, setFolderList] = useState<HistoryItem[]>([]);
  const [searchList, setSearchList] = useState<HistoryItem[]>([]);
  const [replaceList, setReplaceList] = useState<HistoryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (!isOpen) return;

    // ファイル履歴のロード
    const savedFavs = JSON.parse(localStorage.getItem('sakura_fav_files') || '[]') as string[];
    const files: HistoryItem[] = recentFiles.map((f, idx) => ({
      id: `f-${idx}-${f}`,
      text: f,
      isFavorite: savedFavs.includes(f),
    }));
    setFileList(files);

    // フォルダー履歴のロード
    const savedFolders = JSON.parse(localStorage.getItem('sakura_history_folders') || '[]') as string[];
    const favFolders = JSON.parse(localStorage.getItem('sakura_fav_folders') || '[]') as string[];
    setFolderList(
      savedFolders.map((dir, idx) => ({
        id: `dir-${idx}-${dir}`,
        text: dir,
        isFavorite: favFolders.includes(dir),
      }))
    );

    // 検索・置換履歴のロード
    const savedSearch = JSON.parse(localStorage.getItem('sakura_history_search') || '["サクラエディタ", "TextBuffer", "function"]') as string[];
    setSearchList(
      savedSearch.map((s, idx) => ({
        id: `s-${idx}-${s}`,
        text: s,
        isFavorite: false,
      }))
    );

    const savedReplace = JSON.parse(localStorage.getItem('sakura_history_replace') || '["Sakura Editor", "TextBufferModel"]') as string[];
    setReplaceList(
      savedReplace.map((r, idx) => ({
        id: `r-${idx}-${r}`,
        text: r,
        isFavorite: false,
      }))
    );

    setSelectedIndex(files.length > 0 ? 0 : -1);
  }, [isOpen, recentFiles]);

  if (!isOpen) return null;

  const currentList =
    activeTab === 'files'
      ? fileList
      : activeTab === 'folders'
      ? folderList
      : activeTab === 'search'
      ? searchList
      : replaceList;

  const updateCurrentList = (newList: HistoryItem[]) => {
    if (activeTab === 'files') {
      setFileList(newList);
      const favs = newList.filter((item) => item.isFavorite).map((item) => item.text);
      localStorage.setItem('sakura_fav_files', JSON.stringify(favs));
    } else if (activeTab === 'folders') {
      setFolderList(newList);
      const favs = newList.filter((item) => item.isFavorite).map((item) => item.text);
      localStorage.setItem('sakura_fav_folders', JSON.stringify(favs));
      localStorage.setItem('sakura_history_folders', JSON.stringify(newList.map((i) => i.text)));
    } else if (activeTab === 'search') {
      setSearchList(newList);
      localStorage.setItem('sakura_history_search', JSON.stringify(newList.map((i) => i.text)));
    } else {
      setReplaceList(newList);
      localStorage.setItem('sakura_history_replace', JSON.stringify(newList.map((i) => i.text)));
    }
  };

  // お気に入りの切り替え (Toggle favorite)
  const handleToggleFavorite = () => {
    if (selectedIndex < 0 || selectedIndex >= currentList.length) return;
    const updated = [...currentList];
    updated[selectedIndex] = {
      ...updated[selectedIndex],
      isFavorite: !updated[selectedIndex].isFavorite,
    };
    updateCurrentList(updated);
  };

  // 選択項目を削除
  const handleDeleteSelected = () => {
    if (selectedIndex < 0 || selectedIndex >= currentList.length) return;
    const updated = currentList.filter((_, idx) => idx !== selectedIndex);
    updateCurrentList(updated);
    if (selectedIndex >= updated.length) {
      setSelectedIndex(updated.length - 1);
    }
  };

  // お気に入り以外を削除
  const handleDeleteNonFavorites = () => {
    const updated = currentList.filter((item) => item.isFavorite);
    updateCurrentList(updated);
    setSelectedIndex(updated.length > 0 ? 0 : -1);
  };

  // すべて削除
  const handleDeleteAll = () => {
    if (!window.confirm('すべての履歴をクリアしますか？')) return;
    updateCurrentList([]);
    setSelectedIndex(-1);
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          height: '460px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--sakura-ui-font)',
          fontSize: '12px',
        }}
      >
        <div className="sakura-dialog-titlebar">
          <span>履歴とお気に入りの管理</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>
            ✕
          </span>
        </div>

        <div className="sakura-dialog-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px' }}>
          {/* タブ */}
          <div className="win32-tab-header" style={{ marginBottom: '8px' }}>
            <button
              className={`win32-tab-btn ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('files');
                setSelectedIndex(fileList.length > 0 ? 0 : -1);
              }}
            >
              ファイル(F)
            </button>
            <button
              className={`win32-tab-btn ${activeTab === 'folders' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('folders');
                setSelectedIndex(folderList.length > 0 ? 0 : -1);
              }}
            >
              フォルダー(D)
            </button>
            <button
              className={`win32-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('search');
                setSelectedIndex(searchList.length > 0 ? 0 : -1);
              }}
            >
              検索文字列(S)
            </button>
            <button
              className={`win32-tab-btn ${activeTab === 'replace' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('replace');
                setSelectedIndex(replaceList.length > 0 ? 0 : -1);
              }}
            >
              置換文字列(R)
            </button>
          </div>

          {/* メインリスト & サイドボタンコンテナ */}
          <div style={{ display: 'flex', flex: 1, gap: '10px', minHeight: 0 }}>
            {/* 履歴リスト */}
            <div
              style={{
                flex: 1,
                border: '2px inset #ffffff',
                backgroundColor: '#ffffff',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  background: '#f0f0f0',
                  borderBottom: '1px solid #c0c0c0',
                  padding: '3px 6px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                }}
              >
                <span style={{ width: '36px', textAlign: 'center' }}>★</span>
                <span style={{ flex: 1 }}>履歴内容</span>
              </div>
              {currentList.length === 0 ? (
                <div style={{ padding: '16px', color: '#888888', textAlign: 'center' }}>(履歴がありません)</div>
              ) : (
                currentList.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndex(idx)}
                      onDoubleClick={() => {
                        if (activeTab === 'files' && onOpenFile) {
                          onOpenFile(item.text);
                          onClose();
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '3px 6px',
                        cursor: 'default',
                        backgroundColor: isSelected ? '#3399ff' : 'transparent',
                        color: isSelected ? '#ffffff' : '#000000',
                        userSelect: 'none',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <span
                        style={{
                          width: '36px',
                          textAlign: 'center',
                          color: item.isFavorite ? '#eab308' : isSelected ? '#ffffff' : '#94a3b8',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(idx);
                          handleToggleFavorite();
                        }}
                      >
                        {item.isFavorite ? '★' : '☆'}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '12px',
                        }}
                        title={item.text}
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* 操作ボタン群 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '135px' }}>
              <button
                className="sakura-dialog-btn"
                onClick={handleToggleFavorite}
                disabled={selectedIndex < 0 || currentList.length === 0}
              >
                お気に入り切替(F)
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleDeleteSelected}
                disabled={selectedIndex < 0 || currentList.length === 0}
              >
                選択項目削除(D)
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleDeleteNonFavorites}
                disabled={currentList.length === 0}
              >
                ★以外削除(N)
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleDeleteAll}
                disabled={currentList.length === 0}
              >
                すべて削除(A)
              </button>
              <div style={{ flex: 1 }} />
              <button className="sakura-dialog-btn primary" onClick={onClose}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
