/**
 * Cross-chart synchronisation (`syncId`): charts in the same group share the
 * active x value, so hovering one shows the crosshair and tooltip in all of them.
 * One tiny in-memory channel per group id; no global state per chart.
 */
export type SyncKey = string | number;

interface Channel {
  source: string | null;
  key: SyncKey | null;
  listeners: Set<() => void>;
}

const channels = new Map<string, Channel>();

function channel(id: string): Channel {
  let c = channels.get(id);
  if (!c) {
    c = { source: null, key: null, listeners: new Set() };
    channels.set(id, c);
  }
  return c;
}

export function publishSync(id: string, source: string, key: SyncKey | null): void {
  const c = channel(id);
  if (c.source === source && c.key === key) return;
  c.source = source;
  c.key = key;
  c.listeners.forEach((l) => l());
}

export function subscribeSync(id: string, listener: () => void): () => void {
  const c = channel(id);
  c.listeners.add(listener);
  return () => {
    c.listeners.delete(listener);
    if (!c.listeners.size) channels.delete(id);
  };
}

export function readSync(id: string): { source: string | null; key: SyncKey | null } {
  const c = channel(id);
  return { source: c.source, key: c.key };
}
