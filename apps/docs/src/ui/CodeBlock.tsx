import { FileCode2, Terminal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
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
  /** Without its own frame: for panels that already draw one (example code tab). */
  bare?: boolean;
  /** Wrap long lines instead of scrolling (short snippets in narrow columns). */
  wrap?: boolean;
}

/** A code panel with an optional file tab bar and a copy button. */
export function CodeBlock({
  code,
  language = 'tsx',
  files,
  title,
  className,
  bare = false,
  wrap = false,
}: CodeBlockProps) {
  const t = useT().code;
  const list: readonly CodeFile[] = files ?? [{ name: title ?? '', code: code ?? '', language }];
  const [active, setActive] = useState(0);
  const file = list[Math.min(active, list.length - 1)] as CodeFile;
  const text = file.code.replace(/\s+$/, '');
  const showHeader = list.length > 1 || Boolean(list[0]?.name);
  const lang = file.language ?? language;
  const HeaderIcon = lang === 'bash' ? Terminal : FileCode2;
  return (
    <div
      className={cn(
        'codeblock relative min-w-0 overflow-hidden bg-code',
        bare ? 'rounded-none' : 'my-4 rounded-xl ring-1 ring-foreground/10',
        className,
      )}
    >
      {showHeader ? (
        <div className="flex min-h-10 items-center justify-between gap-2 border-b border-border bg-muted/40 py-1 pr-1.5 pl-3">
          {list.length > 1 ? (
            <div
              className="-ml-1.5 flex min-w-0 gap-0.5 overflow-x-auto [scrollbar-width:none]"
              role="tablist"
              aria-label={t.files}
            >
              {list.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className="inline-flex h-7 shrink-0 items-center rounded-lg px-2.5 font-mono text-xs font-medium whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-sm dark:aria-selected:bg-muted"
                  onClick={() => setActive(i)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          ) : (
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
              <HeaderIcon className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate font-mono">{list[0]?.name}</span>
            </span>
          )}
          <CopyButton text={text} />
        </div>
      ) : null}
      <div className="relative">
        {showHeader ? null : <CopyButton text={text} floating />}
        <pre
          tabIndex={0}
          aria-label={file.name ? t.codeOf(file.name) : t.code}
          className={cn(
            'm-0 max-h-[560px] overflow-auto px-4 py-3.5 text-[0.8125rem] leading-[1.65] [tab-size:2] focus-visible:outline-offset-[-2px]',
            !showHeader && 'pr-24',
            wrap && 'break-words whitespace-pre-wrap',
          )}
        >
          <Code code={text} language={lang} />
        </pre>
      </div>
    </div>
  );
}
