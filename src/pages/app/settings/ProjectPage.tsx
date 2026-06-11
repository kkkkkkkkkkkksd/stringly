import { useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Input, SoonCard } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import { Can } from '@/features/projects/ui/Can';
import { useCurrentProject, usePermission } from '@/features/projects/model/access';
import { useRenameProject } from '@/features/projects/model/useProjects';
import { LanguagesSection } from '@/features/languages/ui/LanguagesSection';

const t = texts.app.settings.project;

const schema = z.object({
  name: z.string().trim().min(1, t.nameRequired).max(25, t.nameTooLong),
});
type Values = z.infer<typeof schema>;

// Настройки → Проект (docs/03, 6.5). Сейчас — переименование; позже сюда же slug,
// базовый язык, формат экспорта, удаление проекта. Изменять может только admin
// (project:manage); остальным поле недоступно (read-only).
export function ProjectPage(): ReactNode {
  const project = useCurrentProject();
  const pid = project?.id ?? '';
  const canManage = usePermission('project:manage');
  const rename = useRenameProject(pid);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), values: { name: project?.name ?? '' } });

  // Сбрасываем флаг успеха при правках (чтобы «успех» не висел после нового ввода).
  useEffect(() => {
    if (isDirty && rename.isSuccess) rename.reset();
  }, [isDirty, rename]);

  const onSubmit = (values: Values) => rename.mutate(values.name, { onSuccess: () => reset(values) });

  return (
    <div className="max-w-2xl space-y-4">
      <header>
        <h2 className="text-lg font-medium text-ink">{t.title}</h2>
        <p className="mt-0.5 text-sm text-muted">{t.subtitle}</p>
      </header>

      <Card>
        <h3 className="text-sm font-medium text-ink">{t.nameTitle}</h3>
        <p className="mb-3 mt-0.5 text-sm text-muted">{t.nameHint}</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <Input
            label={t.nameLabel}
            placeholder={t.namePlaceholder}
            maxLength={25}
            disabled={!canManage}
            error={errors.name?.message}
            {...register('name')}
          />
          {rename.error ? (
            <p className="rounded-md bg-[color:var(--danger-tint)] px-3 py-2 text-xs text-[color:var(--danger-fg)]">
              {rename.error instanceof Error ? rename.error.message : texts.common.state.error}
            </p>
          ) : rename.isSuccess ? (
            <p className="rounded-md bg-[color:var(--success-tint)] px-3 py-2 text-xs text-[color:var(--success-fg)]">
              {t.success}
            </p>
          ) : null}
          {canManage ? (
            <div className="flex justify-end">
              <Button type="submit" disabled={rename.isPending || !isDirty}>
                {rename.isPending ? t.pending : t.submit}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-faint">{t.readOnlyHint}</p>
          )}
        </form>
      </Card>

      {/* Языки проекта — раньше были отдельной вкладкой; перенесены сюда, чтобы не путать
          с языком интерфейса. Тот же централизованный список (features/languages). */}
      <div className="border-t border-[var(--border)] pt-4">
        <LanguagesSection pid={pid} />
      </div>

      {/* Остаток вкладки «Проект» (docs 6.5, v2) — заглушки для admin: slug, формат
          экспорта, опасная зона (удаление проекта). */}
      <Can perm="project:manage">
        <div className="space-y-4 border-t border-[var(--border)] pt-4">
          <SoonCard title={t.slugTitle} text={t.slugText} />
          <SoonCard title={t.exportTitle} text={t.exportText} />
          <SoonCard
            title={t.dangerTitle}
            text={t.dangerText}
            action={
              <Button type="button" variant="danger" disabled>
                {t.dangerBtn}
              </Button>
            }
          />
        </div>
      </Can>
    </div>
  );
}
