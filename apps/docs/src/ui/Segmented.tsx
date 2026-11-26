import { useId } from 'react';

export interface SegmentedOption<V extends string | number> {
  value: V;
  label: string;
}

/**
 * Compact single-choice control built on native radio inputs, so arrow keys,
 * focus and screen reader semantics come from the browser.
 */
export function Segmented<V extends string | number>({
  label,
  options,
  value,
  onChange,
  hideLabel = false,
  size = 'md',
}: {
  label: string;
  options: readonly SegmentedOption<V>[];
  value: V;
  onChange: (value: V) => void;
  hideLabel?: boolean;
  size?: 'sm' | 'md';
}) {
  const name = useId();
  return (
    <fieldset className={`segmented segmented-${size}`}>
      <legend className={hideLabel ? 'sr-only' : 'segmented-legend'}>{label}</legend>
      <div className="segmented-track">
        {options.map((o) => (
          <label key={String(o.value)} className="segmented-option">
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
