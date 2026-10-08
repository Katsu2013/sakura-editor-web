import React, { useState, useRef } from 'react';
import type { TypeSettingItem } from '../../../core/config/TypeSettingsModel';
import { DEFAULT_TYPE_SETTINGS } from '../../../core/config/TypeSettingsModel';

interface TypeListDialogProps {
  isOpen: boolean;
  typeSettingsList: TypeSettingItem[];
  activeTypeId: string;
  onClose: () => void;
  onSelectType: (id: string) => void;
  onEditType: (typeItem: TypeSettingItem) => void;
  onUpdateList: (newList: TypeSettingItem[]) => void;
}

export const TypeListDialog: React.FC<TypeListDialogProps> = ({
  isOpen,
  typeSettingsList,
  activeTypeId,
  onClose,
  onSelectType,
  onEditType,
  onUpdateList,
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeTypeId);
  const [openOnDoubleClick, setOpenOnDoubleClick] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const selectedItem = typeSettingsList.find((t) => t.id === selectedId) || typeSettingsList[0] || DEFAULT_TYPE_SETTINGS[0];
  const selectedIndex = typeSettingsList.findIndex((t) => t.id === selectedId);

  // 設定変更
  const handleEdit = () => {
    onEditType(selectedItem);
    onClose();
  };

  // 一時適用
  const handleApply = () => {
    onSelectType(selectedId);
    onClose();
  };

  // 上へ移動 (↑)
  const handleMoveUp = () => {
    if (selectedIndex <= 0) return;
    const newList = [...typeSettingsList];
    const temp = newList[selectedIndex - 1];
    newList[selectedIndex - 1] = newList[selectedIndex];
    newList[selectedIndex] = temp;
    onUpdateList(newList);
  };

  // 下へ移動 (↓)
  const handleMoveDown = () => {
    if (selectedIndex < 0 || selectedIndex >= typeSettingsList.length - 1) return;
    const newList = [...typeSettingsList];
    const temp = newList[selectedIndex + 1];
    newList[selectedIndex + 1] = newList[selectedIndex];
    newList[selectedIndex] = temp;
    onUpdateList(newList);
  };

  // 複製
  const handleDuplicate = () => {
    const newItem: TypeSettingItem = {
      ...JSON.parse(JSON.stringify(selectedItem)),
      id: `type-${Date.now()}`,
      name: `${selectedItem.name} 2`,
    };
    const newList = [...typeSettingsList, newItem];
    onUpdateList(newList);
    setSelectedId(newItem.id);
  };

  // 初期化
  const handleReset = () => {
    if (window.confirm(`設定「${selectedItem.name}」を初期設定に戻しますか？`)) {
      const defaultMatch = DEFAULT_TYPE_SETTINGS.find((d) => d.id === selectedItem.id || d.name === selectedItem.name);
      const restoredItem = defaultMatch ? JSON.parse(JSON.stringify(defaultMatch)) : {
        ...JSON.parse(JSON.stringify(DEFAULT_TYPE_SETTINGS[0])),
        id: selectedItem.id,
        name: selectedItem.name,
        extensions: selectedItem.extensions,
      };

      const newList = typeSettingsList.map((t) => (t.id === selectedId ? restoredItem : t));
      onUpdateList(newList);
      alert(`「${selectedItem.name}」を工場初期設定に戻しました。`);
    }
  };

  // 追加
  const handleAdd = () => {
    const name = window.prompt('新しいタイプ設定の名前を入力してください:', '新規設定');
    if (!name || !name.trim()) return;
    const baseTemplate = DEFAULT_TYPE_SETTINGS[0];
    const newItem: TypeSettingItem = {
      ...JSON.parse(JSON.stringify(baseTemplate)),
      id: `type-${Date.now()}`,
      name: name.trim(),
      extensions: '',
    };
    const newList = [...typeSettingsList, newItem];
    onUpdateList(newList);
    setSelectedId(newItem.id);
  };

  // 削除
  const handleDelete = () => {
    if (selectedItem.id === 'type-base' || selectedItem.name === '基本') {
      alert('「基本」設定は削除できません。');
      return;
    }
    if (typeSettingsList.length <= 1) {
      alert('これ以上削除できません。');
      return;
    }
    const ok = window.confirm(`設定「${selectedItem.name}」を削除しますか？`);
    if (!ok) return;
    const newList = typeSettingsList.filter((t) => t.id !== selectedId);
    onUpdateList(newList);
    setSelectedId(newList[0].id);
  };

  // エクスポート (実ファイルダウンロード)
  const handleExport = () => {
    try {
      const exportData = JSON.stringify(selectedItem, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedItem.name}_設定.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('エクスポートに失敗しました: ' + e.message);
    }
  };

  // インポート (実ファイル読み込み)
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed.name === 'string') {
          const importedItem: TypeSettingItem = {
            ...parsed,
            id: `type-${Date.now()}`,
          };
          const newList = [...typeSettingsList, importedItem];
          onUpdateList(newList);
          setSelectedId(importedItem.id);
          alert(`タイプ設定「${importedItem.name}」を正常にインポートしました。`);
        } else {
          alert('有効なタイプ設定ファイルではありません。');
        }
      } catch (err: any) {
        alert('ファイルの読み込みに失敗しました: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
          fontFamily: 'var(--sakura-ui-font)',
          fontSize: '12px',
        }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar">
          <span>タイプ別設定一覧</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span
              style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }}
              title="ヘルプ"
              onClick={() => setIsHelpOpen((prev) => !prev)}
            >
              ?
            </span>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} onClick={onClose}>
              ✕
            </span>
          </div>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '8px 10px 10px 10px' }}>
          <div style={{ marginBottom: '6px' }}>下からタイプを選択してください(T):</div>

          <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0 }}>
            {/* 左側: 単一リストボックス (サクラエディタ実機完全準拠) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                height: '350px',
                backgroundColor: '#ffffff',
                border: '2px inset #ffffff',
                overflowY: 'auto',
                padding: '1px',
                boxSizing: 'border-box',
              }}
            >
              {typeSettingsList.map((item) => {
                const isSelected = item.id === selectedId;
                const displayText = item.extensions
                  ? `${item.name} ( ${item.extensions} )`
                  : item.name;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    onDoubleClick={() => {
                      if (openOnDoubleClick) {
                        handleApply();
                      } else {
                        handleEdit();
                      }
                    }}
                    style={{
                      padding: '2px 4px',
                      cursor: 'default',
                      whiteSpace: 'nowrap',
                      backgroundColor: isSelected ? '#000080' : 'transparent',
                      color: isSelected ? '#ffffff' : '#000000',
                      lineHeight: '16px',
                      fontSize: '12px',
                      userSelect: 'none',
                    }}
                  >
                    {displayText}
                  </div>
                );
              })}
            </div>

            {/* 右側: 縦並びボタン群 (サクラエディタ実機完全準拠) */}
            <div
              style={{
                width: '105px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                boxSizing: 'border-box',
              }}
            >
              <button
                className="sakura-dialog-btn primary"
                style={{ width: '100%' }}
                onClick={handleEdit}
              >
                設定変更(S)...
              </button>
              <button className="sakura-dialog-btn" style={{ width: '100%' }} onClick={handleApply}>
                一時適用(R)
              </button>
              <button className="sakura-dialog-btn" style={{ width: '100%' }} onClick={onClose}>
                キャンセル(X)
              </button>

              <div style={{ height: '4px' }} />

              <button
                className="sakura-dialog-btn"
                style={{ width: '100%' }}
                onClick={() => fileInputRef.current?.click()}
              >
                インポート(I)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.ini,.txt,.sakura-type"
                style={{ display: 'none' }}
                onChange={handleImportFile}
              />
              <button className="sakura-dialog-btn" style={{ width: '100%' }} onClick={handleExport}>
                エクスポート(E)
              </button>
              <button className="sakura-dialog-btn" style={{ width: '100%' }} onClick={handleReset}>
                初期化(N)
              </button>
              <button className="sakura-dialog-btn" style={{ width: '100%' }} onClick={handleDuplicate}>
                複製(C)
              </button>
              <button
                className="sakura-dialog-btn"
                style={{ width: '100%' }}
                onClick={handleMoveUp}
                disabled={selectedIndex <= 0}
              >
                ↑ (U)
              </button>
              <button
                className="sakura-dialog-btn"
                style={{ width: '100%' }}
                onClick={handleMoveDown}
                disabled={selectedIndex >= typeSettingsList.length - 1}
              >
                ↓ (D)
              </button>
              <button className="sakura-dialog-btn" style={{ width: '100%' }} onClick={handleAdd}>
                追加(A)
              </button>
              <button
                className="sakura-dialog-btn"
                style={{ width: '100%' }}
                onClick={handleDelete}
                disabled={selectedItem.id === 'type-base' || selectedItem.name === '基本'}
              >
                削除(D)
              </button>

              <div style={{ height: '4px' }} />

              <label
                style={{
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: '#888888',
                  whiteSpace: 'nowrap',
                }}
                title="Web環境ではWindowsシェル拡張（レジストリ）は利用できません"
              >
                <input type="checkbox" disabled checked={false} />
                右クリックメニューに追加
              </label>

              <label
                style={{
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <input
                  type="checkbox"
                  checked={openOnDoubleClick}
                  onChange={(e) => setOpenOnDoubleClick(e.target.checked)}
                />
                ダブルクリックで開く
              </label>

              <div style={{ height: '4px' }} />

              <button
                className="sakura-dialog-btn"
                style={{ width: '100%' }}
                onClick={() => setIsHelpOpen((prev) => !prev)}
              >
                ヘルプ(H)
              </button>
            </div>
          </div>

          {/* ヘルプ情報パネル */}
          {isHelpOpen && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 10px',
                backgroundColor: '#ffffef',
                border: '1px solid #d0d090',
                borderRadius: '2px',
                fontSize: '11px',
                lineHeight: '1.4',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              <b>【タイプ別設定一覧 ヘルプ (F_TYPE_LIST)】</b><br />
              ・<b>設定変更(S)</b>: 選択中のファイルタイプ（C/C++、HTML、Java等）のフォント、カラー、支援機能などを編集します。<br />
              ・<b>一時適用(R)</b>: 現在編集中のウィンドウに、選択したタイプ設定を一時的に反映します。<br />
              ・<b>インポート(I) / エクスポート(E)</b>: 独自に設定したタイプ設定を外部ファイルとして読み書きします。<br />
              ・<b>初期化(N)</b>: 選択タイプの設定を出荷時の初期値に戻します。<br />
              ・<b>複製(C) / 追加(A) / 削除(D)</b>: 新規ファイルタイプを作成、複製、または削除します。<br />
              ・<b>↑(U) / ↓(D)</b>: 拡張子マッチング時の優先順位を上下に変更します。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
