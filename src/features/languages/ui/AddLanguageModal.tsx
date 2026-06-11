import { useState, type ReactNode } from 'react';
import { Button, Modal, Select } from '@/shared/ui';
import { LOCALE_OPTIONS } from '@/shared/core';
import { texts } from '@/shared/resources/i18n';
import { useLanguages } from '../model/useLanguages';
import { useAddLanguage } from '../model/useAddLanguage';

const t = texts.app.table.addLanguage;

// «+ Язык»: выбор ISO-локали. Централизованно → колонка появляется во всех разделах.
// Переиспользуется в быстром доступе таблицы и в настройках языков (Шаг 5).
export function AddLanguageModal({
  pid,
  open,
  onClose,
}: {
  pid: string;
  open: boolean;
  onClose: () => void;
}): ReactNode {
  const { data: langs } = useLanguages(pid);
  const existing = new Set((langs ?? []).map((l) => l.code));
  const options = LOCALE_OPTIONS.filter((o) => !existing.has(o.code));

  const [code, setCode] = useState('');
  const value = code || options[0]?.code || '';
  const add = useAddLanguage(pid);

  const close = () => {
    setCode('');
    add.reset();
    onClose();
  };
  const submit = () => {
    if (value) add.mutate(value, { onSuccess: close });
  };

  return (
    <Modal open={open} onClose={close} title={t.title} closeLabel={t.close}>
      <div className="space-y-4">
        <Select label={t.label} value={value} onChange={(e) => setCode(e.target.value)}>
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.name} ({o.code}){o.rtl ? ' · RTL' : ''}
            </option>
          ))}
        </Select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close}>
            {texts.common.actions.cancel}
          </Button>
          <Button onClick={submit} disabled={add.isPending || !value}>
            {t.submit}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
