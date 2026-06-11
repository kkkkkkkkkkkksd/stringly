import type { ReactNode } from 'react';
import { Button } from '@/shared/ui';
import { FilterIcon, KeyIcon, LanguageIcon, PlusIcon, SearchIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';

const tt = texts.app.table.toolbar;

// Тулбар таблицы. Поиск/Фильтр — видимый, но неактивный UI (следующая итерация, docs/07).
// «+ Ключ» / «+ Язык» активны (Шаг 4), скрыты от ролей без прав через <Can>.
// Сохранение вынесено в плавающую панель снизу (SaveBar).
export function TableToolbar({
  onAddKey,
  onAddLanguage,
}: {
  onAddKey: () => void;
  onAddLanguage: () => void;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative" title={tt.searchSoon}>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint">
          <SearchIcon size={16} />
        </span>
        <input
          type="search"
          disabled
          placeholder={tt.searchPlaceholder}
          className="h-9 w-56 cursor-not-allowed rounded-md border border-[var(--border)] bg-surface pl-8 pr-3 text-sm text-ink opacity-50 placeholder:text-faint"
        />
      </div>
      <button
        type="button"
        disabled
        title={tt.searchSoon}
        className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-md border border-[var(--border)] bg-surface px-3 text-sm text-muted opacity-50"
      >
        <FilterIcon size={16} />
        {tt.filter}
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Can perm="keys:add">
          <Button variant="secondary" onClick={onAddKey}>
            <PlusIcon size={16} />
            <KeyIcon size={16} />
            {tt.addKey}
          </Button>
        </Can>
        <Can perm="lang:manage">
          <Button variant="secondary" onClick={onAddLanguage}>
            <PlusIcon size={16} />
            <LanguageIcon size={16} />
            {tt.addLanguage}
          </Button>
        </Can>
      </div>
    </div>
  );
}
