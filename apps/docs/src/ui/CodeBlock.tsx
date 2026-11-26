import { useMemo, useState } from 'react';
import { tokenize, type Language } from '../lib/highlight';
import { CopyButton } from './CopyButton';

export interface CodeFile {
  name: string;
  code: string;
  language?: Language;
}

/** Highlighted, copyable code. Renders tokens as React text — never as HTML. */
export function Code({ code, language = 'tsx' }: { code: string; language?: Language }) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);
  return (
    <code>
      {tokens.map((t, i) =>
        t.type === 'plain' ? (
          t.text
        ) : (
          <span key={i} className={`tok-${t.type}`}>
            {t.text}
          </span>
        ),
      )}
    </code>
  );
}

export interface CodeBlockProps {
  code?: string;
  language?: Language;
  /** Several files shown as tabs (first one active). */
  files?: readonly CodeFile[];
  /** Label shown in the header when there are no tabs. */
  title?: string;
  className?: string;
}

/** A code panel with an optional file tab bar and a copy button. */
export function CodeBlock({ code, language = 'tsx', files, title, className }: CodeBlockProps) {
  const list: readonly CodeFile[] = files ?? [{ name: title ?? '', code: code ?? '', language }];
  const [active, setActive] = useState(0);
  const file = list[Math.min(active, list.length - 1)] as CodeFile;
  const text = file.code.replace(/\s+$/, '');
  const showHeader = list.length > 1 || Boolean(list[0]?.name);
  return (
    <div className={`codeblock${className ? ` ${className}` : ''}`}>
      {showHeader ? (
        <div className="codeblock-head">
          {list.length > 1 ? (
            <div className="codeblock-tabs" role="tablist" aria-label="Files">
              {list.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className="codeblock-tab"
                  onClick={() => setActive(i)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          ) : (
            <span className="codeblock-title">{list[0]?.name}</span>
          )}
          <CopyButton text={text} />
        </div>
      ) : null}
      <div className="codeblock-body">
        {showHeader ? null : <CopyButton text={text} floating />}
        <pre tabIndex={0} aria-label={file.name ? `Code: ${file.name}` : 'Code'}>
          <Code code={text} language={file.language ?? language} />
        </pre>
      </div>
    </div>
  );
}
