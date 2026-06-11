import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qk } from '@/shared/api/queryKeys';
import { projectsApi } from '../api/projectsApi';
import type { Project } from '@/entities/project';
import { useActiveProject } from './activeProjectStore';

export function useProjects() {
  return useQuery({ queryKey: qk.projects, queryFn: projectsApi.list });
}

export function useCreateProject() {
  const qc = useQueryClient();
  const setActiveProject = useActiveProject((s) => s.setActiveProject);
  return useMutation({
    mutationFn: ({
      name,
      baseLanguageCode,
      seedDemo,
    }: {
      name: string;
      baseLanguageCode?: string;
      seedDemo?: boolean;
    }) => projectsApi.create(name, baseLanguageCode, seedDemo),
    onSuccess: (project) => {
      // Сразу обновляем кэш проектов, чтобы гард RequireProject увидел новый проект
      // мгновенно (без гонки со «старым пустым» кэшем), затем подтверждаем рефетчем.
      setActiveProject(project.id);
      qc.setQueryData<Project[]>(qk.projects, (old) => (old ? [...old, project] : [project]));
      qc.invalidateQueries({ queryKey: qk.projects });
    },
  });
}

// Переименование проекта (admin, <Can perm="project:manage">). Обновляем кэш списка
// проектов, чтобы новое имя сразу отобразилось в переключателе/сайдбаре.
export function useRenameProject(pid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => projectsApi.rename(pid, name),
    onSuccess: (project) => {
      qc.setQueryData<Project[]>(qk.projects, (old) =>
        old ? old.map((p) => (p.id === project.id ? project : p)) : old,
      );
      qc.invalidateQueries({ queryKey: qk.projects });
    },
  });
}
