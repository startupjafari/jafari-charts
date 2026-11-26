export const days = Array.from({ length: 60 }, (_, i) => {
  const date = new Date(Date.UTC(2025, 8, 1 + i)).toISOString().slice(0, 10);
  return {
    date,
    students: Math.round(420 + 60 * Math.sin(i / 6) + i * 3),
    teachers: Math.round(120 + 25 * Math.cos(i / 5) + i),
  };
});

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
  month,
  registrations: [320, 410, 380, 520, 610, 580][i] as number,
  churn: [-40, -25, -60, -30, -20, -45][i] as number,
}));

export const roles = [
  { role: 'Students', count: 18420 },
  { role: 'Teachers', count: 1260 },
  { role: 'Curators', count: 340 },
  { role: 'Admins', count: 58 },
];

export const universities = [
  { name: 'Al-Farabi Kazakh National University', rating: 92 },
  { name: 'Nazarbayev University', rating: 89 },
  { name: 'L.N. Gumilyov Eurasian National University', rating: 84 },
  { name: 'Satbayev University', rating: 81 },
];
