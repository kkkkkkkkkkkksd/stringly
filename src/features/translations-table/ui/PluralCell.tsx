import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui';
import { pluralCategories } from '@/shared/core';
import { texts } from '@/shared/resources/i18n';
import type { Cell } from '@/entities/translation';
import { cellKeyOf, useEdits } from '../model/editsStore';

const t = texts.app.table;

const nonEmpty = (forms: Record<string, string>) =>
  Object.fromEntries(Object.entries(forms).filter(([, v]) => v.trim() !== ''));
const normKey = (forms: Record<string, string>): string =>
  JSON.stringify(
    Object.entries(nonEmpty(forms)).sort(([a], [b]) => a.localeCompare(b)),
  );

// Поповер редактирования plural-форм (CLDR) — отдельный вид ячейки для plural-разделов
// (docs/06, docs/08). Категории берём из Intl.PluralRules по языку.
function PluralPopover({
  langCode,
  rtl,
  forms,
  pos,
  onClose,
  onSave,
}: {
  langCode: string;
  rtl: boolean;
  forms: Record<string, string>;
  pos: { top: number; left: number };
  onClose: () => void;
  onSave: (forms: Record<string, string>) => void;
}): ReactNode {
  const cats = pluralCategories(langCode);
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    cats.forEach((c) => (init[c] = forms[c] ?? ''));
    return init;
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: 260, zIndex: 60 }}
      className="rounded-lg border border-[var(--border)] bg-surface p-3 shadow-pop"
    >
      <div className="mb-2 text-xs font-medium text-muted">
        {t.editor.pluralTitle} · {langCode}
      </div>
      <div className="space-y-2">
        {cats.map((c) => (
          <label key={c} className="flex items-center gap-2">
            <span className="w-12 shrink-0 font-mono text-[11px] text-faint">{c}</span>
            <input
              dir={rtl ? 'rtl' : undefined}
              value={draft[c]}
              onChange={(e) => setDraft((d) => ({ ...d, [c]: e.target.value }))}
              className="h-8 w-full rounded-md border border-[var(--border)] bg-surface px-2 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={() => onSave(draft)}>
          {t.editor.done}
        </Button>
      </div>
    </div>,
    document.body,
  );
}

// Ячейка plural-раздела: показывает форму 'other' (свод), клик открывает поповер с формами.
// МЕМОИЗИРОВАНА + точечная подписка на буфер правок.
export const PluralCell = memo(function PluralCell({
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

  const dirty = edit !== undefined;
  const serverForms = server?.plural ?? {};
  const currentForms = dirty ? edit.plural ?? {} : serverForms;
  const display = (currentForms.other ?? currentForms.one ?? '').trim();
  const empty = Object.values(currentForms).every((v) => !v || !v.trim());

  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const begin = () => {
    if (!editable) return;
    const r = ref.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, left: r.left });
    setOpen(true);
  };

  const handleSave = (forms: Record<string, string>) => {
    const cleaned = nonEmpty(forms);
    if (normKey(cleaned) === normKey(serverForms)) removeEdit(cellKey);
    else setEdit(cellKey, { plural: cleaned });
    setOpen(false);
  };

  return (
    <>
      <div
        ref={ref}
        role={editable ? 'button' : undefined}
        tabIndex={editable ? 0 : undefined}
        onClick={begin}
        onKeyDown={(e) => {
          if (editable && e.key === 'Enter') {
            e.preventDefault();
            begin();
          }
        }}
        dir={rtl ? 'rtl' : undefined}
        className={[
          'flex h-full w-full items-center gap-1 px-3 text-sm transition-colors',
          editable ? 'cursor-pointer' : '',
          dirty
            ? 'text-ink'
            : empty
              ? 'bg-[var(--cell-empty)] text-faint group-hover:bg-[var(--cell-empty-hover)]'
              : 'bg-surface text-ink group-hover:bg-[var(--row-hover)]',
        ].join(' ')}
        style={
          dirty
            ? { background: 'var(--cell-dirty-bg)', boxShadow: 'inset 0 0 0 1.5px var(--cell-dirty-border)' }
            : undefined
        }
      >
        <span className="truncate">{empty ? t.emptyCell : display}</span>
        <span className="ml-auto shrink-0 font-mono text-[10px] text-faint">{'{ }'}</span>
      </div>
      {open && pos ? (
        <PluralPopover
          langCode={langCode}
          rtl={rtl}
          forms={currentForms}
          pos={pos}
          onClose={() => setOpen(false)}
          onSave={handleSave}
        />
      ) : null}
    </>
  );
});
