import { ChartNoAxesCombined, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { GROUPS, SCENES } from '../catalog';
import type { ThemePreference } from '../lib/theme';
import { cn } from '../lib/utils';
import { Field } from '../ui/field';
import { Segmented } from '../ui/segmented';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { LOCALES, sceneHref, usePlayground, type Locale } from './playground';

const THEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const satisfies ReadonlyArray<{ value: ThemePreference; label: string; icon: typeof Sun }>;

function Logo() {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ChartNoAxesCombined className="size-[1.125rem]" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[0.9375rem] font-bold tracking-tight">Jafari Charts</span>
        <span className="mt-0.5 text-[0.6875rem] font-semibold tracking-wide text-primary uppercase">
          Playground
        </span>
      </span>
    </span>
  );
}

/** Plain links (open in a new tab works); a normal click navigates without a reload. */
function SceneNav({ onNavigate }: { onNavigate?: () => void }) {
  const { scene, navigate } = usePlayground();
  const follow = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(id);
    onNavigate?.();
  };
  return (
    <nav aria-label="Scenes" className="flex flex-col gap-1 px-3 py-2">
      {GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-0.5">
          {group.id !== 'start' && (
            <p className="px-3 pt-3 pb-1 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground/80 uppercase">
              {group.label}
            </p>
          )}
          {SCENES.filter((s) => s.group === group.id).map((s) => {
            const active = s.id === scene;
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={sceneHref(s.id)}
                onClick={follow(s.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium outline-none focus-visible:ring-4 focus-visible:ring-ring/25',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{s.title}</span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

/** Settings that apply to every scene: colour theme, chart locale, entry animations. */
function PreviewSettings() {
  const { theme, setTheme, locale, setLocale, animation, setAnimation } = usePlayground();
  return (
    <div className="flex flex-col gap-3 border-t border-sidebar-border px-4 pt-3 pb-4">
      <p className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground/80 uppercase">
        Preview
      </p>
      <Field label="Theme">
        {(id) => (
          <Segmented items={THEMES} value={theme} onChange={setTheme} labelledBy={id} stretch />
        )}
      </Field>
      <Field label="Number & date locale">
        {(id) => (
          <Select
            value={(LOCALES.some((l) => l.value === locale) ? locale : 'en') as Locale}
            onChange={setLocale}
            options={LOCALES}
            labelledBy={id}
          />
        )}
      </Field>
      <Field label="Entry animations" inline className="justify-between">
        {(id) => <Switch checked={animation} onChange={setAnimation} labelledBy={id} />}
      </Field>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SceneNav onNavigate={onNavigate} />
      </div>
      <PreviewSettings />
    </>
  );
}

/** Phones and tablets: a slim top bar whose menu button opens the sidebar as a drawer. */
function MobileBar() {
  const [open, setOpen] = useState(false);
  // After choosing a scene, focus goes to its title rather than back to the menu button.
  const navigated = useRef(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-sidebar-border bg-sidebar/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-sidebar/75 lg:hidden">
        <Dialog.Trigger
          aria-label="Open navigation"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/25"
        >
          <Menu className="size-5" aria-hidden />
        </Dialog.Trigger>
        <Logo />
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[190] bg-overlay/30 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-(--motion-panel) lg:hidden" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            if (!navigated.current) return;
            navigated.current = false;
            e.preventDefault();
            document.getElementById('scene-title')?.focus({ preventScroll: true });
          }}
          className="fixed inset-y-0 left-0 z-[200] flex w-[min(18rem,86vw)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:duration-(--motion-panel) lg:hidden"
        >
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Choose a scene and adjust the preview settings.
          </Dialog.Description>
          <SidebarBody
            onNavigate={() => {
              navigated.current = true;
              setOpen(false);
            }}
          />
          <Dialog.Close
            aria-label="Close navigation"
            className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-xl text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/25"
          >
            <X className="size-5" aria-hidden />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-muted/30 lg:flex">
      <a
        href="#scene-title"
        className="sr-only z-[300] rounded-xl bg-primary text-sm font-medium text-primary-foreground outline-none focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus-visible:ring-4 focus-visible:ring-ring/30"
      >
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarBody />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBar />
        <main id="main" className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
