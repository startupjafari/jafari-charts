import { ChartNoAxesCombined, Menu, Monitor, Moon, Sun, X } from '../ui/icons';
import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { GROUPS, SCENES } from '../catalog';
import { LANG_LABELS, LANGS, useLang, useT, type Lang } from '../i18n';
import type { ThemePreference } from '../lib/theme';
import { cn } from '../lib/utils';
import { Field } from '../ui/field';
import { Segmented } from '../ui/segmented';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { LOCALES, sceneHref, usePlayground, type Locale } from './playground';

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const satisfies Record<
  ThemePreference,
  typeof Sun
>;

/** EN / RU / ҚАЗ, each with its native name as the tooltip and its own `lang`. */
const LANG_ITEMS = LANGS.map((value) => ({
  value,
  label: LANG_LABELS[value].short,
  title: LANG_LABELS[value].native,
  lang: value,
}));

function Logo() {
  const t = useT();
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ChartNoAxesCombined className="size-[1.125rem]" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[0.9375rem] font-bold tracking-tight">{t.app.name}</span>
        <span className="mt-0.5 truncate text-[0.6875rem] font-semibold tracking-wide text-primary-ink uppercase">
          {t.app.product}
        </span>
      </span>
    </span>
  );
}

/** Plain links (open in a new tab works); a normal click navigates without a reload. */
function SceneNav({ onNavigate }: { onNavigate?: () => void }) {
  const { scene, navigate } = usePlayground();
  const t = useT();
  const follow = (id: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(id);
    onNavigate?.();
  };
  return (
    <nav aria-label={t.a11y.scenes} className="flex flex-col gap-1 px-3 py-2">
      {GROUPS.map((group) => (
        <div key={group} className="flex flex-col gap-0.5">
          {group !== 'start' && (
            <p className="px-3 pt-3 pb-1 text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
              {t.groups[group].label}
            </p>
          )}
          {SCENES.filter((s) => s.group === group).map((s) => {
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
                    ? 'bg-primary/10 text-primary-ink'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{t.scenes[s.id].title}</span>
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

type LocaleChoice = Locale | 'auto';

/**
 * Settings that apply to every scene: interface language, colour theme, chart locale
 * (follows the interface language until one is picked) and entry animations.
 */
function PreviewSettings() {
  const { theme, setTheme, localeOverride, setLocaleOverride, animation, setAnimation } =
    usePlayground();
  const { lang, setLang } = useLang();
  const t = useT();
  const themes = (['light', 'dark', 'system'] as const).map((value) => ({
    value,
    label: t.preview[value],
    icon: THEME_ICONS[value],
  }));
  const localeOptions: ReadonlyArray<{ value: LocaleChoice; label: string }> = [
    { value: 'auto', label: t.preview.localeAuto },
    ...LOCALES,
  ];
  const localeChoice: LocaleChoice = LOCALES.some((l) => l.value === localeOverride)
    ? (localeOverride as Locale)
    : 'auto';
  return (
    <div className="flex flex-col gap-3 border-t border-sidebar-border px-4 pt-3 pb-4">
      <p className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {t.preview.heading}
      </p>
      <Field label={t.preview.language}>
        {(id) => (
          <Segmented<Lang>
            items={LANG_ITEMS}
            value={lang}
            onChange={setLang}
            labelledBy={id}
            stretch
          />
        )}
      </Field>
      <Field label={t.preview.theme}>
        {(id) => (
          <Segmented
            items={themes}
            value={theme}
            onChange={setTheme}
            labelledBy={id}
            stretch
            stacked
          />
        )}
      </Field>
      <Field label={t.preview.locale}>
        {(id) => (
          <Select
            value={localeChoice}
            onChange={(v) => setLocaleOverride(v === 'auto' ? null : v)}
            options={localeOptions}
            labelledBy={id}
          />
        )}
      </Field>
      <Field label={t.preview.animation} inline className="justify-between">
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
  const t = useT();
  const [open, setOpen] = useState(false);
  // After choosing a scene, focus goes to its title rather than back to the menu button.
  const navigated = useRef(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-sidebar-border bg-sidebar px-3 lg:hidden">
        <Dialog.Trigger
          aria-label={t.a11y.openNavigation}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/25"
        >
          <Menu className="size-5" aria-hidden />
        </Dialog.Trigger>
        <Logo />
      </header>
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
          <Dialog.Title className="sr-only">{t.a11y.navigation}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {t.a11y.navigationDescription}
          </Dialog.Description>
          <SidebarBody
            onNavigate={() => {
              navigated.current = true;
              setOpen(false);
            }}
          />
          <Dialog.Close
            aria-label={t.a11y.closeNavigation}
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
  const t = useT();
  return (
    <div className="min-h-dvh bg-muted/30 lg:flex">
      <a
        href="#scene-title"
        className="sr-only z-[300] rounded-xl bg-primary text-sm font-medium text-primary-foreground outline-none focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-4 focus:py-2 focus-visible:ring-4 focus-visible:ring-ring/30"
      >
        {t.a11y.skipToContent}
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
