import type { ReactNode } from 'react';
import { useStoreSelector } from '../../hooks/useStoreSelector';
import { useChart, type ActiveItem, type InteractionState } from '../../providers/ChartContext';

const selectKey = (s: InteractionState) =>
  s.active ? `${s.active.position}:${s.active.series}` : '';

export interface CenterLabelProps {
  x: number;
  y: number;
  /** Diameter available for the text, px. */
  size: number;
  render: (active: ActiveItem | null) => { value: ReactNode; label?: ReactNode };
}

/** HTML text centred in a ring; re-renders only when the active item changes. */
export function CenterLabel({ x, y, size, render }: CenterLabelProps) {
  const { store } = useChart();
  const key = useStoreSelector(store, selectKey);
  const active = key ? store.getState().active : null;
  const content = render(active);
  if (size < 36) return null;
  const fontSize = Math.max(14, Math.min(36, size * 0.2));
  return (
    <div className="jc-center" style={{ left: x, top: y, maxWidth: size * 0.8 }} aria-hidden="true">
      <div className="jc-center-value" style={{ fontSize }}>
        {content.value}
      </div>
      {content.label ? <div className="jc-center-label">{content.label}</div> : null}
    </div>
  );
}
