import React, { useState } from 'react';

interface KeywordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (keywordSet: string) => void;
}

const DEFAULT_KEYWORD_SETS: Record<string, string[]> = {
  JavaScript: [
    'above', 'abs', 'acos', 'action', 'activeElement', 'addFavorite', 'alert', 'alinkColor', 'all', 'altKey',
    'anchor', 'anchors', 'appCodeName', 'appendChild', 'apply', 'appMinorVersion', 'appName', 'appVersion',
    'arguments', 'arity', 'Array', 'asin', 'assign', 'atan', 'atan2', 'atob', 'back', 'background',
    'below', 'bgColor', 'big', 'blink', 'blur', 'bold', 'Boolean', 'border', 'bottom', 'break',
    'browserLanguage', 'btoa', 'button', 'call', 'caller', 'cancelBubble', 'captureEvents', 'case', 'catch',
    'ceil', 'char', 'charAt', 'charCodeAt', 'charset', 'checked', 'childNodes', 'className', 'clear',
    'clearInterval', 'clearTimeout', 'click', 'clientInformation', 'clientX', 'clientY', 'close', 'closed',
    'colorDepth', 'complete', 'confirm', 'constructor', 'contains', 'cookie', 'cos', 'createComment',
    'createDocumentFragment', 'createElement', 'createTextNode', 'current', 'data', 'Date', 'debugger',
    'default', 'defaultCharset', 'defaultChecked', 'defaultSelected', 'defaultStatus', 'defaultValue',
    'delete', 'description', 'dir', 'disabled', 'do', 'document', 'documentElement', 'domain', 'elements',
    'else', 'embeds', 'enabledPlugin', 'encoding', 'escape', 'eval', 'event', 'exp', 'export', 'extends',
    'fgColor', 'filename', 'finally', 'find', 'fixed', 'floor', 'focus', 'fontcolor', 'fontsize', 'for',
    'form', 'forms', 'forward', 'frames', 'fromCharCode', 'Function', 'function', 'getComputedStyle',
    'getDate', 'getDay', 'getFullYear', 'getHours', 'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds',
    'getTime', 'getTimezoneOffset', 'getYear', 'global', 'go', 'handleEvent', 'hasChildNodes', 'hash',
    'height', 'history', 'home', 'host', 'hostname', 'href', 'hspace', 'if', 'ignoreCase', 'images', 'import',
    'in', 'indexOf', 'Infinity', 'innerHeight', 'innerWidth', 'input', 'insertAdjacentHTML', 'insertAdjacentText',
    'insertBefore', 'instanceof', 'isFinite', 'isNaN', 'italics', 'java', 'JavaArray', 'JavaClass',
    'JavaObject', 'JavaPackage', 'join', 'key', 'keyCode', 'lang', 'language', 'lastIndex', 'lastIndexOf',
    'lastModified', 'layers', 'length', 'let', 'link', 'linkColor', 'links', 'LN10', 'LN2', 'load', 'location',
    'log', 'LOG10E', 'LOG2E', 'lowsrc', 'match', 'Math', 'max', 'MAX_VALUE', 'menubar', 'method', 'mimeTypes',
    'min', 'MIN_VALUE', 'moveBy', 'moveTo', 'multiline', 'name', 'NaN', 'navigate', 'navigator', 'netscape',
    'new', 'next', 'Number', 'Object', 'offscreenBuffering', 'onabort', 'onafterprint', 'onbeforeprint',
    'onbeforeunload', 'onblur', 'onchange', 'onclick', 'ondblclick', 'onerror', 'onfocus', 'onhelp',
    'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover',
    'onmouseup', 'onreset', 'onresize', 'onscroll', 'onselect', 'onsubmit', 'onunload', 'open', 'opener',
    'opsProfile', 'Option', 'options', 'outerHeight', 'outerWidth', 'Packages', 'pageOffset', 'pageXOffset',
    'pageYOffset', 'parent', 'parseFloat', 'parseInt', 'pathname', 'personalbar', 'PI', 'pixelDepth',
    'platform', 'plugins', 'pop', 'port', 'pos', 'pow', 'preference', 'previous', 'print', 'prompt', 'protocol',
    'prototype', 'push', 'random', 'referrer', 'RegExp', 'releaseEvents', 'reload', 'replace', 'reset',
    'resizeBy', 'resizeTo', 'return', 'reverse', 'right', 'round', 'routeEvent', 'round', 'screen', 'screenX',
    'screenY', 'scroll', 'scrollbars', 'scrollBy', 'scrollTo', 'search', 'select', 'selected', 'selectedIndex',
    'self', 'shift', 'sin', 'slice', 'small', 'sort', 'source', 'splice', 'split', 'sqrt', 'SQRT1_2', 'SQRT2',
    'status', 'statusbar', 'stop', 'strike', 'String', 'sub', 'submit', 'substr', 'substring', 'sun', 'sup',
    'super', 'switch', 'tags', 'taint', 'taintEnabled', 'tan', 'target', 'test', 'text', 'this', 'throw',
    'title', 'toGMTString', 'toLocaleString', 'toLowerCase', 'toolbar', 'top', 'toString', 'toUpperCase',
    'toUTCString', 'try', 'typeof', 'undefined', 'unescape', 'unshift', 'untaint', 'unwatch', 'userAgent',
    'userLanguage', 'userProfile', 'UTC', 'value', 'valueOf', 'var', 'visibility', 'vlinkColor', 'void',
    'vspace', 'watch', 'while', 'width', 'window', 'with', 'yield'
  ],
  'C/C++': [
    'auto', 'break', 'case', 'catch', 'char', 'class', 'const', 'const_cast', 'continue', 'default',
    'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false',
    'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new',
    'operator', 'private', 'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short',
    'signed', 'sizeof', 'static', 'static_cast', 'struct', 'switch', 'template', 'this', 'throw', 'true',
    'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void', 'volatile',
    'wchar_t', 'while'
  ],
  HTML: [
    'DOCTYPE', 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
    'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data',
    'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset',
    'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header',
    'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'main',
    'map', 'mark', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output',
    'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section',
    'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table',
    'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u',
    'ul', 'var', 'video', 'wbr'
  ],
};

