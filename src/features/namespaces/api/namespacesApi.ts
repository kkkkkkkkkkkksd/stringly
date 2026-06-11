import { z } from 'zod';
import { httpClient } from '@/shared/services/network';
import { namespaceSchema, type NamespaceType } from '@/entities/namespace';

// Разделы (namespaces) проекта — вкладки таблицы (docs/07).
export const namespacesApi = {
  list: async (pid: string) =>
    z.array(namespaceSchema).parse(await httpClient.get(`/projects/${pid}/namespaces`)),
  create: async (pid: string, input: { name: string; type: NamespaceType }) =>
    namespaceSchema.parse(await httpClient.post(`/projects/${pid}/namespaces`, input)),
};
