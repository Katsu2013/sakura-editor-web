import React, { useMemo } from 'react';
import ReactDOM from 'react-dom';
import type { TextBuffer } from '../../core/buffer/TextBuffer';
import {
  type PageSetupSettings,
  calculatePrintPages,
  formatHeaderFooter,
} from '../../core/print/PrintEngine';

interface PrintDocumentProps {
  buffer: TextBuffer;
  title: string;
  pageSetup: PageSetupSettings;
  wrapColumn?: number;
  fontFamily?: string;
  fontSize?: number;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  buffer,
  title,
  pageSetup,
  wrapColumn,
  fontFamily = '"MS Gothic", "BIZ UDGothic", "Courier New", monospace',
  fontSize = 10,
}) => {
  const pages = useMemo(() => {
    return calculatePrintPages(buffer.getText(), pageSetup, wrapColumn);
  }, [buffer, pageSetup, wrapColumn]);

  const targetEl = typeof document !== 'undefined' ? document.getElementById('sakura-print-area') : null;
  if (!targetEl) return null;

  const totalPages = pages.length;

  const content = (
    <div className="sakura-print-container">
      {/* 動的 @page ルール */}
      <style>{`
        @media print {
          @page {
            size: ${pageSetup.paperSize} ${pageSetup.orientation};
            margin: 0;
          }
        }
      `}</style>

      {pages.map((pageLines, pIdx) => {
        const headerLeft = formatHeaderFooter(pageSetup.headerText, pIdx + 1, totalPages, title);
        const headerRight = formatHeaderFooter('&d &t', pIdx + 1, totalPages, title);
        const footerCenter = formatHeaderFooter(pageSetup.footerText, pIdx + 1, totalPages, title);

        return (
          <div
            key={pIdx}
            className="sakura-print-page"
            style={{
              paddingTop: `${pageSetup.marginTop}mm`,
              paddingBottom: `${pageSetup.marginBottom}mm`,
              paddingLeft: `${pageSetup.marginLeft}mm`,
              paddingRight: `${pageSetup.marginRight}mm`,
              fontFamily,
              fontSize: `${fontSize}pt`,
            }}
          >
            {/* ヘッダー */}
            <div className="sakura-print-header">
              <span className="sakura-print-header-left">{headerLeft}</span>
              <span className="sakura-print-header-right">{headerRight}</span>
            </div>

            {/* 本文エリア */}
            <div className="sakura-print-body">
              {pageLines.map((item, lIdx) => (
                <div key={lIdx} className="sakura-print-line">
                  {pageSetup.showLineNumbers && (
                    <span className="sakura-print-linenum">
                      {item.lineNum > 0 ? String(item.lineNum).padStart(4, ' ') : '    '}
                    </span>
                  )}
                  <span className="sakura-print-text">{item.text || '\u00A0'}</span>
                </div>
              ))}
            </div>

            {/* フッター */}
            <div className="sakura-print-footer">
              <span className="sakura-print-footer-center">{footerCenter}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return ReactDOM.createPortal(content, targetEl);
};
