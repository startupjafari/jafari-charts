import { Code2, Eye, Monitor, Moon, Sun } from 'lucide-react';
import { Suspense, use, useState, type ReactNode } from 'react';
import { loadCode, loadExample } from '../examples';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { CodeBlock } from './CodeBlock';
import { ErrorBoundary } from './ErrorBoundary';
import { SegmentedTabs } from './segmented-tabs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

export type PreviewTheme = 'auto' | 'light' | 'dark';
export type PreviewWidth = 'fill' | 480 | 320;

export interface ExampleProps {
  /** Example id, `<group>/<FileName>` (see `src/examples/index.ts`). */
  id: string;
  title: string;
  description?: ReactNode;
  /** Initial preview width. */
  width?: PreviewWidth;
  /** Show the code under the preview (no tabs): for guides where the code is the point. */
  codeOpen?: boolean;
  /** Anchor id for deep links. */
  anchor?: string;
  /** Hide the width switcher (examples that manage their own layout). */
  fixedWidth?: boolean;
  /** Without the title row (when the surrounding section already names it). */
  hideTitle?: boolean;
  className?: string;
}

/** The example's source files (loaded on demand). */
function ExampleCode({ id }: { id: string }) {
  const files = use(loadCode(id));
  return <CodeBlock files={files} bare />;
}

/**
 * A live example: the component rendered in a themable, resizable preview, with
 * its exact source code one tab away.
 */
export function Example({
  id,
  title,
  description,
  width = 'fill',
  codeOpen = false,
  anchor,
  fixedWidth = false,
  hideTitle = false,
  className,
}: ExampleProps) {
  const { Component } = loadExample(id);
  const t = useT();
  const themes = [
    { value: 'auto', label: t.example.themeAuto, icon: Monitor },
    { value: 'light', label: t.example.themeLight, icon: Sun },
    { value: 'dark', label: t.example.themeDark, icon: Moon },
  ] as const;
  const widths = [
    { value: 'fill', label: t.example.widthFill },
    { value: '480', label: '480' },
    { value: '320', label: '320' },
  ] as const;
  const [theme, setTheme] = useState<PreviewTheme>('auto');
  const [w, setW] = useState<PreviewWidth>(width);
  const [tab, setTab] = useState('preview');
  const titleId = anchor ? `${anchor}-title` : undefined;
  // StudentHub's SegmentedTabs, compact (a toolbar row). The theme row shows icons only —
  // the names stay as the buttons' accessible names — so it never collapses into a list.
  const controls = (
    <div className="ml-auto flex flex-wrap items-center gap-2">
      <SegmentedTabs
        aria-label={t.example.previewTheme(title)}
        compact
        collapsible={false}
        items={themes.map(({ value, label, icon }) => ({
          value,
          icon,
          label: <span className="sr-only">{label}</span>,
        }))}
        value={theme}
        onChange={setTheme}
      />
      {fixedWidth ? null : (
        <SegmentedTabs
          aria-label={t.example.previewWidth(title)}
          compact
          collapsible={false}
          items={widths}
          value={String(w) as (typeof widths)[number]['value']}
          onChange={(next) => setW(next === 'fill' ? 'fill' : (Number(next) as 480 | 320))}
        />
      )}
    </div>
  );
  const preview = (
    <div
      className={cn(
        'example-preview bg-preview px-3 pt-4 pb-3.5 text-foreground sm:px-5 sm:pt-6 sm:pb-5',
        theme !== 'auto' && theme,
      )}
      data-preview-theme={theme}
    >
      <div
        className={cn(
          'example-stage mx-auto min-w-0 [container-type:inline-size]',
          w !== 'fill' && 'rounded-sm outline-1 outline-offset-8 outline-border outline-dashed',
        )}
        style={w === 'fill' ? undefined : { maxWidth: w }}
        data-width={w}
      >
        <ErrorBoundary label={t.errors.example(title)}>
          <Component />
        </ErrorBoundary>
      </div>
    </div>
  );
  const code = (
    <ErrorBoundary label={t.errors.code}>
      <Suspense
        fallback={
          <p className="m-0 px-4 py-3.5 text-[0.8125rem] text-muted-foreground">
            {t.example.loadingCode}
          </p>
        }
      >
        <ExampleCode id={id} />
      </Suspense>
    </ErrorBoundary>
  );
  return (
    <section
      className={cn('example my-8', className)}
      id={anchor}
      aria-labelledby={hideTitle ? undefined : titleId}
      aria-label={hideTitle ? title : undefined}
    >
      {hideTitle ? null : (
        <div className="mb-3">
          <h3 id={titleId} className="m-0 text-base font-semibold">
            {title}
          </h3>
          {description ? (
            <div className="mt-1 text-[0.9375rem] text-muted-foreground [&>:last-child]:mb-0">
              {description}
            </div>
          ) : null}
        </div>
      )}
      {codeOpen ? (
        // Guides: the code is the point, so preview and code are shown together.
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-3 py-1.5">
            <span className="inline-flex h-7 items-center gap-1.5 text-[0.8125rem] font-medium text-muted-foreground">
              <Eye className="size-3.5" aria-hidden />
              {t.example.preview}
            </span>
            {controls}
          </div>
          {preview}
          <div className="border-t border-border">{code}</div>
        </div>
      ) : (
        <Tabs
          value={tab}
          onValueChange={setTab}
          className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
        >
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-2 py-1.5">
            <TabsList aria-label={t.example.views(title)}>
              <TabsTrigger value="preview">
                <Eye className="size-4" aria-hidden />
                {t.example.preview}
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code2 className="size-4" aria-hidden />
                {t.example.code}
              </TabsTrigger>
            </TabsList>
            {tab === 'preview' ? controls : null}
          </div>
          {/* The preview stays mounted while the code is shown: switching back is instant. */}
          <TabsContent
            value="preview"
            forceMount
            tabIndex={-1}
            className="mt-0 data-[state=inactive]:hidden"
          >
            {preview}
          </TabsContent>
          <TabsContent value="code" tabIndex={-1} className="mt-0">
            {code}
          </TabsContent>
        </Tabs>
      )}
    </section>
  );
}
