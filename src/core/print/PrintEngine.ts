export interface PageSetupSettings {
  paperSize: string; // 'A4' | 'A3' | 'B5' | 'Letter'
  orientation: 'portrait' | 'landscape';
  marginTop: number; // mm
  marginBottom: number; // mm
  marginLeft: number; // mm
  marginRight: number; // mm
  showLineNumbers: boolean;
  headerText: string;
  footerText: string;
}

export const DEFAULT_PAGE_SETUP_SETTINGS: PageSetupSettings = {
  paperSize: 'A4',
  orientation: 'portrait',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 15,
  marginRight: 15,
  showLineNumbers: true,
  headerText: '&f',
  footerText: '- &p -',
};

export interface PrintLineItem {
  lineNum: number; // 1-based, or 0 if wrapped line
  text: string;
}

/**
 * 全角・半角判定による文字幅計算
 */
export function getCharWidth(ch: string): number {
  const code = ch.charCodeAt(0);
  if (
    (code >= 0x3000 && code <= 0x9fff) ||
    (code >= 0xff01 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6) ||
    (code >= 0xac00 && code <= 0xd7af)
  ) {
    return 2;
  }
  return 1;
}

export function getLineWidth(text: string): number {
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    w += getCharWidth(text[i]);
  }
  return w;
}

/**
 * 表示桁数（半角換算）に応じた行の自動折り返し
 */
export function wrapLineByWidth(text: string, maxWidth: number): string[] {
  if (getLineWidth(text) <= maxWidth) return [text];
  const chunks: string[] = [];
  let cur = '';
  let curW = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const cw = getCharWidth(ch);
    if (curW + cw > maxWidth && cur.length > 0) {
      chunks.push(cur);
      cur = ch;
      curW = cw;
    } else {
      cur += ch;
      curW += cw;
    }
  }
  if (cur.length > 0) {
    chunks.push(cur);
  }
  return chunks;
}

/**
 * ページ設定に応じた1ページあたりの行数を計算
 */
export function getLinesPerPage(settings: PageSetupSettings): number {
  const pageHeightMm = settings.orientation === 'landscape' ? 210 : 297;
  const availHeightMm = pageHeightMm - settings.marginTop - settings.marginBottom - 18;
  const lines = Math.floor(availHeightMm / 4.8);
  return Math.max(15, Math.min(80, lines));
}

/**
 * ページ設定に応じた1行あたりの折り返し文字数を計算
 */
export function getWrapColumn(settings: PageSetupSettings, customWrap?: number): number {
  if (customWrap && customWrap > 20) return customWrap;
  const pageWidthMm = settings.orientation === 'landscape' ? 297 : 210;
  const availWidthMm = pageWidthMm - settings.marginLeft - settings.marginRight;
  const cols = Math.floor(availWidthMm / 2.1);
  return settings.orientation === 'landscape' ? Math.max(80, cols) : 80;
}

/**
 * サクラエディタのマクロ文字書式（&f, &p, &P, &d, &t, &w）を展開
 */
export function formatHeaderFooter(
  template: string,
  page: number,
  totalPages: number,
  title: string
): string {
  if (!template) return '';
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dayName = days[now.getDay()];

  let res = template;
  res = res.replace(/&f|\$f/g, title);
  res = res.replace(/&p|\$p/g, String(page));
  res = res.replace(/&P|\$P/g, String(totalPages));
  res = res.replace(/&d|\$d/g, `${yyyy}/${mm}/${dd}`);
  res = res.replace(/&t|\$t/g, `${hh}:${min}`);
  res = res.replace(/&w|\$w/g, dayName);
  return res;
}

/**
 * テキスト全文から印刷用ページ配列を作成
 */
export function calculatePrintPages(
  fullText: string,
  settings: PageSetupSettings,
  customWrap?: number
): PrintLineItem[][] {
  const rawLines = fullText.split(/\r\n|\r|\n/);
  const wrapCol = getWrapColumn(settings, customWrap);
  const linesPerPage = getLinesPerPage(settings);

  const wrapped: PrintLineItem[] = [];
  rawLines.forEach((line, idx) => {
    const chunks = wrapLineByWidth(line, wrapCol);
    if (chunks.length === 0) {
      wrapped.push({ lineNum: idx + 1, text: '' });
    } else {
      chunks.forEach((chunk, cIdx) => {
        wrapped.push({
          lineNum: cIdx === 0 ? idx + 1 : 0,
          text: chunk,
        });
      });
    }
  });

  const pages: PrintLineItem[][] = [];
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    pages.push(wrapped.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) {
    pages.push([{ lineNum: 1, text: '' }]);
  }
  return pages;
}
