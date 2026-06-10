import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './queryClient';
import { router } from '@/app/router';

// Композиция глобальных провайдеров. Тема пока фиксированная (data-theme на <html>);
// переключатель light/dark добавим позже — токены уже поддерживают обе темы.
export function AppProviders(): ReactNode {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
