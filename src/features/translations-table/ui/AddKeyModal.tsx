import { type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import { useAddKey } from '../model/useAddKey';

const t = texts.app.table.addKey;
const schema = z.object({
  code: z.string().trim().min(1, t.codeRequired),
  comment: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;

// «+ Ключ»: code + комментарий. После добавления строки раздела инвалидируются.
export function AddKeyModal({
  pid,
  nsid,
  open,
  onClose,
}: {
  pid: string;
  nsid: string;
  open: boolean;
  onClose: () => void;
}): ReactNode {
  const add = useAddKey(pid, nsid);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { code: '', comment: '' } });

  const close = () => {
    reset();
    add.reset();
    onClose();
  };
  const submit = handleSubmit((v) =>
    add.mutate({ code: v.code, comment: v.comment || undefined }, { onSuccess: close }),
  );

  return (
    <Modal open={open} onClose={close} title={t.title} closeLabel={t.close}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label={t.codeLabel}
          placeholder={t.codePlaceholder}
          autoFocus
          error={errors.code?.message}
          {...register('code')}
        />
        <Input label={t.commentLabel} placeholder={t.commentPlaceholder} {...register('comment')} />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={close}>
            {texts.common.actions.cancel}
          </Button>
          <Button type="submit" disabled={add.isPending}>
            {t.submit}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
