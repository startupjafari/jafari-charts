import type { YAxisOptions } from '../charts/cartesian/types';

/**
 * Normalises `boolean | options` props: `undefined` → the default (enabled = `{}`),
 * `false` → null (disabled), `true` → `{}`, an object → itself.
 */
export function resolveOption<O extends object>(
  value: boolean | O | undefined,
  enabledByDefault: boolean,
): O | null {
  if (value === undefined) return enabledByDefault ? ({} as O) : null;
  if (value === false) return null;
  return value === true ? ({} as O) : value;
}

/** Core value-axis options from the public `YAxisOptions` (`null` = hidden axis). */
export function valueAxisSpec(o: YAxisOptions | null) {
  return {
    ...(o?.hidden || !o ? { hidden: true } : {}),
    ...(o?.tickCount !== undefined ? { tickCount: o.tickCount } : {}),
    ...(o?.format ? { format: o.format } : {}),
    ...(o?.min !== undefined ? { min: o.min } : {}),
    ...(o?.max !== undefined ? { max: o.max } : {}),
    ...(o?.includeZero !== undefined ? { includeZero: o.includeZero } : {}),
    ...(o?.scale ? { scale: o.scale } : {}),
    ...(o?.nice !== undefined ? { nice: o.nice } : {}),
    ...(o?.integer ? { integer: true } : {}),
  };
}
