export type TokenType =
  | 'text'
  | 'keyword'
  | 'comment'
  | 'string'
  | 'number'
  | 'operator'
  | 'url';

export interface Token {
  type: TokenType;
  start: number; // 文字列内の開始インデックス
  end: number;   // 終了インデックス
}

export interface SyntaxRule {
  name: string;
  keywords: Set<string>;
  lineComment?: string;
  blockCommentStart?: string;
  blockCommentEnd?: string;
}

export const C_CPP_RULES: SyntaxRule = {
  name: 'C/C++',
  keywords: new Set([
    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
    'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'int', 'long', 'register',
    'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef',
    'union', 'unsigned', 'void', 'volatile', 'while', 'class', 'public', 'protected',
    'private', 'template', 'typename', 'virtual', 'override', 'include', 'define',
  ]),
  lineComment: '//',
  blockCommentStart: '/*',
  blockCommentEnd: '*/',
};

export const JS_TS_RULES: SyntaxRule = {
  name: 'JavaScript/TypeScript',
  keywords: new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function',
    'if', 'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch',
    'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'let', 'static', 'async', 'await', 'interface', 'type', 'from', 'as',
  ]),
  lineComment: '//',
  blockCommentStart: '/*',
  blockCommentEnd: '*/',
};

export const PYTHON_RULES: SyntaxRule = {
  name: 'Python',
  keywords: new Set([
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def',
    'del', 'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global',
    'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass',
    'raise', 'return', 'True', 'try', 'while', 'with', 'yield',
  ]),
  lineComment: '#',
};

export class SyntaxHighlighter {
  public static tokenizeLine(text: string, rule?: SyntaxRule): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = text.length;

    while (i < len) {
      // 0. URL / メールアドレスの検出 (サクラエディタ標準: 青色＋下線表示)
      if (text.startsWith('http://', i) || text.startsWith('https://', i) || text.startsWith('mailto:', i)) {
        const start = i;
        while (i < len && !/[\s"'<>\u3000\uff08\uff09\(\)]/.test(text[i])) {
          i++;
        }
        tokens.push({ type: 'url', start, end: i });
        continue;
      }

      if (!rule || rule.name === 'Text') {
        const start = i;
        while (
          i < len &&
          !text.startsWith('http://', i) &&
          !text.startsWith('https://', i) &&
          !text.startsWith('mailto:', i)
        ) {
          i++;
        }
        tokens.push({ type: 'text', start, end: i });
        continue;
      }

      // 1. 行コメント
      if (rule.lineComment && text.startsWith(rule.lineComment, i)) {
        tokens.push({ type: 'comment', start: i, end: len });
        break;
      }

      // 2. 文字列リテラル
      if (text[i] === '"' || text[i] === "'" || text[i] === '`') {
        const quote = text[i];
        const start = i;
        i++;
        while (i < len && text[i] !== quote) {
          if (text[i] === '\\' && i + 1 < len) {
            i += 2;
          } else {
            i++;
          }
        }
        if (i < len) i++; // 閉じクォート
        tokens.push({ type: 'string', start, end: i });
        continue;
      }

      // 3. 数値
      if (/[0-9]/.test(text[i])) {
        const start = i;
        while (i < len && /[0-9a-fA-FxX.]/.test(text[i])) {
          i++;
        }
        tokens.push({ type: 'number', start, end: i });
        continue;
      }

      // 4. 単語 / 予約語
      if (/[a-zA-Z_]/.test(text[i])) {
        const start = i;
        while (i < len && /[a-zA-Z0-9_]/.test(text[i])) {
          i++;
        }
        const word = text.substring(start, i);
        if (rule.keywords.has(word)) {
          tokens.push({ type: 'keyword', start, end: i });
        } else {
          tokens.push({ type: 'text', start, end: i });
        }
        continue;
      }

      // 5. 記号・その他
      tokens.push({ type: 'text', start: i, end: i + 1 });
      i++;
    }

    return tokens;
  }
}
