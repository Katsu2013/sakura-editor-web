import React, { useState, useMemo } from 'react';
import type { CommonSettingsModel, MacroRegistration } from '../../../core/config/CommonSettingsModel';
import { DEFAULT_COMMON_SETTINGS } from '../../../core/config/CommonSettingsModel';
import { ALL_COMMANDS } from './CommandListDialog';

export type CommonTabKey =
  | 'general'
  | 'file'
  | 'backup'
  | 'format'
  | 'toolbar'
  | 'tabbar'
  | 'statusbar'
  | 'macro'
  | 'keybind';

interface CommonSettingDialogProps {
  isOpen: boolean;
  settings: CommonSettingsModel;
  initialTab?: CommonTabKey;
  onClose: () => void;
  onSave: (updatedSettings: CommonSettingsModel) => void;
}

export const CommonSettingDialog: React.FC<CommonSettingDialogProps> = ({
  isOpen,
  settings,
  initialTab = 'general',
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<CommonTabKey>(initialTab);
  const [data, setData] = useState<CommonSettingsModel>(settings);
  const [selectedMacroIdx, setSelectedMacroIdx] = useState<number>(0);
  const [selectedKeyFunc, setSelectedKeyFunc] = useState<string>('new');
  const [newShortcutInput, setNewShortcutInput] = useState<string>('Ctrl+N');
  const [keyCategory, setKeyCategory] = useState<string>('すべて');
  const [keySearchQuery, setKeySearchQuery] = useState<string>('');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  React.useEffect(() => {
    setData(settings);
    if (initialTab) setActiveTab(initialTab);
  }, [settings, isOpen, initialTab]);

  if (!isOpen) return null;

  const currentMacro: MacroRegistration = data.macros[selectedMacroIdx] || {
    id: selectedMacroIdx,
    name: '',
    path: '',
    shortcut: '',
  };

  const updateMacro = (updater: Partial<MacroRegistration>) => {
    const nextMacros = [...data.macros];
    nextMacros[selectedMacroIdx] = {
      ...currentMacro,
      ...updater,
    };
    setData({ ...data, macros: nextMacros });
  };

  const filteredKeyCommands = useMemo(() => {
    return ALL_COMMANDS.filter((cmd) => {
      if (keyCategory !== 'すべて' && cmd.category !== keyCategory) return false;
      if (!keySearchQuery) return true;
      const q = keySearchQuery.toLowerCase();
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.shortcut.toLowerCase().includes(q) ||
        cmd.id.toLowerCase().includes(q)
      );
    });
  }, [keyCategory, keySearchQuery]);

  const selectedCmd = ALL_COMMANDS.find((c) => c.id === selectedKeyFunc) || ALL_COMMANDS[0];

  const handleAssignKey = () => {
    if (!newShortcutInput.trim()) return;
    setData({
      ...data,
      keyBindings: {
        ...data.keyBindings,
        [selectedKeyFunc]: newShortcutInput.trim(),
      },
    });
  };

  const handleRemoveKey = () => {
    const nextBindings = { ...data.keyBindings };
    delete nextBindings[selectedKeyFunc];
    setData({
      ...data,
      keyBindings: nextBindings,
    });
    setNewShortcutInput('');
  };

  const handleResetKeys = () => {
    const ok = window.confirm('キー割り当てを初期設定に戻しますか？');
    if (!ok) return;
    setData({
      ...data,
      keyBindings: { ...DEFAULT_COMMON_SETTINGS.keyBindings },
    });
  };

  const handleShortcutKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    let k = e.key;
    if (k === 'Escape') k = 'Esc';
    else if (k === ' ') k = 'Space';
    else if (k.length === 1) k = k.toUpperCase();
    parts.push(k);
    setNewShortcutInput(parts.join('+'));
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '640px' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>共通設定</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={onClose}>✕</span>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '8px' }}>
          {/* Win32 プロパティシート タブコントロール */}
          <div className="win32-tab-control">
            <div className="win32-tab-header" style={{ flexWrap: 'wrap', rowGap: '2px' }}>
              <button
                className={`win32-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                全般
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab('file')}
              >
                ファイル
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'backup' ? 'active' : ''}`}
                onClick={() => setActiveTab('backup')}
              >
                バックアップ
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'format' ? 'active' : ''}`}
                onClick={() => setActiveTab('format')}
              >
                書式
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'toolbar' ? 'active' : ''}`}
                onClick={() => setActiveTab('toolbar')}
              >
                ツールバー
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'tabbar' ? 'active' : ''}`}
                onClick={() => setActiveTab('tabbar')}
              >
                タブバー
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'statusbar' ? 'active' : ''}`}
                onClick={() => setActiveTab('statusbar')}
              >
                ステータスバー
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'macro' ? 'active' : ''}`}
                onClick={() => setActiveTab('macro')}
              >
                マクロ
              </button>
              <button
                className={`win32-tab-btn ${activeTab === 'keybind' ? 'active' : ''}`}
                onClick={() => setActiveTab('keybind')}
              >
                キー割り当て
              </button>
            </div>

            {/* タブページ内容 */}
            <div className="win32-tab-page" style={{ minHeight: '340px' }}>
              {/* ==================== 1. 全般 タブ ==================== */}
              {activeTab === 'general' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>カーソル制御</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.general.freeCursor}
                          onChange={(e) =>
                            setData({
                              ...data,
                              general: { ...data.general, freeCursor: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>フリーカーソルモード (行末以降への移動を許可)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.general.overstrike}
                          onChange={(e) =>
                            setData({
                              ...data,
                              general: { ...data.general, overstrike: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>上書きモード (OVR) を有効にする</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.general.wordWrapByPunctuation}
                          onChange={(e) =>
                            setData({
                              ...data,
                              general: { ...data.general, wordWrapByPunctuation: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>単語単位の移動で句読点を区切る</span>
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>スクロール</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.general.smoothScroll}
                          onChange={(e) =>
                            setData({
                              ...data,
                              general: { ...data.general, smoothScroll: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>スムーズスクロールを行う</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '22px' }}>
                        <label>ホイールスクロール行数(&L):</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={data.general.scrollLines}
                          onChange={(e) =>
                            setData({
                              ...data,
                              general: {
                                ...data.general,
                                scrollLines: parseInt(e.target.value, 10) || 3,
                              },
                            })
                          }
                          style={{ width: '50px', padding: '2px' }}
                        />
                        <span>行</span>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>編集マーク</legend>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={data.general.showModifiedGutter}
                        onChange={(e) =>
                          setData({
                            ...data,
                            general: { ...data.general, showModifiedGutter: e.target.checked },
                          })
                        }
                      />
                      <span style={{ marginLeft: '6px' }}>変更行を行番号エリア（Gutter）に緑色ラインで表示する</span>
                    </label>
                  </fieldset>
                </div>
              )}

              {/* ==================== 2. ファイル タブ ==================== */}
              {activeTab === 'file' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>標準文字コード・改行コード</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', alignItems: 'center' }}>
                      <label>デフォルト文字コード(&C):</label>
                      <select
                        value={data.file.defaultEncoding}
                        onChange={(e) =>
                          setData({
                            ...data,
                            file: { ...data.file, defaultEncoding: e.target.value as any },
                          })
                        }
                        style={{ padding: '2px 4px' }}
                      >
                        <option value="UTF-8">UTF-8 (BOMなし)</option>
                        <option value="Shift_JIS">Shift_JIS (CP932)</option>
                        <option value="EUC-JP">EUC-JP</option>
                      </select>

                      <label>デフォルト改行コード(&L):</label>
                      <select
                        value={data.file.defaultLineEnding}
                        onChange={(e) =>
                          setData({
                            ...data,
                            file: { ...data.file, defaultLineEnding: e.target.value as any },
                          })
                        }
                        style={{ padding: '2px 4px' }}
                      >
                        <option value="CRLF">CRLF (Windows標準)</option>
                        <option value="LF">LF (UNIX/Linux/macOS)</option>
                        <option value="CR">CR (Classic Mac)</option>
                      </select>
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>排他制御 & 自動保存</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.file.exclusiveLock}
                          onChange={(e) =>
                            setData({
                              ...data,
                              file: { ...data.file, exclusiveLock: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ファイルの排他ロックを有効にする</span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.file.autoSave}
                            onChange={(e) =>
                              setData({
                                ...data,
                                file: { ...data.file, autoSave: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '6px' }}>自動保存を行う(&A):</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={data.file.autoSaveIntervalMinutes}
                          disabled={!data.file.autoSave}
                          onChange={(e) =>
                            setData({
                              ...data,
                              file: {
                                ...data.file,
                                autoSaveIntervalMinutes: parseInt(e.target.value, 10) || 5,
                              },
                            })
                          }
                          style={{ width: '50px', padding: '2px' }}
                        />
                        <span>分ごと</span>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 3. バックアップ タブ ==================== */}
              {activeTab === 'backup' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>バックアップの作成</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.backup.createBackup}
                          onChange={(e) =>
                            setData({
                              ...data,
                              backup: { ...data.backup, createBackup: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>保存時にバックアップファイルを作成する(&B)</span>
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginLeft: '22px' }}>
                        <label>拡張子(&E):</label>
                        <input
                          type="text"
                          value={data.backup.backupExtension}
                          disabled={!data.backup.createBackup}
                          onChange={(e) =>
                            setData({
                              ...data,
                              backup: { ...data.backup, backupExtension: e.target.value },
                            })
                          }
                          style={{ padding: '2px 4px', width: '120px' }}
                        />

                        <label>バックアップ先:</label>
                        <input
                          type="text"
                          placeholder="(同一フォルダー)"
                          value={data.backup.backupFolder}
                          disabled={!data.backup.createBackup}
                          onChange={(e) =>
                            setData({
                              ...data,
                              backup: { ...data.backup, backupFolder: e.target.value },
                            })
                          }
                          style={{ padding: '2px 4px' }}
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 4. 書式 タブ ==================== */}
              {activeTab === 'format' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>日時フォーマット</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                      <label>日時の書式(&D):</label>
                      <input
                        type="text"
                        value={data.format.dateTimeFormat}
                        onChange={(e) =>
                          setData({
                            ...data,
                            format: { ...data.format, dateTimeFormat: e.target.value },
                          })
                        }
                        style={{ padding: '2px 4px' }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '6px' }}>
                      メニュー [編集] - [現在日時を挿入] で挿入されるフォーマットです。
                    </div>
                  </fieldset>

                  <fieldset className="win32-groupbox">
                    <legend>引用符</legend>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', alignItems: 'center' }}>
                      <label>引用符(&Q):</label>
                      <input
                        type="text"
                        value={data.format.quoteString}
                        onChange={(e) =>
                          setData({
                            ...data,
                            format: { ...data.format, quoteString: e.target.value },
                          })
                        }
                        style={{ padding: '2px 4px', width: '80px' }}
                      />
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 5. ツールバー タブ ==================== */}
              {activeTab === 'toolbar' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>ツールバー表示設定</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.toolbar.showToolbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              toolbar: { ...data.toolbar, showToolbar: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ツールバーを表示する(&T)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <input
                          type="checkbox"
                          checked={data.toolbar.flatButtons}
                          disabled={!data.toolbar.showToolbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              toolbar: { ...data.toolbar, flatButtons: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>フラットボタン表示にする</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <input
                          type="checkbox"
                          checked={data.toolbar.showTooltips}
                          disabled={!data.toolbar.showToolbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              toolbar: { ...data.toolbar, showTooltips: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ツールチップを表示する</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 6. タブバー タブ ==================== */}
              {activeTab === 'tabbar' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>タブバー設定</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.tabbar.showTabbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              tabbar: { ...data.tabbar, showTabbar: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>タブバーを表示する(&T)</span>
                      </label>

                      <div style={{ display: 'flex', gap: '16px', marginLeft: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="tabPosition"
                            checked={data.tabbar.position === 'top'}
                            disabled={!data.tabbar.showTabbar}
                            onChange={() =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, position: 'top' },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ウィンドウ上部に表示</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="radio"
                            name="tabPosition"
                            checked={data.tabbar.position === 'bottom'}
                            disabled={!data.tabbar.showTabbar}
                            onChange={() =>
                              setData({
                                ...data,
                                tabbar: { ...data.tabbar, position: 'bottom' },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>ウィンドウ下部に表示</span>
                        </label>
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <input
                          type="checkbox"
                          checked={data.tabbar.showCloseButton}
                          disabled={!data.tabbar.showTabbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              tabbar: { ...data.tabbar, showCloseButton: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>タブごとに閉じるボタンを表示する</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                        <input
                          type="checkbox"
                          checked={data.tabbar.showModifiedMarker}
                          disabled={!data.tabbar.showTabbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              tabbar: { ...data.tabbar, showModifiedMarker: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>変更時にファイル名末尾へ「*」を表示する</span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 7. ステータスバー タブ ==================== */}
              {activeTab === 'statusbar' && (
                <div>
                  <fieldset className="win32-groupbox">
                    <legend>ステータスバー表示項目</legend>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={data.statusbar.showStatusbar}
                          onChange={(e) =>
                            setData({
                              ...data,
                              statusbar: { ...data.statusbar, showStatusbar: e.target.checked },
                            })
                          }
                        />
                        <span style={{ marginLeft: '6px' }}>ステータスバーを表示する(&S)</span>
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginLeft: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showCursorPos}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showCursorPos: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>カーソル位置 (行, 桁)</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showCharCount}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showCharCount: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>選択文字数 / 総行数</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showEncoding}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showEncoding: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>文字コード名</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showLineEnding}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showLineEnding: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>改行コード名 (CRLF/LF)</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showCharCode}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showCharCode: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>現在文字コード値 (U+XXXX)</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={data.statusbar.showInsOvr}
                            disabled={!data.statusbar.showStatusbar}
                            onChange={(e) =>
                              setData({
                                ...data,
                                statusbar: { ...data.statusbar, showInsOvr: e.target.checked },
                              })
                            }
                          />
                          <span style={{ marginLeft: '4px' }}>挿入/上書きモード (INS/OVR)</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              {/* ==================== 8. マクロ タブ ==================== */}
              {activeTab === 'macro' && (
                <div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '180px' }}>
                      <div style={{ fontSize: '11px', marginBottom: '4px' }}>マクロ一覧 (0〜49):</div>
                      <div
                        style={{
                          height: '240px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {Array.from({ length: 50 }).map((_, idx) => {
                          const item = data.macros[idx];
                          const isSel = idx === selectedMacroIdx;
                          return (
                            <div
                              key={idx}
                              style={{
                                padding: '2px 6px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                              }}
                              onClick={() => setSelectedMacroIdx(idx)}
                            >
                              {idx.toString().padStart(2, '0')}: {item && item.name ? item.name : '(空き)'}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <fieldset className="win32-groupbox">
                        <legend>マクロ番号 [{selectedMacroIdx}] の設定</legend>
                        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px', alignItems: 'center' }}>
                          <label>表示名(&N):</label>
                          <input
                            type="text"
                            value={currentMacro.name || ''}
                            onChange={(e) => updateMacro({ name: e.target.value })}
                            placeholder="例: 行番号挿入マクロ"
                            style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                          />

                          <label>ファイル(&F):</label>
                          <input
                            type="text"
                            value={currentMacro.path || ''}
                            onChange={(e) => updateMacro({ path: e.target.value })}
                            placeholder="例: C:\sakura\macros\sample.mac"
                            style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                          />

                          <label>ショートカット:</label>
                          <input
                            type="text"
                            value={currentMacro.shortcut || ''}
                            onChange={(e) => updateMacro({ shortcut: e.target.value })}
                            placeholder="例: Ctrl+Shift+1"
                            style={{ padding: '2px 4px', border: '1px solid #7f9db9' }}
                          />
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 9. キー割り当て タブ ==================== */}
              {activeTab === 'keybind' && (
                <div>
                  {/* 分類 & 絞り込みフィルター */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px' }}>分類(&C):</span>
                    <select
                      value={keyCategory}
                      onChange={(e) => setKeyCategory(e.target.value)}
                      style={{ padding: '2px 4px', fontSize: '11px' }}
                    >
                      {['すべて', 'ファイル', '編集', '変換', '検索', 'ツール', '設定', 'ウィンドウ', 'ヘルプ'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <span style={{ fontSize: '11px', marginLeft: '6px' }}>絞り込み:</span>
                    <input
                      type="text"
                      value={keySearchQuery}
                      onChange={(e) => setKeySearchQuery(e.target.value)}
                      placeholder="機能名やキーで絞り込み..."
                      style={{ flexGrow: 1, padding: '2px 4px', fontSize: '11px', border: '1px solid #7f9db9' }}
                    />
                    {keySearchQuery && (
                      <button
                        onClick={() => setKeySearchQuery('')}
                        style={{ padding: '1px 5px', fontSize: '10px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '310px' }}>
                      <div style={{ fontSize: '11px', marginBottom: '4px' }}>機能一覧 (全 {filteredKeyCommands.length} 件):</div>
                      <div
                        style={{
                          height: '215px',
                          border: '2px inset #ffffff',
                          background: '#ffffff',
                          overflowY: 'auto',
                          fontSize: '11px',
                        }}
                      >
                        {filteredKeyCommands.map((f) => {
                          const isSel = f.id === selectedKeyFunc;
                          const currentKey = data.keyBindings[f.id] || f.shortcut || '(なし)';
                          return (
                            <div
                              key={f.id}
                              style={{
                                padding: '2px 6px',
                                background: isSel ? '#0a246a' : 'transparent',
                                color: isSel ? '#ffffff' : '#000000',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid #f0f0f0',
                              }}
                              onClick={() => {
                                setSelectedKeyFunc(f.id);
                                setNewShortcutInput(data.keyBindings[f.id] || f.shortcut || '');
                              }}
                            >
                              <span>[{f.category}] {f.name}</span>
                              <span style={{ color: isSel ? '#ffffaa' : '#0066cc', fontWeight: isSel ? 'bold' : 'normal' }}>
                                {currentKey}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <fieldset className="win32-groupbox" style={{ height: '100%' }}>
                        <legend>キーの割り当て</legend>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>機能名: <b>[{selectedCmd.category}] {selectedCmd.name}</b></div>
                          <div style={{ fontSize: '11px', color: '#555555' }}>
                            {selectedCmd.description}
                          </div>

                          <div style={{ fontSize: '11px' }}>
                            現在の割り当て: <b style={{ color: '#0066cc' }}>{data.keyBindings[selectedKeyFunc] || selectedCmd.shortcut || '(なし)'}</b>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            <label style={{ fontSize: '11px' }}>新しいキー (入力欄でキーを押してください):</label>
                            <input
                              type="text"
                              value={newShortcutInput}
                              onChange={(e) => setNewShortcutInput(e.target.value)}
                              onKeyDown={handleShortcutKeyDown}
                              placeholder="例: Ctrl+Alt+S"
                              style={{ padding: '3px 6px', border: '1px solid #7f9db9', fontSize: '12px' }}
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                            <button className="sakura-dialog-btn primary" onClick={handleAssignKey}>
                              割り当て(&A)
                            </button>
                            <button className="sakura-dialog-btn" onClick={handleRemoveKey}>
                              解除(&D)
                            </button>
                            <button className="sakura-dialog-btn" onClick={handleResetKeys}>
                              初期化(&R)
                            </button>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 下部ボタン (Win32標準: OK, キャンセル, 適用, ヘルプ) */}
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
            <button className="sakura-dialog-btn" onClick={() => setIsHelpOpen((prev) => !prev)}>
              ヘルプ(&H)
            </button>
          </div>

          {/* ヘルプモーダル */}
          {isHelpOpen && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#ffffef',
                border: '1px solid #d0d090',
                borderRadius: '3px',
                fontSize: '11px',
                lineHeight: '1.5',
                maxHeight: '120px',
                overflowY: 'auto',
              }}
            >
              <b>【サクラエディタ 共通設定ヘルプ】</b><br />
              ・<b>全般</b>: フリーカーソル・上書き(OVR)モード・スムーズスクロール・変更行マーク(緑ライン)を設定します。<br />
              ・<b>ファイル</b>: 新規ファイル作成時の既定文字コード(Shift_JIS/UTF-8等)や自動保存間隔を設定します。<br />
              ・<b>バックアップ</b>: 上書き保存時にバックアップファイル(.bak)の自動生成を設定します。<br />
              ・<b>書式</b>: 日時挿入時の書式(YYYY/MM/DD HH:mm:ss等)や引用符(&gt; )を設定します。<br />
              ・<b>ツールバー/タブバー/ステータスバー</b>: 各種バーの表示・非表示、タブ位置(上/下)、ステータスバー各項目の個別表示を制御します。<br />
              ・<b>マクロ</b>: 50個までの外部マクロファイル登録および個別ショートカットキーを設定します。<br />
              ・<b>キー割り当て</b>: 70種以上の全エディタコマンドにお好みのキーボードショートカットを自由に割り当て可能です。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
