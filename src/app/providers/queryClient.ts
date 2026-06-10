import { QueryClient } from '@tanstack/react-query';

// Глобальные настройки кэша. Ретраи на сеть/5xx по умолчанию; 4xx не ретраим.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
