import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { authApi } from '../api/authApi';
import { useSession } from './sessionStore';

// Хуки auth. Компоненты не дергают api/стор напрямую — только через них.
export function useLogin() {
  const setSession = useSession((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ user, accessToken }) => setSession(accessToken, user),
  });
}

export function useRegister() {
  const setSession = useSession((s) => s.setSession);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ user, accessToken }) => setSession(accessToken, user),
  });
}

export function useMe() {
  const token = useSession((s) => s.token);
  return useQuery({ queryKey: qk.me(), queryFn: authApi.me, enabled: !!token });
}

export function useLogout() {
  const clear = useSession((s) => s.clear);
  const qc = useQueryClient();
  return () => {
    clear();
    qc.clear();
  };
}

// Смена email: на успехе обновляем пользователя в сессии и кэш me.
export function useUpdateEmail() {
  const setUser = useSession((s) => s.setUser);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateEmail,
    onSuccess: (user) => {
      setUser(user);
      qc.setQueryData(qk.me(), user);
    },
  });
}

// Смена пароля: токен бессрочный, повторный вход не требуется (refresh — позже).
export function useUpdatePassword() {
  return useMutation({ mutationFn: authApi.updatePassword });
}
