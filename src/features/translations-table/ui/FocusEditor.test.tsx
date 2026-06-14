import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Language } from '@/entities/language';
import type { TableRow } from '@/entities/translation';
import { texts } from '@/shared/resources/i18n';
import { FocusEditor } from './FocusEditor';

const target: Language = { id: '2', code: 'ar', name: 'العربية', isBase: false, rtl: true };

const rows: TableRow[] = [
  {
    keyId: 'k1',
    code: '[copy]',
    comment: 'button',
    values: {
      en: { value: 'Copy', status: 'reviewed', ai: false },
      ar: { value: '', status: 'empty', ai: false },
    },
  },
];

// Смоук: редактор Column Focus монтируется и рисует заголовки колонок (ключ/база/перевод)
// и коды языков. Виртуализация (TanStack Virtual + measureElement) не падает.
describe('FocusEditor', () => {
  it('рендерит заголовки колонок и коды языков', () => {
    render(
      <FocusEditor
        rows={rows}
        baseCode="en"
        target={target}
        showBase
        isPlural={false}
        editable
        onEditKey={vi.fn()}
        hasNextPage={false}
        isFetchingNextPage={false}
        fetchNextPage={vi.fn()}
      />,
    );
    const f = texts.app.table.focus;
    expect(screen.getByText(f.columns.key)).toBeInTheDocument();
    expect(screen.getByText(`en · ${f.columns.base}`)).toBeInTheDocument();
    expect(screen.getByText(`ar · ${f.columns.target}`)).toBeInTheDocument();
  });
});
