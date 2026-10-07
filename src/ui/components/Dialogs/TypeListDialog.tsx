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

  if (!isOpen) return null;

  const selectedItem = typeSettingsList.find((t) => t.id === selectedId) || typeSettingsList[0];
  const selectedIndex = typeSettingsList.findIndex((t) => t.id === selectedId);

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

  // 削除
  const handleDelete = () => {
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

  // 追加
  const handleAdd = () => {
    const name = window.prompt('新しい設定の名前を入力してください:', '新規設定');
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

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '540px' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>タイプ別設定一覧</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body">
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* 左側: リストビュー */}
            <div style={{ flexGrow: 1 }}>
              <div style={{ marginBottom: '4px', fontSize: '11px' }}>設定一覧(&L):</div>
              <div className="win32-listview">
                <div className="win32-listview-header">
                  <div className="win32-listview-col" style={{ width: '35px' }}>No.</div>
                  <div className="win32-listview-col" style={{ width: '140px' }}>設定名</div>
                  <div className="win32-listview-col" style={{ flexGrow: 1 }}>拡張子</div>
                </div>

                {typeSettingsList.map((item, idx) => {
                  const isSelected = item.id === selectedId;
                  const isCurrentActive = item.id === activeTypeId;
                  return (
                    <div
                      key={item.id}
                      className={`win32-listview-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedId(item.id)}
                      onDoubleClick={() => {
                        onEditType(item);
                        onClose();
                      }}
                    >
                      <div className="win32-listview-cell" style={{ width: '35px' }}>
                        {idx + 1}
                      </div>
                      <div className="win32-listview-cell" style={{ width: '140px', fontWeight: isCurrentActive ? 'bold' : 'normal' }}>
                        {isCurrentActive ? '● ' : '  '}{item.name}
                      </div>
                      <div className="win32-listview-cell" style={{ flexGrow: 1, color: isSelected ? '#ffffff' : '#555555' }}>
                        {item.extensions || '(なし)'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 右側: 縦並びボタン群 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '18px', width: '105px' }}>
              <button
                className="sakura-dialog-btn primary"
                onClick={() => {
                  onEditType(selectedItem);
                  onClose();
                }}
              >
                設定変更(&S)...
              </button>
              <button className="sakura-dialog-btn" onClick={handleAdd}>
                追加(&A)...
              </button>
              <button className="sakura-dialog-btn" onClick={handleDelete}>
                削除(&D)
              </button>
              <div style={{ height: '6px' }} />
              <button className="sakura-dialog-btn" onClick={handleMoveUp} disabled={selectedIndex <= 0}>
                上へ(&U)
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleMoveDown}
                disabled={selectedIndex >= typeSettingsList.length - 1}
              >
                下へ(&D)
              </button>
            </div>
          </div>

          {/* 下部ボタン */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px' }}>
            <button
              className="sakura-dialog-btn primary"
              onClick={() => {
                onSelectType(selectedId);
                onClose();
              }}
            >
              一時適用(&T)
            </button>
            <button className="sakura-dialog-btn" onClick={onClose}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
