import { ArrowUp, TableOfContents } from 'lucide-react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { Link, useLocation } from '../lib/router';
import { Button } from '../ui/button';

interface Heading {
  id: string;
  title: string;
}

/** Offset below the sticky top bar at which a section counts as “current”. */
const ACTIVE_OFFSET = 112;

function readHeadings(root: HTMLElement | null): Heading[] {
  if (!root) return [];
  return Array.from(root.querySelectorAll<HTMLHeadingElement>('h2[id]')).map((h) => ({
    id: h.id,
    title: (h.querySelector('span')?.textContent ?? h.textContent ?? '').trim(),
  }));
}

/**
 * “On this page”: the page's sections (its `h2[id]` headings), with the one being
 * read highlighted. Shown as a sticky rail next to the content on wide screens.
 */
export function OnThisPage({
  contentId,
  onHeadings,
}: {
  contentId: string;
  /** Reports how many sections the page has (the shell hides the rail below two). */
  onHeadings?: (count: number) => void;
}) {
  const t = useT();
  const { path, lang } = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // Read the headings after the page has rendered, and again when its sections change.
  useLayoutEffect(() => {
    const root = document.getElementById(contentId);
    let frame = 0;
    let last = '';
    const read = () => {
      frame = 0;
      const list = readHeadings(root);
      const key = list.map((h) => `${h.id}:${h.title}`).join('|');
      if (key === last) return;
      last = key;
      setHeadings(list);
      onHeadings?.(list.length);
    };
    frame = requestAnimationFrame(read);
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(read);
    });
    if (root) observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [contentId, path, lang, onHeadings]);

  useEffect(() => {
    if (headings.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = headings[0]?.id ?? null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = h.id;
      }
      // At the very bottom the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = headings[headings.length - 1]?.id ?? current;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length < 2) return null;
  return (
    <nav aria-label={t.a11y.onThisPage} className="flex flex-col gap-3">
      <p className="m-0 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        <TableOfContents className="size-3.5" aria-hidden />
        {t.a11y.onThisPage}
      </p>
      <ul className="m-0 flex list-none flex-col border-l border-border p-0">
        {headings.map((h) => (
          <li key={h.id}>
            <Link
              to={path}
              section={h.id}
              aria-current={active === h.id ? 'location' : undefined}
              className={cn(
                '-ml-px block border-l-2 border-transparent py-1 pr-2 pl-3 text-[0.8125rem] leading-snug text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40',
                'aria-[current=location]:border-primary aria-[current=location]:font-medium aria-[current=location]:text-primary-ink',
              )}
            >
              {h.title}
            </Link>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          window.scrollTo({ top: 0 });
          document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
        }}
        className="-ml-3 w-fit text-muted-foreground"
      >
        <ArrowUp aria-hidden />
        {t.a11y.backToTop}
      </Button>
    </nav>
  );
}
