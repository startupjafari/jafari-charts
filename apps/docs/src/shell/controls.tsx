import { Monitor, Moon, Sun } from 'lucide-react';
import { LANGS, messagesFor, useLang, useT } from '../i18n';
import { cn } from '../lib/cn';
import { switchLanguage } from '../lib/router';
import { setThemePreference, useThemePreference, type ThemePreference } from '../lib/theme';

const TRACK = 'inline-flex items-center gap-0.5 rounded-xl border border-border bg-muted/50 p-0.5';
const OPTION =
  'inline-flex h-7 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/25 aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:aria-pressed:bg-input/50';

const THEMES: readonly { value: ThemePreference; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

/** Light / dark / system switch. `labels` shows the words next to the icons. */
export function ThemeSwitch({ labels = false }: { labels?: boolean }) {
  const t = useT();
  const pref = useThemePreference();
  return (
    <div className={cn(TRACK, labels && 'w-full')} role="group" aria-label={t.theme.label}>
      {THEMES.map(({ value, icon: Icon }) => {
        const label = t.theme[value];
        return (
          <button
            key={value}
            type="button"
            aria-pressed={pref === value}
            title={labels ? undefined : label}
            onClick={() => setThemePreference(value)}
            className={cn(OPTION, labels ? 'flex-1 px-2.5' : 'w-8')}
          >
            <Icon className="size-3.5" aria-hidden />
            {labels ? label : <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** EN / RU / ҚАЗ switch: keeps the current page and section, remembers the choice. */
export function LanguageSwitch({ labels = false }: { labels?: boolean }) {
  const lang = useLang();
  const t = useT();
  return (
    <div className={cn(TRACK, labels && 'w-full')} role="group" aria-label={t.a11y.language}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={l === lang}
          title={labels ? undefined : messagesFor(l).langName}
          onClick={() => {
            if (l !== lang) switchLanguage(l);
          }}
          className={cn(OPTION, labels ? 'flex-1 px-2.5' : 'min-w-8 px-2')}
        >
          {labels ? messagesFor(l).langName : messagesFor(l).langCode}
        </button>
      ))}
    </div>
  );
}
