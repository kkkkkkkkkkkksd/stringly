import type { ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { texts } from '@/shared/resources/i18n';

const t = texts.app.settings;

// Каркас настроек (вариант A — вертикальный плоский нав). Группировку (заголовки секций)
// можно добавить позже без переделок: достаточно обернуть пункты в блоки с подписями.
const item = ({ isActive }: { isActive: boolean }): string =>
  [
    'block rounded-md px-3 py-2 text-sm',
    isActive ? 'bg-primary-tint font-medium text-primary-hover' : 'text-muted hover:bg-subtle',
  ].join(' ');

export function SettingsLayout(): ReactNode {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">{t.title}</h1>
      <div className="flex min-h-0 flex-1">
        <nav className="w-48 shrink-0 space-y-1 border-r border-[var(--border)] pr-4">
          <NavLink to="members" className={item}>
            {t.nav.members}
          </NavLink>
          <NavLink to="project" className={item}>
            {t.nav.project}
          </NavLink>
          <NavLink to="connections" className={item}>
            {t.nav.connections}
          </NavLink>
          <NavLink to="documentation" className={item}>
            {t.nav.documentation}
          </NavLink>
          <NavLink to="history" className={item}>
            {t.nav.history}
          </NavLink>
          <NavLink to="profile" className={item}>
            {t.nav.profile}
          </NavLink>
          <NavLink to="preferences" className={item}>
            {t.nav.preferences}
          </NavLink>
        </nav>
        <div className="min-h-0 flex-1 overflow-auto pl-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
