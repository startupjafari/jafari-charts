import { cn } from '../lib/cn';

// StudentHub's ToggleSwitch (`widgets/account-settings/ui/account-settings-panels.tsx`):
// an on/off setting that applies immediately. `role="switch"` with `aria-checked`.
export function ToggleSwitch({
  checked,
  onChange,
  disabled,
  label,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /** Accessible name; omit when a `<label htmlFor={id}>` names the switch. */
  label?: string;
  id?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full outline-none transition-colors focus-visible:ring-4 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-muted',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-background ring-1 ring-border transition-transform motion-reduce:transition-none',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}
