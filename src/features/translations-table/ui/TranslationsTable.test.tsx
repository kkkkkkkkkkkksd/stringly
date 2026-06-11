import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Language } from '@/entities/language';
import type { TableRow } from '@/entities/translation';
import { texts } from '@/shared/resources/i18n';
import { TranslationsTable } from './TranslationsTable';

const languages: Language[] = [
  { id: '1', code: 'en', name: 'English', isBase: true, rtl: false },
  { id: '2', code: 'ar', name: 'العربية', isBase: false, rtl: true },
];

const rows: TableRow[] = [
  {
    keyId: 'k1',
    code: '[copy]',
    comment: 'button',
    values: {
      en: { value: 'Copy', status: 'reviewed' },
      ar: { value: '', status: 'empty' }, // пустая ячейка
    },
  },
];

// Смоук: таблица монтируется (TanStack Table + Virtual) и рисует заголовки колонок.
describe('TranslationsTable', () => {
  it('рендерит закреплённые заголовки и языковые колонки без ошибок', () => {
    render(
      <TranslationsTable
        languages={languages}
        rows={rows}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={vi.fn()}
      />,
    );
    expect(screen.getByText(texts.app.table.columns.code)).toBeInTheDocument();
    expect(screen.getByText(texts.app.table.columns.comment)).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
    expect(screen.getByText('ar')).toBeInTheDocument();
  });
});
