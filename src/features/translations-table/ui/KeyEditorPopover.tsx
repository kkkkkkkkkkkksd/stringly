import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input } from '@/shared/ui';
import { CloseIcon, TrashIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useDeleteKey, useUpdateKey } from '../model/useKeyMutations';

const t = texts.app.table.keyEditor;
const WIDTH = 280;

export type EditingKey = {
  keyId: string;
  code: string;
  comment: string;
  anchor: { left: number; bottom: number };
};

// Поповер управления ключом (вариант C): переименование, комментарий, удаление с
// подтверждением. Правки/удаление применяются сразу (оптимистично, см. useKeyMutations).
export function KeyEditorPopover({
  pid,
  nsid,
  editing,
  onClose,
}: {
  pid: string;
  nsid: string;
  editing: EditingKey;
  onClose: () => void;
}): ReactNode {
  const [code, setCode] = useState(editing.code);
  const [comment, setComment] = useState(editing.comment);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const update = useUpdateKey(pid, nsid);
  const del = useDeleteKey(pid, nsid);

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

  const codeError = code.trim() === '' ? t.codeRequired : '';
  const left = Math.max(8, Math.min(editing.anchor.left, window.innerWidth - WIDTH - 8));
  const top = editing.anchor.bottom + 4;

  const save = () => {
    if (codeError) return;
    const changed = code.trim() !== editing.code || comment.trim() !== editing.comment;
    if (changed) {
      update.mutate(
        { keyId: editing.keyId, code: code.trim(), comment: comment.trim() },
        { onSuccess: onClose },
      );
    } else onClose();
  };

  return createPortal(
    <div
      ref={ref}
      style={{ position: 'fixed', top, left, width: WIDTH, zIndex: 60 }}
      className="rounded-lg border border-[var(--border)] bg-surface p-3 shadow-pop"
    >
      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="rounded p-0.5 text-muted hover:bg-subtle"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <Input
          label={t.codeLabel}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={codeError || undefined}
          placeholder={t.codePlaceholder}
          className="font-mono"
          autoFocus
        />
        <Input
          label={t.commentLabel}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.commentPlaceholder}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 text-sm text-[color:var(--danger)] hover:underline"
          >
            <TrashIcon size={16} />
            {t.delete}
          </button>
        ) : (
          <span />
        )}
        <Button size="sm" onClick={save} disabled={!!codeError || update.isPending}>
          {t.save}
        </Button>
      </div>

      {confirming ? (
        <div className="mt-3 rounded-md border border-[color:var(--danger)] bg-[color:var(--danger-tint)] p-2.5">
          <p className="text-xs text-[color:var(--danger-fg)]">{t.deleteConfirm}</p>
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              {t.cancel}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => del.mutate(editing.keyId, { onSuccess: onClose })}
              disabled={del.isPending}
            >
              {t.confirm}
            </Button>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
