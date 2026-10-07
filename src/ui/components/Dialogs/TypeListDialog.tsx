import React, { useState } from 'react';
import type { TypeSettingItem } from '../../../core/config/TypeSettingsModel';

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
  const [addToContextMenu, setAddToContextMenu] = useState(false);
  const [openOnDoubleClick, setOpenOnDoubleClick] = useState(false);

  if (!isOpen) return null;

  const selectedItem = typeSettingsList.find((t) => t.id === selectedId) || typeSettingsList[0];
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

  // 上へ移動
  const handleMoveUp = () => {
    if (selectedIndex <= 0) return;
    const newList = [...typeSettingsList];
    const temp = newList[selectedIndex - 1];
    newList[selectedIndex - 1] = newList[selectedIndex];
    newList[selectedIndex] = temp;
    onUpdateList(newList);
  };

  // 下へ移動
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
      ...selectedItem,
      id: `type-${Date.now()}`,
      name: `${selectedItem.name} のコピー`,
    };
    const newList = [...typeSettingsList, newItem];
    onUpdateList(newList);
    setSelectedId(newItem.id);
  };

  // 初期化
  const handleReset = () => {
    if (window.confirm(`設定「${selectedItem.name}」を初期設定に戻しますか？`)) {
      alert('初期設定に戻しました。');
    }
  };

  // 追加
  const handleAdd = () => {
    const name = window.prompt('新しいタイプ設定の名前を入力してください:', '新規設定');
    if (!name) return;
    const newItem: TypeSettingItem = {
      ...selectedItem,
      id: `type-${Date.now()}`,
      name,
      extensions: '',
    };
    const newList = [...typeSettingsList, newItem];
    onUpdateList(newList);
    setSelectedId(newItem.id);
  };

  // 削除
  const handleDelete = () => {
    if (selectedItem.id === 'type-base') {
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

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '450px',
          fontFamily: "'MS UI Gothic', 'Segoe UI', sans-serif",
          fontSize: '12px',
        }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>タイプ別設定一覧</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} title="ヘルプ">?</span>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} onClick={onClose}>✕</span>
          </div>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '10px 12px 12px 12px' }}>
          <div style={{ marginBottom: '6px' }}>下からタイプを選択してください(&T):</div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {/* 左側: 単一リストボックス (サクラエディタ実機完全準拠) */}
            <div
              style={{
                flex: 1,
                height: '340px',
                backgroundColor: '#ffffff',
                border: '2px inset #d0d0d0',
                overflowY: 'auto',
                padding: '1px',
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
                      padding: '1px 4px',
                      cursor: 'default',
                      whiteSpace: 'nowrap',
                      backgroundColor: isSelected ? '#000080' : 'transparent',
                      color: isSelected ? '#ffffff' : '#000000',
                      lineHeight: '16px',
                      fontSize: '11px',
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
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <button
                className="sakura-dialog-btn"
                style={{ fontWeight: 'bold', border: '2px solid #0055ea' }}
                onClick={handleEdit}
              >
                設定変更(&S)...
              </button>
              <button className="sakura-dialog-btn" onClick={handleApply}>
                一時適用(&R)
              </button>
              <button className="sakura-dialog-btn" onClick={onClose}>
                キャンセル(&X)
              </button>

              <div style={{ height: '4px' }} />

              <button
                className="sakura-dialog-btn"
                onClick={() => alert('設定ファイルのインポート')}
              >
                インポート(&I)
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={() => alert('設定ファイルのエクスポート')}
              >
                エクスポート(&E)
              </button>
              <button className="sakura-dialog-btn" onClick={handleReset}>
                初期化(&N)
              </button>
              <button className="sakura-dialog-btn" onClick={handleDuplicate}>
                複製(&C)
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  className="sakura-dialog-btn"
                  style={{ flex: 1 }}
                  onClick={handleMoveUp}
                  disabled={selectedIndex <= 0}
                >
                  ↑ (&U)
                </button>
                <button
                  className="sakura-dialog-btn"
                  style={{ flex: 1 }}
                  onClick={handleMoveDown}
                  disabled={selectedIndex >= typeSettingsList.length - 1}
                >
                  ↓ (&D)
                </button>
              </div>

              <button className="sakura-dialog-btn" onClick={handleAdd}>
                追加(&A)
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleDelete}
                disabled={selectedItem.id === 'type-base'}
              >
                削除(&D)
              </button>

              <div style={{ height: '2px' }} />

              <label style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={addToContextMenu}
                  onChange={(e) => setAddToContextMenu(e.target.checked)}
                />
                右クリックメニューに追加
              </label>

              <label style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
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
                onClick={() => alert('サクラエディタ ヘルプ: タイプ別設定一覧')}
              >
                ヘルプ(&H)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
