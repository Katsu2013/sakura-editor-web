import Encoding from 'encoding-japanese';
import type { CharacterEncoding, LineEnding } from '../buffer/types';

export interface DecodedResult {
  text: string;
  encoding: CharacterEncoding;
  lineEnding: LineEnding;
  hasBom: boolean;
}

export class CharEncoding {
  /**
   * バイナリデータ（Uint8Array / ArrayBuffer）から文字コードと改行コードを自動判定してデコード
   */
  public static decode(buffer: Uint8Array): DecodedResult {
    // 1. BOM チェック
    let hasBom = false;
    let detectedEncoding: CharacterEncoding = 'UTF-8';

    if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
      hasBom = true;
      detectedEncoding = 'UTF-8-BOM';
    } else if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
      hasBom = true;
      detectedEncoding = 'UTF-16LE';
    } else if (buffer.length >= 2 && buffer[0] === 0xfe && buffer[1] === 0xff) {
      hasBom = true;
      detectedEncoding = 'UTF-16BE';
    } else {
      // 2. encoding-japanese で自動判別
      const enc = Encoding.detect(buffer);
      switch (enc) {
        case 'SJIS':
          detectedEncoding = 'Shift_JIS';
          break;
        case 'EUCJP':
          detectedEncoding = 'EUC-JP';
          break;
        case 'JIS':
          detectedEncoding = 'ISO-2022-JP';
          break;
        case 'UTF16':
        case 'UTF16LE':
          detectedEncoding = 'UTF-16LE';
          break;
        case 'UTF16BE':
          detectedEncoding = 'UTF-16BE';
          break;
        case 'UTF8':
        default:
          detectedEncoding = 'UTF-8';
          break;
      }
    }

    // デコード実行
    let unicodeArray: number[];
    if (detectedEncoding === 'UTF-8-BOM') {
      unicodeArray = Encoding.convert(buffer.subarray(3), {
        to: 'UNICODE',
        from: 'UTF8',
      });
    } else if (detectedEncoding === 'Shift_JIS') {
      unicodeArray = Encoding.convert(buffer, {
        to: 'UNICODE',
        from: 'SJIS',
      });
    } else if (detectedEncoding === 'EUC-JP') {
      unicodeArray = Encoding.convert(buffer, {
        to: 'UNICODE',
        from: 'EUCJP',
      });
    } else if (detectedEncoding === 'ISO-2022-JP') {
      unicodeArray = Encoding.convert(buffer, {
        to: 'UNICODE',
        from: 'JIS',
      });
    } else {
      unicodeArray = Encoding.convert(buffer, {
        to: 'UNICODE',
        from: 'AUTO',
      });
    }

    const text = Encoding.codeToString(unicodeArray);

    // 3. 主要な改行コードの判定
    let lineEnding: LineEnding = 'CRLF';
    const crlfCount = (text.match(/\r\n/g) || []).length;
    const lfCount = (text.match(/[^\r]\n/g) || []).length;
    const crCount = (text.match(/\r[^\n]/g) || []).length;

    if (lfCount > crlfCount && lfCount > crCount) {
      lineEnding = 'LF';
    } else if (crCount > crlfCount && crCount > lfCount) {
      lineEnding = 'CR';
    } else {
      lineEnding = 'CRLF';
    }

    return {
      text,
      encoding: detectedEncoding,
      lineEnding,
      hasBom,
    };
  }

  /**
   * 指定した文字コードで強制デコード
   */
  public static decodeWithEncoding(buffer: Uint8Array, encoding: CharacterEncoding): DecodedResult {
    let fromEnc: Encoding.Encoding = 'AUTO';
    let subBuffer = buffer;

    switch (encoding) {
      case 'UTF-8-BOM':
        fromEnc = 'UTF8';
        if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
          subBuffer = buffer.subarray(3);
        }
        break;
      case 'UTF-8':
        fromEnc = 'UTF8';
        break;
      case 'Shift_JIS':
        fromEnc = 'SJIS';
        break;
      case 'EUC-JP':
        fromEnc = 'EUCJP';
        break;
      case 'ISO-2022-JP':
        fromEnc = 'JIS';
        break;
      case 'UTF-16LE':
        fromEnc = 'UTF16LE';
        break;
      case 'UTF-16BE':
        fromEnc = 'UTF16BE';
        break;
      default:
        fromEnc = 'AUTO';
        break;
    }

    const unicodeArray = Encoding.convert(subBuffer, {
      to: 'UNICODE',
      from: fromEnc,
    });
    const text = Encoding.codeToString(unicodeArray);

    let lineEnding: LineEnding = 'CRLF';
    const crlfCount = (text.match(/\r\n/g) || []).length;
    const lfCount = (text.match(/[^\r]\n/g) || []).length;
    const crCount = (text.match(/\r[^\n]/g) || []).length;

    if (lfCount > crlfCount && lfCount > crCount) {
      lineEnding = 'LF';
    } else if (crCount > crlfCount && crCount > lfCount) {
      lineEnding = 'CR';
    } else {
      lineEnding = 'CRLF';
    }

    return {
      text,
      encoding,
      lineEnding,
      hasBom: encoding === 'UTF-8-BOM',
    };
  }

  /**
   * テキストを指定文字コードのバイナリ（Uint8Array）にエンコード
   */
  public static encode(text: string, targetEncoding: CharacterEncoding): Uint8Array {
    let fromEncoding: Encoding.Encoding = 'UNICODE';
    let toEncoding: Encoding.Encoding = 'UTF8';
    let addBom = false;

    switch (targetEncoding) {
      case 'UTF-8-BOM':
        toEncoding = 'UTF8';
        addBom = true;
        break;
      case 'UTF-8':
        toEncoding = 'UTF8';
        break;
      case 'Shift_JIS':
        toEncoding = 'SJIS';
        break;
      case 'EUC-JP':
        toEncoding = 'EUCJP';
        break;
      case 'ISO-2022-JP':
        toEncoding = 'JIS';
        break;
      case 'UTF-16LE':
        toEncoding = 'UTF16LE';
        break;
      case 'UTF-16BE':
        toEncoding = 'UTF16BE';
        break;
    }

    const unicodeArray = Encoding.stringToCode(text);
    const converted = Encoding.convert(unicodeArray, {
      to: toEncoding,
      from: fromEncoding,
    });

    if (addBom) {
      const result = new Uint8Array(converted.length + 3);
      result[0] = 0xef;
      result[1] = 0xbb;
      result[2] = 0xbf;
      result.set(converted, 3);
      return result;
    }

    return new Uint8Array(converted);
  }

  /**
   * 文字コードのラベル（サクラエディタのステータスバー・ダイアログ表示用）
   */
  public static getEncodingLabel(enc: CharacterEncoding): string {
    switch (enc) {
      case 'Shift_JIS': return 'SJIS';
      case 'UTF-8': return 'UTF-8';
      case 'UTF-8-BOM': return 'UTF-8 (BOM)';
      case 'EUC-JP': return 'EUC';
      case 'ISO-2022-JP': return 'JIS';
      case 'UTF-16LE': return 'Unicode (LE)';
      case 'UTF-16BE': return 'Unicode (BE)';
    }
  }
}
