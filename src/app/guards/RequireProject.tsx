import { useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useProjects } from '@/features/projects/model/useProjects';
import { useActiveProject } from '@/features/projects/model/activeProjectStore';

// Требует наличие хотя бы одного проекта. Если их нет — на /onboarding.
// Если активный проект не выбран — выбирает первый.
export function RequireProject({ children }: { children: ReactNode }): ReactNode {
  const { data: projects, isLoading } = useProjects();
  const { activeProjectId, setActiveProject } = useActiveProject();

  const hasActive = !!activeProjectId && !!projects?.some((p) => p.id === activeProjectId);

  useEffect(() => {
    if (projects && projects.length > 0 && !hasActive) {
      setActiveProject(projects[0].id);
    }
  }, [projects, hasActive, setActiveProject]);

  if (isLoading) {
    return <div className="p-8 text-sm text-muted">Загрузка…</div>;
  }
  if (!projects || projects.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}
