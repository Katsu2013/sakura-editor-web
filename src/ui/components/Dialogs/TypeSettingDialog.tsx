import React, { useState } from 'react';
import type { TypeSettingItem, ColorItemSetting } from '../../../core/config/TypeSettingsModel';
import { KeywordDialog } from './KeywordDialog';

interface TypeSettingDialogProps {
  isOpen: boolean;
  typeItem: TypeSettingItem;
  initialTab?: TypeSettingTabKey;
  onClose: () => void;
  onSave: (updatedItem: TypeSettingItem) => void;
}

export type TypeSettingTabKey = 'screen' | 'color' | 'window' | 'support' | 'regex' | 'keyword_help';

export const TypeSettingDialog: React.FC<TypeSettingDialogProps> = ({
  isOpen,
  typeItem,
  initialTab = 'screen',
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TypeSettingTabKey>(initialTab);
  const [data, setData] = useState<TypeSettingItem>(typeItem);
  const [selectedColorKey, setSelectedColorKey] = useState<string>('text');
  const [isKeywordDialogDocOpen, setIsKeywordDialogDocOpen] = useState<boolean>(false);

  // ダイアログが開くたびに状態を同期
  React.useEffect(() => {
    setData(typeItem);
    setSelectedColorKey('text');
    if (initialTab) setActiveTab(initialTab);
  }, [typeItem, isOpen, initialTab]);

  if (!isOpen) return null;

  const currentColorSetting: ColorItemSetting = data.colorSettings[selectedColorKey] || {
    name: 'テキスト',
    key: 'text',
    fg: '#000000',
    bg: '#ffffff',
  };

  const updateSelectedColor = (updater: Partial<ColorItemSetting>) => {
    const updatedItem = { ...currentColorSetting, ...updater };
    const newColorSettings = { ...data.colorSettings, [selectedColorKey]: updatedItem };

    // theme にも即時同期
    const newTheme = { ...data.theme };
    if (selectedColorKey === 'text') {
      if (updatedItem.fg) newTheme.textColor = updatedItem.fg;
      if (updatedItem.bg) newTheme.background = updatedItem.bg;
    } else if (selectedColorKey === 'lineNumber') {
      if (updatedItem.bg) newTheme.gutterBackground = updatedItem.bg;
      if (updatedItem.fg) newTheme.gutterTextColor = updatedItem.fg;
    } else if (selectedColorKey === 'keyword' && updatedItem.fg) {
      newTheme.keywordColor = updatedItem.fg;
    } else if (selectedColorKey === 'comment' && updatedItem.fg) {
      newTheme.commentColor = updatedItem.fg;
    } else if (selectedColorKey === 'string' && updatedItem.fg) {
      newTheme.stringColor = updatedItem.fg;
    } else if (selectedColorKey === 'selection' && updatedItem.bg) {
      newTheme.selectionColor = updatedItem.bg;
    }

    // showSymbols にも同期
    const newSymbols = { ...data.showSymbols };
    if (selectedColorKey === 'fullSpace') newSymbols.fullSpace = updatedItem.show ?? true;
    if (selectedColorKey === 'halfSpace') newSymbols.halfSpace = updatedItem.show ?? false;
    if (selectedColorKey === 'tab') newSymbols.tab = updatedItem.show ?? true;
    if (selectedColorKey === 'lineEnd') newSymbols.lineEnd = updatedItem.show ?? true;
    if (selectedColorKey === 'eof') newSymbols.eof = updatedItem.show ?? true;

    setData({
      ...data,
      colorSettings: newColorSettings,
      theme: newTheme,
      showSymbols: newSymbols,
    });
  };

  const handleOk = () => {
    onSave(data);
    onClose();
  };

  return (
    <>
      <div className="sakura-dialog-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
        <div
          className="sakura-dialog-window"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '630px',
            fontFamily: "'MS UI Gothic', 'Segoe UI', sans-serif",
            fontSize: '12px',
          }}
        >
          {/* タイトルバー */}
          <div className="sakura-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>タイプ別設定</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} title="ヘルプ">?</span>
              <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} onClick={onClose}>✕</span>
            </div>
          </div>

          <div className="sakura-dialog-body" style={{ padding: '8px 10px 10px 10px' }}>
            {/* 6大プロパティシート タブコントロール (実機完全準拠) */}
            <div className="win32-tab-control">
              <div className="win32-tab-header">
                <button
                  className={`win32-tab-btn ${activeTab === 'screen' ? 'active' : ''}`}
                  onClick={() => setActiveTab('screen')}
                >
                  スクリーン
                </button>
                <button
                  className={`win32-tab-btn ${activeTab === 'color' ? 'active' : ''}`}
                  onClick={() => setActiveTab('color')}
                >
                  カラー
                </button>
                <button
                  className={`win32-tab-btn ${activeTab === 'window' ? 'active' : ''}`}
                  onClick={() => setActiveTab('window')}
                >
                  ウィンドウ
                </button>
                <button
                  className={`win32-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
                  onClick={() => setActiveTab('support')}
                >
                  支援
                </button>
                <button
                  className={`win32-tab-btn ${activeTab === 'regex' ? 'active' : ''}`}
                  onClick={() => setActiveTab('regex')}
                >
                  正規表現キーワード
                </button>
                <button
                  className={`win32-tab-btn ${activeTab === 'keyword_help' ? 'active' : ''}`}
                  onClick={() => setActiveTab('keyword_help')}
                >
                  キーワードヘルプ
                </button>
              </div>

              {/* タブページ内容 */}
              <div
                className="win32-tab-page"
                style={{
                  minHeight: '390px',
                  padding: '8px',
                  backgroundColor: '#ece9d8',
                  border: '1px solid #7f9db9',
                  borderTop: 'none',
                }}
              >
                {/* ==================== 1. スクリーン タブ (Screenshot 2準拠) ==================== */}
                {activeTab === 'screen' && (
                  <div>
                    {/* 上部: 設定の名前 & ファイル拡張子 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '90px 180px 100px 1fr', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
                      <label>設定の名前(&N):</label>
                      <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />
                      <label style={{ textAlign: 'right' }}>ファイル拡張子(&X):</label>
                      <input
                        type="text"
                        value={data.extensions}
                        onChange={(e) => setData({ ...data, extensions: e.target.value })}
                        placeholder="例: txt,log,ini"
                        style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {/* 左列: レイアウト & インデント */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* レイアウト */}
                        <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                          <legend>レイアウト</legend>
                          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '4px', alignItems: 'center' }}>
                            <label>折り返し方法(&K):</label>
                            <select
                              value={data.wrapConfig.wrapMode}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  wrapConfig: { ...data.wrapConfig, wrapMode: e.target.value as any },
                                })
                              }
                              style={{ padding: '1px 2px', border: '1px solid #7f9db9' }}
                            >
                              <option value="none">折り返さない</option>
                              <option value="column">指定桁で折り返す</option>
                              <option value="window">右端で折り返す</option>
                            </select>

                            <label>折り返し桁数(&R):</label>
                            <input
                              type="number"
                              min={10}
                              max={10240}
                              value={data.wrapConfig.wrapColumn}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  wrapConfig: { ...data.wrapConfig, wrapColumn: parseInt(e.target.value, 10) || 80 },
                                })
                              }
                              style={{ width: '70px', padding: '1px' }}
                            />

                            <label>文字の隙間(&C):</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                min={0}
                                max={16}
                                value={data.charSpacing}
                                onChange={(e) => setData({ ...data, charSpacing: parseInt(e.target.value, 10) || 0 })}
                                style={{ width: '45px', padding: '1px' }}
                              />
                              <span>ドット</span>
                            </div>

                            <label>行の間隔(&L):</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                min={0}
                                max={32}
                                value={data.lineSpacing}
                                onChange={(e) => setData({ ...data, lineSpacing: parseInt(e.target.value, 10) || 1 })}
                                style={{ width: '45px', padding: '1px' }}
                              />
                              <span>ドット</span>
                            </div>

                            <label>TAB幅(&T):</label>
                            <input
                              type="number"
                              min={1}
                              max={64}
                              value={data.wrapConfig.tabSize}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  wrapConfig: { ...data.wrapConfig, tabSize: parseInt(e.target.value, 10) || 4 },
                                })
                              }
                              style={{ width: '45px', padding: '1px' }}
                            />

                            <label>TAB表示:</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <select style={{ padding: '1px' }}>
                                <option>文字指定</option>
                                <option>矢印</option>
                                <option>なし</option>
                              </select>
                              <input type="text" defaultValue="^" style={{ width: '25px', textAlign: 'center' }} />
                            </div>

                            <div />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                              <input type="checkbox" /> SPACEの挿入
                            </label>
                          </div>
                        </fieldset>

                        {/* インデント */}
                        <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                          <legend>インデント</legend>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input
                                type="checkbox"
                                checked={data.autoIndent}
                                onChange={(e) => setData({ ...data, autoIndent: e.target.checked })}
                              />
                              自動インデント(&U)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input type="checkbox" defaultChecked /> 全角空白も(&Z)
                            </label>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '4px', alignItems: 'center' }}>
                            <label>スマートインデント(&S):</label>
                            <select style={{ padding: '1px' }}><option>なし</option><option>C/C++</option></select>
                            <label>その他のインデント文字(&I):</label>
                            <input type="text" style={{ padding: '1px' }} />
                            <label>折り返し行インデント(&2):</label>
                            <select style={{ padding: '1px' }}><option>なし</option><option>通常インデント</option></select>
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontSize: '11px' }}>
                            <input type="checkbox" /> 改行時に末尾の空白を削除(&E)
                          </label>
                        </fieldset>
                      </div>

                      {/* 右列: アウトライン解析 & フォント & 禁則処理 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* アウトライン解析方法 */}
                        <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                          <legend>アウトライン解析方法</legend>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input type="radio" name="outlineType" defaultChecked />
                              標準ルール(&B):
                            </label>
                            <select
                              value={data.outlineRule}
                              onChange={(e) => setData({ ...data, outlineRule: e.target.value })}
                              style={{ marginLeft: '16px', padding: '1px' }}
                            >
                              <option value="text">テキスト</option>
                              <option value="cpp">C/C++</option>
                              <option value="java">Java</option>
                              <option value="html">HTML</option>
                              <option value="python">Python</option>
                              <option value="markdown">Markdown</option>
                            </select>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <input type="radio" name="outlineType" /> ルールファイル(&D)
                              </label>
                              <input type="text" style={{ flex: 1, padding: '1px' }} />
                              <button className="sakura-dialog-btn" style={{ padding: '0 4px' }}>(1)...</button>
                            </div>
                          </div>
                        </fieldset>

                        {/* タイプ別フォント */}
                        <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                          <legend>タイプ別フォント</legend>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input type="checkbox" /> 使用する(&G)
                            </label>
                            <button
                              className="sakura-dialog-btn"
                              onClick={() => alert(`現在のフォント: ${data.fontFamily} ${data.fontSize}pt`)}
                            >
                              フォント(&F)...
                            </button>
                          </div>
                        </fieldset>

                        {/* 禁則処理 */}
                        <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                          <legend>禁則処理</legend>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', fontSize: '11px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input type="checkbox" /> 英文ワードラップ(&W)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input type="checkbox" /> 避ける下げ(^)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input type="checkbox" /> ぶら下げを隠す(-)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <input type="checkbox" /> 句読点ぶら下げ(&K)
                            </label>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                            <label style={{ fontSize: '11px' }}>行頭禁則(&J):</label>
                            <input type="text" defaultValue="、。，．)）]｝」』" style={{ padding: '1px' }} />
                            <label style={{ fontSize: '11px' }}>行末禁則(&D):</label>
                            <input type="text" defaultValue="(（[｛「『" style={{ padding: '1px' }} />
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================== 2. カラー タブ (Screenshot 3準拠) ==================== */}
                {activeTab === 'color' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: '8px' }}>
                    {/* 左側: 色指定(L) グループボックス */}
                    <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                      <legend>色指定(&L)</legend>

                      {/* 色指定リストボックス */}
                      <div
                        style={{
                          height: '210px',
                          backgroundColor: '#ffffff',
                          border: '2px inset #d0d0d0',
                          overflowY: 'auto',
                          fontSize: '11px',
                          padding: '1px',
                        }}
                      >
                        {Object.values(data.colorSettings).map((c) => {
                          const isSelected = c.key === selectedColorKey;
                          return (
                            <div
                              key={c.key}
                              onClick={() => setSelectedColorKey(c.key)}
                              style={{
                                padding: '1px 3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                cursor: 'default',
                                backgroundColor: isSelected ? '#000080' : 'transparent',
                                color: isSelected ? '#ffffff' : '#000000',
                                height: '16px',
                                lineHeight: '16px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '9px', width: '10px' }}>
                                  {c.show !== false ? '▼' : '・'}
                                </span>
                                <span>{c.name}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {c.fg && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      width: '10px',
                                      height: '10px',
                                      backgroundColor: c.fg,
                                      border: '1px solid #333',
                                    }}
                                  />
                                )}
                                {c.bg && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      width: '10px',
                                      height: '10px',
                                      backgroundColor: c.bg,
                                      border: '1px solid #333',
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* リスト下のチェックボックス & 色設定ボタン群 */}
                      <div style={{ display: 'flex', gap: '6px', margin: '4px 0', fontSize: '11px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <input
                            type="checkbox"
                            checked={currentColorSetting.show !== false}
                            onChange={(e) => updateSelectedColor({ show: e.target.checked })}
                          />
                          色分け/表示(&D)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <input
                            type="checkbox"
                            checked={currentColorSetting.bold || false}
                            onChange={(e) => updateSelectedColor({ bold: e.target.checked })}
                          />
                          太字(&B)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <input
                            type="checkbox"
                            checked={currentColorSetting.underline || false}
                            onChange={(e) => updateSelectedColor({ underline: e.target.checked })}
                          />
                          下線(&U)
                        </label>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <button
                            className="sakura-dialog-btn"
                            style={{ flex: 1 }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'color';
                              input.value = currentColorSetting.fg || '#000000';
                              input.onchange = (e: any) => updateSelectedColor({ fg: e.target.value });
                              input.click();
                            }}
                          >
                            文字色(&C)...
                          </button>
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              border: '1px solid #000',
                              backgroundColor: currentColorSetting.fg || '#000000',
                            }}
                          />
                        </div>
                        <button className="sakura-dialog-btn">文字色一括(&K)...</button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <button
                            className="sakura-dialog-btn"
                            style={{ flex: 1 }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'color';
                              input.value = currentColorSetting.bg || '#ffffff';
                              input.onchange = (e: any) => updateSelectedColor({ bg: e.target.value });
                              input.click();
                            }}
                          >
                            背景色(&K)...
                          </button>
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              border: '1px solid #000',
                              backgroundColor: currentColorSetting.bg || '#ffffff',
                            }}
                          />
                        </div>
                        <button className="sakura-dialog-btn">背景色一括(&L)...</button>
                      </div>

                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        <button className="sakura-dialog-btn" style={{ flex: 1 }}>インポート(&I)...</button>
                        <button className="sakura-dialog-btn" style={{ flex: 1 }}>エクスポート(&X)...</button>
                      </div>
                    </fieldset>

                    {/* 右側: 強調キーワード & コメントスタイル & 文字列エスケープ */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* 強調キーワード */}
                      <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                        <legend>強調キーワード</legend>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <label>強調キーワード1:</label>
                          <select style={{ flex: 1, padding: '1px' }}>
                            <option>JavaScript</option>
                            <option>C/C++</option>
                            <option>HTML</option>
                            <option>Java</option>
                            <option>Python</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
                          <button className="sakura-dialog-btn">2〜10...</button>
                          <button
                            className="sakura-dialog-btn"
                            onClick={() => setIsKeywordDialogDocOpen(true)}
                          >
                            共通設定(&C)...
                          </button>
                        </div>
                      </fieldset>

                      {/* コメントスタイル */}
                      <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                        <legend>コメントスタイル</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '70px 65px 12px 65px', gap: '3px', alignItems: 'center' }}>
                          <label>ブロック型(&F):</label>
                          <input type="text" defaultValue="/*" style={{ padding: '1px' }} />
                          <span>〜</span>
                          <input type="text" defaultValue="*/" style={{ padding: '1px' }} />

                          <label>ブロック型(&A):</label>
                          <input type="text" defaultValue="" style={{ padding: '1px' }} />
                          <span>〜</span>
                          <input type="text" defaultValue="" style={{ padding: '1px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 45px 1fr', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
                          <label>行型(&M):</label>
                          <input type="text" defaultValue="//" style={{ padding: '1px' }} />
                          <label style={{ fontSize: '10px' }}><input type="checkbox" /> 桁(&P) @ 1</label>

                          <label>行型(&E):</label>
                          <input type="text" defaultValue="" style={{ padding: '1px' }} />
                          <label style={{ fontSize: '10px' }}><input type="checkbox" /> 桁(&O) @ 1</label>

                          <label>行型(&G):</label>
                          <input type="text" defaultValue="" style={{ padding: '1px' }} />
                          <label style={{ fontSize: '10px' }}><input type="checkbox" /> 桁(&J) @ 1</label>
                        </div>
                      </fieldset>

                      {/* 文字列エスケープ */}
                      <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                        <legend>文字列エスケープ(&Q)</legend>
                        <select style={{ width: '100%', padding: '1px', marginBottom: '4px' }}>
                          <option>C/C++言語風 ¥</option>
                          <option>SQL風 ''</option>
                          <option>なし</option>
                        </select>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <input type="checkbox" /> 行内のみ(&Y)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <input type="checkbox" /> 終了文字がない場合行末まで色分け(&N)
                          </label>
                        </div>
                      </fieldset>

                      <div style={{ fontSize: '10px', color: '#555555' }}>
                        行頭特定(&T) *またはStep(Begin, End)でコンマ区切り
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================== 3. ウィンドウ タブ (Screenshot 5準拠) ==================== */}
                {activeTab === 'window' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* 入力モード グループボックス */}
                    <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                      <legend>入力モード</legend>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {/* デフォルトの文字コード */}
                        <div style={{ border: '1px solid #c0c0c0', padding: '6px', background: '#f5f5f5' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>デフォルトの文字コード</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '75px 1fr 50px', gap: '4px', alignItems: 'center' }}>
                            <label>改行コード(&R):</label>
                            <select style={{ padding: '1px' }}>
                              <option>CR+LF</option>
                              <option>LF</option>
                              <option>CR</option>
                            </select>
                            <label style={{ fontSize: '11px' }}><input type="checkbox" /> BOM</label>

                            <label>文字コード(&C):</label>
                            <select style={{ padding: '1px' }}>
                              <option>UTF-8</option>
                              <option>Shift_JIS</option>
                              <option>EUC-JP</option>
                              <option>ISO-2022-JP</option>
                              <option>Unicode(UTF-16LE)</option>
                              <option>UnicodeBE(UTF-16BE)</option>
                            </select>
                            <label style={{ fontSize: '11px' }}><input type="checkbox" /> CP</label>
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontSize: '10px' }}>
                            <input type="checkbox" /> 自動判別時にCESU-8を優先する(&U)
                          </label>
                        </div>

                        {/* 起動時のIME */}
                        <div style={{ border: '1px solid #c0c0c0', padding: '6px', background: '#f5f5f5' }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '11px' }}>起動時のIME (日本語入力変換)</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: '6px', alignItems: 'center' }}>
                            <label>ON/OFF状態(&M):</label>
                            <select style={{ padding: '1px' }}>
                              <option>そのまま</option>
                              <option>ON</option>
                              <option>OFF</option>
                            </select>
                            <label>入力モード(&D):</label>
                            <select style={{ padding: '1px' }}>
                              <option>標準設定</option>
                              <option>ひらがな</option>
                              <option>全角カタカナ</option>
                              <option>半角カタカナ</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </fieldset>

                    {/* ウィンドウ グループボックス */}
                    <fieldset className="win32-groupbox" style={{ padding: '6px 8px' }}>
                      <legend>ウィンドウ</legend>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '6px' }}>
                        <input type="checkbox" /> 文書アイコンを使う(&O)
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '130px 130px 1fr', gap: '8px' }}>
                        {/* 行番号の表示 */}
                        <div style={{ border: '1px solid #c0c0c0', padding: '4px 6px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>行番号の表示</div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <input
                              type="radio"
                              name="lineNumType"
                              checked={data.lineNumberType === 'visual'}
                              onChange={() => setData({ ...data, lineNumberType: 'visual' })}
                            />
                            折り返し単位(&R)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <input
                              type="radio"
                              name="lineNumType"
                              checked={data.lineNumberType === 'logical'}
                              onChange={() => setData({ ...data, lineNumberType: 'logical' })}
                            />
                            改行単位(&W)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px' }}>
                            <span>行数</span>
                            <input type="number" defaultValue={2} style={{ width: '40px', padding: '1px' }} />
                          </div>
                        </div>

                        {/* 行番号区切り */}
                        <div style={{ border: '1px solid #c0c0c0', padding: '4px 6px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>行番号区切り</div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <input type="radio" name="gutterSep" /> なし(&N)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <input type="radio" name="gutterSep" defaultChecked /> 縦線(&V)
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
                            <input type="radio" name="gutterSep" /> 任意(&Y)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px', fontSize: '11px' }}>
                            <span>半角(&S)</span>
                            <input type="text" defaultValue=":" style={{ width: '25px', textAlign: 'center' }} />
                          </div>
                        </div>

                        {/* 背景画像 */}
                        <div style={{ border: '1px solid #c0c0c0', padding: '4px 6px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>背景画像</div>
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            <input type="text" style={{ flex: 1, padding: '1px' }} />
                            <button className="sakura-dialog-btn">...</button>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '3px', alignItems: 'center', fontSize: '11px' }}>
                            <label>表示位置:</label>
                            <select style={{ padding: '1px' }}><option>左上</option><option>中央</option><option>右上</option></select>
                            <label>透明度:</label>
                            <input type="range" min={0} max={100} defaultValue={0} />
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* ==================== 4. 支援 タブ ==================== */}
                {activeTab === 'support' && (
                  <div>
                    <fieldset className="win32-groupbox" style={{ padding: '8px' }}>
                      <legend>入力補完</legend>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <input type="checkbox" defaultChecked /> 補完候補を表示する(&C)
                      </label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <label>辞書ファイル(&D):</label>
                        <input type="text" style={{ flex: 1, padding: '2px' }} />
                        <button className="sakura-dialog-btn">参照...</button>
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* ==================== 5. 正規表現キーワード タブ ==================== */}
                {activeTab === 'regex' && (
                  <div>
                    <fieldset className="win32-groupbox" style={{ padding: '8px' }}>
                      <legend>正規表現キーワード</legend>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <input type="checkbox" defaultChecked /> 正規表現キーワードを使用する(&U)
                      </label>
                      <div style={{ height: '220px', border: '2px inset #ffffff', background: '#ffffff', overflowY: 'auto', padding: '4px' }}>
                        <div style={{ color: '#555555' }}>/^[A-Z][a-zA-Z0-9_]*/k (型名ハイライト)</div>
                        <div style={{ color: '#555555' }}>/[0-9]+\.[0-9]+/ (小数ハイライト)</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <button className="sakura-dialog-btn">追加...</button>
                        <button className="sakura-dialog-btn">編集...</button>
                        <button className="sakura-dialog-btn">削除</button>
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* ==================== 6. キーワードヘルプ タブ ==================== */}
                {activeTab === 'keyword_help' && (
                  <div>
                    <fieldset className="win32-groupbox" style={{ padding: '8px' }}>
                      <legend>キーワードヘルプ辞書</legend>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        <input type="checkbox" defaultChecked /> キーワードヘルプを使用する(&H)
                      </label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <label>辞書ファイル(&F):</label>
                        <input type="text" style={{ flex: 1, padding: '2px' }} />
                        <button className="sakura-dialog-btn">参照...</button>
                      </div>
                    </fieldset>
                  </div>
                )}
              </div>
            </div>

            {/* ダイアログ最下部バー (実機完全準拠: 設定フォルダー(F) >> と OK, キャンセル, ヘルプ) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
              }}
            >
              <button
                className="sakura-dialog-btn"
                onClick={() => alert('設定フォルダー: C:\\Users\\...\\sakura')}
              >
                設定フォルダー(&F) &gt;&gt;
              </button>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="sakura-dialog-btn primary"
                  onClick={handleOk}
                  style={{ minWidth: '70px', fontWeight: 'bold' }}
                >
                  OK
                </button>
                <button
                  className="sakura-dialog-btn"
                  onClick={onClose}
                  style={{ minWidth: '70px' }}
                >
                  キャンセル
                </button>
                <button
                  className="sakura-dialog-btn"
                  onClick={() => alert('サクラエディタ ヘルプ: タイプ別設定')}
                  style={{ minWidth: '70px' }}
                >
                  ヘルプ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 共通設定 - 強調キーワード 子ダイアログ */}
      <KeywordDialog
        isOpen={isKeywordDialogDocOpen}
        onClose={() => setIsKeywordDialogDocOpen(false)}
        onApply={(kwSet) => alert(`キーワードセット「${kwSet}」を適用しました`)}
      />
    </>
  );
};
