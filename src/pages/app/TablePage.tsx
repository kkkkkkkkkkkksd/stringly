import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge, Button, EmptyState, Skeleton } from '@/shared/ui';
import { InboxIcon, PlusIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useActiveProject } from '@/features/projects/model/activeProjectStore';
import { usePermission } from '@/features/projects/model/access';
import { useNamespaces } from '@/features/namespaces/model/useNamespaces';
import { NamespaceTabs } from '@/features/namespaces/ui/NamespaceTabs';
import { CreateNamespaceModal } from '@/features/namespaces/ui/CreateNamespaceModal';
import { useLanguages } from '@/features/languages/model/useLanguages';
import { AddLanguageModal } from '@/features/languages/ui/AddLanguageModal';
import { AddKeyModal } from '@/features/translations-table/ui/AddKeyModal';
import { KeyEditorPopover, type EditingKey } from '@/features/translations-table/ui/KeyEditorPopover';
import { SaveBar } from '@/features/translations-table/ui/SaveBar';
import { LanguageFocusBar } from '@/features/translations-table/ui/LanguageFocusBar';
import { FocusEditor } from '@/features/translations-table/ui/FocusEditor';
import { LanguageProgressRail } from '@/features/translations-table/ui/LanguageProgressRail';
import { useRows } from '@/features/translations-table/model/useRows';
import { useEditsCount } from '@/features/translations-table/model/editsStore';
import { useUnsavedGuard } from '@/features/translations-table/model/useUnsavedGuard';
import { useLanguageProgress } from '@/features/translations-table/model/useLanguageProgress';
import { DEFAULT_PAGE_SIZE, type RowsParams } from '@/features/translations-table/model/rowsParams';

const t = texts.app.table;
const tf = t.focus;

// Скелет редактора на время первой загрузки строк/языков.
function EditorSkeleton(): ReactNode {
  return (
    <div className="min-h-0 flex-1 space-y-2 rounded-lg border border-[var(--border)] bg-surface p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// Экран 5 (docs/03) — ядро продукта. Реализация Column Focus: база (эталон) → один
// целевой язык, без горизонтального скролла; справа рейл прогресса по языкам. Всё
// привязано к активному проекту (pid). Данные/правки — через фичу translations-table.
export function TablePage(): ReactNode {
  const pid = useActiveProject((s) => s.activeProjectId) ?? '';

  const namespacesQuery = useNamespaces(pid);
  const namespaces = useMemo(() => namespacesQuery.data ?? [], [namespacesQuery.data]);

  const [activeNsId, setActiveNsId] = useState<string | null>(null);
  useEffect(() => {
    if (!activeNsId && namespaces.length > 0) setActiveNsId(namespaces[0].id);
  }, [namespaces, activeNsId]);

  const activeNs = namespaces.find((n) => n.id === activeNsId) ?? null;
  const isPlural = activeNs?.type === 'plurals';

  const editable = usePermission('table:write');
  const canAddKey = usePermission('keys:add');
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const [addLangOpen, setAddLangOpen] = useState(false);
  const [createNsOpen, setCreateNsOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<EditingKey | null>(null);

  useUnsavedGuard(useEditsCount() > 0);

  const languagesQuery = useLanguages(pid);
  const languages = useMemo(() => languagesQuery.data ?? [], [languagesQuery.data]);
  const baseLang = languages.find((l) => l.isBase) ?? languages[0] ?? null;

  // Язык, который редактируем. По умолчанию — первый неосновной; если других языков нет,
  // редактируем сам базовый (на старте проекта заполняем исходные строки). Сбрасываем,
  // если выбранный язык удалён из проекта.
  const [targetCode, setTargetCode] = useState<string | null>(null);
  useEffect(() => {
    if (languages.length === 0) {
      if (targetCode !== null) setTargetCode(null);
      return;
    }
    const stillValid = targetCode && languages.some((l) => l.code === targetCode);
    if (!stillValid) {
      const def = languages.find((l) => !l.isBase) ?? baseLang;
      setTargetCode(def?.code ?? null);
    }
  }, [languages, targetCode, baseLang]);
  const target = languages.find((l) => l.code === targetCode) ?? null;
  // Колонку-эталон показываем, только когда редактируем не базовый язык (иначе дубль).
  const showBase = !!baseLang && !!target && target.code !== baseLang.code;

  const progressQuery = useLanguageProgress(pid, activeNsId);
  const progress = useMemo(() => progressQuery.data ?? [], [progressQuery.data]);

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

  function renderEditorArea(): ReactNode {
    if (loadingFirst) return <EditorSkeleton />;
    if (namespaces.length === 0)
      return (
        <EmptyState
          icon={<InboxIcon size={40} />}
          title={t.states.noNamespacesTitle}
          description={t.states.noNamespacesDescription}
          action={
            canAddKey ? (
              <Button onClick={() => setCreateNsOpen(true)}>
                <PlusIcon size={16} />
                {t.namespaces.addBtn}
              </Button>
            ) : undefined
          }
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
          action={
            canAddKey ? (
              <Button onClick={() => setAddKeyOpen(true)}>
                <PlusIcon size={16} />
                {t.toolbar.addKey}
              </Button>
            ) : undefined
          }
        />
      );
    if (!target) return <EmptyState icon={<InboxIcon size={40} />} title={tf.noTarget} />;
    return (
      <FocusEditor
        rows={rows}
        baseCode={baseLang?.code ?? target.code}
        target={target}
        showBase={showBase}
        isPlural={isPlural}
        editable={editable}
        onEditKey={setEditingKey}
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
        onActiveRemoved={() => setActiveNsId(null)}
        onCreate={() => setCreateNsOpen(true)}
      />

      {activeNsId ? (
        <LanguageFocusBar
          baseLang={baseLang}
          target={target}
          languages={languages}
          showBase={showBase}
          onTargetChange={setTargetCode}
          onAddKey={() => setAddKeyOpen(true)}
        />
      ) : null}

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="flex min-h-0 flex-1 flex-col">{renderEditorArea()}</div>
        {namespaces.length > 0 ? (
          <LanguageProgressRail
            progress={progress}
            isLoading={progressQuery.isLoading}
            targetCode={targetCode}
            onSelect={setTargetCode}
            onAddLanguage={() => setAddLangOpen(true)}
          />
        ) : null}
      </div>

      {activeNsId && target ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
          <span>{tf.keyboard.move}</span>
          <span>{tf.keyboard.newline}</span>
          <span>{tf.keyboard.revert}</span>
          <span>{tf.keyboard.save}</span>
        </div>
      ) : null}

      {activeNsId ? (
        <AddKeyModal
          pid={pid}
          nsid={activeNsId}
          open={addKeyOpen}
          onClose={() => setAddKeyOpen(false)}
        />
      ) : null}
      <AddLanguageModal pid={pid} open={addLangOpen} onClose={() => setAddLangOpen(false)} />

      <CreateNamespaceModal
        pid={pid}
        open={createNsOpen}
        onClose={() => setCreateNsOpen(false)}
        onCreated={setActiveNsId}
      />

      {editingKey && activeNsId ? (
        <KeyEditorPopover
          pid={pid}
          nsid={activeNsId}
          editing={editingKey}
          onClose={() => setEditingKey(null)}
        />
      ) : null}

      <SaveBar pid={pid} />
    </div>
  );
}
