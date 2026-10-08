import React, { useState, useMemo } from 'react';
import type { TextBuffer } from '../../../core/buffer/TextBuffer';
import { PrintIcon, CloseIcon } from '../Icons/SakuraIcons';
import {
  type PageSetupSettings,
  DEFAULT_PAGE_SETUP_SETTINGS,
  calculatePrintPages,
  formatHeaderFooter,
} from '../../../core/print/PrintEngine';

interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  buffer: TextBuffer;
  title: string;
  pageSetup?: PageSetupSettings;
  wrapColumn?: number;
  fontFamily?: string;
  fontSize?: number;
}

export const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({
  isOpen,
  onClose,
  buffer,
  title,
  pageSetup = DEFAULT_PAGE_SETUP_SETTINGS,
  wrapColumn,
  fontFamily = '"MS Gothic", "BIZ UDGothic", "Courier New", monospace',
  fontSize = 12,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isTwoPage, setIsTwoPage] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  // 全行の折り返し展開とページ分割 (PrintEngine と同一ロジック)
  const pages = useMemo(() => {
    return calculatePrintPages(buffer.getText(), pageSetup, wrapColumn);
  }, [buffer, pageSetup, wrapColumn]);

  if (!isOpen) return null;

  const totalPages = pages.length;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const handlePrint = () => {
    // 印刷ダイアログを起動 (@media print により本プレビュー画面は不可視化され、印刷用ページが出力される)
    window.print();
  };

  const isLandscape = pageSetup.orientation === 'landscape';
  const pageWidthPx = isLandscape ? 960 : 680;
  const pageMinHeightPx = isLandscape ? 680 : 960;

  const renderSinglePage = (pageIndex: number) => {
    const pageLines = pages[pageIndex] || [];
    const headerLeft = formatHeaderFooter(pageSetup.headerText, pageIndex + 1, totalPages, title);
    const headerRight = formatHeaderFooter('&d &t', pageIndex + 1, totalPages, title);
    const footerCenter = formatHeaderFooter(pageSetup.footerText, pageIndex + 1, totalPages, title);

    return (
      <div
        key={pageIndex}
        style={{
          width: `${pageWidthPx}px`,
          minHeight: `${pageMinHeightPx}px`,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          margin: '16px auto',
          paddingTop: `${Math.max(20, pageSetup.marginTop * 1.5)}px`,
          paddingBottom: `${Math.max(20, pageSetup.marginBottom * 1.5)}px`,
          paddingLeft: `${Math.max(20, pageSetup.marginLeft * 1.5)}px`,
          paddingRight: `${Math.max(20, pageSetup.marginRight * 1.5)}px`,
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
            fontFamily: '"MS UI Gothic", "Meiryo", sans-serif',
          }}
        >
          <span>{headerLeft}</span>
          <span>{headerRight}</span>
        </div>

        {/* 本文エリア */}
        <div style={{ flex: 1, whiteSpace: 'pre', overflow: 'hidden' }}>
          {pageLines.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', height: '17px', lineHeight: '17px' }}>
              {pageSetup.showLineNumbers && (
                <span
                  style={{
                    width: '45px',
                    textAlign: 'right',
                    paddingRight: '12px',
                    color: '#666666',
                    userSelect: 'none',
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  {item.lineNum > 0 ? item.lineNum : ''}
                </span>
              )}
              <span style={{ flex: 1, wordBreak: 'break-all' }}>{item.text || '\u00A0'}</span>
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
            fontFamily: '"MS UI Gothic", "Meiryo", sans-serif',
          }}
        >
          {footerCenter}
        </div>
      </div>
    );
  };

  return (
    <div
      className="sakura-preview-overlay"
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
          className="sakura-dialog-btn primary"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}
        >
          <PrintIcon size={14} />
          印刷(P)...
        </button>

        <div style={{ width: '1px', height: '22px', backgroundColor: '#a0a0a0', margin: '0 2px' }} />

        <button
          disabled={safeCurrentPage <= 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="sakura-dialog-btn"
        >
          前のページ(P)
        </button>
        <button
          disabled={safeCurrentPage >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="sakura-dialog-btn"
        >
          次のページ(N)
        </button>

        <span style={{ fontSize: '12px', margin: '0 6px', color: '#000000' }}>
          ページ: <strong>{safeCurrentPage}</strong> / {totalPages}
        </span>

        <div style={{ width: '1px', height: '22px', backgroundColor: '#a0a0a0', margin: '0 2px' }} />

        <button
          onClick={() => setIsTwoPage((p) => !p)}
          className={`sakura-dialog-btn ${isTwoPage ? 'active' : ''}`}
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

        <span style={{ fontSize: '11px', color: '#555', marginLeft: '6px' }}>
          ({pageSetup.paperSize} / {isLandscape ? '横' : '縦'} / 余白: 上下{pageSetup.marginTop}mm 左右{pageSetup.marginLeft}mm)
        </span>

        <div style={{ flex: 1 }} />

        <button
          onClick={onClose}
          className="sakura-dialog-btn"
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
