import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import { languageSchema } from '@/entities/language';

// Языки проекта — централизованный список, источник колонок таблицы (docs/07).
export const languagesApi = {
  list: async (pid: string) =>
    z.array(languageSchema).parse(await httpClient.get(`/projects/${pid}/languages`)),
  // На будущее (Шаг 4/5): быстрый доступ «+ Язык» и настройки используют один и тот же
  // централизованный список — добавленный язык становится колонкой во всех разделах.
  add: async (pid: string, code: string) =>
    languageSchema.parse(await httpClient.post(`/projects/${pid}/languages`, { code })),
};
