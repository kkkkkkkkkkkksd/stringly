import type { ReactNode } from 'react';
import { texts } from '@/shared/resources/i18n';

// Заглушка. Реализация — Шаг 5 (Языки, Участники; Подключения — заглушка).
const t = texts.app.settings;

export function SettingsPage(): ReactNode {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">{t.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.placeholder}</p>
    </div>
  );
}
