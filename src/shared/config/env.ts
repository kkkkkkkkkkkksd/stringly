// Доступ к env через одну точку. Базовый URL — относительный, чтобы работало
// и локально (localhost), и на проде без правок (см. docs/04 «Запуск и окружения»).
export const env = {
  apiMode: (import.meta.env.VITE_API_MODE ?? 'mock') as 'mock' | 'real',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  isMock: (import.meta.env.VITE_API_MODE ?? 'mock') === 'mock',
} as const;
