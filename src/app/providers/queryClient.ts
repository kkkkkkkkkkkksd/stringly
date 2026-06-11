import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@/shared/services/toast';
import { texts } from '@/shared/resources/i18n';

// Сообщение ошибки: из ApiError (понятный текст с бэка) или дефолт.
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : texts.common.state.error;

// Опт-аут глобального тоста: экраны, которые показывают ошибку инлайн (формы, EmptyState),
// помечают запрос/мутацию `meta: { silentError: true }` — чтобы не дублировать фидбек.
const isSilent = (meta?: Record<string, unknown>): boolean => meta?.silentError === true;

// Глобальные настройки кэша. Ретраи на сеть/5xx по умолчанию; 4xx не ретраим.
// Ошибки запросов/мутаций по умолчанию показываем тостом (safety-net), если не silent.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!isSilent(query.meta)) toast.error(errorMessage(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (!isSilent(mutation.options.meta)) toast.error(errorMessage(error));
    },
  }),
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
