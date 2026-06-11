import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from '@/shared/ui';
import { queryClient } from './queryClient';
import { router } from '@/app/router';
import { ErrorBoundary } from '@/app/ErrorBoundary';

// Композиция глобальных провайдеров. ErrorBoundary ловит ошибки рендера роутов;
// Toaster — единый контейнер тостов (триггерятся в т.ч. из обработчиков React Query).
export function AppProviders(): ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
      <Toaster />
    </QueryClientProvider>
  );
}
