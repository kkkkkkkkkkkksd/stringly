import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Card, Input, SoonCard } from '@/shared/ui';
import { formatDate, passwordRules } from '@/shared/core';
import { texts } from '@/shared/resources/i18n';
import { useSession } from '@/features/auth/model/sessionStore';
import { useUpdateEmail, useUpdatePassword } from '@/features/auth/model/useAuth';

const t = texts.app.settings.profile;

// Заметка под формой: ошибка сервера (danger) или успех (success).
function Note({ error, success }: { error?: unknown; success?: string }): ReactNode {
  if (error) {
    const message = error instanceof Error ? error.message : texts.common.state.error;
    return (
      <p className="rounded-md bg-[color:var(--danger-tint)] px-3 py-2 text-xs text-[color:var(--danger-fg)]">
        {message}
      </p>
    );
  }
  if (success) {
    return (
      <p className="rounded-md bg-[color:var(--success-tint)] px-3 py-2 text-xs text-[color:var(--success-fg)]">
        {success}
      </p>
    );
  }
  return null;
}

// Смена email. Нельзя сохранить тот же адрес (refine с текущим email).
function ChangeEmailForm({ currentEmail }: { currentEmail: string }): ReactNode {
  const te = t.email;
  const update = useUpdateEmail();
  const schema = z.object({
    email: z
      .string()
      .email(te.invalid)
      .refine((v) => v.toLowerCase() !== currentEmail.toLowerCase(), te.same),
  });
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) => update.mutate({ email: values.email });

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-ink">{te.title}</h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <Input
          label={te.label}
          type="email"
          autoComplete="email"
          placeholder={te.placeholder}
          error={errors.email?.message}
          {...register('email')}
        />
        <Note error={update.error} success={update.isSuccess ? te.success : undefined} />
        <div className="flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? te.pending : te.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Смена пароля: текущий + новый (правила из core) + повтор.
function ChangePasswordForm(): ReactNode {
  const tp = t.password;
  const update = useUpdatePassword();
  const schema = z
    .object({
      currentPassword: z.string().min(1, tp.currentRequired),
      newPassword: z
        .string()
        .min(passwordRules.minLength, tp.min)
        .regex(passwordRules.letter, tp.letter)
        .regex(passwordRules.digit, tp.digit),
      confirm: z.string(),
    })
    .refine((d) => d.newPassword === d.confirm, { path: ['confirm'], message: tp.mismatch });
  type Values = z.infer<typeof schema>;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) =>
    update.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: () => reset() },
    );

  return (
    <Card>
      <h3 className="mb-3 text-sm font-medium text-ink">{tp.title}</h3>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
        <Input
          label={tp.currentLabel}
          type="password"
          autoComplete="current-password"
          placeholder={tp.placeholder}
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <Input
          label={tp.newLabel}
          type="password"
          autoComplete="new-password"
          placeholder={tp.placeholderNew}
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label={tp.confirmLabel}
          type="password"
          autoComplete="new-password"
          placeholder={tp.placeholder}
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <Note error={update.error} success={update.isSuccess ? tp.success : undefined} />
        <div className="flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? tp.pending : tp.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Настройки → Профиль (docs/03, 6.4): информация об аккаунте + смена email и пароля.
// У аккаунта нет имени (имя — у проекта); сессия — бессрочный токен (refresh — позже).
export function ProfilePage(): ReactNode {
  const user = useSession((s) => s.user);

  return (
    <div className="max-w-2xl space-y-4">
      <header>
        <h2 className="text-lg font-medium text-ink">{t.title}</h2>
        <p className="mt-0.5 text-sm text-muted">{t.subtitle}</p>
      </header>

      <Card>
        <h3 className="mb-3 text-sm font-medium text-ink">{t.account.title}</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t.account.emailLabel}</dt>
            <dd className="truncate text-ink">{user?.email}</dd>
          </div>
          {user?.createdAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.account.createdLabel}</dt>
              <dd className="text-ink">{formatDate(user.createdAt)}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      {user ? <ChangeEmailForm currentEmail={user.email} /> : null}
      <ChangePasswordForm />

      {/* Заглушка: завершение всех сессий — требует refresh-токенов (later). */}
      <SoonCard title={t.sessions.title} text={t.sessions.text} />
    </div>
  );
}
