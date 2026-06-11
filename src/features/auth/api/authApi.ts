import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import {
  authResponseSchema,
  userSchema,
  type LoginPayload,
  type RegisterPayload,
  type UpdateEmailPayload,
  type UpdatePasswordPayload,
} from './schemas';

// Доступ к auth-эндпоинтам. Ответы валидируются Zod (ловим расхождения с бэком рано).
export const authApi = {
  register: async (payload: RegisterPayload) =>
    authResponseSchema.parse(await httpClient.post('/auth/register', payload)),

  login: async (payload: LoginPayload) =>
    authResponseSchema.parse(await httpClient.post('/auth/login', payload)),

  me: async () => {
    const data = await httpClient.get('/auth/me');
    return z.object({ user: userSchema }).parse(data).user;
  },

  // Смена email: бэк проверяет занятость; возвращает обновлённого пользователя.
  updateEmail: async (payload: UpdateEmailPayload) => {
    const data = await httpClient.patch('/auth/email', payload);
    return z.object({ user: userSchema }).parse(data).user;
  },

  // Смена пароля: бэк проверяет текущий пароль. Тело ответа не нужно (204).
  updatePassword: async (payload: UpdatePasswordPayload) =>
    httpClient.patch<void>('/auth/password', payload),
};
