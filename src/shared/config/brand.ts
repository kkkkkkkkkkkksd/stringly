// Бренд в одном месте — смена названия не затрагивает остальной код (см. docs/01).
export const brand = {
  name: 'Stringly',
  tagline: 'Управление переводами',
  tokenPrefix: 'stl', // префикс будущих API-токенов: stl_live_…
} as const;
