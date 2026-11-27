import { Monitor, Moon, Sun } from 'lucide-react';
import { messagesFor, useLang, useT, type Lang } from '../i18n';
import { cn } from '../lib/cn';
import { switchLanguage } from '../lib/router';
import { setThemePreference, useThemePreference, type ThemePreference } from '../lib/theme';
import type { ControlSize } from '../ui/control-size';
import { Flag, type FlagCode } from '../ui/flag';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/**
 * Site languages as StudentHub lists its interface languages: Russian, Kazakh, English,
 * each with its flag and its own name (endonyms are never translated). `kk` is drawn
 * with StudentHub's Kazakhstan flag (`kz`).
 */
const LANGUAGES: readonly { value: Lang; flag: FlagCode }[] = [
  { value: 'ru', flag: 'ru' },
  { value: 'kk', flag: 'kz' },
  { value: 'en', flag: 'en' },
];

/** StudentHub's theme select order: system, light, dark. */
const THEMES: readonly { value: ThemePreference; icon: typeof Sun }[] = [
  { value: 'system', icon: Monitor },
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
];

/**
 * Language select (StudentHub's language setting): flag + endonym. Keeps the current page
 * and section and remembers the choice. `compact` shows only the flag below `sm`, where the
 * phone top bar has no room for the name.
 */
export function LanguageSelect({
  size = 'lg',
  compact = false,
  className,
}: {
  size?: ControlSize;
  compact?: boolean;
  className?: string;
}) {
  const lang = useLang();
  const t = useT();
  const current = LANGUAGES.find((l) => l.value === lang) ?? LANGUAGES[0]!;
  return (
    <Select
      value={lang}
      onValueChange={(next) => {
        if (next !== lang) switchLanguage(next as Lang);
      }}
    >
      <SelectTrigger size={size} aria-label={t.a11y.language} className={cn('gap-1.5', className)}>
        <SelectValue>
          <span className="flex items-center gap-2">
            <Flag code={current.flag} />
            <span lang={lang} className={cn(compact && 'max-sm:sr-only')}>
              {messagesFor(lang).langName}
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((l) => (
          <SelectItem key={l.value} value={l.value} lang={l.value}>
            <span className="flex items-center gap-2">
              <Flag code={l.flag} />
              {messagesFor(l.value).langName}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Theme select (StudentHub's theme setting): system, light or dark, icon + name. */
export function ThemeSelect({
  size = 'lg',
  className,
}: {
  size?: ControlSize;
  className?: string;
}) {
  const t = useT();
  const pref = useThemePreference();
  return (
    <Select value={pref} onValueChange={(next) => setThemePreference(next as ThemePreference)}>
      <SelectTrigger size={size} aria-label={t.theme.label} className={cn('gap-1.5', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {THEMES.map(({ value, icon: Icon }) => (
          <SelectItem key={value} value={value}>
            <span className="flex items-center gap-2">
              <Icon className="size-4" aria-hidden />
              {t.theme[value]}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
