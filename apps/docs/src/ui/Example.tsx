import { Suspense, use, useState, type ReactNode } from 'react';
import { loadCode, loadExample } from '../examples';
import { useT } from '../i18n';
import { CodeBlock } from './CodeBlock';
import { ErrorBoundary } from './ErrorBoundary';
import { Segmented } from './Segmented';

export type PreviewTheme = 'auto' | 'light' | 'dark';
export type PreviewWidth = 'fill' | 480 | 320;

export interface ExampleProps {
  /** Example id, `<group>/<FileName>` (see `src/examples/index.ts`). */
  id: string;
  title: string;
  description?: ReactNode;
  /** Initial preview width. */
  width?: PreviewWidth;
  /** Show the code panel initially. */
  codeOpen?: boolean;
  /** Anchor id for deep links. */
  anchor?: string;
  /** Hide the width switcher (examples that manage their own layout). */
  fixedWidth?: boolean;
}

/** The example's source files (loaded on demand). */
function ExampleCode({ id }: { id: string }) {
  const files = use(loadCode(id));
  return <CodeBlock files={files} className="example-codeblock" />;
}

/**
 * A live example: the component rendered in a themable, resizable frame, with
 * its exact source code underneath.
 */
export function Example({
  id,
  title,
  description,
  width = 'fill',
  codeOpen = false,
  anchor,
  fixedWidth = false,
}: ExampleProps) {
  const { Component } = loadExample(id);
  const t = useT();
  const themes = [
    { value: 'auto', label: t.example.themeAuto },
    { value: 'light', label: t.example.themeLight },
    { value: 'dark', label: t.example.themeDark },
  ] as const;
  const widths = [
    { value: 'fill', label: t.example.widthFill },
    { value: 480, label: '480' },
    { value: 320, label: '320' },
  ] as const;
  const [theme, setTheme] = useState<PreviewTheme>('auto');
  const [w, setW] = useState<PreviewWidth>(width);
  const [open, setOpen] = useState(codeOpen);
  const codeId = `${anchor ?? id.replace(/\W/g, '-')}-code`;
  return (
    <section
      className="example"
      id={anchor}
      aria-labelledby={anchor ? `${anchor}-title` : undefined}
    >
      <div className="example-head">
        <h3 id={anchor ? `${anchor}-title` : undefined}>{title}</h3>
        {description ? <div className="example-desc">{description}</div> : null}
      </div>
      <div className="example-frame">
        <div className="example-toolbar">
          <Segmented
            label={t.example.previewTheme(title)}
            hideLabel
            size="sm"
            options={themes}
            value={theme}
            onChange={setTheme}
          />
          {fixedWidth ? null : (
            <Segmented
              label={t.example.previewWidth(title)}
              hideLabel
              size="sm"
              options={widths}
              value={w}
              onChange={setW}
            />
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm example-code-toggle"
            aria-expanded={open}
            aria-controls={codeId}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8 6l-6 6 6 6M16 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {open ? t.example.hideCode : t.example.showCode}
          </button>
        </div>
        <div
          className={`example-preview${theme === 'auto' ? '' : ` ${theme}`}`}
          data-preview-theme={theme}
        >
          <div
            className="example-stage"
            style={w === 'fill' ? undefined : { maxWidth: w }}
            data-width={w}
          >
            <ErrorBoundary label={t.errors.example(title)}>
              <Component />
            </ErrorBoundary>
          </div>
        </div>
        <div id={codeId} hidden={!open}>
          {open ? (
            <ErrorBoundary label={t.errors.code}>
              <Suspense fallback={<p className="code-loading">{t.example.loadingCode}</p>}>
                <ExampleCode id={id} />
              </Suspense>
            </ErrorBoundary>
          ) : null}
        </div>
      </div>
    </section>
  );
}
