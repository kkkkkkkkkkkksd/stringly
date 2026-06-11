import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';

const t = texts.app.errorBoundary;

// Глобальный перехват ошибок рендера: вместо «белого экрана» — понятный fallback с
// перезагрузкой. Ловит ошибки в дереве роутов (RouterProvider обёрнут им в AppProviders).
type State = { hasError: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Точка для отправки в мониторинг/аналитику (позже).
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-xl font-semibold text-ink">{t.title}</h1>
        <p className="max-w-sm text-sm text-muted">{t.text}</p>
        <Button onClick={() => window.location.reload()}>{t.reload}</Button>
      </div>
    );
  }
}
