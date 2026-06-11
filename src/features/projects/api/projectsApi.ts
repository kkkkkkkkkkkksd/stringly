import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import { projectSchema } from '@/entities/project';

export const projectsApi = {
  list: async () => z.array(projectSchema).parse(await httpClient.get('/projects')),
  // baseLanguageCode опционален: если не задан в онбординге, бэк ставит базовым английский
  // (docs/06 — у проекта ровно один базовый язык). Доработку логики оставляем на потом.
  // seedDemo — только для mock-режима: заполнить проект демо-данными или создать пустым
  // (симуляция реального нового проекта). Реальный бэк параметр игнорирует.
  create: async (name: string, baseLanguageCode?: string, seedDemo?: boolean) =>
    projectSchema.parse(
      await httpClient.post('/projects', { name, baseLanguageCode, seedDemo }),
    ),
  // Переименование проекта (admin). Бэк обновляет имя и slug, возвращает проект.
  rename: async (pid: string, name: string) =>
    projectSchema.parse(await httpClient.patch(`/projects/${pid}`, { name })),
};
