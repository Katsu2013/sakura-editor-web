import React, { useState, useRef, useEffect } from 'react';
import {
  NewIcon,
  OpenIcon,
  SaveIcon,
  PrintIcon,
  UndoIcon,
  RedoIcon,
  CutIcon,
  CopyIcon,
  PasteIcon,
  FindIcon,
  FindNextIcon,
  FindPrevIcon,
  ReplaceIcon,
  GrepIcon,
  OutlineIcon,
  BookmarkIcon,
  BmNextIcon,
  BmPrevIcon,
  BmClearIcon,
  TypeSettingsIcon,
  CommonSettingsIcon,
} from './Icons/SakuraIcons';

export interface ToolBarProps {
  onNew: () => void;
  onNewWithType?: (syntax: string) => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs?: () => void;
  onPrint?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onFind: () => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: () => void;
  onGrep?: () => void;
  onOutline: () => void;
  onBookmarkToggle?: () => void;
  onBookmarkPrev?: () => void;
  onBookmarkNext?: () => void;
  onBookmarkClear?: () => void;
  onTypeList?: () => void;
  onTypeSettings: () => void;
  onCommonSettings?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canSave?: boolean;
  canCut?: boolean;
  canCopy?: boolean;
  flatButtons?: boolean;
  showTooltips?: boolean;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onNew,
  onNewWithType,
  onOpen,
  onSave,
  onPrint = () => window.print(),
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onFind,
  onFindNext,
  onFindPrev,
  onReplace,
  onGrep,
  onOutline,
  onBookmarkToggle,
  onBookmarkPrev,
  onBookmarkNext,
  onBookmarkClear,
  onTypeSettings,
  onCommonSettings,
  canUndo = true,
  canRedo = false,
  canSave = true,
  canCut = false,
  canCopy = false,
  flatButtons = true,
  showTooltips = true,
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tt = (text: string) => (showTooltips ? text : undefined);

  return (
    <div
      className={`sakura-toolbar ${flatButtons ? 'flat' : 'classic'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '28px',
        padding: '1px 3px',
        backgroundColor: '#ece9d8',
        borderBottom: '1px solid #7f9db9',
        userSelect: 'none',
      }}
    >
      {/* ===== グループ 1: 新規、開く、上書き保存、印刷 (実機完全準拠) ===== */}
      <div ref={newMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          className="sakura-tool-btn"
          title={tt('新規作成 (Ctrl+N)')}
          onClick={onNew}
          style={{ paddingRight: '1px' }}
        >
          <NewIcon size={16} />
        </button>
        <button
          className="sakura-tool-btn"
          title={tt('タイプを指定して新規作成')}
          onClick={() => setIsNewMenuOpen((prev) => !prev)}
          style={{
            paddingLeft: '1px',
            paddingRight: '3px',
            fontSize: '8px',
            color: '#444444',
            lineHeight: 1,
          }}
        >
          ▼
        </button>

        {isNewMenuOpen && (
          <div
            className="sakura-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              minWidth: '150px',
              zIndex: 300,
            }}
          >
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNew();
                setIsNewMenuOpen(false);
              }}
            >
              基本
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('C/C++');
                setIsNewMenuOpen(false);
              }}
            >
              C/C++
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('HTML');
                setIsNewMenuOpen(false);
              }}
            >
              HTML
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('JavaScript');
                setIsNewMenuOpen(false);
              }}
            >
              JavaScript
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('Python');
                setIsNewMenuOpen(false);
              }}
            >
              Python
            </div>
          </div>
        )}
      </div>

      <button className="sakura-tool-btn" title={tt('開く... (Ctrl+O)')} onClick={onOpen}>
        <OpenIcon size={16} />
      </button>

      <button
        className="sakura-tool-btn"
        title={tt('上書き保存 (Ctrl+S)')}
        onClick={onSave}
        disabled={!canSave}
      >
        <SaveIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('印刷... (Ctrl+P)')} onClick={onPrint}>
        <PrintIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 2: 元に戻す、やり直し ===== */}
      <button
        className="sakura-tool-btn"
        title={tt('元に戻す (Ctrl+Z)')}
        onClick={onUndo}
        disabled={!canUndo}
      >
        <UndoIcon size={16} />
      </button>

      <button
        className="sakura-tool-btn"
        title={tt('やり直し (Ctrl+Y)')}
        onClick={onRedo}
        disabled={!canRedo}
      >
        <RedoIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 3: 切り取り、コピー、貼り付け ===== */}
      <button
        className="sakura-tool-btn"
        title={tt('切り取り (F7)')}
        onClick={onCut}
        disabled={!canCut}
      >
        <CutIcon size={16} />
      </button>

      <button
        className="sakura-tool-btn"
        title={tt('コピー (F8)')}
        onClick={onCopy}
        disabled={!canCopy}
      >
        <CopyIcon size={16} />
      </button>

      <button
        className="sakura-tool-btn"
        title={tt('貼り付け (F9)')}
        onClick={onPaste}
      >
        <PasteIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 4: 検索、次を検索、前を検索、置換、Grep、アウトライン ===== */}
      <button className="sakura-tool-btn" title={tt('検索 (Ctrl+F)')} onClick={onFind}>
        <FindIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('次を検索 (F3)')} onClick={onFindNext}>
        <FindNextIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('前を検索 (Shift+F3)')} onClick={onFindPrev}>
        <FindPrevIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('置換 (Ctrl+R)')} onClick={onReplace}>
        <ReplaceIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('Grep (Ctrl+G)')} onClick={onGrep}>
        <GrepIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('アウトライン解析 (F11)')} onClick={onOutline}>
        <OutlineIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 5: ブックマーク設定、前のしおり、次のしおり、全解除 ===== */}
      <button className="sakura-tool-btn" title={tt('ブックマーク設定・解除 (F11)')} onClick={onBookmarkToggle}>
        <BookmarkIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('前のブックマーク (Shift+F2)')} onClick={onBookmarkPrev}>
        <BmPrevIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('次のブックマーク (F2)')} onClick={onBookmarkNext}>
        <BmNextIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('全ブックマーク解除')} onClick={onBookmarkClear}>
        <BmClearIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 6: タイプ別設定、共通設定 ===== */}
      <button className="sakura-tool-btn" title={tt('タイプ別設定...')} onClick={onTypeSettings}>
        <TypeSettingsIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('共通設定...')} onClick={onCommonSettings}>
        <CommonSettingsIcon size={16} />
      </button>
    </div>
  );
};
