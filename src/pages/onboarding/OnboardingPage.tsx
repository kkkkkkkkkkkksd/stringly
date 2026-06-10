import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { texts } from '@/shared/resources/i18n';
import { Button, Card, Input, Logo } from '@/shared/ui';
import { useCreateProject } from '@/features/projects/model/useProjects';
import { useLogout } from '@/features/auth/model/useAuth';

// Онбординг: у аккаунта нет проектов — просим создать первый (только имя). docs/03, экран 3.5.
const t = texts.onboarding;
const schema = z.object({ name: z.string().min(1, t.nameRequired) });
type Values = z.infer<typeof schema>;

export function OnboardingPage(): ReactNode {
  const navigate = useNavigate();
  const create = useCreateProject();
  const logout = useLogout();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) =>
    create.mutate(values.name, { onSuccess: () => navigate('/app/table') });

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Logo size={20} />
        </div>
        <Card>
          <h1 className="text-lg font-semibold text-ink">{t.title}</h1>
          <p className="mt-1 text-[13px] text-muted">{t.subtitle}</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 space-y-3">
            <Input label={t.field} placeholder={t.placeholder} error={errors.name?.message} {...register('name')} />
            <Button type="submit" size="lg" className="w-full" disabled={create.isPending}>
              {create.isPending ? t.submitPending : t.submit}
            </Button>
          </form>
        </Card>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="mx-auto mt-4 block text-xs text-muted hover:text-ink"
        >
          {texts.common.actions.signOut}
        </button>
      </div>
    </div>
  );
}
