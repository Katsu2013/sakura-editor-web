import React, { useState, useEffect, useRef } from 'react';

interface KeywordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (keywordSet: string) => void;
}

interface KeywordSetData {
  keywords: string[];
  matchCase: boolean;
}

const DEFAULT_KEYWORD_SETS: Record<string, KeywordSetData> = {
  JavaScript: {
    matchCase: true,
    keywords: [
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
  },
  'C/C++': {
    matchCase: true,
    keywords: [
      'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break',
      'case', 'catch', 'char', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl', 'concept', 'const',
      'consteval', 'constexpr', 'constinit', 'const_cast', 'continue', 'co_await', 'co_return', 'co_yield',
      'decltype', 'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export',
      'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable',
      'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private',
      'protected', 'public', 'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return', 'short',
      'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct', 'switch', 'template',
      'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned',
      'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq'
    ],
  },
  HTML: {
    matchCase: false,
    keywords: [
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
  },
  Python: {
    matchCase: true,
    keywords: [
      'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
      'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
      'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
      'return', 'try', 'while', 'with', 'yield'
    ],
  },
  SQL: {
    matchCase: false,
    keywords: [
      'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CHECK',
      'COLUMN', 'CONSTRAINT', 'CREATE', 'DATABASE', 'DEFAULT', 'DELETE', 'DESC', 'DISTINCT', 'DROP', 'ELSE',
      'END', 'EXEC', 'EXISTS', 'FOREIGN', 'FROM', 'GROUP', 'HAVING', 'IN', 'INDEX',
      'INNER', 'INSERT', 'INTO', 'IS', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT', 'NOT',
      'NULL', 'OR', 'ORDER', 'OUTER', 'PRIMARY', 'RIGHT', 'SELECT', 'SET', 'TABLE', 'THEN',
      'UNION', 'UNIQUE', 'UPDATE', 'VALUES', 'VIEW', 'WHEN', 'WHERE'
    ],
  },
};

const STORAGE_KEY = 'sakura_keyword_sets_data';

export const KeywordDialog: React.FC<KeywordDialogProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [sets, setSets] = useState<Record<string, KeywordSetData>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_KEYWORD_SETS;
  });

  const [selectedSet, setSelectedSet] = useState<string>('JavaScript');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!sets[selectedSet]) {
      const firstKey = Object.keys(sets)[0] || 'JavaScript';
      setSelectedSet(firstKey);
    }
  }, [sets, selectedSet]);

  if (!isOpen) return null;

  const currentSetData: KeywordSetData = sets[selectedSet] || {
    matchCase: true,
    keywords: [],
  };

  const keywords = currentSetData.keywords;

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

  // セット名の変更
  const handleRenameSet = () => {
    const newName = window.prompt('新しいセット名を入力してください:', selectedSet);
    if (!newName || newName.trim() === '' || newName === selectedSet) return;
    const trimmed = newName.trim();
    if (sets[trimmed]) {
      alert(`「${trimmed}」というセット名は既に存在します。`);
      return;
    }
    const updatedSets = { ...sets };
    updatedSets[trimmed] = updatedSets[selectedSet];
    delete updatedSets[selectedSet];
    setSets(updatedSets);
    setSelectedSet(trimmed);
  };

  // セット追加
  const handleAddSet = () => {
    const newName = window.prompt('追加するセット名を入力してください:', '');
    if (!newName || newName.trim() === '') return;
    const trimmed = newName.trim();
    if (sets[trimmed]) {
      alert(`「${trimmed}」というセット名は既に存在します。`);
      return;
    }
    setSets({
      ...sets,
      [trimmed]: {
        matchCase: true,
        keywords: [],
      },
    });
    setSelectedSet(trimmed);
    setSelectedWord(null);
  };

  // セット削除
  const handleDeleteSet = () => {
    const keys = Object.keys(sets);
    if (keys.length <= 1) {
      alert('最後のセットは削除できません。');
      return;
    }
    if (!window.confirm(`セット「${selectedSet}」を削除しますか？`)) return;
    const updatedSets = { ...sets };
    delete updatedSets[selectedSet];
    setSets(updatedSets);
    setSelectedSet(Object.keys(updatedSets)[0]);
    setSelectedWord(null);
  };

  // 単語追加
  const handleAddWord = () => {
    const input = window.prompt('追加する強調キーワードを入力してください (スペース区切りで複数可):', '');
    if (!input || input.trim() === '') return;
    const newWords = input
      .split(/[\s,]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0 && w.length <= 100);

    if (newWords.length === 0) return;

    const existingSet = new Set(keywords);
    const appended: string[] = [];
    for (const w of newWords) {
      if (!existingSet.has(w)) {
        existingSet.add(w);
        appended.push(w);
      }
    }

    if (appended.length === 0) {
      alert('指定されたキーワードは既に登録されています。');
      return;
    }

    const updatedKeywords = [...keywords, ...appended];
    setSets({
      ...sets,
      [selectedSet]: {
        ...currentSetData,
        keywords: updatedKeywords,
      },
    });
    setSelectedWord(appended[0]);
  };

  // 単語編集
  const handleEditWord = () => {
    if (!selectedWord) return;
    const newWord = window.prompt('キーワードの編集:', selectedWord);
    if (!newWord || newWord.trim() === '' || newWord.trim() === selectedWord) return;
    const trimmed = newWord.trim();
    const idx = keywords.indexOf(selectedWord);
    if (idx === -1) return;

    const updatedKeywords = [...keywords];
    updatedKeywords[idx] = trimmed;
    setSets({
      ...sets,
      [selectedSet]: {
        ...currentSetData,
        keywords: updatedKeywords,
      },
    });
    setSelectedWord(trimmed);
  };

  // 単語削除
  const handleDeleteWord = () => {
    if (!selectedWord) return;
    const updatedKeywords = keywords.filter((w) => w !== selectedWord);
    setSets({
      ...sets,
      [selectedSet]: {
        ...currentSetData,
        keywords: updatedKeywords,
      },
    });
    setSelectedWord(null);
  };

  // 整理 (アルファベット順ソート & 重複除去)
  const handleSortAndClean = () => {
    const unique = Array.from(new Set(keywords));
    unique.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    setSets({
      ...sets,
      [selectedSet]: {
        ...currentSetData,
        keywords: unique,
      },
    });
  };

  // 大文字小文字の区別トグル
  const handleToggleCase = (checked: boolean) => {
    setSets({
      ...sets,
      [selectedSet]: {
        ...currentSetData,
        matchCase: checked,
      },
    });
  };

  // インポート
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;
      const lines = text.split(/\r?\n/);
      const imported: string[] = [];
      const setWords = new Set(keywords);

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith('//') || line.startsWith(';')) continue;
        const words = line.split(/[\s,]+/);
        for (const w of words) {
          const tw = w.trim();
          if (tw && tw.length <= 100 && !setWords.has(tw)) {
            setWords.add(tw);
            imported.push(tw);
          }
        }
      }

      if (imported.length > 0) {
        setSets({
          ...sets,
          [selectedSet]: {
            ...currentSetData,
            keywords: [...keywords, ...imported],
          },
        });
        alert(`${imported.length} 個のキーワードをインポートしました。`);
      } else {
        alert('インポート可能な新しいキーワードは見つかりませんでした。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // エクスポート
  const handleExportFile = () => {
    const content = `# サクラエディタ 強調キーワードセット: ${selectedSet}\n# 登録数: ${keywords.length}\n` + keywords.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSet}.kwd`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // OK (保存)
  const handleOk = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
    } catch {
      // ignore
    }
    onApply?.(selectedSet);
    onClose();
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '580px',
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          fontFamily: "'MS UI Gothic', 'Segoe UI', sans-serif",
          fontSize: '12px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        {/* タイトルバー */}
        <div className="sakura-dialog-titlebar" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>共通設定 - 強調キーワード</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <span
              style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }}
              title="ヘルプ"
              onClick={() => setIsHelpOpen((prev) => !prev)}
            >
              ?
            </span>
            <span style={{ cursor: 'pointer', padding: '0 4px', fontSize: '11px' }} onClick={onClose}>✕</span>
          </div>
        </div>

        <div className="sakura-dialog-body" style={{ padding: '8px 10px', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {/* 上部: セット名行 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <label style={{ flexShrink: 0 }}>セット名(N):</label>
            <select
              value={selectedSet}
              onChange={(e) => {
                setSelectedSet(e.target.value);
                setSelectedWord(null);
              }}
              style={{
                flex: '1 1 120px',
                minWidth: '100px',
                padding: '2px 4px',
                border: '1px solid #7f9db9',
                backgroundColor: '#ffffff',
                fontSize: '12px',
              }}
            >
              {Object.keys(sets).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button className="sakura-dialog-btn" onClick={handleRenameSet}>
              変更(H)
            </button>
            <button className="sakura-dialog-btn" onClick={handleAddSet}>
              セット追加(M)...
            </button>
            <button className="sakura-dialog-btn" onClick={handleDeleteSet}>
              セット削除(R)...
            </button>
          </div>

          {/* 強調キーワード(K) グループボックス */}
          <fieldset
            className="win32-groupbox"
            style={{ padding: '6px 8px', marginBottom: '8px', display: 'flex', flexDirection: 'column' }}
          >
            <legend>強調キーワード(K)</legend>

            {/* 4カラム マルチカラムリストボックス */}
            <div
              style={{
                height: '240px',
                backgroundColor: '#ffffff',
                border: '2px inset #d0d0d0',
                overflowY: 'scroll',
                overflowX: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                padding: '2px',
                fontSize: '11px',
                boxSizing: 'border-box',
              }}
            >
              {keywords.length === 0 ? (
                <div style={{ gridColumn: 'span 4', padding: '20px', textAlign: 'center', color: '#888888' }}>
                  登録されたキーワードはありません。「追加(A)...」または「インポート(I)...」から登録してください。
                </div>
              ) : (
                Array.from({ length: rowsCount }).map((_, rowIdx) => (
                  <React.Fragment key={rowIdx}>
                    {columns.map((col, colIdx) => {
                      const word = col[rowIdx] || '';
                      if (!word) return <div key={colIdx} style={{ height: '16px' }} />;
                      const isSelected = selectedWord === word;

                      return (
                        <div
                          key={colIdx}
                          onClick={() => setSelectedWord(word)}
                          onDoubleClick={handleEditWord}
                          title={word}
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
                ))
              )}
            </div>

            {/* キーワード編集・オプション行 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
              <button className="sakura-dialog-btn" onClick={handleAddWord}>
                追加(A)...
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleEditWord}
                disabled={!selectedWord}
              >
                編集(E)...
              </button>
              <button
                className="sakura-dialog-btn"
                onClick={handleDeleteWord}
                disabled={!selectedWord}
              >
                削除(D)
              </button>

              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '6px', fontSize: '11px' }}>
                <input
                  type="checkbox"
                  checked={currentSetData.matchCase}
                  onChange={(e) => handleToggleCase(e.target.checked)}
                />
                英大文字小文字区別(C)
              </label>

              <button className="sakura-dialog-btn" style={{ marginLeft: 'auto' }} onClick={handleSortAndClean}>
                整理(O)
              </button>
            </div>

            {/* 下段情報 & インポート/エクスポート */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '6px',
                fontSize: '11px',
                flexWrap: 'wrap',
                gap: '4px',
              }}
            >
              <span style={{ color: '#555555' }}>
                (最大 100 文字, 登録数 {keywords.length} / 10000 個)
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".kwd,.txt,.ini"
                  onChange={handleImportFile}
                />
                <button
                  className="sakura-dialog-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  インポート(I)...
                </button>
                <button
                  className="sakura-dialog-btn"
                  onClick={handleExportFile}
                  disabled={keywords.length === 0}
                >
                  エクスポート(X)...
                </button>
              </div>
            </div>
          </fieldset>

          {/* ヘルプモーダル */}
          {isHelpOpen && (
            <div
              style={{
                marginBottom: '8px',
                padding: '8px 10px',
                backgroundColor: '#ffffef',
                border: '1px solid #d0d090',
                borderRadius: '2px',
                fontSize: '11px',
                lineHeight: '1.5',
              }}
            >
              <b>【強調キーワード機能について】</b><br />
              ・セットごとに複数の強調キーワード（最大10,000個）を登録し、シンタックスハイライトに利用できます。<br />
              ・「整理(O)」を実行すると、キーワードが昇順に整列され重複が除去されます。<br />
              ・「インポート(I)」でテキストファイル（.kwd, .txt）から単語を一括登録できます。<br />
              ・「エクスポート(X)」で現在のセットを.kwdファイルとして保存できます。
            </div>
          )}

          {/* 最下部モーダルボタン */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
            <button
              className="sakura-dialog-btn primary"
              style={{ minWidth: '70px', fontWeight: 'bold' }}
              onClick={handleOk}
            >
              OK
            </button>
            <button className="sakura-dialog-btn" style={{ minWidth: '70px' }} onClick={onClose}>
              キャンセル
            </button>
            <button
              className="sakura-dialog-btn"
              style={{ minWidth: '70px' }}
              onClick={() => setIsHelpOpen((prev) => !prev)}
            >
              ヘルプ(H)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
