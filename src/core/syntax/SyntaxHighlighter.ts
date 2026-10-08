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
  start: number; // 文字列内の開始インデックス (inclusive)
  end: number;   // 終了インデックス (exclusive)
}

export interface SyntaxLineState {
  blockCommentEnd?: string;
  multilineStringDelimiter?: string;
}

export interface BlockCommentRule {
  start: string;
  end: string;
}

export interface SyntaxRule {
  name: string;
  caseSensitive?: boolean;
  keywords: Set<string>;
  keywords2?: Set<string>;
  lineComments?: string[];
  blockComments?: BlockCommentRule[];
  stringDelimiters?: string[];
  multilineStrings?: string[];
  preprocessorPrefix?: string;
  variablePrefixes?: string[];
  // Backwards compatibility with previous simple rule structure
  lineComment?: string;
  blockCommentStart?: string;
  blockCommentEnd?: string;
}

export const C_CPP_RULES: SyntaxRule = {
  name: 'C/C++',
  caseSensitive: true,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  preprocessorPrefix: '#',
  keywords: new Set([
    'alignas', 'alignof', 'and', 'and_eq', 'asm', 'atomic_cancel', 'atomic_commit', 'atomic_noexcept',
    'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char8_t', 'char16_t',
    'char32_t', 'class', 'compl', 'concept', 'const', 'consteval', 'constexpr', 'constinit',
    'const_cast', 'continue', 'co_await', 'co_return', 'co_yield', 'decltype', 'default', 'delete',
    'do', 'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float',
    'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
    'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'override', 'private', 'protected', 'public',
    'reflexpr', 'register', 'reinterpret_cast', 'requires', 'return', 'short', 'signed', 'sizeof',
    'static', 'static_assert', 'static_cast', 'struct', 'switch', 'synchronized', 'template', 'this',
    'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename', 'union', 'unsigned',
    'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq',
    // Preprocessor directives
    'include', 'define', 'undef', 'ifdef', 'ifndef', 'endif', 'elif', 'pragma', 'error', 'warning',
    // Common types & std
    'size_t', 'ssize_t', 'int8_t', 'int16_t', 'int32_t', 'int64_t', 'uint8_t', 'uint16_t',
    'uint32_t', 'uint64_t', 'intptr_t', 'uintptr_t', 'string', 'wstring', 'vector', 'map', 'unordered_map',
    'set', 'unordered_set', 'pair', 'tuple', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'cout', 'cin', 'cerr', 'endl',
    'std', 'NULL'
  ]),
};

export const JS_TS_RULES: SyntaxRule = {
  name: 'JavaScript/TypeScript',
  caseSensitive: true,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  multilineStrings: ['`'],
  keywords: new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
    'else', 'export', 'extends', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
    'new', 'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
    'with', 'yield', 'let', 'static', 'enum', 'await', 'async', 'implements', 'interface', 'package',
    'private', 'protected', 'public', 'abstract', 'as', 'asserts', 'any', 'boolean', 'constructor',
    'declare', 'get', 'is', 'keyof', 'module', 'namespace', 'never', 'readonly', 'require', 'number',
    'set', 'string', 'symbol', 'type', 'undefined', 'unique', 'unknown', 'from', 'of', 'null', 'true',
    'false', 'NaN', 'Infinity', 'bigint', 'record', 'infer'
  ]),
};

export const HTML_RULES: SyntaxRule = {
  name: 'HTML',
  caseSensitive: false,
  blockComments: [{ start: '<!--', end: '-->' }],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'html', 'head', 'body', 'title', 'meta', 'link', 'style', 'script', 'noscript',
    'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    'form', 'input', 'button', 'select', 'optgroup', 'option', 'textarea', 'label', 'fieldset', 'legend',
    'img', 'picture', 'source', 'video', 'audio', 'canvas', 'svg', 'path', 'rect', 'circle',
    'iframe', 'header', 'footer', 'nav', 'section', 'article', 'aside', 'main', 'figure', 'figcaption',
    'b', 'strong', 'i', 'em', 'mark', 'small', 'del', 'ins', 'sub', 'sup', 'pre', 'code', 'blockquote',
    'br', 'hr', 'doctype', '!doctype', 'xml', '?xml'
  ]),
  keywords2: new Set([
    'class', 'id', 'name', 'value', 'type', 'src', 'href', 'rel', 'style', 'width', 'height',
    'alt', 'title', 'placeholder', 'disabled', 'checked', 'selected', 'readonly', 'required',
    'target', 'method', 'action', 'enctype', 'rows', 'cols', 'onclick', 'onload', 'onchange'
  ]),
};

