/**
 * Demo data shared by the documentation examples. Everything is generated
 * deterministically, so every visitor (and every screenshot) sees the same charts.
 */

/** Seeded pseudo-random numbers in [0, 1). */
export function random(seed = 1): () => number {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** ISO date (`YYYY-MM-DD`) `offset` days after `start`. */
export function isoDay(offset: number, start = Date.UTC(2025, 0, 1)): string {
  return new Date(start + offset * 864e5).toISOString().slice(0, 10);
}

/** Random walk that never drops below `min`. */
function walk(n: number, seed: number, start: number, step: number, drift = 0, min = 0): number[] {
  const r = random(seed);
  let v = start;
  return Array.from({ length: n }, (_, i) => {
    v = Math.max(min, v + (r() - 0.5) * step + drift + Math.sin(i / 7) * step * 0.15);
    return Math.round(v);
  });
}

// ─── Time series ────────────────────────────────────────────────────────────

const users = walk(120, 3, 1200, 90, 9);
const sessions = walk(120, 5, 2600, 160, 14);

/** 120 days of active users and sessions. */
export const dailyUsers = users.map((u, i) => ({
  date: isoDay(i),
  users: u,
  sessions: sessions[i] ?? 0,
}));

const students = walk(90, 7, 420, 46, 1.2);
const teachers = walk(90, 11, 160, 22, 0.4);
const staff = walk(90, 13, 60, 12, 0.1);

/** 90 days of platform activity by role. */
export const activity = students.map((s, i) => ({
  date: isoDay(i, Date.UTC(2025, 8, 1)),
  students: s,
  teachers: teachers[i] ?? 0,
  staff: staff[i] ?? 0,
}));

/** Daily temperatures with missing readings (null) and values below zero. */
export const temperature = Array.from({ length: 60 }, (_, i) => {
  const base = -8 + i * 0.35 + Math.sin(i / 4) * 3;
  return {
    date: isoDay(i, Date.UTC(2025, 1, 1)),
    almaty: i >= 18 && i <= 22 ? null : Math.round((base + 4) * 10) / 10,
    astana: i >= 40 && i <= 43 ? null : Math.round((base - 3) * 10) / 10,
  };
});

/** `n` hourly readings of server load (%), for zoom and canvas examples. */
export function serverLoad(n: number) {
  const r = random(17);
  let v = 48;
  const start = Date.UTC(2025, 5, 1);
  return Array.from({ length: n }, (_, i) => {
    v = Math.min(98, Math.max(4, v + (r() - 0.5) * 9 + Math.sin(i / 24) * 1.5));
    return { time: start + i * 36e5, load: Math.round(v * 10) / 10 };
  });
}

// ─── Categories ─────────────────────────────────────────────────────────────

export const MONTHS = [
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
] as const;

/** Registrations per month by role. */
export const registrations = MONTHS.map((month, i) => ({
  month,
  students: 120 + Math.round(Math.sin(i / 2) * 60 + i * 12),
  teachers: 30 + ((i * 7) % 23),
  admins: 4 + (i % 4),
}));

/** Monthly revenue (million ₸), margin (%) and target. */
export const revenue = MONTHS.map((month, i) => ({
  month,
  revenue: Math.round(42 + i * 3.1 + Math.sin(i / 1.6) * 7),
  costs: Math.round(30 + i * 1.9 + Math.cos(i / 2) * 4),
  margin: Math.round(18 + Math.sin(i / 2.2) * 6 + i * 0.6),
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

export const roles = [
  { role: 'Students', count: 18420 },
  { role: 'Teachers', count: 1260 },
  { role: 'Curators', count: 340 },
  { role: 'Admins', count: 58 },
];

export const devices = [
  { device: 'Mobile', share: 58 },
  { device: 'Desktop', share: 34 },
  { device: 'Tablet', share: 6 },
  { device: 'Other', share: 2 },
];

/** Quarterly profit change (million ₸) — includes losses. */
export const profit = [
  { quarter: 'Q1 2024', change: -12 },
  { quarter: 'Q2 2024', change: 25 },
  { quarter: 'Q3 2024', change: -8 },
  { quarter: 'Q4 2024', change: 30 },
  { quarter: 'Q1 2025', change: 14 },
  { quarter: 'Q2 2025', change: -5 },
];

/** Net balance by department: positive and negative parts in one stack. */
export const balance = [
  { department: 'Science', income: 42, grants: 18, expenses: -35 },
  { department: 'Arts', income: 21, grants: 6, expenses: -30 },
  { department: 'Medicine', income: 55, grants: 24, expenses: -61 },
  { department: 'Law', income: 30, grants: 4, expenses: -19 },
  { department: 'IT', income: 48, grants: 15, expenses: -27 },
];

/** Cash flow for a waterfall chart; `total` rows show the running total. */
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

/** Course completion by faculty (percent of enrolled students). */
export const completion = [
  { label: 'Attendance', value: 86 },
  { label: 'Assignments', value: 64 },
  { label: 'Exams', value: 41 },
];

// ─── Dashboard ──────────────────────────────────────────────────────────────

/** Registered users at the start of each month, two years. */
export const userGrowth = Array.from({ length: 24 }, (_, i) => ({
  month: new Date(Date.UTC(2024, i, 1)).toISOString().slice(0, 10),
  users: Math.round(4200 * 1.055 ** i + Math.sin(i / 2) * 180),
}));

/** One year of daily logins: quieter weekends and holidays, busier exam weeks. */
export const dailyLogins = (() => {
  const r = random(23);
  const start = Date.UTC(2025, 0, 1);
  return Array.from({ length: 365 }, (_, i) => {
    const day = new Date(start + i * 864e5);
    const weekday = day.getUTCDay();
    const month = day.getUTCMonth();
    const holiday = month === 6 || month === 7 || (month === 0 && day.getUTCDate() < 8);
    const exams = (month === 4 && day.getUTCDate() > 15) || (month === 11 && day.getUTCDate() > 10);
    let base = weekday === 0 || weekday === 6 ? 40 : 160;
    if (holiday) base *= 0.25;
    if (exams) base *= 1.6;
    return { date: isoDay(i, start), logins: Math.round(base * (0.6 + r() * 0.8)) };
  });
})();

// ─── Advanced charts ────────────────────────────────────────────────────────

const FACULTIES = ['Engineering', 'Medicine', 'Economics'] as const;

/** 150 students: weekly study hours, average grade, credits and faculty. */
export const cohort = (() => {
  const r = random(31);
  return Array.from({ length: 150 }, (_, i) => {
    const faculty = FACULTIES[i % 3] as (typeof FACULTIES)[number];
    const hours = Math.round((4 + r() * 26 + (faculty === 'Medicine' ? 6 : 0)) * 10) / 10;
    const grade = Math.min(100, Math.round(48 + hours * 1.4 + (r() - 0.5) * 22));
    return { name: `Student ${i + 1}`, faculty, hours, grade, credits: 12 + Math.round(r() * 48) };
  });
})();

/** `n` random points for large scatter plots. */
export function cloud(n: number) {
  const r = random(41);
  return Array.from({ length: n }, () => {
    const x = r() * 100;
    return { x, y: x * 0.6 + (r() + r() + r() - 1.5) * 30 };
  });
}

/** University profiles on six criteria (0–100). */
export const profiles = [
  { metric: 'Teaching', north: 86, south: 74, east: 69 },
  { metric: 'Research', north: 72, south: 88, east: 58 },
  { metric: 'Employability', north: 90, south: 70, east: 81 },
  { metric: 'International', north: 64, south: 79, east: 52 },
  { metric: 'Facilities', north: 78, south: 66, east: 88 },
  { metric: 'Student life', north: 81, south: 72, east: 76 },
];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Sessions by weekday and hour (08–21). */
export const sessionsByHour = WEEKDAYS.flatMap((day, d) =>
  Array.from({ length: 14 }, (_, h) => {
    const hour = h + 8;
    const weekend = d >= 5;
    const peak =
      Math.exp(-((hour - (weekend ? 16 : 11)) ** 2) / 18) + 0.6 * Math.exp(-((hour - 19) ** 2) / 6);
    return {
      day,
      hour: `${String(hour).padStart(2, '0')}:00`,
      sessions: Math.round((weekend ? 120 : 340) * peak + 20 + ((d * 31 + h * 17) % 23)),
    };
  }),
);

/** Change in enrolment vs last year (%) by faculty and term — positive and negative. */
export const enrolmentChange = ['Engineering', 'Medicine', 'Economics', 'Law', 'Arts'].flatMap(
  (faculty, f) =>
    ['Fall 23', 'Spring 24', 'Fall 24', 'Spring 25'].map((term, t) => ({
      faculty,
      term,
      change:
        Math.round(
          (Math.sin(f * 1.7 + t * 0.9) * 14 + (f === 1 ? 6 : 0) - (f === 4 ? 5 : 0)) * 10,
        ) / 10,
    })),
);

/** Admissions funnel. */
export const admissions = [
  { stage: 'Site visitors', count: 48200 },
  { stage: 'Applications', count: 12600 },
  { stage: 'Documents verified', count: 8450 },
  { stage: 'Entrance exam', count: 6120 },
  { stage: 'Enrolled', count: 3980 },
];

/** University budget as a hierarchy (million ₸). */
export const budgetTree = [
  {
    name: 'Academic',
    children: [
      { name: 'Salaries', value: 410 },
      { name: 'Research grants', value: 145 },
      { name: 'Library', value: 38 },
      { name: 'Labs', value: 92 },
    ],
  },
  {
    name: 'Campus',
    children: [
      { name: 'Dormitories', value: 120 },
      { name: 'Maintenance', value: 84 },
      { name: 'Utilities', value: 61 },
    ],
  },
  {
    name: 'Students',
    children: [
      { name: 'Scholarships', value: 160 },
      { name: 'Sports', value: 27 },
      { name: 'Clubs', value: 14 },
    ],
  },
  {
    name: 'IT',
    children: [
      { name: 'Infrastructure', value: 58 },
      { name: 'Software', value: 33 },
    ],
  },
];

/** The same kind of data as flat rows (one row per course). */
export const courseLoad = [
  { faculty: 'Engineering', department: 'Computer science', course: 'Algorithms', hours: 320 },
  { faculty: 'Engineering', department: 'Computer science', course: 'Databases', hours: 240 },
  { faculty: 'Engineering', department: 'Computer science', course: 'Networks', hours: 180 },
  { faculty: 'Engineering', department: 'Mechanics', course: 'Statics', hours: 210 },
  { faculty: 'Engineering', department: 'Mechanics', course: 'Dynamics', hours: 190 },
  { faculty: 'Medicine', department: 'Anatomy', course: 'Anatomy I', hours: 360 },
  { faculty: 'Medicine', department: 'Anatomy', course: 'Anatomy II', hours: 300 },
  { faculty: 'Medicine', department: 'Pharmacology', course: 'Pharmacology', hours: 260 },
  { faculty: 'Economics', department: 'Finance', course: 'Corporate finance', hours: 200 },
  { faculty: 'Economics', department: 'Finance', course: 'Markets', hours: 150 },
  { faculty: 'Economics', department: 'Statistics', course: 'Econometrics', hours: 170 },
  { faculty: 'Law', department: 'Civil law', course: 'Contracts', hours: 160 },
  { faculty: 'Law', department: 'Civil law', course: 'Property', hours: 120 },
];
