// Централизованная фабрика ключей кэша React Query (qk).
// Единое место → надёжная инвалидация. Всё, что внутри проекта, начинается с pid
// (см. docs/07). Заполняется по мере добавления фич.
export const qk = {
  health: ['health'] as const,

  auth: ['auth'] as const,
  me: () => [...qk.auth, 'me'] as const,

  projects: ['projects'] as const,
  members: (pid: string) => ['projects', pid, 'members'] as const,
  languages: (pid: string) => ['projects', pid, 'languages'] as const,
  namespaces: (pid: string) => ['projects', pid, 'namespaces'] as const,
  rows: (pid: string, nsid: string, params: unknown) =>
    ['projects', pid, 'namespaces', nsid, 'rows', params] as const,
  tokens: (pid: string) => ['projects', pid, 'tokens'] as const,
} as const;
