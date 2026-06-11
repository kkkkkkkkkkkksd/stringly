import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui';
import { DotsVerticalIcon, TrashIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';

const t = texts.app.table.langMenu;
const MENU_WIDTH = 220;

// Меню действий с языковой колонкой (вариант A): «⋮» в заголовке → «Удалить язык»
// с подтверждением. Само удаление делает родитель (onDelete) — слой languages.
export function LangHeaderMenu({ code, onDelete }: { code: string; onDelete: () => void }): ReactNode {
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };
  const openMenu = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 4, left: Math.max(8, r.right - MENU_WIDTH) });
    setConfirming(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || btnRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={t.trigger}
        onClick={openMenu}
        className="ml-auto rounded p-0.5 text-muted hover:bg-[var(--bg-hover)]"
      >
        <DotsVerticalIcon size={16} />
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_WIDTH, zIndex: 60 }}
              className="rounded-lg border border-[var(--border)] bg-surface p-1.5 shadow-pop"
            >
              {!confirming ? (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-[color:var(--danger)] hover:bg-subtle"
                >
                  <TrashIcon size={16} />
                  {t.delete}
                </button>
              ) : (
                <div className="p-1.5">
                  <p className="mb-2 text-xs text-[color:var(--danger-fg)]">{t.confirm(code)}</p>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                      {t.cancel}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        onDelete();
                        close();
                      }}
                    >
                      {t.confirmBtn}
                    </Button>
                  </div>
                </div>
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