export const CSS_RULES: SyntaxRule = {
  name: 'CSS',
  caseSensitive: false,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'color', 'background', 'background-color', 'background-image', 'background-repeat', 'background-position', 'background-size',
    'border', 'border-color', 'border-style', 'border-width', 'border-radius', 'border-top', 'border-bottom', 'border-left', 'border-right',
    'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
    'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
    'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-align', 'text-decoration',
    'display', 'flex', 'grid', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'gap',
    'position', 'top', 'bottom', 'left', 'right', 'z-index', 'overflow', 'overflow-x', 'overflow-y',
    'opacity', 'box-shadow', 'text-shadow', 'cursor', 'transition', 'transform', 'animation', 'visibility',
    'outline', 'box-sizing', 'content', 'vertical-align', 'float', 'clear',
    '@media', '@keyframes', '@import', '@font-face', '@supports', '@charset',
    'none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid',
    'auto', 'inherit', 'initial', 'unset', 'relative', 'absolute', 'fixed', 'sticky',
    'bold', 'normal', 'italic', 'center', 'left', 'right', 'justify', 'pointer',
    '!important'
  ]),
};

export const JSON_RULES: SyntaxRule = {
  name: 'JSON',
  caseSensitive: true,
  stringDelimiters: ['"'],
  keywords: new Set(['true', 'false', 'null']),
};

export const PYTHON_RULES: SyntaxRule = {
  name: 'Python',
  caseSensitive: true,
  lineComments: ['#'],
  multilineStrings: ['"""', "'''"],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class',
    'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global',
    'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
    'try', 'while', 'with', 'yield', 'match', 'case', 'self', 'cls',
    // Builtins
    'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple', 'bool',
    'open', 'type', 'isinstance', 'enumerate', 'zip', 'map', 'filter', 'sum', 'min', 'max',
    'abs', 'round', 'super', 'dir', 'id', 'hasattr', 'getattr', 'setattr', 'repr'
  ]),
};

export const SQL_RULES: SyntaxRule = {
  name: 'SQL',
  caseSensitive: false,
  lineComments: ['--', '//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ["'", '"'],
  keywords: new Set([
    'select', 'from', 'where', 'insert', 'into', 'update', 'delete', 'create', 'table', 'drop',
    'alter', 'add', 'column', 'join', 'inner', 'left', 'right', 'outer', 'full', 'cross', 'on',
    'group', 'by', 'order', 'having', 'limit', 'offset', 'union', 'all', 'distinct', 'as', 'and',
    'or', 'not', 'in', 'is', 'null', 'like', 'between', 'exists', 'case', 'when', 'then', 'else',
    'end', 'primary', 'key', 'foreign', 'references', 'index', 'view', 'trigger', 'procedure',
    'function', 'begin', 'commit', 'rollback', 'declare', 'exec', 'execute', 'set', 'values',
    'count', 'sum', 'avg', 'min', 'max', 'int', 'integer', 'varchar', 'char', 'text', 'date',
    'datetime', 'timestamp', 'boolean', 'float', 'double', 'decimal', 'numeric', 'default',
    'check', 'unique', 'top', 'row_number', 'over', 'partition', 'with', 'database', 'schema',
    'grant', 'revoke', 'truncate', 'use', 'show', 'describe', 'explain', 'asc', 'desc'
  ]),
};

export const JAVA_RULES: SyntaxRule = {
  name: 'Java',
  caseSensitive: true,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
    'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
    'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
    'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'false', 'try',
    'void', 'volatile', 'while', 'var', 'record', 'sealed', 'permits', 'yield',
    'String', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Character', 'Byte', 'Short',
    'Object', 'Class', 'System', 'Math', 'List', 'ArrayList', 'LinkedList', 'Map', 'HashMap',
    'Set', 'HashSet', 'Collections', 'Arrays', 'Override', 'Deprecated', 'SuppressWarnings'
  ]),
};

