/**
 * A small, dependency-free syntax highlighter. It only *classifies* text into
 * tokens; rendering happens through React text nodes, so source code is never
 * interpreted as HTML.
 *
 * TSX support covers what docs examples use: comments, strings and template
 * literals, numbers, keywords, JSX tags/attributes/text (with nested `{…}`
 * expressions) and TypeScript generics.
 */
export type TokenType =
  'plain' | 'keyword' | 'string' | 'comment' | 'number' | 'tag' | 'attr' | 'fn' | 'type' | 'punct';

export interface Token {
  type: TokenType;
  text: string;
}

export type Language = 'tsx' | 'ts' | 'bash' | 'css' | 'json' | 'text';

const KEYWORDS = new Set(
  (
    'import from export default function return const let var if else for while of in new type ' +
    'interface extends as typeof keyof null undefined true false async await class this switch ' +
    'case break continue throw try catch finally readonly void satisfies declare enum implements ' +
    'private public protected static yield delete instanceof do'
  ).split(' '),
);

class Out {
  readonly tokens: Token[] = [];
  push(type: TokenType, text: string): void {
    if (!text) return;
    const last = this.tokens[this.tokens.length - 1];
    if (last && last.type === type && (type === 'plain' || type === 'punct')) last.text += text;
    else this.tokens.push({ type, text });
  }
}

/** Matches `re` (sticky) at `pos`; returns the match text or null. */
function at(re: RegExp, src: string, pos: number): string | null {
  re.lastIndex = pos;
  const m = re.exec(src);
  return m ? m[0] : null;
}

const RE = {
  space: /\s+/y,
  lineComment: /\/\/[^\n]*/y,
  blockComment: /\/\*[\s\S]*?(?:\*\/|$)/y,
  single: /'(?:[^'\\\n]|\\.)*'?/y,
  double: /"(?:[^"\\\n]|\\.)*"?/y,
  template: /`(?:[^`\\]|\\[\s\S])*`?/y,
  number: /(?:0[xX][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?)/y,
  ident: /[A-Za-z_$][\w$]*/y,
  tagName: /[A-Za-z_$][\w$.:-]*/y,
  jsxText: /[^<{]+/y,
  punct: /=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\.\.\.|[{}()[\];,.<>+\-*/%=!?:&|^~@#]/y,
} satisfies Record<string, RegExp>;

type Mode = 'js' | 'tag-open' | 'tag-close' | 'children';

/** Tokens before which `<` starts JSX rather than a generic or comparison. */
function jsxCanStart(prev: Token | undefined): boolean {
  if (!prev) return true;
  if (prev.type === 'keyword') return prev.text === 'return' || prev.text === 'default';
  if (prev.type !== 'punct') return false;
  const ch = prev.text[prev.text.length - 1];
  return ch !== undefined && '(=,{}?:>&|[;'.includes(ch) && prev.text !== ')';
}

function lastSignificant(out: Out): Token | undefined {
  for (let i = out.tokens.length - 1; i >= 0; i--) {
    const t = out.tokens[i] as Token;
    if (t.type === 'comment' || (t.type === 'plain' && !t.text.trim())) continue;
    return t;
  }
  return undefined;
}

function tokenizeTsx(src: string, jsx: boolean): Token[] {
  const out = new Out();
  const stack: Mode[] = ['js'];
  let pos = 0;
  const len = src.length;
  const enterTag = (closing: boolean) => {
    out.push('punct', closing ? '</' : '<');
    pos += closing ? 2 : 1;
    const name = at(RE.tagName, src, pos);
    if (name) {
      out.push('tag', name);
      pos += name.length;
    }
    stack.push(closing ? 'tag-close' : 'tag-open');
  };

  while (pos < len) {
    const mode = stack[stack.length - 1] as Mode;
    const ch = src[pos] as string;

    if (mode === 'children') {
      if (ch === '{') {
        out.push('punct', '{');
        stack.push('js');
        pos += 1;
      } else if (ch === '<') {
        if (src.startsWith('</>', pos)) {
          out.push('punct', '</>');
          pos += 3;
          stack.pop();
        } else if (src.startsWith('<>', pos)) {
          out.push('punct', '<>');
          pos += 2;
          stack.push('children');
        } else enterTag(src[pos + 1] === '/');
      } else {
        const text = at(RE.jsxText, src, pos) ?? ch;
        out.push('plain', text);
        pos += text.length;
      }
      continue;
    }

    if (mode === 'tag-open' || mode === 'tag-close') {
      const space = at(RE.space, src, pos);
      if (space) {
        out.push('plain', space);
        pos += space.length;
      } else if (src.startsWith('/>', pos)) {
        out.push('punct', '/>');
        pos += 2;
        stack.pop();
      } else if (ch === '>') {
        out.push('punct', '>');
        pos += 1;
        stack.pop();
        if (mode === 'tag-open') stack.push('children');
        else if (stack[stack.length - 1] === 'children') stack.pop();
      } else if (ch === '{') {
        out.push('punct', '{');
        stack.push('js');
        pos += 1;
      } else if (ch === '"' || ch === "'") {
        const s = at(ch === '"' ? RE.double : RE.single, src, pos) ?? ch;
        out.push('string', s);
        pos += s.length;
      } else {
        const name = at(RE.tagName, src, pos);
        if (name) {
          out.push('attr', name);
          pos += name.length;
        } else {
          out.push('punct', ch);
          pos += 1;
        }
      }
      continue;
    }

    // JavaScript / TypeScript.
    const space = at(RE.space, src, pos);
    if (space) {
      out.push('plain', space);
      pos += space.length;
      continue;
    }
    const comment = at(RE.lineComment, src, pos) ?? at(RE.blockComment, src, pos);
    if (comment) {
      out.push('comment', comment);
      pos += comment.length;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const s = at(ch === '`' ? RE.template : ch === '"' ? RE.double : RE.single, src, pos) ?? ch;
      out.push('string', s);
      pos += s.length;
      continue;
    }
    if (ch === '<' && jsx && jsxCanStart(lastSignificant(out))) {
      if (src.startsWith('<>', pos)) {
        out.push('punct', '<>');
        pos += 2;
        stack.push('children');
        continue;
      }
      const next = src[pos + 1] ?? '';
      if (/[A-Za-z]/.test(next)) {
        enterTag(false);
        continue;
      }
    }
    const num = /\d/.test(ch) ? at(RE.number, src, pos) : null;
    if (num) {
      out.push('number', num);
      pos += num.length;
      continue;
    }
    const ident = at(RE.ident, src, pos);
    if (ident) {
      pos += ident.length;
      if (KEYWORDS.has(ident)) out.push('keyword', ident);
      else if (src[pos] === '(') out.push('fn', ident);
      else if (/^[A-Z]/.test(ident)) out.push('type', ident);
      else out.push('plain', ident);
      continue;
    }
    if (ch === '{') {
      out.push('punct', '{');
      stack.push('js');
      pos += 1;
      continue;
    }
    if (ch === '}') {
      out.push('punct', '}');
      if (stack.length > 1) stack.pop();
      pos += 1;
      continue;
    }
    const p = at(RE.punct, src, pos) ?? ch;
    out.push('punct', p);
    pos += p.length;
  }
  return out.tokens;
}

