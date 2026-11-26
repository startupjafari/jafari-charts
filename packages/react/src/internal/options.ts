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
