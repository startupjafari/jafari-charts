import { FileCode2, Terminal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { tokenize, type Language } from '../lib/highlight';
import { CopyButton } from './CopyButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

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
  const HeaderIcon = (file.language ?? language) === 'bash' ? Terminal : FileCode2;
  const body = (f: CodeFile) => (
    <pre
      tabIndex={0}
      aria-label={f.name ? t.codeOf(f.name) : t.code}
      className={cn(
        'm-0 max-h-[560px] overflow-auto px-4 py-3.5 text-[0.8125rem] leading-[1.65] [tab-size:2] focus-visible:outline-offset-[-2px]',
        !showHeader && 'pr-24',
        wrap && 'break-words whitespace-pre-wrap',
      )}
    >
      <Code code={f.code.replace(/\s+$/, '')} language={f.language ?? language} />
    </pre>
  );
  const frame = cn(
    'codeblock relative min-w-0 overflow-hidden bg-code',
    bare ? 'rounded-none' : 'my-4 rounded-xl ring-1 ring-foreground/10',
    className,
  );
  const header =
    'flex min-h-10 items-center justify-between gap-2 border-b border-border bg-muted/40 py-1 pr-1.5 pl-3';
  if (list.length > 1) {
    // Several files: StudentHub's Tabs (Radix), one panel per file.
    return (
      <Tabs value={String(active)} onValueChange={(v) => setActive(Number(v))} className={frame}>
        <div className={cn(header, 'py-1.5 pl-1.5')}>
          <TabsList aria-label={t.files} className="w-auto min-w-0">
            {list.map((f, i) => (
              <TabsTrigger key={f.name} value={String(i)} className="font-mono text-xs">
                {f.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <CopyButton text={text} />
        </div>
        {list.map((f, i) => (
          <TabsContent key={f.name} value={String(i)} tabIndex={-1} className="mt-0">
            {body(f)}
          </TabsContent>
        ))}
      </Tabs>
    );
  }
  return (
    <div className={frame}>
      {showHeader ? (
        <div className={header}>
          <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
            <HeaderIcon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate font-mono">{list[0]?.name}</span>
          </span>
          <CopyButton text={text} />
        </div>
      ) : null}
      <div className="relative">
        {showHeader ? null : <CopyButton text={text} floating />}
        {body(file)}
      </div>
    </div>
  );
}
