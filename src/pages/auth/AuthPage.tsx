import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { texts } from '@/shared/resources/i18n';
import { passwordRules } from '@/shared/core';
import { Button, Card, Input, Logo, Segmented } from '@/shared/ui';
import { useLogin, useRegister } from '@/features/auth/model/useAuth';

const t = texts.auth;
type Mode = 'login' | 'register';

const loginSchema = z.object({
  email: z.string().email(t.errors.email),
  password: z.string().min(1, t.errors.passwordRequired),
});
const registerSchema = z
  .object({
    email: z.string().email(t.errors.email),
    password: z
      .string()
      .min(passwordRules.minLength, t.errors.passwordMin)
      .regex(passwordRules.letter, t.errors.passwordLetter)
      .regex(passwordRules.digit, t.errors.passwordDigit),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ['confirm'],
    message: t.errors.confirmMismatch,
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

function ServerError({ error }: { error: unknown }): ReactNode {
  if (!error) return null;
  const message = error instanceof Error ? error.message : texts.common.state.error;
  return (
    <p className="mt-3 rounded-md bg-[color:var(--danger-tint)] px-3 py-2 text-xs text-[color:var(--danger-fg)]">
      {message}
    </p>
  );
}

function LoginForm(): ReactNode {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginValues) =>
    login.mutate(values, { onSuccess: () => navigate('/app') });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <Input label={t.fields.email} type="email" autoComplete="email" placeholder={t.placeholders.email} error={errors.email?.message} {...register('email')} />
      <Input label={t.fields.password} type="password" autoComplete="current-password" placeholder={t.placeholders.password} error={errors.password?.message} {...register('password')} />
      <ServerError error={login.error} />
      <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
        {login.isPending ? t.submit.loginPending : t.submit.login}
      </Button>
    </form>
  );
}

function RegisterForm(): ReactNode {
  const navigate = useNavigate();
  const registerMut = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values: RegisterValues) =>
    registerMut.mutate(
      { email: values.email, password: values.password },
      { onSuccess: () => navigate('/app') },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      <Input label={t.fields.email} type="email" autoComplete="email" placeholder={t.placeholders.email} error={errors.email?.message} {...register('email')} />
      <Input label={t.fields.password} type="password" autoComplete="new-password" placeholder={t.placeholders.passwordNew} error={errors.password?.message} {...register('password')} />
      <Input label={t.fields.confirm} type="password" autoComplete="new-password" placeholder={t.placeholders.password} error={errors.confirm?.message} {...register('confirm')} />
      <ServerError error={registerMut.error} />
      <Button type="submit" size="lg" className="w-full" disabled={registerMut.isPending}>
        {registerMut.isPending ? t.submit.registerPending : t.submit.register}
      </Button>
    </form>
  );
}

// Один экран с переключателем «Вход / Регистрация» (Вариант 1 · Карточка).
export function AuthPage(): ReactNode {
  const { pathname } = useLocation();
  const [mode, setMode] = useState<Mode>(pathname === '/register' ? 'register' : 'login');

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
          <Link to="/">
            <Logo size={20} />
          </Link>
        </div>
        <Card>
          <div className="mb-4">
            <Segmented<Mode>
              value={mode}
              onChange={setMode}
              options={[
                { value: 'login', label: t.tabs.login },
                { value: 'register', label: t.tabs.register },
              ]}
            />
          </div>
          {mode === 'login' ? <LoginForm /> : <RegisterForm />}
        </Card>
      </div>
    </div>
  );
}
