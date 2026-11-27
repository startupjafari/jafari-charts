import type { ReactNode } from 'react';
import { useLang, useT } from '../i18n';
import type { L } from '../i18n/lang';
import { cn } from '../lib/cn';
import { Code } from './CodeBlock';

/** Renders `backtick` spans in plain-text descriptions as inline code. */
export function inlineCode(text: string): ReactNode {
  const parts = text.split('`');
  if (parts.length < 3) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}

/** Rich text, or a plain string whose `backtick` spans become inline code. */
export function richText(value: ReactNode): ReactNode {
  return typeof value === 'string' ? inlineCode(value) : value;
}

/** One row of a props table. Hand-written per component, kept in sync with the source types. */
export interface PropDef {
  name: string;
  /** TypeScript type as written in the source. */
  type: string;
  /**
   * Default value, shown as code: a plain string for code (`'vertical'`, `true`),
   * an `L<string>` when it is prose (“per chart”). Omitted when there is none.
   */
  default?: string | L<string>;
  required?: boolean;
  /** Backticks in strings become inline code. */
  description: L<ReactNode>;
}

/**
 * Props as a readable table: the name with its type underneath (types are long,
 * a column of their own squeezed the description), the default, then what it does.
 * Below 640px each row becomes a small stacked block.
 */
export function PropsTable({
  props,
  caption,
  bare = false,
}: {
  props: readonly PropDef[];
  caption?: string;
  /** Without its own frame: inside a prop group that already draws one. */
  bare?: boolean;
}) {
  const lang = useLang();
  const t = useT().propsTable;
  return (
    <div
      className={cn(
        'props-table min-w-0 overflow-x-auto',
        bare ? '' : 'my-4 rounded-xl bg-card ring-1 ring-foreground/10',
      )}
    >
      <table className="w-full border-collapse text-sm max-sm:block">
        {caption ? (
          <caption className="border-b border-border px-4 py-2.5 text-left font-semibold">
            {caption}
          </caption>
        ) : null}
        <thead className="max-sm:sr-only">
          <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="px-4 py-2 font-semibold whitespace-nowrap">
              {t.prop}
            </th>
            <th scope="col" className="px-4 py-2 font-semibold whitespace-nowrap">
              {t.default}
            </th>
            <th scope="col" className="px-4 py-2 font-semibold whitespace-nowrap">
              {t.description}
            </th>
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {props.map((p) => (
            <tr
              key={p.name}
              className="border-b border-border align-top last:border-b-0 hover:bg-muted/30 max-sm:block max-sm:px-4 max-sm:py-3"
            >
              <th
                scope="row"
                className="px-4 py-3 text-left font-normal max-sm:block max-sm:p-0 sm:w-[40%] sm:min-w-[13rem] [&_code]:bg-transparent [&_code]:p-0"
              >
                <span className="flex flex-wrap items-center gap-1.5">
                  <code className="font-mono text-[0.8125rem] font-semibold text-primary-ink">
                    {p.name}
                  </code>
                  {p.required ? (
                    <span
                      className="rounded-full bg-primary/10 px-1.5 text-[0.6875rem] leading-[1.125rem] font-semibold text-primary-ink"
                      title={t.requiredTitle}
                    >
                      {t.required}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block font-mono text-xs leading-5 [overflow-wrap:break-word] text-muted-foreground">
                  <span className="sr-only">{t.type}: </span>
                  <Code code={p.type} language="ts" />
                </span>
              </th>
              <td className="px-4 py-3 max-sm:block max-sm:p-0 max-sm:pt-1.5 [&_code_code]:bg-transparent [&_code_code]:p-0">
                <span className="text-xs text-muted-foreground sm:hidden">{t.default}: </span>
                {typeof p.default === 'string' ? (
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs whitespace-nowrap">
                    <Code code={p.default} language="ts" />
                  </code>
                ) : p.default !== undefined ? (
                  <span className="text-[0.8125rem] text-muted-foreground">{p.default[lang]}</span>
                ) : (
                  <span className="text-muted-foreground" aria-label={t.none}>
                    —
                  </span>
                )}
              </td>
              <td className="px-4 py-3 leading-6 text-foreground/80 max-sm:block max-sm:p-0 max-sm:pt-1.5 sm:min-w-[16rem] [&_code]:text-[0.8em]">
                {richText(p.description[lang])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
