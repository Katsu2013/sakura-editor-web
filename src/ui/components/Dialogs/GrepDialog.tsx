import React, { useState } from 'react';
import type { SearchOptions } from '../../../core/search/SearchEngine';
import { CharEncoding } from '../../../core/encoding/CharEncoding';

export interface GrepExecuteParams {
  query: string;
  replaceText?: string;
  isReplaceMode?: boolean;
  filePattern: string;
  targetScope: 'all-tabs' | 'current-tab' | 'folder';
  isRegex: boolean;
  matchCase: boolean;
  matchWholeWord: boolean;
  subFolders: boolean;
}

export interface GrepResultItem {
  fileName: string;
  filePath: string;
  line: number;
  column: number;
  lineText: string;
}

interface GrepDialogProps {
  isOpen: boolean;
  isReplaceMode?: boolean;
  currentFileName: string;
  onClose: () => void;
  onExecuteGrep: (params: GrepExecuteParams, folderResults?: GrepResultItem[]) => void;
}

export const GrepDialog: React.FC<GrepDialogProps> = ({
  isOpen,
  isReplaceMode = false,
  currentFileName,
  onClose,
  onExecuteGrep,
}) => {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [filePattern, setFilePattern] = useState('*.*');
  const [targetScope, setTargetScope] = useState<'all-tabs' | 'current-tab' | 'folder'>('all-tabs');
  const [folderPath, setFolderPath] = useState('C:\\Work\\WebApp01');
  const [isRegex, setIsRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [matchWholeWord, setMatchWholeWord] = useState(false);
  const [subFolders, setSubFolders] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query) {
      alert('検索条件を入力してください。');
      return;
    }

    if (targetScope === 'folder') {
      if ('showDirectoryPicker' in window) {
        try {
          setIsSearching(true);
          const dirHandle = await (window as any).showDirectoryPicker();
          const collector: GrepResultItem[] = [];
          const searchOptions: SearchOptions = {
            query,
            isRegex,
            matchCase,
            matchWholeWord,
          };
          await scanDirectory(dirHandle, dirHandle.name, searchOptions, collector);
          setIsSearching(false);
          onClose();
          onExecuteGrep(
            {
              query,
              replaceText,
              isReplaceMode,
              filePattern,
              targetScope,
              isRegex,
              matchCase,
              matchWholeWord,
              subFolders,
            },
            collector
          );
        } catch (err: any) {
          setIsSearching(false);
          if (err.name !== 'AbortError') {
            console.error(err);
          }
        }
      } else {
        alert('お使いのブラウザではフォルダ選択APIがサポートされていません。開いているファイルから検索します。');
        onClose();
        onExecuteGrep({
          query,
          replaceText,
          isReplaceMode,
          filePattern,
          targetScope: 'all-tabs',
          isRegex,
          matchCase,
          matchWholeWord,
          subFolders,
        });
      }
    } else {
      onClose();
      onExecuteGrep({
        query,
        replaceText,
        isReplaceMode,
        filePattern,
        targetScope,
        isRegex,
        matchCase,
        matchWholeWord,
        subFolders,
      });
    }
  };

  const scanDirectory = async (
    dirHandle: any,
    currentPath: string,
    options: SearchOptions,
    collector: GrepResultItem[]
  ) => {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        if (/\.(txt|c|cpp|h|hpp|js|ts|tsx|jsx|json|py|html|css|md|log|ini|csv)$/i.test(entry.name)) {
          try {
            const file = await entry.getFile();
            const arrayBuffer = await file.arrayBuffer();
            const decoded = CharEncoding.decode(new Uint8Array(arrayBuffer));
            const lines = decoded.text.split(/\r\n|\r|\n/);

            const regex = new RegExp(
              options.isRegex ? options.query : options.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              options.matchCase ? 'g' : 'gi'
            );

            for (let i = 0; i < lines.length; i++) {
              const lineText = lines[i];
              if (regex.test(lineText)) {
                collector.push({
                  fileName: entry.name,
                  filePath: `${currentPath}\\${entry.name}`,
                  line: i + 1,
                  column: 1,
                  lineText: lineText.trim(),
                });
                if (collector.length >= 1000) return;
              }
            }
          } catch (e) {
            // スキップ
          }
        }
      } else if (entry.kind === 'directory' && subFolders && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await scanDirectory(entry, `${currentPath}\\${entry.name}`, options, collector);
      }
    }
  };

  return (
    <div className="sakura-dialog-overlay" onClick={onClose}>
      <div
        className="sakura-dialog-window"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '540px', fontFamily: '"MS UI Gothic", "Meiryo", sans-serif', fontSize: '12px' }}
      >
        <div className="sakura-dialog-titlebar">
          <span>{isReplaceMode ? 'Grep 置換' : 'Grep 検索'}</span>
          <button className="sakura-dialog-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* 条件 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px' }}>条件(&N):</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="検索する文字列または正規表現"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              style={{ flex: 1, padding: '3px 6px', border: '1px solid #7f9db9', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* 置換後文字列 (置換モード時) */}
          {isReplaceMode && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '80px' }}>置換後(&P):</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="置換後の文字列"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                style={{ flex: 1, padding: '3px 6px', border: '1px solid #7f9db9', backgroundColor: '#ffffff' }}
              />
            </div>
          )}

          {/* ファイル */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px' }}>ファイル(&F):</label>
            <input
              type="text"
              value={filePattern}
              onChange={(e) => setFilePattern(e.target.value)}
              style={{ flex: 1, padding: '3px 6px', border: '1px solid #7f9db9', backgroundColor: '#ffffff' }}
            />
          </div>

          {/* 検索対象スコープ */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px' }}>対象(&T):</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'all-tabs'}
                  onChange={() => setTargetScope('all-tabs')}
                />
                開いている全ファイル
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'current-tab'}
                  onChange={() => setTargetScope('current-tab')}
                />
                現在のファイル ({currentFileName})
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="scope"
                  checked={targetScope === 'folder'}
                  onChange={() => setTargetScope('folder')}
                />
                フォルダ指定
              </label>
            </div>
          </div>

          {/* フォルダ */}
          {targetScope === 'folder' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ width: '80px' }}>フォルダ(&D):</label>
              <input
                type="text"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                style={{ flex: 1, padding: '3px 6px', border: '1px solid #7f9db9', backgroundColor: '#ffffff' }}
              />
            </div>
          )}

          {/* オプション チェックボックス */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              padding: '8px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #d4d0c8',
              marginTop: '4px',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
              />
              大文字/小文字を区別する(&C)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
              />
              正規表現(&E)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={matchWholeWord}
                onChange={(e) => setMatchWholeWord(e.target.checked)}
              />
              単語単位で探す(&W)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={subFolders}
                onChange={(e) => setSubFolders(e.target.checked)}
                disabled={targetScope !== 'folder'}
              />
              サブフォルダからも検索(&S)
            </label>
          </div>

          {/* アクションボタン */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              className="sakura-btn primary"
              onClick={handleSearch}
              disabled={isSearching}
              style={{ fontWeight: 'bold', minWidth: '90px' }}
            >
              {isSearching ? '処理中...' : isReplaceMode ? '置換実行(&R)' : '検索(&S)'}
            </button>
            <button className="sakura-btn" onClick={onClose} style={{ minWidth: '80px' }}>
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
