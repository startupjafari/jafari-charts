import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';
import { useT } from '../i18n';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path (permissions, insecure origins).
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/** Copies `text`; announces the result through a polite live region. */
export function CopyButton({
  text,
  floating = false,
  label,
  className,
}: {
  text: string;
  floating?: boolean;
  label?: string;
  className?: string;
}) {
  const t = useT().code;
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 1600);
  };
  const Icon = state === 'copied' ? Check : Copy;
  return (
    <button
      type="button"
      onClick={onClick}
      data-state={state}
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 data-[state=copied]:text-success',
        floating &&
          'absolute top-2 right-2 z-[1] border border-border bg-background/85 backdrop-blur-sm',
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      <span aria-live="polite">
        {state === 'copied' ? t.copied : state === 'failed' ? t.copyFailed : (label ?? t.copy)}
      </span>
    </button>
  );
}