export const CSHARP_RULES: SyntaxRule = {
  name: 'C#',
  caseSensitive: true,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char', 'checked', 'class',
    'const', 'continue', 'decimal', 'default', 'delegate', 'do', 'double', 'else', 'enum', 'event',
    'explicit', 'extern', 'false', 'finally', 'fixed', 'float', 'for', 'foreach', 'goto', 'if',
    'implicit', 'in', 'int', 'interface', 'internal', 'is', 'lock', 'long', 'namespace', 'new', 'null',
    'object', 'operator', 'out', 'override', 'params', 'private', 'protected', 'public', 'readonly',
    'ref', 'return', 'sbyte', 'sealed', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct',
    'switch', 'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe',
    'ushort', 'using', 'virtual', 'void', 'volatile', 'while', 'async', 'await', 'var', 'yield',
    'record', 'init', 'get', 'set', 'value', 'Task', 'List', 'Dictionary'
  ]),
};

export const PHP_RULES: SyntaxRule = {
  name: 'PHP',
  caseSensitive: false,
  lineComments: ['//', '#'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  variablePrefixes: ['$'],
  keywords: new Set([
    'echo', 'print', 'function', 'class', 'interface', 'trait', 'public', 'protected', 'private',
    'static', 'final', 'abstract', 'const', 'return', 'if', 'else', 'elseif', 'while', 'do', 'for',
    'foreach', 'as', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally',
    'throw', 'new', 'clone', 'instanceof', 'use', 'namespace', 'require', 'require_once', 'include',
    'include_once', 'yield', 'fn', 'match', 'true', 'false', 'null', 'array', 'isset', 'empty',
    'die', 'exit', 'var', 'global', 'extends', 'implements', 'self', 'parent',
    'php', '?php'
  ]),
};

export const RUBY_RULES: SyntaxRule = {
  name: 'Ruby',
  caseSensitive: true,
  lineComments: ['#'],
  blockComments: [{ start: '=begin', end: '=end' }],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'defined?', 'do', 'else', 'elsif',
    'end', 'ensure', 'false', 'for', 'if', 'in', 'module', 'next', 'nil', 'not', 'or', 'redo',
    'rescue', 'retry', 'return', 'self', 'super', 'then', 'true', 'undef', 'unless', 'until',
    'when', 'while', 'yield', 'attr_accessor', 'attr_reader', 'attr_writer', 'require', 'require_relative',
    'include', 'extend', 'puts', 'print', 'raise'
  ]),
};

export const GO_RULES: SyntaxRule = {
  name: 'Go',
  caseSensitive: true,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  multilineStrings: ['`'],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else', 'fallthrough', 'for',
    'func', 'go', 'goto', 'if', 'import', 'interface', 'map', 'package', 'range', 'return', 'select',
    'struct', 'switch', 'type', 'var', 'nil', 'true', 'false', 'iota', 'make', 'new', 'append',
    'len', 'cap', 'copy', 'delete', 'panic', 'recover', 'string', 'int', 'int8', 'int16', 'int32',
    'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32', 'float64', 'bool', 'byte',
    'rune', 'error'
  ]),
};

