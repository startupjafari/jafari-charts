import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, GitBranch, Menu, X } from 'lucide-react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { Link, useLocation } from '../lib/router';
import { REPO_URL } from '../lib/repo';
import { pageOrder } from '../nav';
import { LanguageSwitch, ThemeSwitch } from './controls';
import { Brand, Sidebar, VERSION } from './Sidebar';

/** Previous / next page, in sidebar order. */
export function PrevNext({ path }: { path: string }) {
  const t = useT();
  const order = pageOrder(t);
  const i = order.findIndex((p) => p.to === path);
  if (i < 0) return null;
  const prev = order[i - 1];
  const next = order[i + 1];
  const card =
    'group/pn flex min-w-0 flex-col gap-0.5 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 outline-none hover:bg-muted/40 hover:ring-ring/50 focus-visible:ring-2 focus-visible:ring-ring/60';
  return (
    <nav
      className="mt-14 grid grid-cols-1 gap-3 border-t border-border pt-8 sm:grid-cols-2"
      aria-label={t.a11y.prevNext}
    >
      {prev ? (
        <Link to={prev.to} className={card}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeft className="size-3.5 group-hover/pn:-translate-x-0.5" aria-hidden />
            {t.pager.previous}
          </span>
          <span className="truncate font-semibold text-foreground">{prev.label}</span>
        </Link>
      ) : (
        <span className="max-sm:hidden" />
      )}
      {next ? (
        <Link to={next.to} className={cn(card, 'sm:items-end sm:text-right')}>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {t.pager.next}
            <ArrowRight className="size-3.5 group-hover/pn:translate-x-0.5" aria-hidden />
          </span>
          <span className="max-w-full truncate font-semibold text-foreground">{next.label}</span>
        </Link>
      ) : null}
    </nav>
  );
}

export function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-1 px-4 py-8 text-[0.8125rem] text-muted-foreground sm:px-8">
        <p className="m-0">
          <span className="font-semibold text-foreground">Jafari Charts {VERSION}</span> ·{' '}
          {t.meta.tagline}
        </p>
        <p className="m-0">{t.footer.rendered}</p>
      </div>
    </footer>
  );
}

/** Mobile navigation: the sidebar in a left drawer (Radix Dialog: focus trap, Esc, scroll lock). */
export function MobileNav({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 lg:hidden"
          aria-label={open ? t.a11y.closeNavigation : t.a11y.openNavigation}
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-[100] bg-overlay/40 backdrop-blur-[2px] lg:hidden" />
        <Dialog.Content
          className="drawer-panel fixed inset-y-0 left-0 z-[100] flex w-[min(20rem,88vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-xl outline-none lg:hidden"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{t.a11y.docsNav}</Dialog.Title>
          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-2.5 right-2.5 z-10 flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20"
              aria-label={t.a11y.closeNavigation}
            >
              <X className="size-5" aria-hidden />
            </button>
          </Dialog.Close>
          <div className="min-h-0 flex-1">
            <Sidebar onNavigate={() => onOpenChange(false)} />
          </div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3">
            <LanguageSwitch labels />
            <ThemeSwitch labels />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Sticky top bar of the content column: primary sections on the left, repository,
 * language and colour theme on the right. On phones it carries the menu button and
 * the brand instead of the section links.
 */
export function TopBar({
  menuOpen,
  onMenuOpenChange,
}: {
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const { path } = useLocation();
  const links = [
    { to: '/getting-started', label: t.top.docs },
    { to: '/charts', label: t.top.charts },
    { to: '/playground', label: t.top.playground },
    { to: '/examples', label: t.top.examples },
    { to: '/performance', label: t.top.performance },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6 xl:px-8">
        <MobileNav open={menuOpen} onOpenChange={onMenuOpenChange} />
        <div className="min-w-0 lg:hidden">
          <Brand compact />
        </div>
        <nav aria-label={t.a11y.primaryNav} className="hidden items-center lg:flex xl:gap-1">
          {links.map((l) => {
            const active = path === l.to || path.startsWith(`${l.to}/`);
            return (
              <Link
                key={l.to}
                to={l.to}
                data-active={active ? '' : undefined}
                className="inline-flex h-8 items-center rounded-lg px-1.5 text-[0.8125rem] font-medium whitespace-nowrap text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 data-[active]:bg-primary/10 data-[active]:text-primary-ink xl:px-3 xl:text-sm"
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {REPO_URL ? (
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              // Hidden between lg and xl, where the section links need the room (the
              // sidebar still links to the GitHub page).
              className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex lg:max-xl:hidden"
            >
              <GitBranch className="size-4" aria-hidden />
              GitHub
            </a>
          ) : null}
          <LanguageSwitch />
          <div className="hidden sm:block">
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  );
}
