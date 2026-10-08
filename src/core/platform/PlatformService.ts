/**
 * PlatformService: ブラウザ環境 (Web SPA) とデスクトップ環境 (Tauri) の両対応ファイルアクセス・ストレージ抽象化レイヤー
 * 
 * - ブラウザ時: File System Access API, <input type="file">, IndexedDB / localStorage 仮想ストレージで動作
 * - Tauri時: Tauri Rust ネイティブプラグイン (@tauri-apps/plugin-fs, @tauri-apps/plugin-dialog, @tauri-apps/plugin-shell) を呼び出し可能
 */

export interface PickedFileResult {
  name: string;
  path: string;
  content: string;
  size: number;
}

export interface BackupItem {
  key: string;
  filename: string;
  timestamp: number;
  size: number;
  formattedDate: string;
}

export class PlatformService {
  /**
   * 現在の実行環境が Tauri デスクトップ環境かどうかを判定
   */
  public static isTauri(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__)
    );
  }

  /**
   * プラットフォーム詳細情報を取得
   */
  public static getPlatformInfo() {
    const isTauri = this.isTauri();
    return {
      isTauri,
      name: isTauri ? ('tauri' as const) : ('browser' as const),
      label: isTauri ? 'Tauri デスクトップ版' : 'Webブラウザ版 (Web SPA)',
      canAccessLocalFs: isTauri,
      description: isTauri
        ? 'ローカルファイルシステム (C:\\...) への直接アクセスが有効です。'
        : 'ブラウザサンドボックス環境です。ファイル選択・仮想ストレージ(localStorage/IndexedDB)を介して動作します。',
    };
  }

  /**
   * ファイルピッカーを開いてテキストファイルを読み込む
   * (ブラウザ時は <input type="file">、Tauri時はネイティブファイル選択)
   */
  public static async pickFile(options?: {
    accept?: string;
    title?: string;
  }): Promise<PickedFileResult | null> {
    if (this.isTauri()) {
      // 将来の Tauri 連携用フックポイント
      try {
        const tauriDialog = (window as any).__TAURI__?.dialog;
        const tauriFs = (window as any).__TAURI__?.fs;
        if (tauriDialog && tauriFs) {
          const selected = await tauriDialog.open({
            multiple: false,
            title: options?.title || 'ファイルを開く',
          });
          if (typeof selected === 'string') {
            const content = await tauriFs.readTextFile(selected);
            const name = selected.split(/[\\/]/).pop() || selected;
            return {
              name,
              path: selected,
              content,
              size: content.length,
            };
          }
        }
      } catch (err) {
        console.warn('Tauri file dialog fallback to web picker:', err);
      }
    }

    // ブラウザ Web File API による選択
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      if (options?.accept) input.accept = options.accept;

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = (event.target?.result as string) || '';
          resolve({
            name: file.name,
            path: `(選択済み) ${file.name}`,
            content,
            size: file.size,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };

      // キャンセル検知
      window.addEventListener(
        'focus',
        () => {
          setTimeout(() => {
            if (!input.files || input.files.length === 0) {
              // ファイル未選択でダイアログが閉じられた場合
            }
          }, 500);
        },
        { once: true }
      );

      input.click();
    });
  }

  /**
   * フォルダー選択
   */
  public static async pickFolder(options?: { title?: string }): Promise<string | null> {
    if (this.isTauri()) {
      try {
        const tauriDialog = (window as any).__TAURI__?.dialog;
        if (tauriDialog) {
          const selected = await tauriDialog.open({
            directory: true,
            title: options?.title || 'フォルダーの選択',
          });
          if (typeof selected === 'string') return selected;
        }
      } catch (err) {
        console.warn('Tauri folder picker error:', err);
      }
    }

    // ブラウザ環境: File System Access API の showDirectoryPicker が使える場合はフォルダ名を取得
    if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const dirHandle = await (window as any).showDirectoryPicker();
        return `(選択フォルダ) ${dirHandle.name}`;
      } catch {
        // キャンセル時は何もしない
        return null;
      }
    }

    return '(ブラウザ内仮想ストレージ)';
  }

  /**
   * バックアップの保存
   */
  public static async saveBackup(
    filename: string,
    content: string,
    backupType: 'fixed_ext' | 'datetime' | 'serial' = 'fixed_ext',
    ext = '.bak',
    _folder?: string
  ): Promise<string> {
    const timestamp = Date.now();
    let finalExt = ext.startsWith('.') ? ext : `.${ext}`;
    if (backupType === 'datetime') {
      const d = new Date(timestamp);
      const yyyymmdd =
        d.getFullYear().toString() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') +
        '_' +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0') +
        String(d.getSeconds()).padStart(2, '0');
      finalExt = `_${yyyymmdd}${finalExt}`;
    }
    const storageKey = `sakura_backup_${filename}${finalExt}_${timestamp}`;

    try {
      localStorage.setItem(storageKey, content);
      return storageKey;
    } catch (e) {
      console.warn('Backup storage error (localStorage full?):', e);
      return '';
    }
  }

  /**
   * 保存済みバックアップ一覧の取得
   */
  public static listBackups(): BackupItem[] {
    const results: BackupItem[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sakura_backup_')) {
          const val = localStorage.getItem(key) || '';
          // key format: sakura_backup_<filename.ext>_<timestamp>
          const parts = key.replace('sakura_backup_', '').split('_');
          const timestamp = parseInt(parts[parts.length - 1], 10) || 0;
          const originalFilename = parts.slice(0, parts.length - 1).join('_');
          const d = new Date(timestamp);
          results.push({
            key,
            filename: originalFilename || key,
            timestamp,
            size: val.length,
            formattedDate: d.toLocaleString('ja-JP'),
          });
        }
      }
    } catch {}
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 特定バックアップ内容の取得
   */
  public static getBackupContent(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * 特定バックアップの削除
   */
  public static deleteBackup(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  /**
   * すべてのバックアップを削除
   */
  public static clearAllBackups(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sakura_backup_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }

  /**
   * マクロスクリプトの登録・キャッシュ保存
   */
  public static registerMacroCode(macroId: number, name: string, code: string, path: string): void {
    try {
      localStorage.setItem(`sakura_macro_code_${macroId}`, code);
      localStorage.setItem(
        `sakura_macro_meta_${macroId}`,
        JSON.stringify({ name, path, updatedAt: Date.now() })
      );
    } catch {}
  }

  /**
   * 登録マクロスクリプトの読み出し
   */
  public static getMacroCode(macroId: number): string | null {
    try {
      return localStorage.getItem(`sakura_macro_code_${macroId}`);
    } catch {
      return null;
    }
  }

  /**
   * キーワード辞書ファイルの保存
   */
  public static saveDictWords(dictName: string, words: string[]): void {
    try {
      localStorage.setItem(`sakura_dict_${dictName}`, JSON.stringify(words));
    } catch {}
  }

  /**
   * キーワード辞書ファイルの読み出し
   */
  public static getDictWords(dictName: string): string[] | null {
    try {
      const raw = localStorage.getItem(`sakura_dict_${dictName}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