export const RUST_RULES: SyntaxRule = {
  name: 'Rust',
  caseSensitive: true,
  lineComments: ['//'],
  blockComments: [{ start: '/*', end: '*/' }],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else', 'enum', 'extern',
    'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop', 'match', 'mod', 'move', 'mut', 'pub',
    'ref', 'return', 'self', 'Self', 'static', 'struct', 'super', 'trait', 'true', 'type', 'unsafe',
    'use', 'where', 'while', 'yield', 'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'u8', 'u16',
    'u32', 'u64', 'u128', 'usize', 'f32', 'f64', 'bool', 'char', 'str', 'String', 'Vec', 'Option',
    'Result', 'Some', 'None', 'Ok', 'Err', 'println', 'format', 'vec'
  ]),
};

export const SHELL_RULES: SyntaxRule = {
  name: 'Shell',
  caseSensitive: true,
  lineComments: ['#'],
  stringDelimiters: ['"', "'"],
  variablePrefixes: ['$'],
  keywords: new Set([
    'if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done',
    'in', 'function', 'select', 'time', 'echo', 'export', 'source', 'exit', 'local', 'return',
    'read', 'set', 'unset', 'alias', 'test', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep'
  ]),
};

export const POWERSHELL_RULES: SyntaxRule = {
  name: 'PowerShell',
  caseSensitive: false,
  lineComments: ['#'],
  blockComments: [{ start: '<#', end: '#>' }],
  stringDelimiters: ['"', "'"],
  variablePrefixes: ['$'],
  keywords: new Set([
    'if', 'else', 'elseif', 'switch', 'foreach', 'for', 'while', 'do', 'until', 'break', 'continue',
    'return', 'function', 'filter', 'param', 'begin', 'process', 'end', 'try', 'catch', 'finally',
    'throw', 'trap', 'class', 'enum', 'using', 'write-host', 'write-output', 'get-childitem',
    'set-item', 'get-content', 'set-content', 'select-object', 'where-object', 'out-null',
    'exit', 'true', 'false', 'null'
  ]),
};

export const BATCH_RULES: SyntaxRule = {
  name: 'Batch',
  caseSensitive: false,
  lineComments: ['REM ', 'rem ', '::'],
  stringDelimiters: ['"'],
  variablePrefixes: ['%'],
  keywords: new Set([
    '@echo', 'echo', 'off', 'on', 'set', 'if', 'else', 'goto', 'call', 'exit', 'pause', 'for',
    'in', 'do', 'shift', 'choice', 'errorlevel', 'exist', 'not', 'start', 'title', 'cls', 'cd',
    'dir', 'copy', 'del', 'md', 'rd', 'type', 'find', 'findstr', 'ren', 'move', 'xcopy', 'robocopy'
  ]),
};

export const INI_RULES: SyntaxRule = {
  name: 'INI',
  caseSensitive: false,
  lineComments: [';', '#'],
  stringDelimiters: ['"', "'"],
  keywords: new Set([]),
};

export const MARKDOWN_RULES: SyntaxRule = {
  name: 'Markdown',
  caseSensitive: false,
  multilineStrings: ['```'],
  stringDelimiters: ['`'],
  keywords: new Set([]),
};

export const PERL_RULES: SyntaxRule = {
  name: 'Perl',
  caseSensitive: true,
  lineComments: ['#'],
  stringDelimiters: ['"', "'"],
  variablePrefixes: ['$', '@', '%'],
  keywords: new Set([
    'my', 'our', 'local', 'sub', 'if', 'unless', 'else', 'elsif', 'while', 'until', 'for',
    'foreach', 'do', 'next', 'last', 'redo', 'return', 'print', 'use', 'require', 'package',
    'die', 'warn', 'strict', 'warnings'
  ]),
};

export const VB_RULES: SyntaxRule = {
  name: 'Visual Basic',
  caseSensitive: false,
  lineComments: ["'", 'REM ', 'rem '],
  stringDelimiters: ['"'],
  keywords: new Set([
    'dim', 'as', 'public', 'private', 'protected', 'sub', 'function', 'end', 'if', 'then',
    'else', 'elseif', 'for', 'to', 'step', 'next', 'each', 'in', 'while', 'wend', 'do',
    'loop', 'until', 'select', 'case', 'with', 'exit', 'return', 'new', 'set', 'call',
    'const', 'true', 'false', 'nothing', 'string', 'integer', 'boolean', 'long', 'double', 'date'
  ]),
};

