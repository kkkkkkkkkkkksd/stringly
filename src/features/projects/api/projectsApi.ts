import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import { projectSchema } from '@/entities/project';

export const projectsApi = {
  list: async () => z.array(projectSchema).parse(await httpClient.get('/projects')),
  create: async (name: string) => projectSchema.parse(await httpClient.post('/projects', { name })),
};
