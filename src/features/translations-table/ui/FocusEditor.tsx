import { useEffect, useRef, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Language } from '@/entities/language';
import type { TableRow } from '@/entities/translation';
import { texts } from '@/shared/resources/i18n';
import { FocusRow } from './FocusRow';
import { focusGridClass } from './focusGrid';
import type { EditingKey } from './KeyEditorPopover';

const t = texts.app.table.focus;

// Виртуализированный двухколоночный редактор (Column Focus, docs/08): база (эталон) →
// один целевой язык. Высота строк динамическая (текст не обрезается) — measureElement.
// Бесконечный скролл подгружает следующую страницу при приближении к концу.
export function FocusEditor({
  rows,
  baseCode,
  target,
  showBase,
  isPlural,
  editable,
  onEditKey,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  rows: TableRow[];
  baseCode: string;
  target: Language;
  showBase: boolean;
  isPlural: boolean;
  editable: boolean;
  onEditKey: (info: EditingKey) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}): ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 76,
    overscan: 8,
    measureElement: (el) => el.getBoundingClientRect().height,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1];
    if (!last) return;
    if (last.index >= rows.length - 1 && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [virtualItems, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      ref={scrollRef}
      className="relative min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--border)] bg-surface"
    >
      <div
        className={`${focusGridClass(showBase)} sticky top-0 z-10 border-b border-[var(--border)] bg-subtle text-xs font-medium text-muted`}
      >
        <div className="border-r border-[var(--border)] px-4 py-2.5">{t.columns.key}</div>
        {showBase ? (
          <div className="border-r border-[var(--border)] px-4 py-2.5">
            {baseCode} · {t.columns.base}
          </div>
        ) : null}
        <div className="px-4 py-2.5">
          {target.code} · {t.columns.target}
        </div>
      </div>

      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map((vi) => {
          const row = rows[vi.index];
          return (
            <div
              key={row.keyId}
              data-index={vi.index}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 right-0"
              style={{ top: 0, transform: `translateY(${vi.start}px)` }}
            >
              <FocusRow
                row={row}
                baseCode={baseCode}
                target={target}
                showBase={showBase}
                isPlural={isPlural}
                editable={editable}
                placeholder={texts.app.table.emptyCell}
                onEditKey={onEditKey}
              />
            </div>
          );
        })}
      </div>

      {isFetchingNextPage ? (
        <div className="border-t border-[var(--border)] px-3 py-2 text-center text-xs text-faint">
          {texts.common.state.loading}
        </div>
      ) : null}

      {/* Нижний отступ: последние строки можно проскроллить выше плавающей панели «Сохранить». */}
      <div aria-hidden="true" style={{ height: 88 }} />
    </div>
  );
}