export const PASCAL_RULES: SyntaxRule = {
  name: 'Pascal',
  caseSensitive: false,
  lineComments: ['//'],
  blockComments: [{ start: '{', end: '}' }, { start: '(*', end: '*)' }],
  stringDelimiters: ["'"],
  keywords: new Set([
    'program', 'unit', 'interface', 'implementation', 'uses', 'var', 'const', 'type',
    'procedure', 'function', 'begin', 'end', 'if', 'then', 'else', 'case', 'of', 'for',
    'to', 'downto', 'do', 'while', 'repeat', 'until', 'with', 'try', 'except', 'finally',
    'raise', 'class', 'record', 'array', 'string', 'integer', 'boolean', 'true', 'false', 'nil'
  ]),
};

export const COBOL_RULES: SyntaxRule = {
  name: 'COBOL',
  caseSensitive: false,
  lineComments: ['*>'],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'identification', 'division', 'program-id', 'environment', 'data', 'working-storage',
    'section', 'procedure', 'display', 'stop', 'run', 'move', 'to', 'compute', 'perform',
    'varying', 'until', 'if', 'else', 'end-if', 'end-perform', 'pic', 'picture', 'value', 'occurs'
  ]),
};

export const TEX_RULES: SyntaxRule = {
  name: 'TeX',
  caseSensitive: true,
  lineComments: ['%'],
  stringDelimiters: ['"', "'"],
  keywords: new Set([]),
};

export const AWK_RULES: SyntaxRule = {
  name: 'AWK',
  caseSensitive: true,
  lineComments: ['#'],
  stringDelimiters: ['"', "'"],
  variablePrefixes: ['$'],
  keywords: new Set([
    'begin', 'end', 'if', 'else', 'while', 'for', 'do', 'break', 'continue', 'return',
    'exit', 'next', 'print', 'printf', 'getline', 'length', 'substr', 'split', 'index', 'match'
  ]),
};

export const ASM_RULES: SyntaxRule = {
  name: 'Assembler',
  caseSensitive: false,
  lineComments: [';'],
  stringDelimiters: ['"', "'"],
  keywords: new Set([
    'mov', 'push', 'pop', 'add', 'sub', 'inc', 'dec', 'cmp', 'jmp', 'je', 'jne', 'jz',
    'jnz', 'call', 'ret', 'nop', 'lea', 'test', 'xor', 'and', 'or', 'shl', 'shr',
    'eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'esp', 'ebp', 'rax', 'rbx', 'rcx', 'rdx',
    'rsi', 'rdi', 'rsp', 'rbp', 'section', 'global', 'extern', 'db', 'dw', 'dd', 'dq'
  ]),
};

export const ALL_SYNTAX_RULES: Record<string, SyntaxRule> = {
  'C/C++': C_CPP_RULES,
  'JavaScript/TypeScript': JS_TS_RULES,
  'Python': PYTHON_RULES,
  'HTML': HTML_RULES,
  'CSS': CSS_RULES,
  'JSON': JSON_RULES,
  'SQL': SQL_RULES,
  'Java': JAVA_RULES,
  'C#': CSHARP_RULES,
  'PHP': PHP_RULES,
  'Ruby': RUBY_RULES,
  'Go': GO_RULES,
  'Rust': RUST_RULES,
  'Shell': SHELL_RULES,
  'PowerShell': POWERSHELL_RULES,
  'Batch': BATCH_RULES,
  'INI': INI_RULES,
  'Markdown': MARKDOWN_RULES,
  'Perl': PERL_RULES,
  'Visual Basic': VB_RULES,
  'Pascal': PASCAL_RULES,
  'COBOL': COBOL_RULES,
  'TeX': TEX_RULES,
  'AWK': AWK_RULES,
  'Assembler': ASM_RULES,
};

