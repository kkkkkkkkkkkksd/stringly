import type { ReactNode } from 'react';
import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import type { ToastItem, ToastTone } from '@/shared/services/toast';

// Тост дизайн-системы (docs/14, §5): tint-фон по семантике + иконка + текст + закрытие.
const toneClass: Record<ToastTone, string> = {
  success: 'bg-[color:var(--success-tint)] text-[color:var(--success-fg)]',
  error: 'bg-[color:var(--danger-tint)] text-[color:var(--danger-fg)]',
  info: 'bg-[color:var(--info-tint)] text-[color:var(--info-fg)]',
};
const toneIcon: Record<ToastTone, (p: { size?: number }) => ReactNode> = {
  success: CheckIcon,
  error: AlertIcon,
  info: InfoIcon,
};

export function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }): ReactNode {
  const Icon = toneIcon[item.tone];
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto flex items-start gap-2.5 rounded-lg px-3.5 py-2.5 shadow-pop ${toneClass[item.tone]}`}
    >
      <span className="mt-0.5 shrink-0">
        <Icon size={18} />
      </span>
      <p className="flex-1 text-sm">{item.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={texts.common.actions.close}
        className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
}
