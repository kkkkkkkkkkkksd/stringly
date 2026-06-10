import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthToken } from '@/shared/services/network';
import type { User } from '../api/schemas';

// Сессия: бессрочный access-токен + пользователь. Персистится в localStorage.
// При смене токена синхронизируем HTTP-клиент (setAuthToken).
type SessionState = {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  clear: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        setAuthToken(token);
        set({ token, user });
      },
      clear: () => {
        setAuthToken(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: 'stringly-session',
      onRehydrateStorage: () => (state) => {
        // после восстановления из localStorage — отдать токен HTTP-клиенту
        if (state?.token) setAuthToken(state.token);
      },
    },
  ),
);
