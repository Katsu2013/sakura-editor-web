import React, { useState, useMemo } from 'react';
import { TextBuffer } from '../../../core/buffer/TextBuffer';
import { PrintIcon, CloseIcon } from '../Icons/SakuraIcons';

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  buffer: TextBuffer;
  title: string;
  wrapColumn?: number;
  fontFamily?: string;
  fontSize?: number;
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  isOpen,
  onClose,
  buffer,
  title,
  wrapColumn = 80,
  fontFamily = '"MS Gothic", monospace',
  fontSize = 13,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isTwoPage, setIsTwoPage] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  // 1ページあたりの行数
  const LINES_PER_PAGE = 52;

  // 全行の折り返し展開とページ分割
  const pages = useMemo(() => {
    const rawLines = buffer.getText().split(/\r\n|\r|\n/);
    const wrapped: { lineNum: number; text: string }[] = [];

    rawLines.forEach((line, idx) => {
      if (line.length <= wrapColumn) {
        wrapped.push({ lineNum: idx + 1, text: line });
      } else {
        let first = true;
        for (let i = 0; i < line.length; i += wrapColumn) {
          wrapped.push({
            lineNum: first ? idx + 1 : 0, // 0 は折り返し行
            text: line.slice(i, i + wrapColumn),
          });
          first = false;
        }
      }
    });

    const pageList: { lineNum: number; text: string }[][] = [];
    for (let i = 0; i < wrapped.length; i += LINES_PER_PAGE) {
      pageList.push(wrapped.slice(i, i + LINES_PER_PAGE));
    }

    if (pageList.length === 0) {
      pageList.push([]);
    }
    return pageList;
  }, [buffer, wrapColumn]);

  if (!isOpen) return null;

  const totalPages = pages.length;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const handlePrint = () => {
    window.print();
  };

  const renderSinglePage = (pageIndex: number) => {
    const pageLines = pages[pageIndex] || [];
    const dateStr = new Date().toLocaleDateString('ja-JP');

    return (
      <div
        key={pageIndex}
        style={{
          width: '680px',
          minHeight: '960px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          margin: '16px auto',
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '1.45',
          color: '#000000',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#333333',
            borderBottom: '1px solid #999999',
            paddingBottom: '4px',
            marginBottom: '16px',
          }}
        >
          <span>{title}</span>
          <span>{dateStr}</span>
        </div>

        {/* 本文エリア */}
        <div style={{ flex: 1, whiteSpace: 'pre', overflow: 'hidden' }}>
          {pageLines.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', height: '17px', lineHeight: '17px' }}>
              <span
                style={{
                  width: '45px',
                  textAlign: 'right',
                  paddingRight: '12px',
                  color: '#666666',
                  userSelect: 'none',
                  fontSize: '11px',
                }}
              >
                {item.lineNum > 0 ? item.lineNum : ''}
              </span>
              <span style={{ flex: 1 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* フッター */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#333333',
            borderTop: '1px solid #999999',
            paddingTop: '6px',
            marginTop: '16px',
          }}
        >
          - {pageIndex + 1} -
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#606060',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* クラシック Win32 プレビュー ツールバー */}
      <div
        style={{
          height: '36px',
          backgroundColor: '#ece9d8',
          borderBottom: '2px solid #999999',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: '8px',
          fontFamily: '"MS UI Gothic", "Meiryo", sans-serif',
          fontSize: '12px',
        }}
      >
        <button
          onClick={handlePrint}
          className="sakura-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
        >
          <PrintIcon size={14} />
          印刷(P)...
        </button>

        <div style={{ width: '1px', height: '22px', backgroundColor: '#a0a0a0', margin: '0 2px' }} />

        <button
          disabled={safeCurrentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="sakura-btn"
        >
          前のページ(P)
        </button>
        <button
          disabled={safeCurrentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="sakura-btn"
        >
          次のページ(N)
        </button>

        <span style={{ fontSize: '12px', margin: '0 6px', color: '#000000' }}>
          ページ: <strong>{safeCurrentPage}</strong> / {totalPages}
        </span>

        <div style={{ width: '1px', height: '22px', backgroundColor: '#a0a0a0', margin: '0 2px' }} />

        <button
          onClick={() => setIsTwoPage((p) => !p)}
          className={`sakura-btn ${isTwoPage ? 'active' : ''}`}
        >
          {isTwoPage ? '1ページ表示(1)' : '2ページ表示(2)'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>ズーム:</span>
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{
              padding: '2px 4px',
              fontSize: '12px',
              border: '1px solid #7f9db9',
              backgroundColor: '#ffffff',
            }}
          >
            <option value={50}>50 %</option>
            <option value={75}>75 %</option>
            <option value={100}>100 %</option>
            <option value={125}>125 %</option>
            <option value={150}>150 %</option>
            <option value={200}>200 %</option>
          </select>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={onClose}
          className="sakura-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <CloseIcon size={14} />
          閉じる(C)
        </button>
      </div>

      {/* プレビュー表示キャンバス */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '20px',
          gap: '24px',
          backgroundColor: '#6b7280',
        }}
      >
        {isTwoPage ? (
          <>
            {renderSinglePage(safeCurrentPage - 1)}
            {safeCurrentPage < totalPages && renderSinglePage(safeCurrentPage)}
          </>
        ) : (
          renderSinglePage(safeCurrentPage - 1)
        )}
      </div>
    </div>
  );
};
