import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Modal, ToggleField } from '@/shared/ui';
import { SparkleIcon } from '@/shared/resources/assets';
import { texts } from '@/shared/resources/i18n';
import { useLanguages } from '@/features/languages/model/useLanguages';
import { useAddKey } from '../model/useAddKey';

const t = texts.app.table.addKey;
const schema = z.object({
  code: z.string().trim().min(1, t.codeRequired),
  baseValue: z.string().trim().min(1, t.baseRequired),
  comment: z.string().trim().optional(),
});
type FormValues = z.infer<typeof schema>;

// Выбор AI-доперевода запоминается между ключами в рамках сессии (sticky), чтобы при
// массовом добавлении не переключать каждый раз.
let stickyAi = true;

// «+ Ключ»: код + обязательный базовый перевод + (при ≥2 языках) свитч AI-доперевода
// остальных языков. После добавления раздел инвалидируется (строки + прогресс).
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
  const { data: langs } = useLanguages(pid);
  const languages = langs ?? [];
  const baseLang = languages.find((l) => l.isBase) ?? languages[0] ?? null;
  const hasTargets = languages.length > 1;

  const add = useAddKey(pid, nsid);
  const [ai, setAi] = useState(stickyAi);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', baseValue: '', comment: '' },
  });

  const close = () => {
    reset();
    add.reset();
    onClose();
  };
  const submit = handleSubmit((v) =>
    add.mutate(
      { code: v.code, baseValue: v.baseValue, comment: v.comment || undefined, ai: hasTargets && ai },
      { onSuccess: close },
    ),
  );

  const setAiSticky = (value: boolean) => {
    stickyAi = value;
    setAi(value);
  };

  return (
    <Modal open={open} onClose={close} title={t.title} closeLabel={t.close}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label={t.codeLabel}
          placeholder={t.codePlaceholder}
          autoFocus
          className="font-mono"
          error={errors.code?.message}
          {...register('code')}
        />
        <Input
          label={t.baseLabel(baseLang?.code ?? '—')}
          placeholder={t.basePlaceholder}
          error={errors.baseValue?.message}
          {...register('baseValue')}
        />
        <Input label={t.commentLabel} placeholder={t.commentPlaceholder} {...register('comment')} />

        {hasTargets ? (
          <ToggleField
            icon={<SparkleIcon size={15} />}
            label={t.aiSwitch}
            hint={t.aiSwitchHint}
            checked={ai}
            onChange={setAiSticky}
          />
        ) : null}

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
