import { memo, useRef, type ReactNode } from 'react';
import type { Language } from '@/entities/language';
import type { TableRow } from '@/entities/translation';
import { FocusStringInput } from './FocusStringInput';
import { FocusPluralInput } from './FocusPluralInput';
import { focusGridClass } from './focusGrid';
import type { EditingKey } from './KeyEditorPopover';

// Одна строка редактора Column Focus. МЕМОИЗИРОВАНА — перерисовывается только при смене
// своих данных (точечные подписки — внутри полей перевода).
export const FocusRow = memo(function FocusRow({
  row,
  baseCode,
  target,
  showBase,
  isPlural,
  editable,
  placeholder,
  onEditKey,
}: {
  row: TableRow;
  baseCode: string;
  target: Language;
  showBase: boolean;
  isPlural: boolean;
  editable: boolean;
  placeholder: string;
  onEditKey: (info: EditingKey) => void;
}): ReactNode {
  const keyRef = useRef<HTMLButtonElement>(null);
  const baseValue = row.values[baseCode]?.value ?? '';
  const targetCell = row.values[target.code];
  const filled = isPlural
    ? Object.values(targetCell?.plural ?? {}).some((v) => v.trim() !== '')
    : (targetCell?.value ?? '').trim() !== '';

  const emitEdit = () => {
    const r = keyRef.current?.getBoundingClientRect();
    onEditKey({
      keyId: row.keyId,
      code: row.code,
      comment: row.comment ?? '',
      anchor: { left: r?.left ?? 0, bottom: r?.bottom ?? 0 },
    });
  };

  return (
    <div className={`${focusGridClass(showBase)} border-b border-[var(--border)] hover:bg-[var(--row-hover)]`}>
      <div className="flex min-w-0 flex-col gap-1 border-r border-[var(--border)] px-4 py-3">
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: filled ? 'var(--success)' : 'var(--border-strong)' }}
          />
          <button
            ref={keyRef}
            type="button"
            onClick={editable ? emitEdit : undefined}
            disabled={!editable}
            className={[
              'truncate font-mono text-[12.5px] text-[color:var(--primary-hover)]',
              editable ? 'cursor-pointer hover:underline' : 'cursor-default',
            ].join(' ')}
            title={row.code}
          >
            {row.code}
          </button>
        </span>
        {row.comment ? (
          <span className="break-words pl-4 text-[11px] leading-snug text-faint">{row.comment}</span>
        ) : null}
      </div>

      {showBase ? (
        <div className="min-w-0 whitespace-pre-wrap break-words border-r border-[var(--border)] px-4 py-3 text-sm text-muted">
          {baseValue || <span className="text-faint">—</span>}
        </div>
      ) : null}

      <div className="min-w-0 px-2 py-2">
        {isPlural ? (
          <FocusPluralInput
            keyId={row.keyId}
            langCode={target.code}
            server={targetCell}
            rtl={target.rtl}
            editable={editable}
            ai={!!targetCell?.ai}
          />
        ) : (
          <FocusStringInput
            keyId={row.keyId}
            langCode={target.code}
            serverValue={targetCell?.value ?? ''}
            rtl={target.rtl}
            editable={editable}
            placeholder={placeholder}
            ai={!!targetCell?.ai}
          />
        )}
      </div>
    </div>
  );
});
