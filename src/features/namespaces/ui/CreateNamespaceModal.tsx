import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal, Segmented } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import type { NamespaceType } from '@/entities/namespace';
import { useCreateNamespace } from '../model/useNamespaces';

const t = texts.app.table.createNamespace;

const schema = z.object({ name: z.string().trim().min(1, t.nameRequired) });
type FormValues = z.infer<typeof schema>;

// Создание раздела: название + выбор типа (strings | plurals). Тип влияет на вид ячейки
// (plurals — формы CLDR на Шаге 4). После создания родитель переключается на новый раздел.
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
  const [type, setType] = useState<NamespaceType>('strings');
  const create = useCreateNamespace(pid);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '' } });

  const close = () => {
    reset();
    setType('strings');
    create.reset();
    onClose();
  };

  const submit = handleSubmit((values) => {
    create.mutate(
      { name: values.name, type },
      {
        onSuccess: (ns) => {
          onCreated(ns.id);
          close();
        },
      },
    );
  });

  return (
    <Modal open={open} onClose={close} title={t.title} closeLabel={t.close}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label={t.nameLabel}
          placeholder={t.namePlaceholder}
          autoFocus
          error={errors.name?.message}
          {...register('name')}
        />
        <div>
          <span className="mb-1.5 block text-xs text-muted">{t.typeLabel}</span>
          <Segmented<NamespaceType>
            value={type}
            onChange={setType}
            options={[
              { value: 'strings', label: t.typeStrings },
              { value: 'plurals', label: t.typePlurals },
            ]}
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={close}>
            {texts.common.actions.cancel}
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {t.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
