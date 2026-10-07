import React, { useState, useRef, useEffect } from 'react';
import {
  NewIcon,
  OpenIcon,
  SaveIcon,
  SaveAsIcon,
  UndoIcon,
  RedoIcon,
  IndentRightIcon,
  IndentLeftIcon,
  FindIcon,
  FindNextIcon,
  FindPrevIcon,
  ReplaceIcon,
  SearchMarkIcon,
  ReturnSearchOriginIcon,
  BookmarkIcon,
  BmNextIcon,
  BmPrevIcon,
  BmClearIcon,
  OutlineIcon,
  TypeListIcon,
  TypeSettingsIcon,
  CommonSettingsIcon,
  FontIcon,
  ExportIniIcon,
} from './Icons/SakuraIcons';

export interface ToolBarProps {
  onNew: () => void;
  onNewWithType?: (syntax: string) => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onIndent?: () => void;
  onUnindent?: () => void;
  onFind: () => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplace: () => void;
  onToggleSearchMark: () => void;
  onReturnSearchOrigin?: () => void;
  onGrep?: () => void;
  onBookmarkToggle?: () => void;
  onBookmarkNext?: () => void;
  onBookmarkPrev?: () => void;
  onBookmarkClear?: () => void;
  onTypeList?: () => void;
  onTypeSettings: () => void;
  onCommonSettings?: () => void;
  onFont?: () => void;
  onExportIni?: () => void;
  onOutline: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  canSave?: boolean;
  canReturnSearchOrigin?: boolean;
  flatButtons?: boolean;
  showTooltips?: boolean;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  onNew,
  onNewWithType,
  onOpen,
  onSave,
  onSaveAs,
  onUndo,
  onRedo,
  onIndent,
  onUnindent,
  onFind,
  onFindNext,
  onFindPrev,
  onReplace,
  onToggleSearchMark,
  onReturnSearchOrigin,
  onBookmarkToggle,
  onBookmarkNext,
  onBookmarkPrev,
  onBookmarkClear,
  onTypeList,
  onTypeSettings,
  onCommonSettings,
  onFont,
  onExportIni,
  onOutline,
  canUndo = true,
  canRedo = false,
  canSave = true,
  canReturnSearchOrigin = false,
  flatButtons = true,
  showTooltips = true,
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    if (isNewMenuOpen) {
      window.addEventListener('mousedown', handleOutside);
      return () => window.removeEventListener('mousedown', handleOutside);
    }
  }, [isNewMenuOpen]);

  const tt = (titleText: string) => (showTooltips ? titleText : undefined);

  return (
    <div
      className={`sakura-toolbar ${flatButtons ? 'flat-toolbar' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '28px',
        padding: '1px 2px',
        background: '#f0f0f0',
        borderBottom: '1px solid #c0c0c0',
        gap: '2px',
        userSelect: 'none',
      }}
    >
      {/* ===== グループ 1: ファイル操作 (新規、開く、保存、別名保存) ===== */}
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
              通常テキスト
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('C/C++');
                setIsNewMenuOpen(false);
              }}
            >
              C/C++ ソース
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('HTML');
                setIsNewMenuOpen(false);
              }}
            >
              HTML 文書
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('JavaScript/TypeScript');
                setIsNewMenuOpen(false);
              }}
            >
              JavaScript / TypeScript
            </div>
            <div
              className="sakura-dropdown-item"
              onClick={() => {
                onNewWithType?.('Python');
                setIsNewMenuOpen(false);
              }}
            >
              Python スクリプト
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
        style={{ opacity: canSave ? 1 : 0.4 }}
      >
        <SaveIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('名前を付けて保存... (Shift+Ctrl+S)')} onClick={onSaveAs}>
        <SaveAsIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 2: アンドゥ・リドゥ ===== */}
      <button
        className="sakura-tool-btn"
        title={tt('元に戻す (Ctrl+Z)')}
        onClick={onUndo}
        disabled={!canUndo}
        style={{ opacity: canUndo ? 1 : 0.4 }}
      >
        <UndoIcon size={16} />
      </button>

      <button
        className="sakura-tool-btn"
        title={tt('やり直し (Ctrl+Y)')}
        onClick={onRedo}
        disabled={!canRedo}
        style={{ opacity: canRedo ? 1 : 0.4 }}
      >
        <RedoIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 3: 行インデント・行逆インデント ===== */}
      <button className="sakura-tool-btn" title={tt('行インデント (字下げ)')} onClick={onIndent}>
        <IndentRightIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('行逆インデント (字上げ)')} onClick={onUnindent}>
        <IndentLeftIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 4: 検索・置換 ===== */}
      <button className="sakura-tool-btn" title={tt('検索 (Ctrl+F)')} onClick={onFind}>
        <FindIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('検索マークの切替え (Ctrl+F3)')} onClick={onToggleSearchMark}>
        <SearchMarkIcon size={16} />
      </button>

      <button
        className="sakura-tool-btn"
        title={tt('検索開始位置へ戻る (Shift+Ctrl+F3)')}
        onClick={onReturnSearchOrigin}
        disabled={!canReturnSearchOrigin}
        style={{ opacity: canReturnSearchOrigin ? 1 : 0.4 }}
      >
        <ReturnSearchOriginIcon size={16} />
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

      <div className="sakura-tool-separator" />

      {/* ===== グループ 5: ブックマーク ===== */}
      <button className="sakura-tool-btn" title={tt('ブックマーク設定・解除 (F11)')} onClick={onBookmarkToggle}>
        <BookmarkIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('次のブックマーク (F2)')} onClick={onBookmarkNext}>
        <BmNextIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('前のブックマーク (Shift+F2)')} onClick={onBookmarkPrev}>
        <BmPrevIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('全ブックマーク解除')} onClick={onBookmarkClear}>
        <BmClearIcon size={16} />
      </button>

      <div className="sakura-tool-separator" />

      {/* ===== グループ 6: 解析・設定・ツール ===== */}
      <button className="sakura-tool-btn" title={tt('アウトライン解析 (F11)')} onClick={onOutline}>
        <OutlineIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('タイプ別設定一覧...')} onClick={onTypeList}>
        <TypeListIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('タイプ別設定...')} onClick={onTypeSettings}>
        <TypeSettingsIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('共通設定...')} onClick={onCommonSettings}>
        <CommonSettingsIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('フォント設定...')} onClick={onFont}>
        <FontIcon size={16} />
      </button>

      <button className="sakura-tool-btn" title={tt('設定エクスポート (sakura.ini)...')} onClick={onExportIni}>
        <ExportIniIcon size={16} />
      </button>
    </div>
  );
};
