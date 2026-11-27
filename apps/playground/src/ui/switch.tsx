import { cn } from '../lib/utils';

/** On/off setting (`role="switch"`), the StudentHub ToggleSwitch. */
export function Switch({
  checked,
  onChange,
  label,
  labelledBy,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  labelledBy?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/25',
        checked ? 'bg-primary' : 'bg-input/40 dark:bg-input/60',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow-sm ring-1 ring-border transition-transform duration-(--motion-control) motion-reduce:transition-none',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}
