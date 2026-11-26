import type { ReactNode } from 'react';
import { Code } from './CodeBlock';

/** Renders `backtick` spans in plain-text descriptions as inline code. */
export function inlineCode(text: string): ReactNode {
  const parts = text.split('`');
  if (parts.length < 3) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part));
}

/** One row of a props table. Hand-written per component, kept in sync with the source types. */
export interface PropDef {
  name: string;
  /** TypeScript type as written in the source. */
  type: string;
  /** Default value (as code), or omitted when there is none. */
  default?: string;
  required?: boolean;
  description: ReactNode;
}

export function PropsTable({ props, caption }: { props: readonly PropDef[]; caption?: string }) {
  return (
    <div className="table-wrap props-table">
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name}>
              <th scope="row">
                <code className="prop-name">{p.name}</code>
                {p.required ? (
                  <span className="badge badge-required" title="Required">
                    required
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
                  <span className="prop-default">
                    <Code code={p.default} language="ts" />
                  </span>
                ) : (
                  <span className="muted" aria-label="none">
                    —
                  </span>
                )}
              </td>
              <td className="prop-desc">
                {typeof p.description === 'string' ? inlineCode(p.description) : p.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
