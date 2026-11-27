import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, GitBranch, Menu, X } from 'lucide-react';
import { useT } from '../i18n';
import { Link, useLocation } from '../lib/router';
import { REPO_URL } from '../lib/repo';
import { pageOrder } from '../nav';
import { Button } from '../ui/button';
import { LanguageSelect, ThemeSelect } from './controls';
import { Brand, Sidebar, VERSION } from './Sidebar';

/** Previous / next page, in sidebar order. */
export function PrevNext({ path }: { path: string }) {
  const t = useT();
  const order = pageOrder(t);
  const i = order.findIndex((p) => p.to === path);
  if (i < 0) return null;
  const prev = order[i - 1];
  const next = order[i + 1];
  return (
    <nav
      className="mt-14 grid grid-cols-1 gap-3 border-t border-border pt-8 sm:grid-cols-2"
      aria-label={t.a11y.prevNext}
    >
      {prev ? (
        <Button asChild variant="outline" size="xl" className="min-w-0 justify-start">
          <Link to={prev.to}>
            <ArrowLeft aria-hidden />
            <span className="min-w-0 truncate">
              <span className="font-normal text-muted-foreground">{t.pager.previous}: </span>
              {prev.label}
            </span>
          </Link>
        </Button>
      ) : (
        <span className="max-sm:hidden" />
      )}
      {next ? (
        <Button asChild variant="outline" size="xl" className="min-w-0 justify-end">
          <Link to={next.to}>
            <span className="min-w-0 truncate">
              <span className="font-normal text-muted-foreground">{t.pager.next}: </span>
              {next.label}
            </span>
            <ArrowRight aria-hidden />
          </Link>
        </Button>
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
        <Button
          type="button"
          variant="ghost"
          size="md"
          icon
          className="-ml-1.5 lg:hidden"
          aria-label={open ? t.a11y.closeNavigation : t.a11y.openNavigation}
        >
          <Menu aria-hidden />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="drawer-overlay fixed inset-0 z-[100] bg-overlay/40 backdrop-blur-[2px] lg:hidden" />
        <Dialog.Content
          className="drawer-panel fixed inset-y-0 left-0 z-[100] flex w-[min(20rem,88vw)] flex-col border-r border-sidebar-border bg-sidebar shadow-xl outline-none lg:hidden"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{t.a11y.docsNav}</Dialog.Title>
          <Dialog.Close asChild>
            <Button
              type="button"
              variant="ghost"
              size="md"
              icon
              className="absolute top-2.5 right-2.5 z-10"
              aria-label={t.a11y.closeNavigation}
            >
              <X aria-hidden />
            </Button>
          </Dialog.Close>
          <div className="min-h-0 flex-1">
            <Sidebar onNavigate={() => onOpenChange(false)} />
          </div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3">
            <LanguageSelect />
            <ThemeSelect />
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
            <Button
              asChild
              variant="ghost"
              size="md"
              // Hidden between lg and xl, where the section links need the room (the
              // sidebar still links to the GitHub page).
              className="hidden sm:inline-flex lg:max-xl:hidden"
            >
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <GitBranch aria-hidden />
                GitHub
              </a>
            </Button>
          ) : null}
          <LanguageSelect size="md" compact className="w-auto" />
          <ThemeSelect size="md" className="hidden w-auto sm:flex" />
        </div>
      </div>
    </header>
  );
}