export const KeywordDialog: React.FC<KeywordDialogProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [selectedSet, setSelectedSet] = useState<string>('JavaScript');
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  if (!isOpen) return null;

  const keywords = DEFAULT_KEYWORD_SETS[selectedSet] || DEFAULT_KEYWORD_SETS.JavaScript;

  // 4カラム形式にグリッド配置
  const columnsCount = 4;
  const rowsCount = Math.ceil(keywords.length / columnsCount);
  const columns: string[][] = Array.from({ length: columnsCount }, () => []);

  for (let r = 0; r < rowsCount; r++) {
    for (let c = 0; c < columnsCount; c++) {
      const idx = c * rowsCount + r;
      if (idx < keywords.length) {
        columns[c].push(keywords[idx]);
      }
    }
  }

  return (
    <div className="sakura-dialog-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '540px',
          fontFamily: "'MS UI Gothic', 'Segoe UI', sans-serif",
          fontSize: '12px',
        }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>共通設定 - 強調キーワード</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} title="ヘルプ">?</span>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} onClick={onClose}>✕</span>
          </div>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '8px 10px' }}>
          {/* 上部: セット名行 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <label>セット名(N):</label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              style={{
                flex: 1,
                padding: '2px 4px',
                border: '1px solid #7f9db9',
                backgroundColor: '#ffffff',
                fontSize: '12px',
              }}
            >
              {Object.keys(DEFAULT_KEYWORD_SETS).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button className="sakura-dialog-btn" onClick={() => alert('セット名の変更')}>
              変更(H)
            </button>
            <button className="sakura-dialog-btn" onClick={() => alert('セットの追加')}>
              セット追加(M)...
            </button>
            <button className="sakura-dialog-btn" onClick={() => alert('セットの削除')}>
              セット削除(R)...
            </button>
          </div>

          {/* 強調キーワード(K) グループボックス */}
          <fieldset
            className="win32-groupbox"
            style={{ padding: '6px 8px', marginBottom: '8px' }}
          >
            <legend>強調キーワード(K)</legend>

            {/* 4カラム マルチカラムリストボックス (実機スクショ完全準拠) */}
            <div
              style={{
                height: '240px',
                backgroundColor: '#ffffff',
                border: '2px inset #d0d0d0',
                overflowY: 'scroll',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                padding: '2px',
                fontSize: '11px',
              }}
            >
              {Array.from({ length: rowsCount }).map((_, rowIdx) => (
                <React.Fragment key={rowIdx}>
                  {columns.map((col, colIdx) => {
                    const word = col[rowIdx] || '';
                    if (!word) return <div key={colIdx} style={{ height: '16px' }} />;
                    const isSelected = selectedWord === word;

                    return (
                      <div
                        key={colIdx}
                        onClick={() => setSelectedWord(word)}
                        style={{
                          height: '16px',
                          lineHeight: '16px',
                          padding: '0 3px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'default',
                          backgroundColor: isSelected ? '#000080' : 'transparent',
                          color: isSelected ? '#ffffff' : '#000000',
                        }}
                      >
                        {word}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            {/* キーワード編集・オプション行 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
              <button
                className="sakura-dialog-btn"
                onClick={() => {
                  const w = window.prompt('追加するキーワード:', '');
                  if (w) alert(`「${w}」を追加しました`);
                }}
              >
                追加(A)...
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={() => alert(`「${selectedWord || ''}」を編集`)}
                disabled={!selectedWord}
              >
                編集(E)...
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={() => alert(`「${selectedWord || ''}」を削除`)}
                disabled={!selectedWord}
              >
                削除(D)
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px', fontSize: '11px' }}>
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                />
                英大文字小文字区別(C)
              </label>

              <button className="sakura-dialog-btn" style={{ marginLeft: 'auto' }} onClick={() => alert('並び順を整理しました')}>
                整理(O)
              </button>
            </div>

            {/* 下段情報 & インポート/エクスポート */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
              <span style={{ color: '#555555' }}>
                (最大 63 文字, 登録数 {keywords.length}, 空き {7150 - keywords.length} 個)
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="sakura-dialog-btn" onClick={() => alert('キーワードのインポート')}>
                  インポート(I)...
                </button>
                <button className="sakura-dialog-btn" onClick={() => alert('キーワードのエクスポート')}>
                  エクスポート(X)...
                </button>
              </div>
            </div>
          </fieldset>

          {/* 最下部モーダルボタン */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
            <button
              className="sakura-dialog-btn primary"
              style={{ minWidth: '70px', fontWeight: 'bold' }}
              onClick={() => {
                onApply?.(selectedSet);
                onClose();
              }}
            >
              OK
            </button>
            <button className="sakura-dialog-btn" style={{ minWidth: '70px' }} onClick={onClose}>
              キャンセル
            </button>
            <button
              className="sakura-dialog-btn"
              style={{ minWidth: '70px' }}
              onClick={() => alert('サクラエディタ ヘルプ: 強調キーワード')}
            >
              ヘルプ(H)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
