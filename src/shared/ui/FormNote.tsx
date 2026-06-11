import type { ReactNode } from 'react';
import { texts } from '@/shared/resources/i18n';

// Заметка под формой: ошибка сервера (danger) или успех (success). Инлайн-фидбэк для
// форм (смена email/пароля, переименование проекта). Переиспользуемый — не дублируем.
export function FormNote({ error, success }: { error?: unknown; success?: string }): ReactNode {
  if (error) {
    const message = error instanceof Error ? error.message : texts.common.state.error;
    return (
      <p className="rounded-md bg-[color:var(--danger-tint)] px-3 py-2 text-xs text-[color:var(--danger-fg)]">
        {message}
      </p>
    );
  }
  if (success) {
    return (
      <p className="rounded-md bg-[color:var(--success-tint)] px-3 py-2 text-xs text-[color:var(--success-fg)]">
        {success}
      </p>
    );
  }
  return null;
}
