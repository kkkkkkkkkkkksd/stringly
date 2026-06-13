import type { ReactNode } from 'react';
import { Button, Select } from '@/shared/ui';
import { KeyIcon, PlusIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';
import type { Language } from '@/entities/language';

const tt = texts.app.table.toolbar;
const tf = texts.app.table.focus;

// Панель выбора того, что редактируем (Column Focus). Целью может быть любой язык, включая
// базовый (на старте проекта заполняем сами исходные строки). Когда цель ≠ база — слева
// показываем эталон (база →); когда редактируем сам базовый язык — пилюли эталона нет.
// Добавление языка — только из рейла языков; здесь рядом с выбором языка — «+ Ключ».
export function LanguageFocusBar({
  baseLang,
  target,
  languages,
  showBase,
  onTargetChange,
  onAddKey,
}: {
  baseLang: Language | null;
  target: Language | null;
  languages: Language[];
  showBase: boolean;
  onTargetChange: (code: string) => void;
  onAddKey: () => void;
}): ReactNode {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showBase && baseLang ? (
        <>
          <span className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-[13px] font-medium text-ink">
            <span className="font-mono text-[11px] text-muted">{baseLang.code}</span>
            {baseLang.name}
            <span className="text-faint">база</span>
          </span>
          <span className="text-faint" aria-hidden="true">
            →
          </span>
        </>
      ) : null}
      <label className="sr-only" htmlFor="focus-target">
        {tf.targetSelect}
      </label>
      <Select
        id="focus-target"
        value={target?.code ?? ''}
        onChange={(e) => onTargetChange(e.target.value)}
        className="w-52"
      >
        {target ? null : <option value="">{tf.noTarget}</option>}
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.code} · {l.name}
            {l.isBase ? ' · база' : ''}
          </option>
        ))}
      </Select>

      <Can perm="keys:add">
        <Button variant="secondary" onClick={onAddKey}>
          <PlusIcon size={16} />
          <KeyIcon size={16} />
          {tt.addKey}
        </Button>
      </Can>
    </div>
  );
}
