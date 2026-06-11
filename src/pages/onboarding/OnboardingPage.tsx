import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { texts } from '@/shared/resources/i18n';
import { Button, Card, Input, Logo } from '@/shared/ui';
import { useCreateProject } from '@/features/projects/model/useProjects';
import { useLogout } from '@/features/auth/model/useAuth';
import { useSession } from '@/features/auth/model/sessionStore';

// Онбординг: у аккаунта нет проектов — просим создать первый. docs/03, экран 3.5.
// «Пропустить» создаёт проект с дефолтным именем (переименование — позже в настройках).
const t = texts.onboarding;
const schema = z.object({
  name: z.string().trim().min(1, t.nameRequired).max(25, t.nameTooLong),
});
type Values = z.infer<typeof schema>;

export function OnboardingPage(): ReactNode {
  const navigate = useNavigate();
  const create = useCreateProject();
  const logout = useLogout();
  const email = useSession((s) => s.user?.email);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const goToApp = () => navigate('/app/table');
  const onSubmit = (values: Values) => create.mutate(values.name, { onSuccess: goToApp });
  const onSkip = () => create.mutate(t.defaultName, { onSuccess: goToApp });

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-5 flex justify-center">
          <Logo size={24} />
        </div>
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-ink">{t.title}</h1>
          <p className="mt-1.5 text-sm text-muted">{t.subtitle}</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5 space-y-3.5">
            <Input inputSize="lg" label={t.field} placeholder={t.placeholder} maxLength={25} error={errors.name?.message} {...register('name')} />
            <Button type="submit" size="xl" className="w-full" disabled={create.isPending}>
              {create.isPending ? t.submitPending : t.submit}
            </Button>
          </form>
          <button
            type="button"
            onClick={onSkip}
            disabled={create.isPending}
            className="mt-3 block w-full text-center text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {t.skip}
          </button>
        </Card>
        <p className="mt-4 text-center text-xs text-faint">
          {t.signedInAs} {email} ·{' '}
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-muted hover:text-ink"
          >
            {texts.common.actions.signOut}
          </button>
        </p>
      </div>
    </div>
  );
}
