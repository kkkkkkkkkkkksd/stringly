import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Badge, Logo } from '@/shared/ui';
import { texts } from '@/shared/resources/i18n';
import { useSession } from '@/features/auth/model/sessionStore';
import { useLogout } from '@/features/auth/model/useAuth';
import { ProjectSwitcher } from '@/features/projects/ui/ProjectSwitcher';
import { useRole } from '@/features/projects/model/access';

const t = texts.app;

// Каркас рабочей области: левая панель + контент.
// TODO(Шаг 2): рабочий переключатель проектов вместо заглушки.
const navItem = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm',
    isActive ? 'bg-primary-tint text-primary-hover font-medium' : 'text-muted hover:bg-subtle',
  ].join(' ');

export function AppLayout(): ReactNode {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const role = useRole();
  const logout = useLogout();

  return (
    <div className="grid h-full grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r border-[var(--border)] bg-surface p-3">
        <div className="mb-4 px-1">
          <Logo />
        </div>
        <ProjectSwitcher />
        <nav className="space-y-1">
          <NavLink to="/app/table" className={navItem}>
            {t.nav.table}
          </NavLink>
          <NavLink to="/app/settings" className={navItem}>
            {t.nav.settings}
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-[var(--border)] pt-3">
          <div className="flex items-center justify-between px-1">
            <p className="truncate text-xs text-muted">{user?.email}</p>
            <Badge tone="primary">{role}</Badge>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-subtle"
          >
            {texts.common.actions.signOut}
          </button>
        </div>
      </aside>
      <main className="min-h-0 overflow-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}
