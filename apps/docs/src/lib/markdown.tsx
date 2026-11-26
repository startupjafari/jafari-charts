import type { ReactNode } from 'react';

/**
 * A tiny Markdown renderer for trusted repository files (CHANGELOG.md).
 * Supports ATX headings, paragraphs, bullet/numbered lists (with wrapped
 * continuation lines), fenced code, inline code, **bold**, *italic*, links
 * ([text](url), <url>, and reference links [text] with `[text]: url`
 * definitions). Output is React elements — never raw HTML — and only http(s)
 * and mailto URLs become links (relative repository paths render as text).
 */

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; text: string };

function safeUrl(url: string): string | null {
  // Only absolute web and mail links: relative repository paths do not exist on this site.
  const u = url.trim();
  return /^(https?:\/\/|mailto:)/i.test(u) ? u : null;
}

export function parseBlocks(src: string): { blocks: Block[]; refs: Map<string, string> } {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  const refs = new Map<string, string>();
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (para.length) blocks.push({ type: 'paragraph', text: para.join(' ') });
    para = [];
    if (list) blocks.push({ type: 'list', ...list });
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] as string;
    const ref = /^\s{0,3}\[([^\]]+)\]:\s*(\S+)\s*$/.exec(line);
    if (ref) {
      refs.set((ref[1] as string).toLowerCase(), ref[2] as string);
      continue;
    }
    if (/^\s*```/.test(line)) {
      flush();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i] as string))
        body.push(lines[i++] as string);
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      flush();
      blocks.push({
        type: 'heading',
        level: (heading[1] as string).length,
        text: heading[2] as string,
      });
      continue;
    }
    const item = /^\s{0,3}([-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (item) {
      if (para.length) {
        blocks.push({ type: 'paragraph', text: para.join(' ') });
        para = [];
      }
      const ordered = /\d/.test(item[1] as string);
      if (!list || list.ordered !== ordered) {
        if (list) blocks.push({ type: 'list', ...list });
        list = { ordered, items: [] };
      }
      list.items.push(item[2] as string);
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    if (list && /^\s+\S/.test(line)) {
      // Continuation of the current list item.
      const last = list.items.length - 1;
      list.items[last] = `${list.items[last] ?? ''} ${line.trim()}`;
      continue;
    }
    if (list) {
      blocks.push({ type: 'list', ...list });
      list = null;
    }
    para.push(line.trim());
  }
  flush();
  return { blocks, refs };
}

const INLINE =
  /(`+)([\s\S]*?)\1|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|(?<![\w])_([^_\s][^_]*)_(?![\w])|\[([^\]]+)\]\(([^)\s]+)\)|<(https?:\/\/[^>\s]+)>|\[([^\]]+)\]/g;

export function renderInline(text: string, refs: Map<string, string>, keyBase = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  // A fresh regex per call: nested calls (bold, links) must not share `lastIndex`.
  const re = new RegExp(INLINE.source, 'g');
  let last = 0;
  let n = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${n++}`;
    if (m[1]) out.push(<code key={key}>{(m[2] ?? '').trim()}</code>);
    else if (m[3]) out.push(<strong key={key}>{renderInline(m[3], refs, key)}</strong>);
    else if (m[4] || m[5])
      out.push(<em key={key}>{renderInline(m[4] ?? m[5] ?? '', refs, key)}</em>);
    else if (m[6] && m[7]) {
      const url = safeUrl(m[7]);
      const label = renderInline(m[6], refs, key);
      out.push(
        url ? (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ) : (
          <span key={key}>{label}</span>
        ),
      );
    } else if (m[8]) {
      const url = safeUrl(m[8]);
      out.push(
        url ? (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer">
            {m[8]}
          </a>
        ) : (
          m[8]
        ),
      );
    } else if (m[9]) {
      // Reference link; without a definition it is plain text (brackets dropped).
      const target = refs.get(m[9].toLowerCase());
      const url = target ? safeUrl(target) : null;
      out.push(
        url ? (
          <a key={key} href={url} target="_blank" rel="noopener noreferrer">
            {m[9]}
          </a>
        ) : (
          <span key={key}>{m[9]}</span>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');
}

export function Markdown({ source, skipTitle = false }: { source: string; skipTitle?: boolean }) {
  const { blocks, refs } = parseBlocks(source);
  const list =
    skipTitle && blocks[0]?.type === 'heading' && blocks[0].level === 1 ? blocks.slice(1) : blocks;
  return (
    <div className="markdown">
      {list.map((b, i) => {
        const key = `b${i}`;
        switch (b.type) {
          case 'heading': {
            const content = renderInline(b.text, refs, key);
            const id = `md-${slug(b.text)}`;
            if (b.level <= 2)
              return (
                <h2 key={key} id={id}>
                  {content}
                </h2>
              );
            if (b.level === 3)
              return (
                <h3 key={key} id={id}>
                  {content}
                </h3>
              );
            return (
              <h4 key={key} id={id}>
                {content}
              </h4>
            );
          }
          case 'paragraph':
            return <p key={key}>{renderInline(b.text, refs, key)}</p>;
          case 'list': {
            const items = b.items.map((it, j) => (
              <li key={j}>{renderInline(it, refs, `${key}-${j}`)}</li>
            ));
            return b.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
          }
          case 'code':
            return (
              <pre key={key} className="markdown-code">
                <code>{b.text}</code>
              </pre>
            );
        }
        return null;
      })}
    </div>
  );
}