function tokenizeBash(src: string): Token[] {
  const out = new Out();
  for (const line of src.split(/(\n)/)) {
    if (line === '\n') {
      out.push('plain', line);
      continue;
    }
    const re = /(#.*$)|('[^']*'?|"(?:[^"\\]|\\.)*"?)|(\s+)|(--?[\w-]+)|([^\s'"#]+)/g;
    let first = true;
    for (let m = re.exec(line); m; m = re.exec(line)) {
      if (m[1]) out.push('comment', m[1]);
      else if (m[2]) out.push('string', m[2]);
      else if (m[3]) out.push('plain', m[3]);
      else if (m[4]) out.push('attr', m[4]);
      else if (m[5]) {
        out.push(first ? 'fn' : 'plain', m[5]);
        first = false;
      }
    }
  }
  return out.tokens;
}

function tokenizeCss(src: string): Token[] {
  const out = new Out();
  const re =
    /(\/\*[\s\S]*?(?:\*\/|$))|('[^']*'?|"[^"]*"?)|(\s+)|([{}();,])|(#[\da-fA-F]{3,8}\b|-?\d*\.?\d+(?:px|rem|em|%|ms|s|deg)?)|(--?[\w-]+|[\w-]+)(?=\s*:(?!:))|([\w-]+(?=\())|([^\s{}();,'"]+)/g;
  let depth = 0;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m[1]) out.push('comment', m[1]);
    else if (m[2]) out.push('string', m[2]);
    else if (m[3]) out.push('plain', m[3]);
    else if (m[4]) {
      if (m[4] === '{') depth += 1;
      if (m[4] === '}') depth = Math.max(0, depth - 1);
      out.push('punct', m[4]);
    } else if (m[5]) out.push(depth > 0 ? 'number' : 'tag', m[5]);
    else if (m[6]) out.push(depth > 0 ? 'attr' : 'tag', m[6]);
    else if (m[7]) out.push('fn', m[7]);
    else if (m[8]) out.push(depth > 0 ? 'plain' : 'tag', m[8]);
  }
  return out.tokens;
}

function tokenizeJson(src: string): Token[] {
  const out = new Out();
  const re =
    /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false|null)|(\s+)|([^\s"\d]+)/g;
  for (let m = re.exec(src); m; m = re.exec(src)) {
    if (m[1]) {
      out.push(m[2] ? 'attr' : 'string', m[1]);
      if (m[2]) out.push('punct', m[2]);
    } else if (m[3]) out.push('number', m[3]);
    else if (m[4]) out.push('keyword', m[4]);
    else if (m[5]) out.push('plain', m[5]);
    else if (m[6]) out.push('punct', m[6]);
  }
  return out.tokens;
}

export function tokenize(src: string, language: Language): Token[] {
  switch (language) {
    case 'tsx':
      return tokenizeTsx(src, true);
    case 'ts':
      return tokenizeTsx(src, false);
    case 'bash':
      return tokenizeBash(src);
    case 'css':
      return tokenizeCss(src);
    case 'json':
      return tokenizeJson(src);
    default:
      return [{ type: 'plain', text: src }];
  }
}
