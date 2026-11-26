import { TreemapChart } from '@jafari/charts';
import { budgetTree } from '../data';

/** Hierarchical data: `{ name, value }` leaves and `{ name, children }` parents. */
export default function Basic() {
  return (
    <TreemapChart data={budgetTree} valueFormatter={(v) => `${v} M ₸`} title="University budget" />
  );
}
