/**
 * サクラエディタ互換 文字種変換・テキスト整形エンジン
 */

export class TextTransform {
  // 全角英数・記号 ↔ 半角英数・記号
  public static toHalfWidth(text: string): string {
    return text
      // 全角英数字・記号
      .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
      // 全角スペース
      .replace(/　/g, ' ')
      // 全角カタカナ → 半角カタカナ
      .replace(/[\u30a1-\u30f6]/g, (ch) => {
        const kanaMap: Record<string, string> = {
          'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
          'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
          'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
          'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
          'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
          'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
          'マ': 'ﾏ', 'ミ': 'ﾐ', 'ム': 'ﾑ', 'メ': 'ﾒ', 'モ': 'ﾓ',
          'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
          'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
          'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
          'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
          'ッ': 'ｯ', 'ャ': 'ｬ', 'ュ': 'ｭ', 'ョ': 'ｮ',
          'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
          'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
          'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
          'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
          'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
          'ヴ': 'ｳﾞ', 'ー': 'ｰ', '・': '･', '「': '｢', '」': '｣',
        };
        return kanaMap[ch] || ch;
      });
  }

  // 半角 ↔ 全角
  public static toFullWidth(text: string): string {
    return text
      // 半角英数・記号（スペース除く）
      .replace(/[!-~]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0xfee0))
      // 半角スペース
      .replace(/ /g, '　')
      // 半角濁点・半濁点付きカナ
      .replace(/([ｶ-ﾄﾊ-ﾎｳ])ﾞ/g, (_, ch) => {
        const dMap: Record<string, string> = {
          'ｶ': 'ガ', 'ｷ': 'ギ', 'ｸ': 'グ', 'ｹ': 'ゲ', 'ｺ': 'ゴ',
          'ｻ': 'ザ', 'ｼ': 'ジ', 'ｽ': 'ズ', 'ｾ': 'ゼ', 'ｿ': 'ゾ',
          'ﾀ': 'ダ', 'ﾁ': 'ヂ', 'ﾂ': 'ヅ', 'ﾃ': 'デ', 'ﾄ': 'ド',
          'ﾊ': 'バ', 'ﾋ': 'ビ', 'ﾌ': 'ブ', 'ﾍ': 'ベ', 'ﾎ': 'ボ',
          'ｳ': 'ヴ',
        };
        return dMap[ch] || ch + 'ﾞ';
      })
      .replace(/([ﾊ-ﾎ])ﾟ/g, (_, ch) => {
        const pMap: Record<string, string> = {
          'ﾊ': 'パ', 'ﾋ': 'ピ', 'ﾌ': 'プ', 'ﾍ': 'ペ', 'ﾎ': 'ポ',
        };
        return pMap[ch] || ch + 'ﾟ';
      })
      // 通常の半角カナ
      .replace(/[ｦ-ﾝｧ-ｮｰ･｢｣]/g, (ch) => {
        const hMap: Record<string, string> = {
          'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
          'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
          'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
          'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ト': 'ト',
          'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
          'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
          'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
          'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ヨ': 'ヨ',
          'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
          'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
          'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
          'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
          'ｰ': 'ー', '･': '・', '｢': '「', '｣': '」',
        };
        return hMap[ch] || ch;
      });
  }

  // ひらがな → カタカナ
  public static toKatakana(text: string): string {
    return text.replace(/[\u3041-\u3096]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60)
    );
  }

  // カタカナ → ひらがな
  public static toHiragana(text: string): string {
    return text.replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
  }

  // 大文字小文字
  public static toUpperCase(text: string): string {
    return text.toUpperCase();
  }

  public static toLowerCase(text: string): string {
    return text.toLowerCase();
  }

  // 全角英数 → 半角英数
  public static zenAlnumToHan(text: string): string {
    return text.replace(/[０-９Ａ-Ｚａ-ｚ]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );
  }

  // 半角英数 → 全角英数
  public static hanAlnumToZen(text: string): string {
    return text.replace(/[0-9A-Za-z]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0xfee0)
    );
  }

  // 全角カタカナ → 半角カタカナ
  public static zenKataToHan(text: string): string {
    const kanaMap: Record<string, string> = {
      'ア': 'ｱ', 'イ': 'ｲ', 'ウ': 'ｳ', 'エ': 'ｴ', 'オ': 'ｵ',
      'カ': 'ｶ', 'キ': 'ｷ', 'ク': 'ｸ', 'ケ': 'ｹ', 'コ': 'ｺ',
      'サ': 'ｻ', 'シ': 'ｼ', 'ス': 'ｽ', 'セ': 'ｾ', 'ソ': 'ｿ',
      'タ': 'ﾀ', 'チ': 'ﾁ', 'ツ': 'ﾂ', 'テ': 'ﾃ', 'ト': 'ﾄ',
      'ナ': 'ﾅ', 'ニ': 'ﾆ', 'ヌ': 'ﾇ', 'ネ': 'ﾈ', 'ノ': 'ﾉ',
      'ハ': 'ﾊ', 'ヒ': 'ﾋ', 'フ': 'ﾌ', 'ヘ': 'ﾍ', 'ホ': 'ﾎ',
      'マ': 'ﾏ', 'ﾐ': 'ﾐ', 'ﾑ': 'ﾑ', 'ﾒ': 'ﾒ', 'モ': 'ﾓ',
      'ヤ': 'ﾔ', 'ユ': 'ﾕ', 'ヨ': 'ﾖ',
      'ラ': 'ﾗ', 'リ': 'ﾘ', 'ル': 'ﾙ', 'レ': 'ﾚ', 'ロ': 'ﾛ',
      'ワ': 'ﾜ', 'ヲ': 'ｦ', 'ン': 'ﾝ',
      'ァ': 'ｧ', 'ィ': 'ｨ', 'ゥ': 'ｩ', 'ェ': 'ｪ', 'ォ': 'ｫ',
      'ッ': 'ｯ', 'ャ': 'ｬ', 'ュ': 'ｭ', 'ｮ': 'ョ',
      'ガ': 'ｶﾞ', 'ギ': 'ｷﾞ', 'グ': 'ｸﾞ', 'ゲ': 'ｹﾞ', 'ゴ': 'ｺﾞ',
      'ザ': 'ｻﾞ', 'ジ': 'ｼﾞ', 'ズ': 'ｽﾞ', 'ゼ': 'ｾﾞ', 'ゾ': 'ｿﾞ',
      'ダ': 'ﾀﾞ', 'ヂ': 'ﾁﾞ', 'ヅ': 'ﾂﾞ', 'デ': 'ﾃﾞ', 'ド': 'ﾄﾞ',
      'バ': 'ﾊﾞ', 'ビ': 'ﾋﾞ', 'ブ': 'ﾌﾞ', 'ベ': 'ﾍﾞ', 'ボ': 'ﾎﾞ',
      'パ': 'ﾊﾟ', 'ピ': 'ﾋﾟ', 'プ': 'ﾌﾟ', 'ペ': 'ﾍﾟ', 'ポ': 'ﾎﾟ',
      'ヴ': 'ｳﾞ', 'ー': 'ｰ', '・': '･', '「': '｢', '」': '｣',
    };
    return text.replace(/[\u30a1-\u30f6ー・「」]/g, (ch) => kanaMap[ch] || ch);
  }

  // 半角カタカナ → 全角カタカナ
  public static hanKataToZen(text: string): string {
    return text
      .replace(/([ｶ-ﾄﾊ-ﾎｳ])ﾞ/g, (_, ch) => {
        const dMap: Record<string, string> = {
          'ｶ': 'ガ', 'ｷ': 'ギ', 'ｸ': 'グ', 'ｹ': 'ゲ', 'ｺ': 'ゴ',
          'ｻ': 'ザ', 'ｼ': 'ジ', 'ｽ': 'ズ', 'ｾ': 'ゼ', 'ｿ': 'ゾ',
          'ﾀ': 'ダ', 'ﾁ': 'ヂ', 'ﾂ': 'ヅ', 'ﾃ': 'デ', 'ﾄ': 'ド',
          'ﾊ': 'バ', 'ﾋ': 'ビ', 'ﾌ': 'ブ', 'ﾍ': 'ベ', 'ﾎ': 'ボ',
          'ｳ': 'ヴ',
        };
        return dMap[ch] || ch + 'ﾞ';
      })
      .replace(/([ﾊ-ﾎ])ﾟ/g, (_, ch) => {
        const pMap: Record<string, string> = {
          'ﾊ': 'パ', 'ﾋ': 'ピ', 'ﾌ': 'プ', 'ﾍ': 'ペ', 'ﾎ': 'ポ',
        };
        return pMap[ch] || ch + 'ﾟ';
      })
      .replace(/[ｦ-ﾝｧ-ｮｰ･｢｣]/g, (ch) => {
        const hMap: Record<string, string> = {
          'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
          'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
          'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
          'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ト': 'ト',
          'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
          'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
          'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'モ': 'モ',
          'ヤ': 'ヤ', 'ﾕ': 'ユ', 'ヨ': 'ヨ',
          'ラ': 'ラ', 'リ': 'リ', 'ル': 'ル', 'レ': 'レ', 'ロ': 'ロ',
          'ワ': 'ワ', 'ｦ': 'ヲ', 'ン': 'ン',
          'ァ': 'ァ', 'ィ': 'ィ', 'ゥ': 'ゥ', 'ェ': 'ェ', 'ｫ': 'ォ',
          'ｯ': 'ッ', 'ャ': 'ャ', 'ュ': 'ュ', 'ｮ': 'ョ',
          'ｰ': 'ー', '･': '・', '｢': '「', '｣': '」',
        };
        return hMap[ch] || ch;
      });
  }

  // 半角カタカナ → 全角ひらがな
  public static hanKataToZenHira(text: string): string {
    const zen = TextTransform.hanKataToZen(text);
    return TextTransform.toHiragana(zen);
  }

  // 半角＋全ひら → 全角・カタカナ
  public static hanPlusZenHiraToZenKata(text: string): string {
    const zenKata = TextTransform.hanKataToZen(text);
    return TextTransform.toKatakana(zenKata);
  }

  // 半角＋全カタ → 全角・ひらがな
  public static hanPlusZenKataToZenHira(text: string): string {
    const zenKata = TextTransform.hanKataToZen(text);
    return TextTransform.toHiragana(zenKata);
  }

  // TAB → 空白
  public static tabToSpaces(text: string, tabSize: number = 4): string {
    const spaces = ' '.repeat(tabSize);
    return text.replace(/\t/g, spaces);
  }

  // 空白 → TAB
  public static spacesToTab(text: string, tabSize: number = 4): string {
    const regex = new RegExp(` {${tabSize}}`, 'g');
    return text.replace(regex, '\t');
  }

  // 行頭の空白削除
  public static trimLineStart(lines: string[]): string[] {
    return lines.map((l) => l.replace(/^[ \t　]+/, ''));
  }

  // 行末の空白削除
  public static trimLineEnd(lines: string[]): string[] {
    return lines.map((l) => l.replace(/[ \t　]+$/, ''));
  }

  // 空行削除
  public static removeEmptyLines(lines: string[]): string[] {
    return lines.filter((l) => l.trim().length > 0);
  }

  // 重複行の削除（ユニーク化）
  public static removeDuplicateLines(lines: string[]): string[] {
    const seen = new Set<string>();
    const res: string[] = [];
    for (const l of lines) {
      if (!seen.has(l)) {
        seen.add(l);
        res.push(l);
      }
    }
    return res;
  }

  // 行の昇順ソート
  public static sortLinesAsc(lines: string[]): string[] {
    return [...lines].sort((a, b) => a.localeCompare(b));
  }

  // 行の降順ソート
  public static sortLinesDesc(lines: string[]): string[] {
    return [...lines].sort((a, b) => b.localeCompare(a));
  }

  // 連番の生成
  public static generateSequence(
    count: number,
    start: number = 1,
    step: number = 1,
    zeroPadDigits: number = 0
  ): string[] {
    const result: string[] = [];
    let cur = start;
    for (let i = 0; i < count; i++) {
      let numStr = String(cur);
      if (zeroPadDigits > 0) {
        numStr = numStr.padStart(zeroPadDigits, '0');
      }
      result.push(numStr);
      cur += step;
    }
    return result;
  }
}
