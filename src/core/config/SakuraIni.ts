import type { TypeSettingItem } from './TypeSettingsModel';

export class SakuraIni {
  /**
   * TypeSettingItem をサクラエディタの sakura.ini 形式の文字列へ変換
   */
  public static exportToIni(settings: TypeSettingItem): string {
    const wrapModeNum = settings.wrapConfig.wrapMode === 'column' ? 0 : settings.wrapConfig.wrapMode === 'window' ? 1 : 2;

    const lines: string[] = [
      '; サクラエディタ 設定ファイル (sakura.ini 互換形式)',
      '[Sakura]',
      `nRulerHeight=20`,
      `nFontSize=${settings.fontSize}`,
      `szFontName="${settings.fontFamily}"`,
      `nLineSpace=${settings.lineSpacing || 2}`,
      `bShowRuler=${settings.showRuler ? 1 : 0}`,
      `bShowLineNum=${settings.showLineNumbers ? 1 : 0}`,
      `nLineNumType=${settings.lineNumberType === 'visual' ? 1 : 0}`,
      '',
      '[Type_Current]',
      `szTypeName="${settings.syntaxName}"`,
      `nTabSize=${settings.wrapConfig.tabSize}`,
      `nMaxLineKetas=${settings.wrapConfig.wrapColumn}`,
      `nWrapType=${wrapModeNum}`,
      `bShowFullSpace=${settings.showSymbols.fullSpace ? 1 : 0}`,
      `bShowHalfSpace=${settings.showSymbols.halfSpace ? 1 : 0}`,
      `bShowTab=${settings.showSymbols.tab ? 1 : 0}`,
      `bShowEOL=${settings.showSymbols.lineEnd ? 1 : 0}`,
      `bShowEOF=${settings.showSymbols.eof ? 1 : 0}`,
      '',
      '[Colors]',
      'clrBack=16777215',       // #ffffff
      'clrText=0',              // #000000
      'clrKeyword=16711680',    // #0000ff
      'clrComment=32768',       // #008000
      'clrString=2763429',      // #a52a2a
    ];

    return lines.join('\r\n');
  }

  /**
   * sakura.ini 形式のテキストから TypeSettings を復元
   */
  public static parseFromIni(iniText: string): Partial<TypeSettingItem> {
    const lines = iniText.split(/\r\n|\r|\n/);
    const parsed: Record<string, string> = {};

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(';') || line.startsWith('[')) continue;
      const idx = line.indexOf('=');
      if (idx !== -1) {
        const key = line.substring(0, idx).trim();
        let val = line.substring(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        parsed[key] = val;
      }
    }

    const wrapMode = parsed['nWrapType'] === '1' ? 'window' : parsed['nWrapType'] === '2' ? 'none' : 'column';
    const wrapColumn = parseInt(parsed['nMaxLineKetas'] || '80', 10);
    const tabSize = parseInt(parsed['nTabSize'] || '4', 10);
    const fontSize = parseInt(parsed['nFontSize'] || '14', 10);
    const fontFamily = parsed['szFontName'] || "'BIZ UDGothic', 'MS Gothic', monospace";
    const lineSpacing = parseInt(parsed['nLineSpace'] || '2', 10);
    const showRuler = parsed['bShowRuler'] !== '0';
    const showLineNumbers = parsed['bShowLineNum'] !== '0';
    const lineNumberType = parsed['nLineNumType'] === '1' ? 'visual' : 'logical';
    const syntaxName = parsed['szTypeName'] || 'Text';

    return {
      fontSize,
      fontFamily,
      lineSpacing,
      showRuler,
      showLineNumbers,
      lineNumberType,
      syntaxName,
      wrapConfig: {
        wrapMode: wrapMode as any,
        wrapColumn,
        tabSize,
      },
      showSymbols: {
        fullSpace: parsed['bShowFullSpace'] !== '0',
        halfSpace: parsed['bShowHalfSpace'] === '1',
        tab: parsed['bShowTab'] !== '0',
        lineEnd: parsed['bShowEOL'] !== '0',
        eof: parsed['bShowEOF'] !== '0',
      },
    };
  }
}
