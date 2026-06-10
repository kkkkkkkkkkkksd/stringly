import { env } from '@/shared/config/env';
import { getAuthToken } from './authToken';

// СЕРВИС: сетевой слой. Единственная точка общения с API.
// Все запросы идут через него (никакого «голого» fetch в компонентах/фичах).
// Добавляет базовый URL, Authorization: Bearer и единообразную обработку ошибок.

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getAuthToken();

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => undefined);
    const message =
      (errBody as { message?: string } | undefined)?.message ?? `Ошибка запроса: ${res.status}`;
    // TODO(позже): при 401 с активной сессией — глобальный разлогин и редирект на /login.
    throw new ApiError(res.status, message, errBody);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const httpClient = {
  get: <T>(path: string, options?: Options) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Options) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Options) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Options) => request<T>(path, { ...options, method: 'DELETE' }),
};
