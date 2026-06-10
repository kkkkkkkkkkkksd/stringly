import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import {
  authResponseSchema,
  userSchema,
  type LoginPayload,
  type RegisterPayload,
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
};
