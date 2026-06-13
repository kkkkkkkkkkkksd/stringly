import { memo, type ReactNode } from 'react';
import { pluralCategories } from '@/shared/core';
import { texts } from '@/shared/resources/i18n';
import type { Cell } from '@/entities/translation';
import { cellKeyOf, useEdits } from '../model/editsStore';

const t = texts.app.table.focus;

const nonEmpty = (forms: Record<string, string>) =>
  Object.fromEntries(Object.entries(forms).filter(([, v]) => v.trim() !== ''));

// Поле перевода plural-ключа (Column Focus): поле на каждую CLDR-категорию языка
// (one/other/…) — все формы видны сразу, без поповера. Точечная подписка + мемо.
export const FocusPluralInput = memo(function FocusPluralInput({
  keyId,
  langCode,
  server,
  rtl,
  editable,
}: {
  keyId: string;
  langCode: string;
  server: Cell | undefined;
  rtl: boolean;
  editable: boolean;
}): ReactNode {
  const cellKey = cellKeyOf(keyId, langCode);
  const edit = useEdits((s) => s.edits[cellKey]);
  const setEdit = useEdits((s) => s.setEdit);
  const removeEdit = useEdits((s) => s.removeEdit);

  const cats = pluralCategories(langCode);
  const serverForms = server?.plural ?? {};
  const forms = edit?.plural ?? serverForms;

  const change = (cat: string, v: string) => {
    const next = { ...forms, [cat]: v };
    const cleaned = nonEmpty(next);
    const serverCleaned = nonEmpty(serverForms);
    if (JSON.stringify(cleaned) === JSON.stringify(serverCleaned)) removeEdit(cellKey);
    else setEdit(cellKey, { plural: cleaned });
  };

  return (
    <div className="space-y-1.5">
      {cats.map((cat) => {
        const dirty = edit !== undefined;
        return (
          <label key={cat} className="flex items-start gap-2">
            <span className="mt-2 w-12 shrink-0 font-mono text-[11px] text-faint">{t.pluralLabel(cat)}</span>
            <input
              dir={rtl ? 'rtl' : undefined}
              value={forms[cat] ?? ''}
              readOnly={!editable}
              onChange={(e) => change(cat, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  removeEdit(cellKey);
                  e.currentTarget.blur();
                }
              }}
              className={[
                'h-9 w-full rounded-md border bg-transparent px-3 text-sm text-ink',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
                editable ? 'hover:bg-page' : '',
                dirty ? 'border-[color:var(--cell-dirty-border)] bg-[var(--cell-dirty-bg)]' : 'border-transparent',
              ].join(' ')}
            />
          </label>
        );
      })}
    </div>
  );
});
