import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LandingPage } from '@/pages/landing/LandingPage';
import { AuthPage } from '@/pages/auth/AuthPage';
import { texts } from '@/shared/resources/i18n';

function renderWithProviders(ui: ReactNode, route = '/') {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

// Смоук: страницы монтируются без ошибок и берут тексты из @/shared/i18n.
describe('pages smoke', () => {
  it('лендинг рендерится', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText(texts.landing.hero.titleAccent)).toBeInTheDocument();
  });

  it('экран входа рендерится с переключателем и кнопкой', () => {
    renderWithProviders(<AuthPage />, '/login');
    expect(screen.getByText(texts.auth.tabs.register)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: texts.auth.submit.login })).toBeInTheDocument();
  });
});
