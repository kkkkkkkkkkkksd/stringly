import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge, Button, EmptyState, Skeleton } from '@/shared/ui';
import { InboxIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useActiveProject } from '@/features/projects/model/activeProjectStore';
import { useNamespaces } from '@/features/namespaces/model/useNamespaces';
import { NamespaceTabs } from '@/features/namespaces/ui/NamespaceTabs';
import { useLanguages } from '@/features/languages/model/useLanguages';
import { TableToolbar } from '@/features/translations-table/ui/TableToolbar';
import { TranslationsTable } from '@/features/translations-table/ui/TranslationsTable';
import { useRows } from '@/features/translations-table/model/useRows';
import { DEFAULT_PAGE_SIZE, type RowsParams } from '@/features/translations-table/model/rowsParams';

const t = texts.app.table;

// Скелет таблицы на время первой загрузки строк/языков.
function TableSkeleton(): ReactNode {
  return (
    <div className="min-h-0 flex-1 space-y-2 rounded-lg border border-[var(--border)] bg-surface p-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}

// Экран 5 (docs/03) — ядро продукта. Шаг 3: чтение. Композиция: вкладки разделов +
// тулбар + виртуализированная таблица. Всё привязано к активному проекту (pid).
export function TablePage(): ReactNode {
  const pid = useActiveProject((s) => s.activeProjectId) ?? '';

  const namespacesQuery = useNamespaces(pid);
  const namespaces = useMemo(() => namespacesQuery.data ?? [], [namespacesQuery.data]);

  const [activeNsId, setActiveNsId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeNsId && namespaces.length > 0) setActiveNsId(namespaces[0].id);
  }, [namespaces, activeNsId]);

  const activeNs = namespaces.find((n) => n.id === activeNsId) ?? null;

  const languagesQuery = useLanguages(pid);
  const languages = useMemo(() => languagesQuery.data ?? [], [languagesQuery.data]);

  const params = useMemo<RowsParams>(() => ({ pageSize: DEFAULT_PAGE_SIZE }), []);
  const rowsQuery = useRows(pid, activeNsId, params);
  const rows = useMemo(
    () => rowsQuery.data?.pages.flatMap((p) => p.rows) ?? [],
    [rowsQuery.data],
  );
  const total = rowsQuery.data?.pages[0]?.total ?? 0;

  const loadingFirst =
    namespacesQuery.isLoading ||
    (!!activeNsId && (languagesQuery.isLoading || rowsQuery.isLoading));

  function renderRegion(): ReactNode {
    if (loadingFirst) return <TableSkeleton />;
    if (namespaces.length === 0)
      return (
        <EmptyState
          icon={<InboxIcon size={40} />}
          title={t.states.noNamespacesTitle}
          description={t.states.noNamespacesDescription}
        />
      );
    if (rowsQuery.isError)
      return (
        <EmptyState
          icon={<InboxIcon size={40} />}
          title={t.states.errorTitle}
          action={
            <Button variant="secondary" onClick={() => rowsQuery.refetch()}>
              {t.states.retry}
            </Button>
          }
        />
      );
    if (total === 0)
      return (
        <EmptyState
          icon={<InboxIcon size={40} />}
          title={t.states.emptyTitle}
          description={t.states.emptyDescription}
        />
      );
    return (
      <TranslationsTable
        languages={languages}
        rows={rows}
        hasNextPage={!!rowsQuery.hasNextPage}
        isFetchingNextPage={rowsQuery.isFetchingNextPage}
        fetchNextPage={rowsQuery.fetchNextPage}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-baseline gap-3">
        <h1 className="text-xl font-semibold text-ink">{t.title}</h1>
        {activeNs ? <Badge tone="primary">{t.typeBadge[activeNs.type]}</Badge> : null}
        {total > 0 ? <span className="text-sm text-muted">{t.keysCount(total)}</span> : null}
      </div>

      <NamespaceTabs
        pid={pid}
        namespaces={namespaces}
        isLoading={namespacesQuery.isLoading}
        activeId={activeNsId}
        onSelect={setActiveNsId}
      />

      <TableToolbar />

      {renderRegion()}
    </div>
  );
}
