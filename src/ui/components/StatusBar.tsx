import React from 'react';
import type { CharacterEncoding, LineEnding, Position } from '../../core/buffer/types';
import { CharEncoding } from '../../core/encoding/CharEncoding';

export interface StatusBarConfig {
  showStatusbar?: boolean;
  showCursorPos?: boolean;
  showCharCount?: boolean;
  showEncoding?: boolean;
  showLineEnding?: boolean;
  showCharCode?: boolean;
  showInsOvr?: boolean;
}

interface StatusBarProps {
  cursor: Position;
  visualCol: number;
  totalLines: number;
  selectedChars: number;
  selectedLines: number;
  encoding: CharacterEncoding;
  lineEnding: LineEnding;
  isOverstrike: boolean;
  currentCharCode: string;
  isRecordingMacro?: boolean;
  zoomPercent?: number;
  typeName?: string;
  config?: StatusBarConfig;
  onPositionClick?: () => void;
  onEncodingClick?: () => void;
  onLineEndingClick?: () => void;
  onMacroRecClick?: () => void;
  onOverstrikeClick?: () => void;
  onZoomClick?: () => void;
  onTypeClick?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursor,
  visualCol,
  totalLines,
  selectedChars,
  selectedLines,
  encoding,
  lineEnding,
  isOverstrike,
  currentCharCode,
  isRecordingMacro = false,
  zoomPercent = 100,
  typeName,
  config = {},
  onPositionClick,
  onEncodingClick,
  onLineEndingClick,
  onMacroRecClick,
  onOverstrikeClick,
  onZoomClick,
  onTypeClick,
}) => {
  const encLabel = CharEncoding.getEncodingLabel(encoding);

  const showCursorPos = config.showCursorPos !== false;
  const showLineEnding = config.showLineEnding !== false;
  const showCharCode = config.showCharCode !== false;
  const showEncoding = config.showEncoding !== false;
  const showInsOvr = config.showInsOvr !== false;
  const showCharCount = config.showCharCount !== false;

  return (
    <div
      className="sakura-statusbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#f0f0f0',
        borderTop: '1px solid #b8b8b8',
        height: '22px',
        fontSize: '11px',
        padding: '0 2px',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. 左側 メッセージエリア (柔軟領域) */}
      <div
        className="sakura-status-panel"
        style={{
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: '#333333',
        }}
      >
        {showCharCount && selectedChars > 0
          ? `選択中: ${selectedChars}文字 (${selectedLines}行)`
          : totalLines > 1
          ? `総行数: ${totalLines}行`
          : ''}
      </div>

      {/* 2. タイプ別設定名 (例: "C/C++", "HTML", "テキスト") */}
      {typeName && (
        <div
          className="sakura-status-panel"
          style={{
            minWidth: '60px',
            padding: '0 6px',
            textAlign: 'center',
            color: '#000000',
            cursor: onTypeClick ? 'pointer' : 'default',
            fontWeight: 500,
          }}
          onClick={onTypeClick}
          title="クリックしてタイプ別設定一覧を開く"
        >
          {typeName}
        </div>
      )}

      {/* 2. 行・桁 (サクラエディタ標準: "1行  1桁") */}
      {showCursorPos && (
        <div
          className="sakura-status-panel"
          style={{
            width: '90px',
            textAlign: 'center',
            color: '#000000',
            cursor: onPositionClick ? 'pointer' : 'default',
          }}
          onClick={onPositionClick}
          title="クリックして指定行へジャンプ (Ctrl+J)"
        >
          {cursor.line + 1}行  {visualCol + 1}桁
        </div>
      )}

      {/* 3. 改行コード (CRLF / LF) */}
      {showLineEnding && (
        <div
          className="sakura-status-panel"
          style={{
            width: '54px',
            textAlign: 'center',
            cursor: onLineEndingClick ? 'pointer' : 'default',
            color: '#000000',
          }}
          onClick={onLineEndingClick}
          title="クリックして改行コードを変更"
        >
          {lineEnding}
        </div>
      )}

      {/* 4. 文字コード値 (サクラエディタ標準: 16進文字コード表示) */}
      {showCharCode && (
        <div
          className="sakura-status-panel"
          style={{
            width: '78px',
            textAlign: 'center',
            color: '#000000',
            fontSize: '10px',
          }}
          title="文字コード値"
        >
          {currentCharCode}
        </div>
      )}

      {/* 5. 文字コードセット (UTF-8 / Shift_JIS) */}
      {showEncoding && (
        <div
          className="sakura-status-panel"
          style={{
            width: '74px',
            textAlign: 'center',
            cursor: onEncodingClick ? 'pointer' : 'default',
            color: '#000000',
          }}
          onClick={onEncodingClick}
          title="クリックして文字コードを変更"
        >
          {encLabel}
        </div>
      )}

      {/* 6. REC (マクロ記録状態) - クリックで記録トグル */}
      <div
        className="sakura-status-panel"
        style={{
          width: '46px',
          textAlign: 'center',
          color: isRecordingMacro ? '#cc0000' : '#a0a0a0',
          fontWeight: isRecordingMacro ? 'bold' : 'normal',
          cursor: onMacroRecClick ? 'pointer' : 'default',
        }}
        onClick={onMacroRecClick}
        title="クリックしてキーマクロ記録を開始/停止 (Ctrl+Shift+M)"
      >
        REC
      </div>

      {/* 7. 挿入/上書きモード (サクラエディタ標準: 挿入 / 上書) */}
      {showInsOvr && (
        <div
          className="sakura-status-panel"
          style={{
            width: '46px',
            textAlign: 'center',
            cursor: onOverstrikeClick ? 'pointer' : 'default',
            color: isOverstrike ? '#cc0000' : '#000000',
            fontWeight: isOverstrike ? 'bold' : 'normal',
          }}
          onClick={onOverstrikeClick}
          title="クリックして 挿入/上書き モード切替え (Insert)"
        >
          {isOverstrike ? '上書' : '挿入'}
        </div>
      )}

      {/* 8. ズーム倍率 (100%) */}
      <div
        className="sakura-status-panel"
        style={{
          width: '50px',
          textAlign: 'center',
          color: '#000000',
          cursor: onZoomClick ? 'pointer' : 'default',
        }}
        onClick={onZoomClick}
        title="クリックして拡大率を変更"
      >
        {zoomPercent}%
      </div>

      {/* 9. 右端リサイズグリップ (Windows標準外観) */}
      <div
        style={{
          width: '12px',
          height: '16px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          paddingRight: '1px',
          paddingBottom: '1px',
          cursor: 'se-resize',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10">
          <circle cx="8" cy="8" r="1" fill="#808080" />
          <circle cx="8" cy="5" r="1" fill="#808080" />
          <circle cx="5" cy="8" r="1" fill="#808080" />
          <circle cx="8" cy="2" r="1" fill="#808080" />
          <circle cx="5" cy="5" r="1" fill="#808080" />
          <circle cx="2" cy="8" r="1" fill="#808080" />
        </svg>
      </div>
    </div>
  );
};
