import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from '@/shared/resources/assets';

// Модал дизайн-системы (docs/14, §5): карточка-поверхность, радиус lg, поповер-тень,
// затемнённый оверлей. Закрытие по Esc и клику по фону. Переиспользуемый.
export function Modal({
  open,
  onClose,
  title,
  children,
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel: string;
}): ReactNode {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,23,.45)] p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-lg border border-[var(--border)] bg-surface p-5 shadow-pop"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="rounded-md p-1 text-muted hover:bg-subtle"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
