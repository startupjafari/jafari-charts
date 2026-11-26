import { useEffect, useRef, useState } from 'react';
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
}: {
  text: string;
  floating?: boolean;
  label?: string;
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
  return (
    <button
      type="button"
      className={`copy-button${floating ? ' copy-floating' : ''}`}
      onClick={onClick}
      data-state={state}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        {state === 'copied' ? (
          <path d="M5 12l5 5L20 7" fill="none" stroke="currentColor" strokeWidth="2.2" />
        ) : (
          <>
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M5 15V6a2 2 0 0 1 2-2h8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
      <span aria-live="polite">
        {state === 'copied' ? t.copied : state === 'failed' ? t.copyFailed : (label ?? t.copy)}
      </span>
    </button>
  );
}
