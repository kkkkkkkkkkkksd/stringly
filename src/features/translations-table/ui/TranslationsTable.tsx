import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type Header,
  type Cell,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Language } from '@/entities/language';
import type { TableRow } from '@/entities/translation';
import { texts } from '@/shared/resources/i18n';
import { StringCell } from './StringCell';
import { PluralCell } from './PluralCell';

const t = texts.app.table;

const ROW_HEIGHT = 40;
const CODE_WIDTH = 220;
const COMMENT_WIDTH = 240;
const LANG_WIDTH = 200;
// Постоянный отступ снизу: последние строки всегда можно прокрутить выше плавающей панели
// сохранения (и просто комфортнее работать с низом таблицы).
const BOTTOM_SPACE = 84;

type ColMeta = { kind: 'code' | 'comment' | 'lang'; rtl?: boolean; langName?: string; code?: string };

// Виртуализированная таблица переводов (TanStack Table + Virtual, docs/08).
// Закреплена (sticky) только колонка code; языковые колонки — из централизованного списка
// языков проекта. RTL-языки рендерят ячейку dir="rtl". Ячейки редактируемы (Шаг 4):
// strings — инлайн, plurals — поповер с формами CLDR.
export function TranslationsTable({
  languages,
  rows,
  isPlural,
  editable,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  languages: Language[];
  rows: TableRow[];
  isPlural: boolean;
  editable: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}): ReactNode {
  const scrollRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      { id: 'code', accessorFn: (r) => r.code, header: t.columns.code, size: CODE_WIDTH, meta: { kind: 'code' } satisfies ColMeta },
      { id: 'comment', accessorFn: (r) => r.comment ?? '', header: t.columns.comment, size: COMMENT_WIDTH, meta: { kind: 'comment' } satisfies ColMeta },
      ...languages.map(
        (l): ColumnDef<TableRow> => ({
          id: `lang_${l.code}`,
          accessorFn: (r) => r.values[l.code]?.value ?? '',
          header: l.code,
          size: LANG_WIDTH,
          meta: { kind: 'lang', rtl: l.rtl, langName: l.name, code: l.code } satisfies ColMeta,
        }),
      ),
    ],
    [languages],
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: { columnPinning: { left: ['code'] } },
    defaultColumn: { size: LANG_WIDTH, minSize: 120 },
  });

  const tableRows = table.getRowModel().rows;
  const totalWidth = table.getTotalSize();

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });
  const virtualItems = rowVirtualizer.getVirtualItems();

  // Бесконечный скролл: подгружаем следующую страницу при приближении к концу.
  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1];
    if (!last) return;
    if (last.index >= tableRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [virtualItems, tableRows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const pinnedStyle = (header: Header<TableRow, unknown> | Cell<TableRow, unknown>) => {
    const col = header.column;
    const pinned = col.getIsPinned() === 'left';
    return {
      width: col.getSize(),
      ...(pinned ? { position: 'sticky' as const, left: col.getStart('left'), zIndex: 10 } : {}),
    };
  };

  return (
    <div
      ref={scrollRef}
      className="relative min-h-0 flex-1 overflow-auto rounded-lg border border-[var(--border)] bg-surface"
    >
      <div style={{ width: totalWidth }}>
        {/* Заголовок — sticky сверху; закреплённые колонки — sticky слева. */}
        <div className="sticky top-0 z-20 flex bg-subtle" style={{ width: totalWidth }}>
          {table.getFlatHeaders().map((header) => {
            const meta = header.column.columnDef.meta as ColMeta;
            const pinned = header.column.getIsPinned() === 'left';
            return (
              <div
                key={header.id}
                style={{ ...pinnedStyle(header), height: ROW_HEIGHT, zIndex: pinned ? 30 : 20 }}
                className="flex shrink-0 items-center border-b border-r border-[var(--border)] bg-subtle px-3 text-xs font-medium text-muted"
                title={meta.kind === 'lang' ? meta.langName : undefined}
              >
                {String(header.column.columnDef.header)}
                {meta.rtl ? <span className="ml-1 text-faint">‏→</span> : null}
              </div>
            );
          })}
        </div>

        {/* Тело — виртуализировано: в DOM только видимые строки. */}
        <div style={{ height: rowVirtualizer.getTotalSize(), width: totalWidth, position: 'relative' }}>
          {virtualItems.map((vi) => {
            const row = tableRows[vi.index];
            return (
              <div
                key={row.id}
                className="group absolute left-0 flex"
                style={{ top: 0, transform: `translateY(${vi.start}px)`, height: vi.size, width: totalWidth }}
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as ColMeta;
                  const value = cell.getValue() as string;
                  return (
                    <div
                      key={cell.id}
                      style={pinnedStyle(cell)}
                      className="flex shrink-0 items-stretch overflow-hidden border-b border-r border-[var(--border)]"
                    >
                      {meta.kind === 'code' ? (
                        <span className="flex h-full w-full items-center truncate bg-surface px-3 font-mono text-[12.5px] text-[color:var(--primary-hover)] transition-colors group-hover:bg-[var(--row-hover)]">
                          {value}
                        </span>
                      ) : meta.kind === 'comment' ? (
                        <span className="flex h-full w-full items-center truncate bg-surface px-3 text-sm text-muted transition-colors group-hover:bg-[var(--row-hover)]">
                          {value}
                        </span>
                      ) : isPlural ? (
                        <PluralCell
                          keyId={cell.row.original.keyId}
                          langCode={meta.code!}
                          server={cell.row.original.values[meta.code!]}
                          rtl={!!meta.rtl}
                          editable={editable}
                        />
                      ) : (
                        <StringCell
                          keyId={cell.row.original.keyId}
                          langCode={meta.code!}
                          serverValue={value}
                          rtl={!!meta.rtl}
                          editable={editable}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {isFetchingNextPage ? (
          <div className="border-t border-[var(--border)] px-3 py-2 text-center text-xs text-faint">
            {texts.common.state.loading}
          </div>
        ) : null}

        {/* Постоянный отступ снизу: низ таблицы не перекрывается панелью сохранения. */}
        <div style={{ height: BOTTOM_SPACE }} aria-hidden="true" />
      </div>
    </div>
  );
}
