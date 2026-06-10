import type { ReactNode } from 'react';
import { texts } from '@/shared/resources/i18n';

// Заглушка. Реализация — Шаги 3–4 (TanStack Table + Virtual, см. docs/08).
const t = texts.app.table;

export function TablePage(): ReactNode {
  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">{t.title}</h1>
      <p className="mt-2 text-sm text-muted">{t.placeholder}</p>
    </div>
  );
}
