export interface OrdinalScaleOptions<V> {
  domain: readonly string[];
  range: readonly V[];
  /** Returned for keys outside the domain. When omitted, unknown keys are appended. */
  unknown?: V;
}

export interface OrdinalScale<V> {
  readonly kind: 'ordinal';
  readonly domain: readonly string[];
  readonly range: readonly V[];
  map(key: string): V;
}

/**
 * Maps discrete keys to discrete values in order. Keys keep their value even when
 * other keys are removed, so colours follow the entity rather than its position.
 */
export function createOrdinalScale<V>(options: OrdinalScaleOptions<V>): OrdinalScale<V> {
  const index = new Map<string, number>();
  const domain = [...options.domain];
  domain.forEach((key, i) => {
    if (!index.has(key)) index.set(key, i);
  });
  const { range, unknown } = options;
  return {
    kind: 'ordinal',
    domain,
    range,
    map(key) {
      let i = index.get(key);
      if (i === undefined) {
        if (unknown !== undefined) return unknown;
        i = domain.length;
        domain.push(key);
        index.set(key, i);
      }
      if (range.length === 0) throw new Error('Ordinal scale range is empty');
      return range[i % range.length] as V;
    },
  };
}
