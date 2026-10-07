import React, { useState } from 'react';
import type { TypeSettingItem, ColorItemSetting } from '../../../core/config/TypeSettingsModel';

interface TypeSettingDialogProps {
  isOpen: boolean;
  typeItem: TypeSettingItem;
  initialTab?: TabKey;
  onClose: () => void;
  onSave: (updatedItem: TypeSettingItem) => void;
}

export type TypeSettingTabKey = TabKey;

type TabKey = 'screen' | 'color' | 'window' | 'support' | 'keyword' | 'outline' | 'regex';

export const TypeSettingDialog: React.FC<TypeSettingDialogProps> = ({
  isOpen,
  typeItem,
  initialTab = 'screen',
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [data, setData] = useState<TypeSettingItem>(typeItem);
  const [selectedColorKey, setSelectedColorKey] = useState<string>('text');

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

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '600px' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>タイプ別設定 - [{data.name}]</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '8px' }}>
          {/* Win32 プロパティシート タブコントロール */}
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
                className={`win32-tab-btn ${activeTab === 'keyword' ? 'active' : ''}`}
                onClick={() => setActiveTab('keyword')}
              >
                キーワード
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'outline' ? 'active' : ''}`}
                onClick={() => setActiveTab('outline')}
              >
                アウトライン解析
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'regex' ? 'active' : ''}`}
                onClick={() => setActiveTab('regex')}
              >
                正規表現キーワード
              </button>
            </div>

            {/* タブページ内容 */}
            <div className="win32-tab-page" style={{ minHeight: '340px' }}>
              {/* ==================== 1. スクリーン タブ ==================== */}
              {activeTab === 'screen' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '6px', marginBottom: '8px' }}>
                    <label>設定の名前(&N):</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                    />

                    <label>ファイル拡張子(&E):</label>
                    <input
                      type="text"
                      value={data.extensions}
                      onChange={(e) => setData({ ...data, extensions: e.target.value })}
                      placeholder="例: txt,log,ini"
                      style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                    />
                  </div>

                  {/* レイアウト グループボックス */}
                  <fieldset className="win32-groupbox">
                    <legend>レイアウト</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* 折り返し方法 */}
                      <div>
                        <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>折り返し方法</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginLeft: '6px' }}>
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="radio"
                              name="wrapMode"
                              checked={data.wrapConfig.wrapMode === 'column'}
                              onChange={() =>
                                setData({
                                  ...data,
                                  wrapConfig: { ...data.wrapConfig, wrapMode: 'column' },
                                })
                              }
                            />
                            <span style={{ marginLeft: '4px' }}>指定桁で折り返す(&W)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="radio"
                              name="wrapMode"
                              checked={data.wrapConfig.wrapMode === 'window'}
                              onChange={() =>
                                setData({
                                  ...data,
                                  wrapConfig: { ...data.wrapConfig, wrapMode: 'window' },
                                })
                              }
                            />
                            <span style={{ marginLeft: '4px' }}>右端で折り返す(&R)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="radio"
                              name="wrapMode"
                              checked={data.wrapConfig.wrapMode === 'none'}
                              onChange={() =>
                                setData({
                                  ...data,
                                  wrapConfig: { ...data.wrapConfig, wrapMode: 'none' },
                                })
                              }
                            />
                            <span style={{ marginLeft: '4px' }}>折り返さない(&N)</span>
                          </label>
                        </div>

                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label>折り返し桁数(&C):</label>
                          <input
                            type="number"
                            min={10}
                            max={10240}
                            value={data.wrapConfig.wrapColumn}
                            disabled={data.wrapConfig.wrapMode !== 'column'}
                            onChange={(e) =>
                              setData({
                                ...data,
                                wrapConfig: {
                                  ...data.wrapConfig,
                                  wrapColumn: parseInt(e.target.value, 10) || 80,
                                },
                              })
                            }
                            style={{ width: '60px', padding: '2px' }}
                          />
                          <span>桁</span>
                        </div>
                      </div>

                      {/* TAB幅 & フォント & スペーシング */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ width: '85px' }}>TAB幅(&T):</label>
                          <input
                            type="number"
                            min={1}
                            max={64}
                            value={data.wrapConfig.tabSize}
                            onChange={(e) =>
                              setData({
                                ...data,
                                wrapConfig: {
                                  ...data.wrapConfig,
                                  tabSize: parseInt(e.target.value, 10) || 4,
                                },
                              })
                            }
                            style={{ width: '50px', padding: '2px' }}
                          />
                          <span>桁</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ width: '85px' }}>行の間隔(&L):</label>
                          <input
                            type="number"
                            min={0}
                            max={32}
                            value={data.lineSpacing}
                            onChange={(e) =>
                              setData({ ...data, lineSpacing: parseInt(e.target.value, 10) || 0 })
                            }
                            style={{ width: '50px', padding: '2px' }}
                          />
                          <span>ドット</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ width: '85px' }}>文字サイズ(&S):</label>
                          <select
                            value={data.fontSize}
                            onChange={(e) => setData({ ...data, fontSize: parseInt(e.target.value, 10) })}
                            style={{ padding: '2px 4px' }}
                          >
                            <option value={10}>10 pt</option>
                            <option value={12}>12 pt</option>
                            <option value={14}>14 pt (標準)</option>
                            <option value={16}>16 pt</option>
                            <option value={18}>18 pt</option>
                            <option value={20}>20 pt</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ width: '85px' }}>フォント名(&F):</label>
                          <select
                            value={data.fontFamily}
                            onChange={(e) => setData({ ...data, fontFamily: e.target.value })}
                            style={{ padding: '2px 4px', flexGrow: 1 }}
                          >
                            <option value="'BIZ UDGothic', 'MS Gothic', monospace">BIZ UDゴシック</option>
                            <option value="'MS Gothic', monospace">ＭＳ ゴシック</option>
                            <option value="'Meiryo', monospace">メイリオ</option>
                            <option value="monospace">等幅 (monospace)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </fieldset>

                  {/* インデント グループボックス */}
                  <fieldset className="win32-groupbox">
                    <legend>インデント</legend>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={data.autoIndent}
                        onChange={(e) => setData({ ...data, autoIndent: e.target.checked })}
                      />
                      <span style={{ marginLeft: '4px' }}>自動インデント(&A) (改行時に直前のインデントを継承)</span>
                    </label>
                  </fieldset>
                </div>
              )}

              {/* ==================== 2. カラー タブ (本家サクラエディタ仕様) ==================== */}
              {activeTab === 'color' && (
                <div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {/* 左側: 色設定リストボックス */}
                    <div style={{ width: '220px' }}>
                      <div style={{ fontSize: '11px', marginBottom: '2px' }}>色指定(&C):</div>
                      <div
                        style={{
                          height: '210px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {Object.values(data.colorSettings).map((c) => {
                          const isSelected = c.key === selectedColorKey;
                          return (
                            <div
                              key={c.key}
                              style={{
                                padding: '2px 6px',
                                background: isSelected ? '#0a246a' : 'transparent',
                                color: isSelected ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                              onClick={() => setSelectedColorKey(c.key)}
                            >
                              <span>{c.name}</span>
                              {c.fg && (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    width: '12px',
                                    height: '12px',
                                    background: c.fg,
                                    border: '1px solid #888',
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 右側: 選択項目の詳細設定 */}
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <fieldset className="win32-groupbox" style={{ margin: 0, padding: '8px' }}>
                        <legend>[{currentColorSetting.name}] の設定</legend>

                        {/* 表示フラグ（記号系の場合） */}
                        {currentColorSetting.show !== undefined && (
                          <div style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center' }}>
                              <input
                                type="checkbox"
                                checked={currentColorSetting.show}
                                onChange={(e) => updateSelectedColor({ show: e.target.checked })}
                              />
                              <span style={{ marginLeft: '4px' }}>記号を表示する(&V)</span>
                            </label>
                          </div>
                        )}

                        {/* 太字・下線 */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={currentColorSetting.bold || false}
                              onChange={(e) => updateSelectedColor({ bold: e.target.checked })}
                            />
                            <span style={{ marginLeft: '4px' }}>太字(&B)</span>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              checked={currentColorSetting.underline || false}
                              onChange={(e) => updateSelectedColor({ underline: e.target.checked })}
                            />
                            <span style={{ marginLeft: '4px' }}>下線(&U)</span>
                          </label>
                        </div>

                        {/* 文字色 & 背景色 */}
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', alignItems: 'center' }}>
                          {currentColorSetting.fg !== undefined && (
                            <>
                              <label>文字色(&F):</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="color"
                                  value={currentColorSetting.fg}
                                  onChange={(e) => updateSelectedColor({ fg: e.target.value })}
                                />
                                <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{currentColorSetting.fg}</span>
                              </div>
                            </>
                          )}

                          {currentColorSetting.bg !== undefined && (
                            <>
                              <label>背景色(&K):</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="color"
                                  value={currentColorSetting.bg}
                                  onChange={(e) => updateSelectedColor({ bg: e.target.value })}
                                />
                                <span style={{ fontSize: '11px', fontFamily: 'monospace' }}>{currentColorSetting.bg}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </fieldset>

                      {/* リアルタイム プレビュー枠 (本家サクラエディタ仕様) */}
                      <fieldset className="win32-groupbox" style={{ margin: 0, padding: '6px' }}>
                        <legend>プレビュー</legend>
                        <div
                          style={{
                            height: '55px',
                            background: data.theme.background,
                            color: data.theme.textColor,
                            fontFamily: data.fontFamily,
                            fontSize: `${data.fontSize}px`,
                            border: '1px solid #a0a0a0',
                            padding: '4px',
                            whiteSpace: 'pre',
                            overflow: 'hidden',
                          }}
                        >
                          <div>サクラエディタの表示例□(全角)</div>
                          <div>
                            <span style={{ color: data.theme.keywordColor, fontWeight: 'bold' }}>const</span>{' '}
                            <span style={{ color: data.theme.stringColor }}>"テキスト"</span>;{' '}
                            <span style={{ color: data.theme.commentColor }}>// コメント↵</span>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 3. ウィンドウ タブ ==================== */}
              {activeTab === 'window' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>行番号表示</legend>
                    <label style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                      <input
                        type="checkbox"
                        checked={data.showLineNumbers}
                        onChange={(e) => setData({ ...data, showLineNumbers: e.target.checked })}
                      />
                      <span style={{ marginLeft: '4px' }}>行番号を表示する(&N)</span>
                    </label>

                    <div style={{ display: 'flex', gap: '16px', marginLeft: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name="lineNumberType"
                          checked={data.lineNumberType === 'logical'}
                          onChange={() => setData({ ...data, lineNumberType: 'logical' })}
                        />
                        <span style={{ marginLeft: '4px' }}>論理行 (改行基準)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="radio"
                          name="lineNumberType"
                          checked={data.lineNumberType === 'visual'}
                          onChange={() => setData({ ...data, lineNumberType: 'visual' })}
                        />
                        <span style={{ marginLeft: '4px' }}>表示行 (折り返し基準)</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>ルーラー & スクロールバー</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.showRuler}
                          onChange={(e) => setData({ ...data, showRuler: e.target.checked })}
                        />
                        <span style={{ marginLeft: '4px' }}>上部 桁ルーラーを表示する(&R)</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 4. 支援 タブ ==================== */}
              {activeTab === 'support' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>構文強調 (シンタックス)</legend>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '6px 0' }}>
                      <label>構文タイプ(&S):</label>
                      <select
                        value={data.syntaxName}
                        onChange={(e) => setData({ ...data, syntaxName: e.target.value })}
                        style={{ padding: '3px 6px', minWidth: '180px' }}
                      >
                        <option value="Text">基本テキスト (Text)</option>
                        <option value="C/C++">C/C++</option>
                        <option value="JavaScript/TypeScript">JavaScript / TypeScript</option>
                        <option value="Python">Python</option>
                        <option value="HTML">HTML</option>
                        <option value="Markdown">Markdown</option>
                      </select>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>括弧 & 補完支援</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" defaultChecked />
                        <span style={{ marginLeft: '4px' }}>対括弧の強調表示 (キャレット位置の括弧に対応する括弧を強調)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" defaultChecked />
                        <span style={{ marginLeft: '4px' }}>閉じ括弧の自動補完 ( (), {}, [], "", '' )</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input type="checkbox" defaultChecked />
                        <span style={{ marginLeft: '4px' }}>単語補完 (編集中の単語候補をサジェスト)</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 5. キーワード タブ ==================== */}
              {activeTab === 'keyword' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>強調キーワードセット</legend>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ width: '130px' }}>
                        <div style={{ fontSize: '11px', marginBottom: '4px' }}>セット選択:</div>
                        <div style={{ border: '2px inset #fff', background: '#fff', height: '140px', fontSize: '11px', padding: '2px' }}>
                          <div style={{ padding: '2px 4px', background: '#0a246a', color: '#fff' }}>セット 1 (予約語)</div>
                          <div style={{ padding: '2px 4px' }}>セット 2 (組み込み)</div>
                          <div style={{ padding: '2px 4px' }}>セット 3 (型・クラス)</div>
                          <div style={{ padding: '2px 4px' }}>セット 4 (マクロ)</div>
                          <div style={{ padding: '2px 4px' }}>セット 5 (カスタム)</div>
                        </div>
                      </div>

                      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center' }}>
                            <input type="checkbox" defaultChecked />
                            <span style={{ marginLeft: '4px' }}>大文字・小文字を区別する(&C)</span>
                          </label>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="sakura-dialog-btn" style={{ minWidth: '60px', padding: '2px 6px' }}>
                              インポート
                            </button>
                            <button className="sakura-dialog-btn" style={{ minWidth: '60px', padding: '2px 6px' }}>
                              エクスポート
                            </button>
                          </div>
                        </div>

                        <textarea
                          readOnly
                          value={
                            data.syntaxName === 'C/C++'
                              ? `auto break case char const continue default do double else enum extern float for goto if int long register return short signed sizeof static struct switch typedef union unsigned void volatile while class public private protected virtual`
                              : data.syntaxName === 'Python'
                              ? `and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield`
                              : `abstract as async await break case catch class const continue debugger default delete do else enum export extends false finally for from function if implements import in instanceof interface let new null package private protected public return super switch this throw true try typeof var void while with yield`
                          }
                          style={{
                            width: '100%',
                            height: '110px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            padding: '4px',
                            border: '1px solid #7f9db9',
                            resize: 'none',
                          }}
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 5. アウトライン解析 タブ ==================== */}
              {activeTab === 'outline' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>アウトライン解析ルール</legend>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                      <label>解析ルール(&R):</label>
                      <select
                        value={data.outlineRule}
                        onChange={(e) => setData({ ...data, outlineRule: e.target.value })}
                        style={{ padding: '3px 6px', minWidth: '180px' }}
                      >
                        <option value="text">テキスト (見出し/箇条書き抽出)</option>
                        <option value="cpp">C/C++ (関数・クラス定義)</option>
                        <option value="java">Java (クラス・メソッド定義)</option>
                        <option value="python">Python (class / def 定義)</option>
                        <option value="html">HTML/XML (タグ階層)</option>
                        <option value="markdown">Markdown (#, ##, ### 見出し階層)</option>
                      </select>
                    </div>
                    <div style={{ fontSize: '11px', color: '#666666' }}>
                      文書内の関数一覧や見出しツリーを抽出し、アウトラインウィンドウへ表示します。
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 6. 正規表現キーワード タブ ==================== */}
              {activeTab === 'regex' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>正規表現キーワード</legend>
                    <div style={{ fontSize: '11px', color: '#555555', marginBottom: '6px' }}>
                      指定した正規表現に合致する文字列に構文強調色を適用します。
                    </div>
                    <textarea
                      placeholder={`// サクラエディタ 正規表現キーワード指定例\n/\\b[A-Z_][A-Z0-9_]*\\b/k // 定数強調\n/https?:\\/\\/[^\\s]+/u // URL強調`}
                      style={{
                        width: '100%',
                        height: '160px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        padding: '4px',
                        border: '1px solid #7f9db9',
                      }}
                    />
                  </fieldset>
                </div>
              )}
            </div>
          </div>

          {/* 下部ボタン (Win32標準: OK, キャンセル, 適用) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '10px' }}>
            <button
              className="sakura-dialog-btn primary"
              onClick={() => {
                onSave(data);
                onClose();
              }}
            >
              OK
            </button>
            <button className="sakura-dialog-btn" onClick={onClose}>
              キャンセル
            </button>
            <button className="sakura-dialog-btn" onClick={() => onSave(data)}>
              適用(&A)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
