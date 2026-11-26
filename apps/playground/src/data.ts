/** Deterministic data generators for fixtures and benchmarks. */
export function rng(seed = 1) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export type Row<K extends string> = { date: string } & Record<K, number>;

export function timeSeries<K extends string = 'students' | 'teachers'>(
  n: number,
  opts: { seed?: number; start?: number; step?: number; keys?: readonly K[] } = {},
): Row<K>[] {
  const r = rng(opts.seed ?? 7);
  const start = opts.start ?? Date.UTC(2025, 0, 1);
  const step = opts.step ?? 864e5;
  const keys = (opts.keys ?? ['students', 'teachers']) as readonly K[];
  const levels = keys.map((_, i) => 400 / (i + 1));
  return Array.from({ length: n }, (_, i) => {
    const row = { date: new Date(start + i * step).toISOString().slice(0, 10) } as Row<K>;
    keys.forEach((k, j) => {
      levels[j] = Math.max(0, (levels[j] as number) + (r() - 0.45) * 30 + Math.sin(i / 9) * 6);
      (row as Record<string, number | string>)[k] = Math.round(levels[j] as number);
    });
    return row;
  });
}

export const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const registrations = months.map((m, i) => ({
  month: m,
  students: 120 + Math.round(Math.sin(i / 2) * 60 + i * 12),
  teachers: 30 + ((i * 7) % 23),
  admins: 4 + (i % 4),
}));

export const universities = [
  { name: 'Al-Farabi Kazakh National University', score: 92 },
  { name: 'Nazarbayev University', score: 89 },
  { name: 'L.N. Gumilyov Eurasian National University', score: 84 },
  { name: 'Satbayev University', score: 81 },
  { name: 'KIMEP University', score: 76 },
  { name: 'Astana IT University', score: 72 },
];

export const complaints = [
  { category: 'Schedule', open: 12, resolved: 30, rejected: 4 },
  { category: 'Grades', open: 8, resolved: 22, rejected: 6 },
  { category: 'Housing', open: 15, resolved: 9, rejected: 2 },
  { category: 'Library', open: 3, resolved: 14, rejected: 1 },
  { category: 'Other', open: 6, resolved: 11, rejected: 5 },
];

export const profit = [
  { label: 'Q1', delta: -12 },
  { label: 'Q2', delta: 25 },
  { label: 'Q3', delta: -8 },
  { label: 'Q4', delta: 30 },
];

export const cashflow = [
  { step: 'Opening', value: 120 },
  { step: 'Tuition', value: 80 },
  { step: 'Grants', value: 35 },
  { step: 'Salaries', value: -95 },
  { step: 'Housing', value: -28 },
  { step: 'Q2 total', value: 0, total: true },
  { step: 'Events', value: 14 },
  { step: 'IT', value: -22 },
  { step: 'Closing', value: 0, total: true },
];
