import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Segmented } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import type { NamespaceType } from '@/entities/namespace';
import { useCreateNamespace } from '../model/useNamespaces';

const t = texts.app.table.createNamespace;

const schema = z.object({
  name: z.string().trim().min(1, t.nameRequired).max(20, t.nameTooLong),
});
type FormValues = z.infer<typeof schema>;

// Форма создания раздела (название + тип strings|plurals). Без Modal-обёртки —
// переиспользуется в модалке создания и в менеджере разделов (не дублируем логику).
export function NamespaceForm({
  pid,
  onCreated,
  onCancel,
}: {
  pid: string;
  onCreated: (namespaceId: string) => void;
  onCancel?: () => void;
}): ReactNode {
  const [type, setType] = useState<NamespaceType>('strings');
  const create = useCreateNamespace(pid);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '' } });

  const submit = handleSubmit((values) =>
    create.mutate({ name: values.name, type }, { onSuccess: (ns) => onCreated(ns.id) }),
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <Input
        label={t.nameLabel}
        placeholder={t.namePlaceholder}
        maxLength={20}
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
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            {texts.common.actions.cancel}
          </Button>
        ) : null}
        <Button type="submit" disabled={create.isPending}>
          {t.submit}
        </Button>
      </div>
    </form>
  );
}