export class SyntaxHighlighter {
  public static getRuleByName(name?: string): SyntaxRule | undefined {
    if (!name || name === 'Text' || name === 'テキスト' || name === '基本') return undefined;
    if (ALL_SYNTAX_RULES[name]) return ALL_SYNTAX_RULES[name];
    const lower = name.toLowerCase();
    for (const key of Object.keys(ALL_SYNTAX_RULES)) {
      if (key.toLowerCase() === lower || ALL_SYNTAX_RULES[key].name.toLowerCase() === lower) {
        return ALL_SYNTAX_RULES[key];
      }
    }
    return undefined;
  }

  public static tokenizeLine(
    text: string,
    rule?: SyntaxRule,
    stateIn?: SyntaxLineState
  ): { tokens: Token[]; nextState: SyntaxLineState } {
    const tokens: Token[] = [];
    const len = text.length;
    let i = 0;
    const nextState: SyntaxLineState = { ...stateIn };

    // 1. 継続している複数行ブロックコメントの処理
    if (nextState.blockCommentEnd) {
      const endIdx = text.indexOf(nextState.blockCommentEnd, 0);
      if (endIdx === -1) {
        tokens.push({ type: 'comment', start: 0, end: len });
        return { tokens, nextState };
      } else {
        const commentEnd = endIdx + nextState.blockCommentEnd.length;
        tokens.push({ type: 'comment', start: 0, end: commentEnd });
        delete nextState.blockCommentEnd;
        i = commentEnd;
      }
    }

    // 2. 継続している複数行文字列リテラル / Markdownコードブロックの処理
    if (nextState.multilineStringDelimiter) {
      const delim = nextState.multilineStringDelimiter;
      const endIdx = text.indexOf(delim, i);
      if (endIdx === -1) {
        tokens.push({ type: 'string', start: i, end: len });
        return { tokens, nextState };
      } else {
        const strEnd = endIdx + delim.length;
        tokens.push({ type: 'string', start: i, end: strEnd });
        delete nextState.multilineStringDelimiter;
        i = strEnd;
      }
    }

    // 後方互換性のためルール定義のコメント・区切り文字を正規化
    const lineComments = rule?.lineComments || (rule?.lineComment ? [rule.lineComment] : []);
    const blockComments = rule?.blockComments || (rule?.blockCommentStart && rule?.blockCommentEnd ? [{ start: rule.blockCommentStart, end: rule.blockCommentEnd }] : []);
    const stringDelims = rule?.stringDelimiters || ['"', "'"];
    const multilineDelims = rule?.multilineStrings || [];
    const isCaseSensitive = rule?.caseSensitive ?? true;

    // 3. 行内トークン解析ループ
    while (i < len) {
      // 3.0. URL / メールアドレスの検出 (サクラエディタ標準: 青色＋下線表示)
      if (text.startsWith('http://', i) || text.startsWith('https://', i) || text.startsWith('mailto:', i) || text.startsWith('ftp://', i)) {
        const start = i;
        while (i < len && !/[\s"'<>\u3000\uff08\uff09\(\)\[\]\{\}]/.test(text[i])) {
          i++;
        }
        tokens.push({ type: 'url', start, end: i });
        continue;
      }

      // ルール未指定 (Text形式) の場合
      if (!rule || rule.name === 'Text') {
        const start = i;
        while (
          i < len &&
          !text.startsWith('http://', i) &&
          !text.startsWith('https://', i) &&
          !text.startsWith('mailto:', i) &&
          !text.startsWith('ftp://', i)
        ) {
          i++;
        }
        tokens.push({ type: 'text', start, end: i });
        continue;
      }

      // 3.1. ブロックコメントの開始判定
      let matchedBlock = false;
      for (const bc of blockComments) {
        if (text.startsWith(bc.start, i)) {
          const start = i;
          const endIdx = text.indexOf(bc.end, i + bc.start.length);
          if (endIdx === -1) {
            tokens.push({ type: 'comment', start, end: len });
            nextState.blockCommentEnd = bc.end;
            return { tokens, nextState };
          } else {
            const commentEnd = endIdx + bc.end.length;
            tokens.push({ type: 'comment', start, end: commentEnd });
            i = commentEnd;
            matchedBlock = true;
            break;
          }
        }
      }
      if (matchedBlock) continue;

      // 3.2. 行コメントの判定
      let matchedLineComment = false;
      for (const lc of lineComments) {
        const isRem = lc.toLowerCase().startsWith('rem') || lc === '::';
        const matches = isRem
          ? text.substring(i).toLowerCase().startsWith(lc.toLowerCase())
          : text.startsWith(lc, i);

        if (matches) {
          tokens.push({ type: 'comment', start: i, end: len });
          return { tokens, nextState };
        }
      }
      if (matchedLineComment) break;

      // 3.3. 複数行文字列 / バッククォート / Markdownコードブロックの判定
      let matchedMultiline = false;
      for (const ml of multilineDelims) {
        if (text.startsWith(ml, i)) {
          const start = i;
          const endIdx = text.indexOf(ml, i + ml.length);
          if (endIdx === -1) {
            tokens.push({ type: 'string', start, end: len });
            nextState.multilineStringDelimiter = ml;
            return { tokens, nextState };
          } else {
            const strEnd = endIdx + ml.length;
            tokens.push({ type: 'string', start, end: strEnd });
            i = strEnd;
            matchedMultiline = true;
            break;
          }
        }
      }
      if (matchedMultiline) continue;

      // 3.4. 単一行文字列リテラル
      if (stringDelims.includes(text[i])) {
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

      // 3.5. HTML / XML タグの解析
      if (rule.name === 'HTML' && text[i] === '<') {
        const start = i;
        i++;
        // 終了タグ </
        if (i < len && text[i] === '/') i++;
        // !DOCTYPE / ?xml
        if (i < len && (text[i] === '!' || text[i] === '?')) i++;

        while (i < len && /[a-zA-Z0-9_\-:]/.test(text[i])) {
          i++;
        }
        tokens.push({ type: 'keyword', start, end: i });

        // タグ内部の属性 & クォート
        while (i < len && text[i] !== '>') {
          if (text[i] === '"' || text[i] === "'") {
            const q = text[i];
            const qStart = i;
            i++;
            while (i < len && text[i] !== q) i++;
            if (i < len) i++;
            tokens.push({ type: 'string', start: qStart, end: i });
          } else if (/[a-zA-Z0-9_\-:]/.test(text[i])) {
            const aStart = i;
            while (i < len && /[a-zA-Z0-9_\-:]/.test(text[i])) i++;
            tokens.push({ type: 'keyword', start: aStart, end: i });
          } else {
            tokens.push({ type: 'text', start: i, end: i + 1 });
            i++;
          }
        }
        if (i < len && text[i] === '>') {
          tokens.push({ type: 'keyword', start: i, end: i + 1 });
          i++;
        }
        continue;
      }

      // 3.6. Markdown 見出し (#) / 引用 (>) / リスト (- *)
      if (rule.name === 'Markdown') {
        if (i === 0 && /^#{1,6}\s+/.test(text)) {
          const match = text.match(/^#{1,6}\s+/);
          if (match) {
            tokens.push({ type: 'keyword', start: 0, end: len });
            return { tokens, nextState };
          }
        }
        if (i === 0 && /^>\s+/.test(text)) {
          tokens.push({ type: 'comment', start: 0, end: len });
          return { tokens, nextState };
        }
        if (i === 0 && /^\s*([*\-+]|\d+\.)\s+/.test(text)) {
          const match = text.match(/^\s*([*\-+]|\d+\.)\s+/);
          if (match) {
            tokens.push({ type: 'keyword', start: 0, end: match[0].length });
            i = match[0].length;
            continue;
          }
        }
      }

      // 3.7. INI セクション [Section]
      if (rule.name === 'INI' && text[i] === '[') {
        const start = i;
        const closeIdx = text.indexOf(']', i);
        if (closeIdx !== -1) {
          tokens.push({ type: 'keyword', start, end: closeIdx + 1 });
          i = closeIdx + 1;
          continue;
        }
      }

      // 3.8. プリプロセッサ / アノテーション (@ / #)
      if ((text[i] === '#' || text[i] === '@') && (rule.preprocessorPrefix === '#' || rule.name === 'Java' || rule.name === 'Python' || rule.name === 'C#')) {
        const start = i;
        i++;
        while (i < len && /[a-zA-Z0-9_]/.test(text[i])) {
          i++;
        }
        tokens.push({ type: 'keyword', start, end: i });
        continue;
      }

      // 3.9. 変数プレフィックス ($var, %var%, :label)
      if (rule.variablePrefixes?.includes(text[i]) || (rule.name === 'Batch' && (text[i] === '%' || text[i] === ':'))) {
        const start = i;
        const prefix = text[i];
        i++;
        while (i < len && /[a-zA-Z0-9_~]/.test(text[i])) {
          i++;
        }
        if (prefix === '%' && i < len && text[i] === '%') i++;
        tokens.push({ type: 'keyword', start, end: i });
        continue;
      }

      // 3.10. 数値
      if (/[0-9]/.test(text[i])) {
        const start = i;
        while (i < len && /[0-9a-fA-FxX.eE_]/.test(text[i])) {
          i++;
        }
        tokens.push({ type: 'number', start, end: i });
        continue;
      }

      // 3.11. 単語 / 予約語 (キーワード)
      if (/[a-zA-Z_]/.test(text[i])) {
        const start = i;
        while (i < len && /[a-zA-Z0-9_\-]/.test(text[i])) {
          i++;
        }
        const rawWord = text.substring(start, i);
        const testWord = isCaseSensitive ? rawWord : rawWord.toLowerCase();
        if (rule.keywords.has(testWord) || rule.keywords2?.has(testWord)) {
          tokens.push({ type: 'keyword', start, end: i });
        } else {
          tokens.push({ type: 'text', start, end: i });
        }
        continue;
      }

      // 3.12. 記号・空白・その他
      tokens.push({ type: 'text', start: i, end: i + 1 });
      i++;
    }

    return { tokens, nextState };
  }

  public static scanLineEndState(text: string, rule?: SyntaxRule, stateIn?: SyntaxLineState): SyntaxLineState {
    const res = SyntaxHighlighter.tokenizeLine(text, rule, stateIn);
    return res.nextState;
  }
}

/**
 * テキストバッファ全体の複数行構文状態を高速に管理・キャッシュするトラッカー
 */
export class DocumentSyntaxStateTracker {
  private lineEndStates: SyntaxLineState[] = [];
  private currentRuleName: string = '';

  public reset(): void {
    this.lineEndStates = [];
    this.currentRuleName = '';
  }

  public invalidateFrom(lineIndex: number): void {
    if (lineIndex < this.lineEndStates.length) {
      this.lineEndStates.length = lineIndex;
    }
  }

  public getInState(
    lineIndex: number,
    getLineText: (idx: number) => string,
    totalLineCount: number,
    rule?: SyntaxRule
  ): SyntaxLineState {
    if (lineIndex <= 0) return {};
    if (!rule || rule.name === 'Text') return {};

    if (rule.name !== this.currentRuleName) {
      this.reset();
      this.currentRuleName = rule.name;
    }

    const target = lineIndex - 1;
    let scanIdx = this.lineEndStates.length;
    let currentState: SyntaxLineState = scanIdx > 0 ? (this.lineEndStates[scanIdx - 1] || {}) : {};

    while (scanIdx <= target && scanIdx < totalLineCount) {
      const lineText = getLineText(scanIdx);
      currentState = SyntaxHighlighter.scanLineEndState(lineText, rule, currentState);
      this.lineEndStates[scanIdx] = currentState;
      scanIdx++;
    }

    return this.lineEndStates[target] || {};
  }
}
