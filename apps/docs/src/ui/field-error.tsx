import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../lib/cn';

// StudentHub's FieldError (`shared/ui/field-error.tsx`). It sits on the label row, on the
// right: a field whose first child is a label becomes a "label | error" grid through the
// `[data-field-error]` rule in styles.css, so an error never adds a line under the field
// and the form does not jump. In the markup it stays after the control, so a screen reader
// reads the field first, then what is wrong with it.
//
// Text that does not fit scrolls like a marquee (to the end and back); with reduced motion
// it is cut with an ellipsis and the full text goes to the tooltip.
//
// `role="alert"` announces the message. An empty value renders nothing, so the component
// can be placed unconditionally. (The StudentHub version also translates schema keys; the
// docs have no validation schemas, so text passes through as is.)

/** Scroll speed, px per second; plus the pauses at both ends (keyframes). */
const MARQUEE_SPEED = 40;
const MARQUEE_MIN_SECONDS = 4;

export function FieldError({ children, className }: { children?: ReactNode; className?: string }) {
  const box = useRef<HTMLParagraphElement>(null);
  const text = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);
  const visible = Boolean(children);

  useLayoutEffect(() => {
    const boxEl = box.current;
    const textEl = text.current;
    if (!visible || !boxEl || !textEl) return;
    const measure = (): void => {
      const extra = textEl.scrollWidth - boxEl.clientWidth;
      setOverflow(extra > 1 ? Math.ceil(extra) : 0);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(boxEl);
    observer.observe(textEl);
    return () => observer.disconnect();
  }, [visible, children]);

  if (!visible) return null;
  const style =
    overflow > 0
      ? ({
          '--sh-marquee-shift': `-${overflow}px`,
          '--sh-marquee-duration': `${Math.max(MARQUEE_MIN_SECONDS, overflow / MARQUEE_SPEED + 3)}s`,
        } as CSSProperties)
      : undefined;
  return (
    <p
      ref={box}
      role="alert"
      data-field-error=""
      title={overflow > 0 && typeof children === 'string' ? children : undefined}
      className={cn('min-w-0 overflow-hidden text-xs leading-tight text-destructive', className)}
    >
      <span
        ref={text}
        data-marquee={overflow > 0 ? '' : undefined}
        className="inline-block max-w-none whitespace-nowrap"
        style={style}
      >
        {children}
      </span>
    </p>
  );
}
