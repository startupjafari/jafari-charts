import type { ReactNode } from 'react';
import { useLang, useT } from '../i18n';
import type { L } from '../i18n/lang';
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

export function PropsTable({ props, caption }: { props: readonly PropDef[]; caption?: string }) {
  const lang = useLang();
  const t = useT().propsTable;
  return (
    <div className="table-wrap props-table">
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col">{t.prop}</th>
            <th scope="col">{t.type}</th>
            <th scope="col">{t.default}</th>
            <th scope="col">{t.description}</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <th scope="row">
                <code className="prop-name">{p.name}</code>
                {p.required ? (
                  <span className="badge badge-required" title={t.requiredTitle}>
                    {t.required}
                  </span>
                ) : null}
              </th>
              <td>
                <span className="prop-type">
                  <Code code={p.type} language="ts" />
                </span>
              </td>
              <td>
                {p.default !== undefined ? (
                  <span
                    className={
                      typeof p.default === 'string'
                        ? 'prop-default'
                        : 'prop-default prop-default-text'
                    }
                  >
                    <Code
                      code={typeof p.default === 'string' ? p.default : p.default[lang]}
                      language="ts"
                    />
                  </span>
                ) : (
                  <span className="muted" aria-label={t.none}>
                    —
                  </span>
                )}
              </td>
              <td className="prop-desc">{richText(p.description[lang])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
