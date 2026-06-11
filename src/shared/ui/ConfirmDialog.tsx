import type { ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

// Диалог подтверждения дизайн-системы: модал + сообщение + отмена/подтверждение.
// Переиспользуемый (удаление языка, удаление участника и т.п.). Тексты — снаружи (i18n).
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  closeLabel,
  danger = false,
  pending = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  closeLabel: string;
  danger?: boolean;
  pending?: boolean;
}): ReactNode {
  return (
    <Modal open={open} onClose={onClose} title={title} closeLabel={closeLabel}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{message}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={pending}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
