import type { ReactNode } from 'react';
import { texts } from '@/shared/resources/i18n';
import { InitialAvatar } from '@/shared/ui';
import { useCurrentProject } from '../model/access';

// Переключатель проектов — ЗАГЛУШКА (Шаг 2): показывает активный проект, переключение и
// «+ Проект» пока неактивны. Структура готова к включению мультипроектности (Шаг позже).
export function ProjectSwitcher(): ReactNode {
  const project = useCurrentProject();
  return (
    <button
      type="button"
      disabled
      title={texts.app.projectSwitcher.tooltip}
      className="mb-4 flex w-full items-center gap-2 rounded-md border border-[var(--border)] px-2.5 py-2 text-left text-sm text-ink disabled:cursor-default"
    >
      <InitialAvatar name={project?.name ?? '?'} />
      <span className="truncate font-medium">{project?.name ?? '—'}</span>
      <span className="ml-auto shrink-0 text-xs text-faint">{texts.app.projectSwitcher.soon}</span>
    </button>
  );
}
