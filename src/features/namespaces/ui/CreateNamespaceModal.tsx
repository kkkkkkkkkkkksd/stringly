import type { ReactNode } from 'react';
import { Modal } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import { NamespaceForm } from './NamespaceForm';

const t = texts.app.table.createNamespace;

// Создание раздела: название + выбор типа (strings | plurals). Тип влияет на вид ячейки
// (plurals — формы CLDR). Форма вынесена в NamespaceForm (переиспользуется в менеджере).
// Modal размонтирует содержимое при закрытии → форма каждый раз открывается чистой.
export function CreateNamespaceModal({
  pid,
  open,
  onClose,
  onCreated,
}: {
  pid: string;
  open: boolean;
  onClose: () => void;
  onCreated: (namespaceId: string) => void;
}): ReactNode {
  return (
    <Modal open={open} onClose={onClose} title={t.title} closeLabel={t.close}>
      <NamespaceForm
        pid={pid}
        onCreated={(id) => {
          onCreated(id);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
